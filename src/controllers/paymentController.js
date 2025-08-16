const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fapshiService = require("../utils/fapshiService");
const prisma = new PrismaClient();

class PaymentController {
  /**
   * Initialize payment for a booking
   */
  async initializePayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { bookingId } = req.params;
      const { paymentMethod } = req.body;

      // Validate payment method
      if (!fapshiService.validatePaymentMethod(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method. Supported methods: MOBILE_MONEY, ORANGE_MONEY",
        });
      }

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: {
            include: {
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if user is the guest of this booking
      if (booking.guestId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only pay for your own bookings",
        });
      }

      // Check if booking is already paid
      if (booking.paymentStatus === "COMPLETED") {
        return res.status(400).json({
          success: false,
          message: "Booking is already paid",
        });
      }

      // Check if payment is already in progress
      if (
        booking.paymentStatus === "PROCESSING" ||
        booking.paymentStatus === "PENDING"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment is already in progress",
        });
      }

      // Prepare booking data for Fapshi
      const bookingData = {
        bookingId: booking.id,
        totalPrice: booking.totalPrice,
        propertyTitle: booking.property.title,
        guestFirstName: booking.guest.firstName,
        guestLastName: booking.guest.lastName,
        guestEmail: booking.guest.email,
        guestPhone: booking.guest.phone,
        guestId: booking.guest.id,
        paymentMethod: paymentMethod,
      };

      // Initialize payment with Fapshi
      const paymentResult = await fapshiService.initializeCollection(
        bookingData
      );

      // Update booking with payment details
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentMethod: paymentMethod,
          paymentStatus: "PENDING",
          paymentReference: paymentResult.transId,
        },
      });

      res.json({
        success: true,
        message: "Payment initialized successfully",
        data: {
          transId: paymentResult.transId,
          status: paymentResult.status,
          message: paymentResult.message,
          dateInitiated: paymentResult.dateInitiated,
          bookingId: booking.id,
        },
      });
    } catch (error) {
      console.error("Initialize payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initialize payment",
        error: error.message,
      });
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(req, res) {
    try {
      const { bookingId } = req.params;

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: {
            include: {
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if user is the guest of this booking
      if (booking.guestId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only verify payments for your own bookings",
        });
      }

      if (!booking.paymentReference) {
        return res.status(400).json({
          success: false,
          message: "No payment reference found for this booking",
        });
      }

      // Verify payment with Fapshi
      const verificationResult = await fapshiService.verifyPayment(
        booking.paymentReference,
        "COLLECTION"
      );

      // Update booking status based on verification result
      let bookingStatus = booking.status;
      let statusReason = "";

      switch (verificationResult.status) {
        case "SUCCESSFUL":
          bookingStatus = "CONFIRMED";
          statusReason = "Payment completed successfully";
          break;
        case "FAILED":
          bookingStatus = "CANCELLED";
          statusReason = "Payment failed";
          break;
        case "EXPIRED":
          bookingStatus = "CANCELLED";
          statusReason = "Payment expired";
          break;
        case "CREATED":
        case "PENDING":
          bookingStatus = "PENDING";
          statusReason = "Payment in progress";
          break;
        default:
          bookingStatus = booking.status;
          statusReason = `Payment status: ${verificationResult.status}`;
      }

      // Update booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: bookingStatus,
          paymentStatus: verificationResult.status,
          statusReason: statusReason,
          transactionId: verificationResult.financialTransId,
        },
      });

      res.json({
        success: true,
        message: "Payment verification completed",
        data: {
          bookingStatus: bookingStatus,
          paymentStatus: verificationResult.status,
          verificationResult: verificationResult,
        },
      });
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error: error.message,
      });
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(req, res) {
    try {
      const paymentMethods = fapshiService.getAvailablePaymentMethods();

      res.json({
        success: true,
        data: paymentMethods,
      });
    } catch (error) {
      console.error("Get payment methods error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment methods",
      });
    }
  }

  /**
   * Process Fapshi webhook
   */
  async processWebhook(req, res) {
    try {
      const webhookData = req.body;

      // Validate webhook data structure
      if (!webhookData.transId) {
        return res.status(400).json({
          success: false,
          message: "Invalid webhook data: transId is required",
        });
      }

      // Process the webhook
      const result = await fapshiService.processWebhook(webhookData);

      res.json({
        success: true,
        message: "Webhook processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Process webhook error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process webhook",
        error: error.message,
      });
    }
  }

  /**
   * Initialize host payout
   */
  async initializePayout(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { amount, paymentMethod } = req.body;

      // Validate payment method
      if (!fapshiService.validatePaymentMethod(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method. Supported methods: MOBILE_MONEY, ORANGE_MONEY",
        });
      }

      // Check if user has sufficient balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId: req.user.id },
      });

      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance for payout",
        });
      }

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          amount: amount,
          currency: "XAF",
          type: "WITHDRAWAL",
          status: "PENDING",
          description: `Payout to ${paymentMethod}`,
          userId: req.user.id,
        },
      });

      // Prepare payout data
      const payoutData = {
        transactionId: transaction.id,
        amount: amount,
        propertyTitle: "Wallet Withdrawal",
        hostFirstName: req.user.firstName,
        hostLastName: req.user.lastName,
        hostEmail: req.user.email,
        hostPhone: req.user.phone,
        hostId: req.user.id,
        paymentMethod: paymentMethod,
      };

      // Initialize disbursement with Fapshi
      const payoutResult = await fapshiService.initializeDisbursement(
        payoutData
      );

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PROCESSING",
          reference: payoutResult.transId,
        },
      });

      // Deduct from wallet
      await prisma.wallet.update({
        where: { userId: req.user.id },
        data: {
          balance: { decrement: amount },
        },
      });

      res.json({
        success: true,
        message: "Payout initialized successfully",
        data: {
          transactionId: transaction.id,
          transId: payoutResult.transId,
          status: payoutResult.status,
          amount: amount,
          message: payoutResult.message,
          dateInitiated: payoutResult.dateInitiated,
        },
      });
    } catch (error) {
      console.error("Initialize payout error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initialize payout",
        error: error.message,
      });
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(req, res) {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      if (type) {
        whereClause.type = type;
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: parseInt(limit),
        include: {
          booking: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      const total = await prisma.transaction.count({
        where: whereClause,
      });

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment history",
      });
    }
  }

  /**
   * Get Fapshi service balance (admin only)
   */
  async getBalance(req, res) {
    try {
      const { serviceType = "COLLECTION" } = req.query;

      const balance = await fapshiService.getBalance(serviceType);

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get balance",
        error: error.message,
      });
    }
  }

  /**
   * Search transactions (admin only)
   */
  async searchTransactions(req, res) {
    try {
      const { serviceType = "COLLECTION", ...params } = req.query;

      const transactions = await fapshiService.searchTransactions(
        params,
        serviceType
      );

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error("Search transactions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search transactions",
        error: error.message,
      });
    }
  }
}

module.exports = new PaymentController();
