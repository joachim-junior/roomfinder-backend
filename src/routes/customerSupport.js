const express = require("express");
const { body, param } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const customerSupportController = require("../controllers/customerSupportController");

const router = express.Router();

// Validation middleware
const validateCreateTicket = [
    body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),
    body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
    body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
        "BOOKING_ISSUES",
        "PAYMENTS_BILLING",
        "ACCOUNT_MANAGEMENT",
        "TECHNICAL_SUPPORT",
        "SAFETY_SECURITY",
    ])
    .withMessage("Invalid category"),
    body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .withMessage("Invalid priority"),
    body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

const validateAddMessage = [
    param("ticketId").notEmpty().withMessage("Ticket ID is required"),
    body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters"),
    body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

const validateAdminMessage = [
    param("ticketId").notEmpty().withMessage("Ticket ID is required"),
    body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters"),
    body("isInternal")
    .optional()
    .isBoolean()
    .withMessage("isInternal must be a boolean"),
    body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

const validateUpdateTicket = [
    param("ticketId").notEmpty().withMessage("Ticket ID is required"),
    body("status")
    .optional()
    .isIn([
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_USER",
        "RESOLVED",
        "CLOSED",
        "ESCALATED",
    ])
    .withMessage("Invalid status"),
    body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .withMessage("Invalid priority"),
    body("assignedToId")
    .optional()
    .isString()
    .withMessage("Assigned to ID must be a string"),
    body("resolution")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Resolution must not exceed 1000 characters"),
];

// Public routes
router.get("/options", customerSupportController.getSupportOptions);

// User routes (authenticated)
router.post(
    "/tickets",
    authenticateToken,
    ...validateCreateTicket,
    customerSupportController.createTicket
);
router.get(
    "/tickets",
    authenticateToken,
    customerSupportController.getUserTickets
);
router.get(
    "/tickets/:ticketId",
    authenticateToken,
    param("ticketId").notEmpty(),
    customerSupportController.getTicketById
);
router.post(
    "/tickets/:ticketId/messages",
    authenticateToken,
    ...validateAddMessage,
    customerSupportController.addMessage
);

// Admin routes (admin only)
router.get(
    "/admin/tickets",
    authenticateToken,
    customerSupportController.getAllTickets
);
router.get(
    "/admin/stats",
    authenticateToken,
    customerSupportController.getSupportStats
);
router.put(
    "/admin/tickets/:ticketId",
    authenticateToken,
    ...validateUpdateTicket,
    customerSupportController.updateTicket
);
router.post(
    "/admin/tickets/:ticketId/messages",
    authenticateToken,
    ...validateAdminMessage,
    customerSupportController.addAdminMessage
);

module.exports = router;