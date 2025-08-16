const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/revenueController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateRevenueConfig = [
    body("name")
    .notEmpty()
    .withMessage("Configuration name is required")
    .isString()
    .withMessage("Name must be a string"),
    body("hostServiceFeePercent")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Host service fee must be between 0 and 100"),
    body("guestServiceFeePercent")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Guest service fee must be between 0 and 100"),
    body("hostServiceFeeMin")
    .isFloat({ min: 0 })
    .withMessage("Host service fee minimum must be 0 or greater"),
    body("guestServiceFeeMin")
    .isFloat({ min: 0 })
    .withMessage("Guest service fee minimum must be 0 or greater"),
];

const validateFeeCalculation = [
    body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
    body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string"),
];

// Public routes (for fee calculation display)
router.get("/fee-breakdown", revenueController.getFeeBreakdown);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get current revenue configuration
router.get("/config", revenueController.getRevenueConfig);

// Calculate fees
router.post(
    "/calculate-fees",
    validateFeeCalculation,
    revenueController.calculateFees
);

// Admin routes (require ADMIN role)
router.use(requireRole(["ADMIN"]));

// Get all revenue configurations
router.get("/configs", revenueController.getAllRevenueConfigs);

// Create new revenue configuration
router.post(
    "/configs",
    validateRevenueConfig,
    revenueController.createRevenueConfig
);

// Update revenue configuration
router.put(
    "/configs/:configId",
    validateRevenueConfig,
    revenueController.updateRevenueConfig
);

// Activate revenue configuration
router.put(
    "/configs/:configId/activate",
    revenueController.activateRevenueConfig
);

// Get revenue statistics
router.get("/stats", revenueController.getRevenueStats);

// Get current month statistics
router.get("/stats/current-month", revenueController.getCurrentMonthStats);

module.exports = router;