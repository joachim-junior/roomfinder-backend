const express = require("express");
const router = express.Router();
const payoutRequestController = require("../controllers/payoutRequestController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validatePayoutRequest = [
    body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1000 })
    .withMessage("Minimum payout amount is 1,000 XAF"),
    body("phoneNumber")
    .optional()
    .matches(/^(\+237)?6[0-9]{8}$/)
    .withMessage("Invalid Cameroon phone number format"),
    body("paymentMethod")
    .optional()
    .isIn(["MOBILE_MONEY", "ORANGE_MONEY"])
    .withMessage("Payment method must be MOBILE_MONEY or ORANGE_MONEY"),
];

const validateApproval = [
    body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

const validateRejection = [
    body("reason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isString()
    .isLength({ max: 500 })
    .withMessage("Reason must be less than 500 characters"),
];

// Host routes (require authentication)
router.use(authenticateToken);

// Calculate payout fees (preview)
router.get(
    "/calculate-fees",
    requireRole(["HOST", "ADMIN"]),
    payoutRequestController.calculatePayoutFees
);

// Get eligible payout amount
router.get(
    "/eligible-amount",
    requireRole(["HOST", "ADMIN"]),
    payoutRequestController.getEligibleAmount
);

// Create payout request
router.post(
    "/request",
    requireRole(["HOST", "ADMIN"]),
    validatePayoutRequest,
    payoutRequestController.createPayoutRequest
);

// Get host's payout requests
router.get(
    "/my-requests",
    requireRole(["HOST", "ADMIN"]),
    payoutRequestController.getHostPayoutRequests
);

// Cancel payout request (only if PENDING)
router.put(
    "/:requestId/cancel",
    requireRole(["HOST", "ADMIN"]),
    payoutRequestController.cancelPayoutRequest
);

// Admin routes
router.use(requireRole(["ADMIN"]));

// Get all payout requests
router.get("/all", payoutRequestController.getAllPayoutRequests);

// Get payout statistics
router.get("/statistics", payoutRequestController.getPayoutStatistics);

// Approve payout request
router.post(
    "/:requestId/approve",
    validateApproval,
    payoutRequestController.approvePayoutRequest
);

// Reject payout request
router.post(
    "/:requestId/reject",
    validateRejection,
    payoutRequestController.rejectPayoutRequest
);

module.exports = router;