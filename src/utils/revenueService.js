const { prisma, handleDatabaseError } = require("./database");

class RevenueService {
    // Get the active revenue configuration
    async getActiveRevenueConfig() {
        try {
            const config = await prisma.revenueConfig.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
            });

            if (!config) {
                // Return default configuration if none exists
                return {
                    id: "default",
                    name: "standard",
                    description: "Default revenue configuration",
                    hostServiceFeePercent: 5.0,
                    hostServiceFeeMin: 0,
                    hostServiceFeeMax: null,
                    guestServiceFeePercent: 3.0,
                    guestServiceFeeMin: 0,
                    guestServiceFeeMax: null,
                    isActive: true,
                    appliesToBooking: true,
                    appliesToWithdrawal: false,
                };
            }

            return config;
        } catch (error) {
            console.error("Error getting revenue config:", error);
            throw error;
        }
    }

    // Calculate fees for a booking
    async calculateBookingFees(bookingAmount, currency = "XAF") {
        try {
            const config = await this.getActiveRevenueConfig();

            // Calculate host service fee
            let hostServiceFee = (bookingAmount * config.hostServiceFeePercent) / 100;

            // Apply minimum and maximum constraints
            if (hostServiceFee < config.hostServiceFeeMin) {
                hostServiceFee = config.hostServiceFeeMin;
            }
            if (
                config.hostServiceFeeMax &&
                hostServiceFee > config.hostServiceFeeMax
            ) {
                hostServiceFee = config.hostServiceFeeMax;
            }

            // Calculate guest service fee
            let guestServiceFee =
                (bookingAmount * config.guestServiceFeePercent) / 100;

            // Apply minimum and maximum constraints
            if (guestServiceFee < config.guestServiceFeeMin) {
                guestServiceFee = config.guestServiceFeeMin;
            }
            if (
                config.guestServiceFeeMax &&
                guestServiceFee > config.guestServiceFeeMax
            ) {
                guestServiceFee = config.guestServiceFeeMax;
            }

            // Calculate totals
            const totalGuestPays = bookingAmount + guestServiceFee;
            const platformRevenue = hostServiceFee + guestServiceFee;
            const netAmountForHost = bookingAmount - hostServiceFee;

            return {
                originalAmount: bookingAmount,
                hostServiceFee,
                guestServiceFee,
                totalGuestPays,
                platformRevenue,
                netAmountForHost,
                currency,
                config: {
                    hostServiceFeePercent: config.hostServiceFeePercent,
                    guestServiceFeePercent: config.guestServiceFeePercent,
                },
            };
        } catch (error) {
            console.error("Error calculating booking fees:", error);
            throw error;
        }
    }

    // Calculate withdrawal fees
    async calculateWithdrawalFees(withdrawalAmount, currency = "XAF") {
        try {
            const config = await this.getActiveRevenueConfig();

            if (!config.appliesToWithdrawal) {
                return {
                    originalAmount: withdrawalAmount,
                    withdrawalFee: 0,
                    netAmount: withdrawalAmount,
                    currency,
                };
            }

            // For withdrawals, we typically only charge a small fixed fee
            const withdrawalFee = Math.max(config.hostServiceFeeMin, 100); // Minimum 100 XAF
            const netAmount = withdrawalAmount - withdrawalFee;

            return {
                originalAmount: withdrawalAmount,
                withdrawalFee,
                netAmount,
                currency,
            };
        } catch (error) {
            console.error("Error calculating withdrawal fees:", error);
            throw error;
        }
    }

    // Record platform revenue
    async recordPlatformRevenue(data) {
        try {
            const revenue = await prisma.platformRevenue.create({
                data: {
                    date: new Date(),
                    revenueType: data.revenueType,
                    amount: data.amount,
                    currency: data.currency || "XAF",
                    transactionId: data.transactionId,
                    bookingId: data.bookingId,
                    userId: data.userId,
                    description: data.description,
                    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                },
            });

            return revenue;
        } catch (error) {
            console.error("Error recording platform revenue:", error);
            throw error;
        }
    }

    // Update transaction with fee information
    async updateTransactionWithFees(transactionId, feeData) {
        try {
            // First get the original transaction to access its metadata
            const originalTransaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
            });

            if (!originalTransaction) {
                throw new Error("Transaction not found");
            }

            const updatedTransaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    hostServiceFee: feeData.hostServiceFee,
                    guestServiceFee: feeData.guestServiceFee,
                    platformRevenue: feeData.platformRevenue,
                    netAmount: feeData.netAmountForHost,
                    metadata: JSON.stringify({
                        ...JSON.parse(originalTransaction.metadata || "{}"),
                        fees: feeData,
                    }),
                },
            });

            return updatedTransaction;
        } catch (error) {
            console.error("Error updating transaction with fees:", error);
            throw error;
        }
    }

    // Get platform revenue statistics
    async getPlatformRevenueStats(startDate, endDate) {
        try {
            const revenues = await prisma.platformRevenue.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            });

            // Calculate totals by type
            const stats = {
                totalRevenue: 0,
                hostFees: 0,
                guestFees: 0,
                withdrawalFees: 0,
                transactionCount: revenues.length,
                breakdown: {
                    HOST_FEE: 0,
                    GUEST_FEE: 0,
                    WITHDRAWAL_FEE: 0,
                },
            };

            revenues.forEach((revenue) => {
                stats.totalRevenue += revenue.amount;
                stats.breakdown[revenue.revenueType] += revenue.amount;

                switch (revenue.revenueType) {
                    case "HOST_FEE":
                        stats.hostFees += revenue.amount;
                        break;
                    case "GUEST_FEE":
                        stats.guestFees += revenue.amount;
                        break;
                    case "WITHDRAWAL_FEE":
                        stats.withdrawalFees += revenue.amount;
                        break;
                }
            });

            return stats;
        } catch (error) {
            console.error("Error getting platform revenue stats:", error);
            throw error;
        }
    }

    // Get revenue configuration for admin
    async getRevenueConfigs() {
        try {
            const configs = await prisma.revenueConfig.findMany({
                orderBy: { createdAt: "desc" },
            });

            return configs;
        } catch (error) {
            console.error("Error getting revenue configs:", error);
            throw error;
        }
    }

    // Create or update revenue configuration
    async createRevenueConfig(configData) {
        try {
            const config = await prisma.revenueConfig.create({
                data: {
                    name: configData.name,
                    description: configData.description,
                    hostServiceFeePercent: configData.hostServiceFeePercent,
                    hostServiceFeeMin: configData.hostServiceFeeMin,
                    hostServiceFeeMax: configData.hostServiceFeeMax,
                    guestServiceFeePercent: configData.guestServiceFeePercent,
                    guestServiceFeeMin: configData.guestServiceFeeMin,
                    guestServiceFeeMax: configData.guestServiceFeeMax,
                    isActive: configData.isActive,
                    appliesToBooking: configData.appliesToBooking,
                    appliesToWithdrawal: configData.appliesToWithdrawal,
                },
            });

            return config;
        } catch (error) {
            console.error("Error creating revenue config:", error);
            throw error;
        }
    }

    // Update revenue configuration
    async updateRevenueConfig(configId, configData) {
        try {
            const config = await prisma.revenueConfig.update({
                where: { id: configId },
                data: configData,
            });

            return config;
        } catch (error) {
            console.error("Error updating revenue config:", error);
            throw error;
        }
    }

    // Activate a revenue configuration (deactivate others)
    async activateRevenueConfig(configId) {
        try {
            // Deactivate all configs
            await prisma.revenueConfig.updateMany({
                data: { isActive: false },
            });

            // Activate the specified config
            const config = await prisma.revenueConfig.update({
                where: { id: configId },
                data: { isActive: true },
            });

            return config;
        } catch (error) {
            console.error("Error activating revenue config:", error);
            throw error;
        }
    }

    // Get fee breakdown for display
    async getFeeBreakdown(amount, currency = "XAF") {
        try {
            const fees = await this.calculateBookingFees(amount, currency);

            return {
                originalAmount: fees.originalAmount,
                fees: {
                    host: {
                        percentage: fees.config.hostServiceFeePercent,
                        amount: fees.hostServiceFee,
                        description: `Host service fee (${fees.config.hostServiceFeePercent}%)`,
                    },
                    guest: {
                        percentage: fees.config.guestServiceFeePercent,
                        amount: fees.guestServiceFee,
                        description: `Guest service fee (${fees.config.guestServiceFeePercent}%)`,
                    },
                },
                totals: {
                    guestPays: fees.totalGuestPays,
                    hostReceives: fees.netAmountForHost,
                    platformRevenue: fees.platformRevenue,
                },
                currency,
            };
        } catch (error) {
            console.error("Error getting fee breakdown:", error);
            throw error;
        }
    }
}

module.exports = new RevenueService();