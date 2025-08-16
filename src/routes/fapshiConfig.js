const express = require("express");
const { body, param } = require("express-validator");
const fapshiConfigController = require("../controllers/fapshiConfigController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validateFapshiConfig = [
  body("serviceType")
    .isIn(["COLLECTION", "DISBURSEMENT"])
    .withMessage("Service type must be either COLLECTION or DISBURSEMENT"),
  body("environment")
    .optional()
    .isIn(["SANDBOX", "PRODUCTION"])
    .withMessage("Environment must be either SANDBOX or PRODUCTION"),
  body("apiKey").isString().notEmpty().withMessage("API key is required"),
  body("apiUser").isString().notEmpty().withMessage("API user is required"),
  body("webhookUrl")
    .optional()
    .isURL()
    .withMessage("Webhook URL must be a valid URL"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const validateServiceType = [
  param("serviceType")
    .isIn(["COLLECTION", "DISBURSEMENT"])
    .withMessage("Service type must be either COLLECTION or DISBURSEMENT"),
  param("environment")
    .isIn(["SANDBOX", "PRODUCTION"])
    .withMessage("Environment must be either SANDBOX or PRODUCTION"),
];

const validateConfigId = [
  param("configId")
    .isString()
    .notEmpty()
    .withMessage("Configuration ID is required"),
];

// Routes - All routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * @route   GET /fapshi-config
 * @desc    Get all Fapshi configurations
 * @access  Admin only
 */
router.get("/", fapshiConfigController.getAllConfigs);

/**
 * @route   GET /fapshi-config/stats
 * @desc    Get Fapshi configuration statistics
 * @access  Admin only
 */
router.get("/stats", fapshiConfigController.getConfigStats);

/**
 * @route   GET /fapshi-config/:serviceType/:environment
 * @desc    Get Fapshi configuration by service type and environment
 * @access  Admin only
 */
router.get(
  "/:serviceType/:environment",
  validateServiceType,
  fapshiConfigController.getConfig
);

/**
 * @route   POST /fapshi-config
 * @desc    Create or update Fapshi configuration
 * @access  Admin only
 */
router.post("/", validateFapshiConfig, fapshiConfigController.upsertConfig);

/**
 * @route   PUT /fapshi-config/:configId
 * @desc    Update Fapshi configuration
 * @access  Admin only
 */
router.put(
  "/:configId",
  validateConfigId,
  validateFapshiConfig,
  fapshiConfigController.updateConfig
);

/**
 * @route   PATCH /fapshi-config/:configId/toggle
 * @desc    Toggle Fapshi configuration active status
 * @access  Admin only
 */
router.patch(
  "/:configId/toggle",
  validateConfigId,
  fapshiConfigController.toggleConfigStatus
);

/**
 * @route   POST /fapshi-config/:configId/test
 * @desc    Test Fapshi configuration
 * @access  Admin only
 */
router.post(
  "/:configId/test",
  validateConfigId,
  fapshiConfigController.testConfig
);

/**
 * @route   DELETE /fapshi-config/:configId
 * @desc    Delete Fapshi configuration
 * @access  Admin only
 */
router.delete(
  "/:configId",
  validateConfigId,
  fapshiConfigController.deleteConfig
);

module.exports = router;
