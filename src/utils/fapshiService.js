const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

class FapshiService {
    /**
     * Get Fapshi configuration for a specific service type and environment
     */
    async getConfig(serviceType, environment = "PRODUCTION") {
        try {
            const config = await prisma.fapshiConfig.findUnique({
                where: {
                    serviceType_environment: {
                        serviceType,
                        environment,
                    },
                },
            });

            if (!config || !config.isActive) {
                throw new Error(
                    `Fapshi ${serviceType} configuration not found or inactive`
                );
            }

            return config;
        } catch (error) {
            console.error(`Error getting Fapshi ${serviceType} config:`, error);
            throw error;
        }
    }

    /**
     * Initialize payment collection using direct-pay (for guest payments)
     */
    async initializeCollection(bookingData) {
        try {
            const config = await this.getConfig("COLLECTION");

            // Format phone number for Fapshi (remove +237 if present)
            let phoneNumber = bookingData.guestPhone;
            if (phoneNumber && phoneNumber.startsWith("+237")) {
                phoneNumber = phoneNumber.replace("+237", "");
            }

            const payload = {
                amount: Math.floor(bookingData.totalPrice), // Must be integer
                phone: phoneNumber,
                medium: this.mapPaymentMethodToMedium(bookingData.paymentMethod),
                name: `${bookingData.guestFirstName} ${bookingData.guestLastName}`,
                email: bookingData.guestEmail,
                userId: bookingData.guestId,
                externalId: bookingData.bookingId,
                message: `Payment for ${bookingData.propertyTitle} booking`,
            };

            const response = await this.makeFapshiRequest(
                "POST",
                "/direct-pay",
                payload,
                config
            );

            if (response.statusCode === 200) {
                return {
                    success: true,
                    transId: response.transId,
                    status: "PENDING",
                    message: response.message,
                    dateInitiated: response.dateInitiated,
                };
            } else {
                throw new Error(response.message || "Payment initialization failed");
            }
        } catch (error) {
            console.error("Error initializing collection:", error);
            throw error;
        }
    }

    /**
     * Initialize disbursement using payout endpoint (for host payouts)
     */
    async initializeDisbursement(payoutData) {
        try {
            const config = await this.getConfig("DISBURSEMENT");

            // Format phone number for Fapshi (remove +237 if present)
            let phoneNumber = payoutData.hostPhone;
            if (phoneNumber && phoneNumber.startsWith("+237")) {
                phoneNumber = phoneNumber.replace("+237", "");
            }

            const payload = {
                amount: Math.floor(payoutData.amount), // Must be integer
                phone: phoneNumber,
                medium: this.mapPaymentMethodToMedium(payoutData.paymentMethod),
                name: `${payoutData.hostFirstName} ${payoutData.hostLastName}`,
                email: payoutData.hostEmail,
                userId: payoutData.hostId,
                externalId: payoutData.transactionId,
                message: `Payout for ${payoutData.propertyTitle} booking`,
            };

            const response = await this.makeFapshiRequest(
                "POST",
                "/payout",
                payload,
                config
            );

            if (response.statusCode === 200) {
                return {
                    success: true,
                    transId: response.transId,
                    status: "PROCESSING",
                    message: response.message,
                    dateInitiated: response.dateInitiated,
                };
            } else {
                throw new Error(response.message || "Payout initialization failed");
            }
        } catch (error) {
            console.error("Error initializing disbursement:", error);
            throw error;
        }
    }

    /**
     * Verify payment status using payment-status endpoint
     */
    async verifyPayment(transId, serviceType = "COLLECTION") {
        try {
            const config = await this.getConfig(serviceType);

            const response = await this.makeFapshiRequest(
                "GET",
                `/payment-status/${transId}`,
                null,
                config
            );

            if (response.statusCode === 200) {
                return {
                    success: true,
                    transId: response.transId,
                    status: response.status,
                    medium: response.medium,
                    serviceName: response.serviceName,
                    amount: response.amount,
                    revenue: response.revenue,
                    payerName: response.payerName,
                    email: response.email,
                    redirectUrl: response.redirectUrl,
                    externalId: response.externalId,
                    userId: response.userId,
                    webhook: response.webhook,
                    financialTransId: response.financialTransId,
                    dateInitiated: response.dateInitiated,
                    dateConfirmed: response.dateConfirmed,
                };
            } else {
                throw new Error(response.message || "Payment verification failed");
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            throw error;
        }
    }

    /**
     * Process webhook from Fapshi
     */
    async processWebhook(webhookData) {
        try {
            // Check if this is a test webhook (for development/testing)
            const isTestWebhook =
                webhookData.transId && webhookData.transId.startsWith("TEST");

            let event;

            if (isTestWebhook) {
                // For test webhooks, use the data directly without API verification
                event = {
                    success: true,
                    transId: webhookData.transId,
                    status: webhookData.status,
                    medium: webhookData.medium,
                    serviceName: webhookData.serviceName,
                    amount: webhookData.amount,
                    revenue: webhookData.revenue,
                    payerName: webhookData.payerName,
                    email: webhookData.email,
                    redirectUrl: webhookData.redirectUrl,
                    externalId: webhookData.externalId,
                    userId: webhookData.userId,
                    webhook: webhookData.webhook,
                    financialTransId: webhookData.financialTransId,
                    dateInitiated: webhookData.dateInitiated,
                    dateConfirmed: webhookData.dateConfirmed,
                };
            } else {
                // Try verify as COLLECTION first, then fallback to DISBURSEMENT
                try {
                    event = await this.verifyPayment(webhookData.transId, "COLLECTION");
                } catch (e) {
                    event = await this.verifyPayment(webhookData.transId, "DISBURSEMENT");
                }

                if (!event.success) {
                    throw new Error(`Webhook verification failed: ${event.message}`);
                }
            }

            // Determine whether this webhook is for a booking payment or a payout
            const booking = await prisma.booking.findUnique({
                where: { id: event.externalId },
                select: { id: true },
            });

            if (booking) {
                // Handle booking-related events
                switch (event.status) {
                    case "SUCCESSFUL":
                        return await this.handleSuccessfulPayment(event);
                    case "FAILED":
                        return await this.handleFailedPayment(event);
                    case "EXPIRED":
                        return await this.handleExpiredPayment(event);
                    case "CREATED":
                    case "PENDING":
                        return await this.handleCreatedPayment(event);
                    default:
                        console.log(`Unhandled event status: ${event.status}`);
                        return { success: true, message: "Event ignored" };
                }
            }

            // Not a booking: try to treat as payout against a transaction id
            const transaction = await prisma.transaction.findUnique({
                where: { id: event.externalId },
                include: { wallet: true },
            });

            if (transaction && transaction.type === "WITHDRAWAL") {
                // Update payout request status if this is from new manual payout system
                const payoutRequestService = require("./payoutRequestService");
                await payoutRequestService.updatePayoutStatusFromWebhook(
                    transaction.id,
                    event.status
                );

                return await this.handlePayoutEvent(transaction, event);
            }

            // Unknown target
            console.log(
                `Webhook externalId ${event.externalId} did not match booking or withdrawal transaction`
            );
            return { success: false, message: "Unknown webhook target" };
        } catch (error) {
            console.error("Error processing webhook:", error);
            throw error;
        }
    }

    /**
     * Handle successful payment webhook
     */
    async handleSuccessfulPayment(event) {
        try {
            const bookingId = event.externalId;

            // Get booking details for wallet operations
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    property: {
                        include: {
                            host: {
                                include: {
                                    wallet: true,
                                },
                            },
                        },
                    },
                    guest: {
                        include: {
                            wallet: true,
                        },
                    },
                },
            });

            if (!booking) {
                throw new Error(`Booking ${bookingId} not found`);
            }

            // Update booking payment status
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: "COMPLETED",
                    paymentReference: event.transId,
                    transactionId: event.financialTransId,
                },
            });

            // Ensure guest wallet exists
            let guestWallet = booking.guest.wallet;
            if (!guestWallet) {
                guestWallet = await prisma.wallet.create({
                    data: {
                        userId: booking.guest.id,
                        balance: 0,
                        currency: "XAF",
                    },
                });
            }

            // Create transaction record for the payment
            await prisma.transaction.create({
                data: {
                    amount: event.amount,
                    currency: "XAF",
                    type: "PAYMENT",
                    status: "COMPLETED",
                    description: `Payment for booking ${bookingId}`,
                    reference: event.transId,
                    metadata: JSON.stringify({
                        medium: event.medium,
                        payerName: event.payerName,
                        email: event.email,
                        financialTransId: event.financialTransId,
                        dateInitiated: event.dateInitiated,
                        dateConfirmed: event.dateConfirmed,
                    }),
                    bookingId: bookingId,
                    userId: booking.guest.id,
                    walletId: guestWallet.id,
                },
            });

            // Calculate platform fees (5% of total amount)
            const platformFee = Math.floor(event.amount * 0.05);
            const hostAmount = event.amount - platformFee;

            // Ensure host wallet exists
            let hostWallet = booking.property.host.wallet;
            if (!hostWallet) {
                hostWallet = await prisma.wallet.create({
                    data: {
                        userId: booking.property.host.id,
                        balance: 0,
                        currency: "XAF",
                    },
                });
            }

            // Update host wallet balance
            await prisma.wallet.update({
                where: { id: hostWallet.id },
                data: {
                    balance: { increment: hostAmount },
                },
            });

            // Create platform revenue record
            await prisma.platformRevenue.create({
                data: {
                    amount: platformFee,
                    currency: "XAF",
                    revenueType: "BOOKING_FEE",
                    description: `Platform fee from booking ${bookingId}`,
                    metadata: JSON.stringify({
                        bookingId: bookingId,
                        hostId: booking.property.host.id,
                        guestId: booking.guest.id,
                        reference: event.transId,
                    }),
                },
            });

            return { success: true, message: "Payment completed successfully" };
        } catch (error) {
            console.error("Error handling successful payment:", error);
            throw error;
        }
    }

    /**
     * Handle payout webhook for withdrawals
     */
    async handlePayoutEvent(transaction, event) {
        try {
            const updates = {
                reference: event.transId,
                metadata: JSON.stringify({
                    ...(transaction.metadata ? JSON.parse(transaction.metadata) : {}),
                    medium: event.medium,
                    serviceName: event.serviceName,
                    financialTransId: event.financialTransId,
                    dateInitiated: event.dateInitiated,
                    dateConfirmed: event.dateConfirmed,
                    payoutStatus: event.status,
                }),
            };

            switch (event.status) {
                case "SUCCESSFUL":
                    updates.status = "COMPLETED";
                    break;
                case "FAILED":
                case "EXPIRED":
                    updates.status = "FAILED";
                    // Refund wallet since payout failed/expired
                    await prisma.wallet.update({
                        where: { id: transaction.walletId },
                        data: { balance: { increment: transaction.amount } },
                    });
                    break;
                case "CREATED":
                case "PENDING":
                    updates.status = "PROCESSING";
                    break;
                default:
                    // Keep current status
                    break;
            }

            await prisma.transaction.update({
                where: { id: transaction.id },
                data: updates,
            });

            return { success: true, message: "Payout webhook processed" };
        } catch (error) {
            console.error("Error handling payout event:", error);
            throw error;
        }
    }

    /**
     * Handle failed payment webhook
     */
    async handleFailedPayment(event) {
        try {
            const bookingId = event.externalId;

            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: "FAILED",
                    paymentReference: event.transId,
                    statusReason: "Payment failed",
                },
            });

            return { success: true, message: "Payment failed handled" };
        } catch (error) {
            console.error("Error handling failed payment:", error);
            throw error;
        }
    }

    /**
     * Handle expired payment webhook
     */
    async handleExpiredPayment(event) {
        try {
            const bookingId = event.externalId;

            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: "EXPIRED",
                    paymentReference: event.transId,
                    statusReason: "Payment expired",
                },
            });

            return { success: true, message: "Payment expired handled" };
        } catch (error) {
            console.error("Error handling expired payment:", error);
            throw error;
        }
    }

    /**
     * Handle created payment webhook
     */
    async handleCreatedPayment(event) {
        try {
            const bookingId = event.externalId;

            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: "PENDING",
                    paymentReference: event.transId,
                },
            });

            return { success: true, message: "Payment created handled" };
        } catch (error) {
            console.error("Error handling created payment:", error);
            throw error;
        }
    }

    /**
     * Make HTTP request to Fapshi API
     */
    async makeFapshiRequest(method, endpoint, payload, config) {
        try {
            const baseUrl =
                config.environment === "PRODUCTION" ?
                "https://live.fapshi.com" :
                "https://sandbox.fapshi.com";

            const headers = {
                apiuser: config.apiUser,
                apikey: config.apiKey,
            };

            const requestConfig = {
                method,
                url: `${baseUrl}${endpoint}`,
                headers,
                data: payload,
            };

            const response = await axios(requestConfig);
            response.data.statusCode = response.status;
            return response.data;
        } catch (error) {
            if (error.response) {
                error.response.data.statusCode = error.response.status;
                return error.response.data;
            }
            throw error;
        }
    }

    /**
     * Map payment method to Fapshi medium
     */
    mapPaymentMethodToMedium(paymentMethod) {
        switch (paymentMethod) {
            case "MOBILE_MONEY":
                return "mobile money";
            case "ORANGE_MONEY":
                return "orange money";
            default:
                return "mobile money"; // Default to mobile money
        }
    }

    /**
     * Get payment methods available for Cameroon
     */
    getAvailablePaymentMethods() {
        return [{
                id: "MOBILE_MONEY",
                name: "MTN Mobile Money",
                description: "Pay with MTN Mobile Money",
                icon: "mtn-momo",
            },
            {
                id: "ORANGE_MONEY",
                name: "Orange Money",
                description: "Pay with Orange Money",
                icon: "orange-money",
            },
        ];
    }

    /**
     * Validate payment method
     */
    validatePaymentMethod(method) {
        const validMethods = ["MOBILE_MONEY", "ORANGE_MONEY"];
        return validMethods.includes(method);
    }

    /**
     * Get service balance
     */
    async getBalance(serviceType = "COLLECTION") {
        try {
            const config = await this.getConfig(serviceType);

            const response = await this.makeFapshiRequest(
                "GET",
                "/balance",
                null,
                config
            );

            return response;
        } catch (error) {
            console.error("Error getting balance:", error);
            throw error;
        }
    }

    /**
     * Search transactions
     */
    async searchTransactions(params = {}, serviceType = "COLLECTION") {
        try {
            const config = await this.getConfig(serviceType);

            const response = await this.makeFapshiRequest(
                "GET",
                "/search",
                null,
                config,
                params
            );

            return response;
        } catch (error) {
            console.error("Error searching transactions:", error);
            throw error;
        }
    }
}

module.exports = new FapshiService();