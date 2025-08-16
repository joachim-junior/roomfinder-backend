const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateEnquiry = [
  body("propertyId").notEmpty().withMessage("Property ID is required"),
  body("subject")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Subject must be between 5 and 100 characters"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters"),
  body("priority")
    .optional()
    .isIn(["LOW", "NORMAL", "HIGH", "URGENT"])
    .withMessage("Priority must be LOW, NORMAL, HIGH, or URGENT"),
];

const validateResponse = [
  body("response")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Response must be between 10 and 1000 characters"),
];

const validateStatus = [
  body("status")
    .isIn(["PENDING", "RESPONDED", "CLOSED", "SPAM"])
    .withMessage("Status must be PENDING, RESPONDED, CLOSED, or SPAM"),
];

// All routes require authentication
router.use(authenticateToken);

// Create a new enquiry (guests only)
router.post("/", validateEnquiry, enquiryController.createEnquiry);

// Get user's enquiries (as guest or host)
router.get("/", enquiryController.getUserEnquiries);

// Get enquiry statistics
router.get("/stats", enquiryController.getEnquiryStats);

// Get a specific enquiry by ID
router.get("/:enquiryId", enquiryController.getEnquiryById);

// Respond to an enquiry (host only)
router.post(
  "/:enquiryId/respond",
  validateResponse,
  enquiryController.respondToEnquiry
);

// Update enquiry status (host or admin)
router.put(
  "/:enquiryId/status",
  validateStatus,
  enquiryController.updateEnquiryStatus
);

// Get enquiries for a specific property (host only)
router.get("/property/:propertyId", enquiryController.getPropertyEnquiries);

// Admin routes
router.use(requireRole(["ADMIN"]));

// Get all enquiries (admin only)
router.get("/admin/all", enquiryController.getAllEnquiries);

module.exports = router;
