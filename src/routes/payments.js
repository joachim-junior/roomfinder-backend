const express = require("express");
const { body, param, query } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validatePaymentMethod = [
  body("paymentMethod")
    .isIn(["MOBILE_MONEY", "ORANGE_MONEY"])
    .withMessage("Payment method must be either MOBILE_MONEY or ORANGE_MONEY"),
];

const validatePayout = [
  body("amount")
    .isFloat({ min: 100 })
    .withMessage("Amount must be at least 100 XAF"),
  body("paymentMethod")
    .isIn(["MOBILE_MONEY", "ORANGE_MONEY"])
    .withMessage("Payment method must be either MOBILE_MONEY or ORANGE_MONEY"),
];

const validateBookingId = [
  param("bookingId")
    .isString()
    .notEmpty()
    .withMessage("Booking ID is required"),
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("type")
    .optional()
    .isIn(["PAYMENT", "WITHDRAWAL", "REFUND"])
    .withMessage("Type must be PAYMENT, WITHDRAWAL, or REFUND"),
];

// Public routes (no authentication required)
/**
 * @route   GET /payments/methods
 * @desc    Get available payment methods
 * @access  Public
 */
router.get("/methods", paymentController.getPaymentMethods);

/**
 * @route   POST /payments/webhook
 * @desc    Process Fapshi webhook
 * @access  Public (webhook endpoint)
 */
router.post("/webhook", paymentController.processWebhook);

// Protected routes (authentication required)
router.use(authenticateToken);

/**
 * @route   POST /payments/booking/:bookingId/initialize
 * @desc    Initialize payment for a booking
 * @access  Authenticated users
 */
router.post(
  "/booking/:bookingId/initialize",
  validateBookingId,
  validatePaymentMethod,
  paymentController.initializePayment
);

/**
 * @route   POST /payments/booking/:bookingId/verify
 * @desc    Verify payment status for a booking
 * @access  Authenticated users
 */
router.post(
  "/booking/:bookingId/verify",
  validateBookingId,
  paymentController.verifyPayment
);

/**
 * @route   POST /payments/payout
 * @desc    Initialize host payout
 * @access  Authenticated users (hosts)
 */
router.post("/payout", validatePayout, paymentController.initializePayout);

/**
 * @route   GET /payments/history
 * @desc    Get payment history for user
 * @access  Authenticated users
 */
router.get("/history", validatePagination, paymentController.getPaymentHistory);

// Admin-only routes
/**
 * @route   GET /payments/balance
 * @desc    Get Fapshi service balance
 * @access  Admin only
 */
router.get("/balance", requireAdmin, paymentController.getBalance);

/**
 * @route   GET /payments/search
 * @desc    Search Fapshi transactions
 * @access  Admin only
 */
router.get("/search", requireAdmin, paymentController.searchTransactions);

module.exports = router;
