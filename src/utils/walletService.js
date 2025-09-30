const { prisma, handleDatabaseError } = require("./database");
const notificationService = require("./notificationService");
const revenueService = require("./revenueService");
const fapshi = require("../../fapshi");

class WalletService {
  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId) {
    try {
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balance: 0,
            currency: "XAF",
          },
        });
      }

      return wallet;
    } catch (error) {
      console.error("Get or create wallet error:", error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet.balance;
    } catch (error) {
      console.error("Get wallet balance error:", error);
      throw error;
    }
  }

  /**
   * Add money to wallet (payment received, refund, bonus, etc.)
   */
  async addToWallet(
    userId,
    amount,
    type,
    description,
    reference = null,
    metadata = null,
    bookingId = null
  ) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          currency: wallet.currency,
          type,
          status: "COMPLETED",
          description,
          reference,
          metadata: metadata ? JSON.stringify(metadata) : null,
          walletId: wallet.id,
          userId,
          bookingId,
        },
      });

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Send notification
      await this.sendWalletNotification(userId, "CREDIT", amount, description);

      return {
        transaction,
        newBalance: updatedWallet.balance,
      };
    } catch (error) {
      console.error("Add to wallet error:", error);
      throw error;
    }
  }

  /**
   * Deduct money from wallet (withdrawal, fee, etc.)
   */
  async deductFromWallet(
    userId,
    amount,
    type,
    description,
    reference = null,
    metadata = null,
    bookingId = null
  ) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Check if sufficient balance
      if (wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          amount: -amount, // Negative amount for deductions
          currency: wallet.currency,
          type,
          status: "COMPLETED",
          description,
          reference,
          metadata: metadata ? JSON.stringify(metadata) : null,
          walletId: wallet.id,
          userId,
          bookingId,
        },
      });

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Send notification
      await this.sendWalletNotification(userId, "DEBIT", amount, description);

      return {
        transaction,
        newBalance: updatedWallet.balance,
      };
    } catch (error) {
      console.error("Deduct from wallet error:", error);
      throw error;
    }
  }

  /**
   * Process refund for booking
   */
  async processRefund(
    bookingId,
    refundAmount,
    reason = "Booking cancellation"
  ) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: true,
          property: {
            include: {
              host: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "REFUNDED") {
        throw new Error("Booking already refunded");
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Add refund to guest's wallet
        const guestRefund = await this.addToWallet(
          booking.guestId,
          refundAmount,
          "REFUND",
          `Refund for booking ${booking.id} - ${booking.property.title}`,
          `REFUND_${booking.id}`,
          { reason, bookingId },
          bookingId
        );

        // Deduct from host's wallet (if they received payment)
        const hostDeduction = await this.deductFromWallet(
          booking.property.hostId,
          refundAmount,
          "REFUND",
          `Refund deduction for booking ${booking.id} - ${booking.property.title}`,
          `REFUND_${booking.id}`,
          { reason, bookingId },
          bookingId
        );

        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "REFUNDED",
            statusReason: reason,
          },
        });

        return {
          guestRefund,
          hostDeduction,
          updatedBooking,
        };
      });

      // Send notifications
      await this.sendRefundNotifications(booking, refundAmount, reason);

      return result;
    } catch (error) {
      console.error("Process refund error:", error);
      throw error;
    }
  }

  /**
   * Process payment for booking
   */
  async processPayment(
    bookingId,
    amount,
    paymentMethod = "MOBILE_MONEY",
    reference = null
  ) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: {
            include: {
              wallet: true,
            },
          },
          property: {
            include: {
              host: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Deduct from guest's wallet (if they have balance) or process external payment
        let guestTransaction;
        if (booking.guest.wallet && booking.guest.wallet.balance >= amount) {
          // Use wallet balance
          guestTransaction = await this.deductFromWallet(
            booking.guestId,
            amount,
            "PAYMENT",
            `Payment for booking ${booking.id} - ${booking.property.title}`,
            reference,
            { paymentMethod, bookingId },
            bookingId
          );
        } else {
          // External payment processed (Fapshi, etc.)
          guestTransaction = await this.addToWallet(
            booking.guestId,
            -amount, // Negative for payment
            "PAYMENT",
            `Payment for booking ${booking.id} - ${booking.property.title}`,
            reference,
            { paymentMethod, bookingId },
            bookingId
          );
        }

        // Add to host's wallet (minus platform fee)
        const platformFee = amount * 0.1; // 10% platform fee
        const hostAmount = amount - platformFee;

        const hostPayment = await this.addToWallet(
          booking.property.hostId,
          hostAmount,
          "PAYMENT",
          `Payment received for booking ${booking.id} - ${booking.property.title}`,
          reference,
          { paymentMethod, bookingId, platformFee },
          bookingId
        );

        // Add platform fee transaction
        const platformFeeTransaction = await this.addToWallet(
          booking.property.hostId,
          -platformFee,
          "FEE",
          `Platform fee for booking ${booking.id}`,
          `FEE_${booking.id}`,
          { bookingId, feeType: "PLATFORM" },
          bookingId
        );

        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
            paymentReference: reference,
          },
        });

        return {
          guestTransaction,
          hostPayment,
          platformFeeTransaction,
          updatedBooking,
        };
      });

      return result;
    } catch (error) {
      console.error("Process payment error:", error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          include: {
            booking: {
              select: {
                id: true,
                property: {
                  select: {
                    title: true,
                    address: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.transaction.count({
          where: { userId },
        }),
      ]);

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get transaction history error:", error);
      throw error;
    }
  }

  // Process withdrawal with fees
  async withdrawFromWallet(userId, amount, paymentMethod, accountNumber) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.wallet) {
        throw new Error("Wallet not found");
      }

      if (user.wallet.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Calculate withdrawal fees
      const withdrawalFees = await revenueService.calculateWithdrawalFees(
        amount
      );
      const netAmount = withdrawalFees.netAmount;

      if (netAmount <= 0) {
        throw new Error("Withdrawal amount too small after fees");
      }

      // Prepare helper to map method to Fapshi medium
      const mapMethodToMedium = (method) => {
        switch (method) {
          case "MOBILE_MONEY":
          case "MTN_MOMO":
            return "mobile money";
          case "ORANGE_MONEY":
            return "orange money";
          default:
            return "mobile money";
        }
      };

      // Normalize phone number if provided (strip +237)
      let payoutPhone = accountNumber;
      if (
        payoutPhone &&
        typeof payoutPhone === "string" &&
        payoutPhone.startsWith("+237")
      ) {
        payoutPhone = payoutPhone.replace("+237", "");
      }

      // Create withdrawal transaction (PENDING)
      const transaction = await prisma.transaction.create({
        data: {
          amount: amount,
          currency: user.wallet.currency,
          type: "WITHDRAWAL",
          status: "PENDING",
          description: `Withdrawal to ${paymentMethod}`,
          reference: `WD-${Date.now()}`,
          metadata: JSON.stringify({
            paymentMethod,
            accountNumber: payoutPhone,
            withdrawalFee: withdrawalFees.withdrawalFee,
            netAmount: netAmount,
          }),
          walletId: user.wallet.id,
          userId: userId,
        },
      });

      // Deduct from wallet immediately
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: user.wallet.balance - amount },
      });

      // Initiate external payout with Fapshi for the net amount
      const payoutPayload = {
        amount: Math.floor(netAmount),
        phone: payoutPhone || user.phone,
        medium: mapMethodToMedium(paymentMethod),
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        userId: userId,
        externalId: transaction.id,
        message: `Wallet withdrawal ${transaction.id}`,
      };

      const payoutResponse = await fapshi.payout(payoutPayload);

      if (!payoutResponse || payoutResponse.statusCode !== 200) {
        // Rollback: restore wallet balance and mark transaction as FAILED
        await prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: user.wallet.balance },
        });

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
            metadata: JSON.stringify({
              ...JSON.parse(transaction.metadata || "{}"),
              payoutError: payoutResponse
                ? payoutResponse.message
                : "Payout failed",
            }),
          },
        });

        throw new Error(
          payoutResponse ? payoutResponse.message : "Payout failed"
        );
      }

      // Update transaction with Fapshi transId and mark as PROCESSING
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PROCESSING",
          reference: payoutResponse.transId || transaction.reference,
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || "{}"),
            fapshiTransId: payoutResponse.transId,
            serviceName: payoutResponse.serviceName,
            dateInitiated: payoutResponse.dateInitiated,
          }),
        },
      });

      // Record platform revenue from withdrawal fee
      if (withdrawalFees.withdrawalFee > 0) {
        await revenueService.recordPlatformRevenue({
          revenueType: "WITHDRAWAL_FEE",
          amount: withdrawalFees.withdrawalFee,
          transactionId: transaction.id,
          userId: userId,
          description: `Withdrawal fee for transaction ${transaction.id}`,
          metadata: {
            transactionId: transaction.id,
            originalAmount: amount,
            netAmount: netAmount,
          },
        });
      }

      // Update transaction with fee information
      await revenueService.updateTransactionWithFees(transaction.id, {
        hostServiceFee: 0,
        guestServiceFee: 0,
        platformRevenue: withdrawalFees.withdrawalFee,
        netAmountForHost: netAmount,
      });

      // Send notification
      await this.sendWalletNotification(userId, "WITHDRAWAL_REQUESTED", {
        amount,
        netAmount,
        fee: withdrawalFees.withdrawalFee,
        paymentMethod,
      });

      return {
        transaction: updatedTransaction,
        withdrawalFees,
        newBalance: user.wallet.balance - amount,
        payout: {
          transId: payoutResponse.transId,
          status: payoutResponse.status || "PROCESSING",
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process external withdrawal
   */
  async processExternalWithdrawal(userId, amount, method, phone) {
    try {
      // This would integrate with your payment provider (Fapshi, etc.)
      // For now, we'll just log the withdrawal request
      console.log(
        `Processing external withdrawal: ${amount} XAF via ${method} for user ${userId}`
      );

      // In production, this would:
      // 1. Call Fapshi API for mobile money withdrawal
      // 2. Call bank API for bank transfer
      // 3. Handle the response and update transaction status

      return true;
    } catch (error) {
      console.error("Process external withdrawal error:", error);
      throw error;
    }
  }

  /**
   * Send wallet notification
   */
  async sendWalletNotification(userId, type, amount, description) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      const title =
        type === "CREDIT"
          ? "Money Added to Wallet"
          : "Money Deducted from Wallet";
      const body = `${
        type === "CREDIT" ? "+" : "-"
      }${amount} XAF - ${description}`;

      // Send email notification (non-blocking)
      notificationService.sendEmail(user.email, title, body).catch((err) => {
        console.error(
          "Wallet notification email failed:",
          err && err.message ? err.message : err
        );
      });

      // Send push notification
      await notificationService.sendPushNotification(userId, title, body);
    } catch (error) {
      console.error("Send wallet notification error:", error);
    }
  }

  /**
   * Send refund notifications
   */
  async sendRefundNotifications(booking, refundAmount, reason) {
    try {
      // Notify guest (non-blocking)
      notificationService
        .sendEmail(
          booking.guest.email,
          "Refund Processed",
          `Your refund of ${refundAmount} XAF has been processed for booking ${booking.id}. Reason: ${reason}`
        )
        .catch((err) => {
          console.error(
            "Refund notification to guest failed:",
            err && err.message ? err.message : err
          );
        });

      // Notify host (non-blocking)
      notificationService
        .sendEmail(
          booking.property.host.email,
          "Refund Processed",
          `A refund of ${refundAmount} XAF has been processed for booking ${booking.id}. Reason: ${reason}`
        )
        .catch((err) => {
          console.error(
            "Refund notification to host failed:",
            err && err.message ? err.message : err
          );
        });
    } catch (error) {
      console.error("Send refund notifications error:", error);
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      const [totalTransactions, totalPayments, totalRefunds, totalWithdrawals] =
        await Promise.all([
          prisma.transaction.count({ where: { userId } }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: "PAYMENT",
              amount: { gt: 0 },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: "REFUND",
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: "WITHDRAWAL",
            },
            _sum: { amount: true },
          }),
        ]);

      return {
        balance: wallet.balance,
        currency: wallet.currency,
        totalTransactions,
        totalPayments: totalPayments._sum.amount || 0,
        totalRefunds: totalRefunds._sum.amount || 0,
        totalWithdrawals: Math.abs(totalWithdrawals._sum.amount || 0),
      };
    } catch (error) {
      console.error("Get wallet stats error:", error);
      throw error;
    }
  }
}

module.exports = new WalletService();
