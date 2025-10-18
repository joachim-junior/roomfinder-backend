const express = require("express");
const router = express.Router();
const adminNotificationController = require("../controllers/adminNotificationController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body, query } = require("express-validator");

// Validation middleware
const validateNotification = [
    body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
    body("body")
    .notEmpty()
    .withMessage("Body is required")
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Body must be between 10 and 1000 characters"),
    body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Priority must be LOW, MEDIUM, or HIGH"),
    body("actionUrl")
    .optional()
    .isURL()
    .withMessage("Action URL must be a valid URL"),
    body("sendEmail")
    .optional()
    .isBoolean()
    .withMessage("sendEmail must be a boolean"),
    body("sendPush")
    .optional()
    .isBoolean()
    .withMessage("sendPush must be a boolean"),
    body("sendInApp")
    .optional()
    .isBoolean()
    .withMessage("sendInApp must be a boolean"),
];

const validateUserNotification = [
    ...validateNotification,
    body("userIds")
    .isArray({ min: 1 })
    .withMessage("User IDs must be an array with at least one user"),
    body("userIds.*").isString().withMessage("Each user ID must be a string"),
];

const validateRoleNotification = [
    ...validateNotification,
    body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["GUEST", "HOST", "ADMIN"])
    .withMessage("Role must be GUEST, HOST, or ADMIN"),
];

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(["ADMIN"]));

// Send notification to specific users
router.post(
    "/send-to-users",
    validateUserNotification,
    adminNotificationController.sendToUsers
);

// Send notification to users by role
router.post(
    "/send-to-role",
    validateRoleNotification,
    adminNotificationController.sendToRole
);

// Send notification to all users
router.post(
    "/send-to-all",
    validateNotification,
    adminNotificationController.sendToAll
);

// Get notification statistics
router.get("/stats", adminNotificationController.getStats);

// Get users for notification targeting
router.get(
    "/users", [
        query("role").optional().isIn(["GUEST", "HOST", "ADMIN"]),
        query("isVerified").optional().isBoolean(),
        query("search").optional().isString(),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 }),
    ],
    adminNotificationController.getUsers
);

module.exports = router;