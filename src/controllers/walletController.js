const { prisma, handleDatabaseError } = require("../utils/database");
const walletService = require("../utils/walletService");

/**
 * Get wallet balance and statistics
 */
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const walletStats = await walletService.getWalletStats(userId);

    res.json({
      success: true,
      data: walletStats,
    });
  } catch (error) {
    console.error("Get wallet balance error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get transaction history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const history = await walletService.getTransactionHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Process refund for booking
 */
const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundAmount, reason } = req.body;
    const userId = req.user.id;

    // Check if user is admin or owns the booking
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
      return res.status(404).json({
        error: "Booking not found",
        message: "Booking not found",
      });
    }

    // Check if user is admin, guest, or host
    const isAdmin = req.user.role === "ADMIN";
    const isGuest = booking.guestId === userId;
    const isHost = booking.property.hostId === userId;

    if (!isAdmin && !isGuest && !isHost) {
      return res.status(403).json({
        error: "Unauthorized",
        message:
          "You can only process refunds for your own bookings or properties",
      });
    }

    // Validate refund amount
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        error: "Invalid refund amount",
        message: "Refund amount must be greater than 0",
      });
    }

    if (refundAmount > booking.totalPrice) {
      return res.status(400).json({
        error: "Invalid refund amount",
        message: "Refund amount cannot exceed booking total",
      });
    }

    // Process refund
    const refundResult = await walletService.processRefund(
      bookingId,
      refundAmount,
      reason || "Booking cancellation"
    );

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: refundResult,
    });
  } catch (error) {
    console.error("Process refund error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Withdraw money from wallet
 */
const withdrawFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, withdrawalMethod, phone } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be greater than 0",
      });
    }

    // Validate withdrawal method
    if (!withdrawalMethod) {
      return res.status(400).json({
        error: "Withdrawal method required",
        message: "Please specify withdrawal method",
      });
    }

    // Process withdrawal
    const withdrawal = await walletService.withdrawFromWallet(
      userId,
      amount,
      withdrawalMethod,
      phone
    );

    res.json({
      success: true,
      message: "Withdrawal processed successfully",
      data: withdrawal,
    });
  } catch (error) {
    console.error("Withdraw from wallet error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get wallet details with recent transactions
 */
const getWalletDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const [wallet, recentTransactions] = await Promise.all([
      walletService.getOrCreateWallet(userId),
      walletService.getTransactionHistory(userId, 1, 5),
    ]);

    res.json({
      success: true,
      data: {
        wallet,
        recentTransactions: recentTransactions.transactions,
      },
    });
  } catch (error) {
    console.error("Get wallet details error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
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
    });

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found",
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get refund history
 */
const getRefundHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [refunds, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: "REFUND",
        },
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
        take: parseInt(limit),
      }),
      prisma.transaction.count({
        where: {
          userId,
          type: "REFUND",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        refunds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get refund history error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get withdrawal history
 */
const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: "WITHDRAWAL",
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({
        where: {
          userId,
          type: "WITHDRAWAL",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get withdrawal history error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  getWalletBalance,
  getTransactionHistory,
  processRefund,
  withdrawFromWallet,
  getWalletDetails,
  getTransactionById,
  getRefundHistory,
  getWithdrawalHistory,
};
