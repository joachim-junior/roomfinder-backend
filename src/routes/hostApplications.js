const express = require("express");
const router = express.Router();
const hostApplicationController = require("../controllers/hostApplicationController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateHostApplication = [
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
];

const validateApproval = [
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

const validateRejection = [
  body("reason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isString()
    .withMessage("Reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Reason must be less than 500 characters"),
];

const validateSuspension = [
  body("reason")
    .notEmpty()
    .withMessage("Suspension reason is required")
    .isString()
    .withMessage("Reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Reason must be less than 500 characters"),
];

// User routes (require authentication)
router.use(authenticateToken);

// Submit host application (GUEST only)
router.post(
  "/apply",
  validateHostApplication,
  requireRole(["GUEST"]),
  hostApplicationController.submitApplication
);

// Get user's application status
router.get("/status", hostApplicationController.getApplicationStatus);

// Admin routes (require ADMIN role)
router.use(requireRole(["ADMIN"]));

// Get all pending applications
router.get("/pending", hostApplicationController.getPendingApplications);

// Get application statistics
router.get("/stats", hostApplicationController.getApplicationStats);

// Approve application
router.put(
  "/:userId/approve",
  validateApproval,
  hostApplicationController.approveApplication
);

// Reject application
router.put(
  "/:userId/reject",
  validateRejection,
  hostApplicationController.rejectApplication
);

// Suspend host
router.put(
  "/:userId/suspend",
  validateSuspension,
  hostApplicationController.suspendHost
);

module.exports = router;
