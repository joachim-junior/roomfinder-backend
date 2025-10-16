const { prisma, handleDatabaseError } = require("./database");
const fapshiService = require("./fapshiService");
const firebaseService = require("./firebaseService");

class PayoutRequestService {
    /**
     * Calculate payout preview (no fees - amount requested = amount received)
     */
    async calculatePayoutWithFees(amount, currency = "XAF") {
        try {
            // No withdrawal fees - all commissions already taken at booking
            return {
                requestedAmount: amount,
                withdrawalFee: 0,
                netAmount: amount,
                currency: currency,
                note: "No withdrawal fee - all commissions deducted during booking",
            };
        } catch (error) {
            console.error("Calculate payout preview error:", error);
            throw error;
        }
    }

    /**
     * Calculate eligible payout amount for host
     * Based on bookings completed 3+ days ago
     */
    async calculateEligibleAmount(userId) {
        try {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            // Get wallet balance
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });

            if (!wallet) {
                return {
                    totalBalance: 0,
                    eligibleAmount: 0,
                    lockedAmount: 0,
                    pendingPayouts: 0,
                };
            }

            // Get pending payout requests
            const pendingPayouts = await prisma.payoutRequest.findMany({
                where: {
                    userId,
                    status: { in: ["PENDING", "APPROVED", "PROCESSING"] },
                },
            });

            const totalPendingPayouts = pendingPayouts.reduce(
                (sum, req) => sum + req.amount,
                0
            );

            // Calculate eligible amount (balance minus pending payouts)
            const eligibleAmount = Math.max(0, wallet.balance - totalPendingPayouts);

            return {
                totalBalance: wallet.balance,
                eligibleAmount: eligibleAmount,
                lockedAmount: totalPendingPayouts,
                pendingPayouts: pendingPayouts.length,
            };
        } catch (error) {
            console.error("Calculate eligible amount error:", error);
            throw error;
        }
    }

    /**
     * Create payout request
     */
    async createPayoutRequest(userId, requestData) {
        try {
            const { amount, phoneNumber, paymentMethod } = requestData;

            // Validate amount
            if (!amount || amount <= 0) {
                throw new Error("Invalid payout amount");
            }

            // Check host profile exists and has payout phone
            const hostProfile = await prisma.hostProfile.findUnique({
                where: { userId },
            });

            if (!hostProfile) {
                throw new Error("Please complete your host profile first");
            }

            // Use provided phone or default to profile phone
            const payoutPhone = phoneNumber || hostProfile.payoutPhoneNumber;

            if (!payoutPhone) {
                throw new Error("Payout phone number is required");
            }

            // Check eligible amount
            const eligibility = await this.calculateEligibleAmount(userId);

            if (amount > eligibility.eligibleAmount) {
                throw new Error(
                    `Insufficient eligible balance. You can request up to ${eligibility.eligibleAmount} XAF. ${eligibility.lockedAmount} XAF is locked in pending payout requests.`
                );
            }

            // Calculate when funds will be eligible (3 days from now for new bookings)
            const eligibleAt = new Date();
            eligibleAt.setDate(eligibleAt.getDate() + 3);

            // Create payout request
            const payoutRequest = await prisma.payoutRequest.create({
                data: {
                    userId,
                    amount,
                    phoneNumber: payoutPhone,
                    paymentMethod: paymentMethod || "MOBILE_MONEY",
                    status: "PENDING",
                    eligibleAt: eligibleAt,
                    metadata: JSON.stringify({
                        requestedBalance: eligibility.totalBalance,
                        eligibleBalance: eligibility.eligibleAmount,
                    }),
                },
            });

            // Create notification for admins
            await this.notifyAdminsOfPayoutRequest(payoutRequest);

            return payoutRequest;
        } catch (error) {
            console.error("Create payout request error:", error);
            throw error;
        }
    }

    /**
     * Get host's payout requests
     */
    async getHostPayoutRequests(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const [requests, total] = await Promise.all([
                prisma.payoutRequest.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                }),
                prisma.payoutRequest.count({ where: { userId } }),
            ]);

            return {
                requests,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error("Get host payout requests error:", error);
            throw error;
        }
    }

    /**
     * Admin: Get all payout requests
     */
    async getAllPayoutRequests(filters = {}, page = 1, limit = 10) {
        try {
            const { status, userId } = filters;
            const skip = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (userId) where.userId = userId;

            const [requests, total] = await Promise.all([
                prisma.payoutRequest.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                }),
                prisma.payoutRequest.count({ where }),
            ]);

            return {
                requests,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error("Get all payout requests error:", error);
            throw error;
        }
    }

    /**
     * Admin: Approve payout request
     */
    async approvePayoutRequest(requestId, adminId, notes = "") {
        try {
            const payoutRequest = await prisma.payoutRequest.findUnique({
                where: { id: requestId },
                include: {
                    user: {
                        include: {
                            wallet: true,
                            hostProfile: true,
                        },
                    },
                },
            });

            if (!payoutRequest) {
                throw new Error("Payout request not found");
            }

            if (payoutRequest.status !== "PENDING") {
                throw new Error(
                    `Cannot approve payout with status: ${payoutRequest.status}`
                );
            }

            // Check if user has sufficient balance
            if (!payoutRequest.user.wallet ||
                payoutRequest.user.wallet.balance < payoutRequest.amount
            ) {
                throw new Error("Insufficient wallet balance for payout");
            }

            // Update payout request to APPROVED
            const updatedRequest = await prisma.payoutRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    approvedAt: new Date(),
                    approvedBy: adminId,
                    adminNotes: notes,
                },
            });

            // Send approval notification
            await prisma.notification.create({
                data: {
                    userId: payoutRequest.userId,
                    title: "Payout Approved ✅",
                    body: `Your payout request for ${payoutRequest.amount} XAF has been approved and is being processed.`,
                    type: "PUSH",
                    status: "SENT",
                    data: JSON.stringify({
                        type: "PAYOUT_APPROVED",
                        payoutRequestId: requestId,
                        amount: payoutRequest.amount,
                    }),
                },
            });

            // Send push notification
            firebaseService
                .sendPushNotification(
                    payoutRequest.userId,
                    "Payout Approved ✅",
                    `Your payout of ${payoutRequest.amount} XAF is being processed and will be sent to ${payoutRequest.phoneNumber}`, {
                        type: "PAYOUT_APPROVED",
                        payoutRequestId: requestId,
                        amount: payoutRequest.amount,
                    }
                )
                .catch((err) => {
                    console.error(
                        "Failed to send payout approval push notification:",
                        err.message
                    );
                });

            // Now process the payout via Fapshi
            await this.processApprovedPayout(updatedRequest);

            return updatedRequest;
        } catch (error) {
            console.error("Approve payout request error:", error);
            throw error;
        }
    }

    /**
     * Process approved payout (called after admin approval)
     */
    async processApprovedPayout(payoutRequest) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payoutRequest.userId },
                include: {
                    wallet: true,
                    hostProfile: true,
                },
            });

            if (!user || !user.wallet) {
                throw new Error("User or wallet not found");
            }

            // No withdrawal fees - all fees taken during booking commission
            // Host receives the full amount they request

            // Update request to PROCESSING
            await prisma.payoutRequest.update({
                where: { id: payoutRequest.id },
                data: {
                    status: "PROCESSING",
                    metadata: JSON.stringify({
                        ...(payoutRequest.metadata ?
                            JSON.parse(payoutRequest.metadata) :
                            {}),
                        note: "No withdrawal fee - all commissions already deducted at booking",
                    }),
                },
            });

            // Deduct requested amount from wallet
            await prisma.wallet.update({
                where: { id: user.wallet.id },
                data: {
                    balance: user.wallet.balance - payoutRequest.amount,
                },
            });

            // Create transaction record
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    walletId: user.wallet.id,
                    amount: payoutRequest.amount,
                    currency: payoutRequest.currency,
                    type: "WITHDRAWAL",
                    status: "PROCESSING",
                    description: `Manual payout request #${payoutRequest.id}`,
                    reference: `PAYOUT-${Date.now()}`,
                    metadata: JSON.stringify({
                        payoutRequestId: payoutRequest.id,
                        phoneNumber: payoutRequest.phoneNumber,
                        paymentMethod: payoutRequest.paymentMethod,
                        note: "No withdrawal fee - commissions already taken at booking",
                    }),
                },
            });

            // Update payout request with transaction ID
            await prisma.payoutRequest.update({
                where: { id: payoutRequest.id },
                data: { transactionId: transaction.id },
            });

            // Initiate Fapshi payout with FULL REQUESTED AMOUNT (no withdrawal fees)
            const payoutPayload = {
                amount: Math.floor(payoutRequest.amount),
                phone: payoutRequest.phoneNumber.replace("+237", ""),
                medium: payoutRequest.paymentMethod === "ORANGE_MONEY" ?
                    "orange money" :
                    "mobile money",
                name:
                    (user.hostProfile && user.hostProfile.fullLegalName) ||
                    `${user.firstName} ${user.lastName}`,
                email: user.email,
                userId: user.id,
                externalId: transaction.id,
                message: `Payout request #${payoutRequest.id}`,
            };

            const fapshiResponse = await fapshiService.payout(payoutPayload);

            if (!fapshiResponse || fapshiResponse.statusCode !== 200) {
                // Rollback: restore wallet balance
                await prisma.wallet.update({
                    where: { id: user.wallet.id },
                    data: { balance: user.wallet.balance },
                });

                // Mark as failed
                await prisma.payoutRequest.update({
                    where: { id: payoutRequest.id },
                    data: {
                        status: "FAILED",
                        adminNotes:
                            (fapshiResponse && fapshiResponse.message) ||
                            "Fapshi payout failed",
                    },
                });

                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "FAILED" },
                });

                throw new Error(
                    (fapshiResponse && fapshiResponse.message) ||
                    "Payout processing failed"
                );
            }

            // Update with Fapshi transaction ID
            await prisma.payoutRequest.update({
                where: { id: payoutRequest.id },
                data: {
                    fapshiTransId: fapshiResponse.transId,
                    processedAt: new Date(),
                },
            });

            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    reference: fapshiResponse.transId,
                    metadata: JSON.stringify({
                        ...JSON.parse(transaction.metadata),
                        fapshiTransId: fapshiResponse.transId,
                        serviceName: fapshiResponse.serviceName,
                        dateInitiated: fapshiResponse.dateInitiated,
                    }),
                },
            });

            return {
                success: true,
                payoutRequest,
                transaction,
                fapshiTransId: fapshiResponse.transId,
            };
        } catch (error) {
            console.error("Process approved payout error:", error);
            throw error;
        }
    }

    /**
     * Admin: Reject payout request
     */
    async rejectPayoutRequest(requestId, adminId, reason) {
        try {
            if (!reason) {
                throw new Error("Rejection reason is required");
            }

            const payoutRequest = await prisma.payoutRequest.findUnique({
                where: { id: requestId },
            });

            if (!payoutRequest) {
                throw new Error("Payout request not found");
            }

            if (payoutRequest.status !== "PENDING") {
                throw new Error(
                    `Cannot reject payout with status: ${payoutRequest.status}`
                );
            }

            const updatedRequest = await prisma.payoutRequest.update({
                where: { id: requestId },
                data: {
                    status: "REJECTED",
                    rejectedAt: new Date(),
                    rejectedBy: adminId,
                    rejectionReason: reason,
                },
            });

            // Notify host of rejection
            await prisma.notification.create({
                data: {
                    userId: payoutRequest.userId,
                    title: "Payout Request Rejected",
                    body: `Your payout request for ${payoutRequest.amount} XAF has been rejected. Reason: ${reason}`,
                    type: "PUSH",
                    status: "SENT",
                    data: JSON.stringify({
                        payoutRequestId: requestId,
                        amount: payoutRequest.amount,
                        reason,
                    }),
                },
            });

            // Send push notification
            firebaseService
                .sendPushNotification(
                    payoutRequest.userId,
                    "Payout Request Rejected",
                    `Your payout request for ${payoutRequest.amount} XAF has been rejected. ${reason}`, {
                        type: "PAYOUT_REJECTED",
                        payoutRequestId: requestId,
                        amount: payoutRequest.amount,
                        reason,
                    }
                )
                .catch((err) => {
                    console.error(
                        "Failed to send payout rejection push notification:",
                        err.message
                    );
                });

            return updatedRequest;
        } catch (error) {
            console.error("Reject payout request error:", error);
            throw error;
        }
    }

    /**
     * Cancel payout request (by host, only if pending)
     */
    async cancelPayoutRequest(requestId, userId) {
        try {
            const payoutRequest = await prisma.payoutRequest.findUnique({
                where: { id: requestId },
            });

            if (!payoutRequest) {
                throw new Error("Payout request not found");
            }

            if (payoutRequest.userId !== userId) {
                throw new Error("You can only cancel your own payout requests");
            }

            if (payoutRequest.status !== "PENDING") {
                throw new Error(
                    `Cannot cancel payout with status: ${payoutRequest.status}`
                );
            }

            const updatedRequest = await prisma.payoutRequest.update({
                where: { id: requestId },
                data: {
                    status: "CANCELLED",
                    updatedAt: new Date(),
                },
            });

            return updatedRequest;
        } catch (error) {
            console.error("Cancel payout request error:", error);
            throw error;
        }
    }

    /**
     * Get payout statistics for admin dashboard
     */
    async getPayoutStatistics() {
        try {
            const [pending, approved, processing, completed, rejected, totalAmount] =
            await Promise.all([
                prisma.payoutRequest.count({ where: { status: "PENDING" } }),
                prisma.payoutRequest.count({ where: { status: "APPROVED" } }),
                prisma.payoutRequest.count({ where: { status: "PROCESSING" } }),
                prisma.payoutRequest.count({ where: { status: "COMPLETED" } }),
                prisma.payoutRequest.count({ where: { status: "REJECTED" } }),
                prisma.payoutRequest.aggregate({
                    where: { status: { in: ["PENDING", "APPROVED", "PROCESSING"] } },
                    _sum: { amount: true },
                }),
            ]);

            return {
                pending,
                approved,
                processing,
                completed,
                rejected,
                totalPendingAmount: totalAmount._sum.amount || 0,
            };
        } catch (error) {
            console.error("Get payout statistics error:", error);
            throw error;
        }
    }

    /**
     * Notify admins of new payout request
     */
    async notifyAdminsOfPayoutRequest(payoutRequest) {
        try {
            // Get all admin users
            const admins = await prisma.user.findMany({
                where: { role: "ADMIN" },
                select: { id: true },
            });

            // Create notifications for all admins
            const notifications = admins.map((admin) => ({
                userId: admin.id,
                title: "New Payout Request",
                body: `A host has requested a payout of ${payoutRequest.amount} XAF`,
                type: "PUSH",
                status: "SENT",
                data: JSON.stringify({
                    payoutRequestId: payoutRequest.id,
                    userId: payoutRequest.userId,
                    amount: payoutRequest.amount,
                }),
            }));

            if (notifications.length > 0) {
                await prisma.notification.createMany({
                    data: notifications,
                });
            }
        } catch (error) {
            console.error("Notify admins of payout request error:", error);
            // Don't throw - notifications are not critical
        }
    }

    /**
     * Update payout request status from Fapshi webhook
     */
    async updatePayoutStatusFromWebhook(transactionId, fapshiStatus) {
        try {
            // Find payout request by transaction ID
            const payoutRequest = await prisma.payoutRequest.findFirst({
                where: { transactionId },
            });

            if (!payoutRequest) {
                console.log("No payout request found for transaction:", transactionId);
                return null;
            }

            let newStatus = payoutRequest.status;

            switch (fapshiStatus) {
                case "SUCCESSFUL":
                    newStatus = "COMPLETED";
                    break;
                case "FAILED":
                case "EXPIRED":
                    newStatus = "FAILED";
                    // Refund wallet
                    await prisma.wallet.update({
                        where: { userId: payoutRequest.userId },
                        data: { balance: { increment: payoutRequest.amount } },
                    });
                    break;
            }

            const updatedRequest = await prisma.payoutRequest.update({
                where: { id: payoutRequest.id },
                data: {
                    status: newStatus,
                    processedAt: newStatus === "COMPLETED" ? new Date() : payoutRequest.processedAt,
                },
            });

            // Notify host of status update
            await prisma.notification.create({
                data: {
                    userId: payoutRequest.userId,
                    title: newStatus === "COMPLETED" ? "Payout Completed" : "Payout Failed",
                    body: newStatus === "COMPLETED" ?
                        `Your payout of ${payoutRequest.amount} XAF has been sent to ${payoutRequest.phoneNumber}` :
                        `Your payout of ${payoutRequest.amount} XAF has failed. The amount has been refunded to your wallet.`,
                    type: "PUSH",
                    status: "SENT",
                    data: JSON.stringify({
                        payoutRequestId: payoutRequest.id,
                        amount: payoutRequest.amount,
                        status: newStatus,
                    }),
                },
            });

            return updatedRequest;
        } catch (error) {
            console.error("Update payout status from webhook error:", error);
            throw error;
        }
    }
}

module.exports = new PayoutRequestService();