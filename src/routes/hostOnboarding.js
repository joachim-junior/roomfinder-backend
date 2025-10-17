const express = require("express");
const router = express.Router();
const hostOnboardingController = require("../controllers/hostOnboardingController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateHostProfile = [
    body("fullLegalName")
    .notEmpty()
    .withMessage("Full legal name is required")
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Full legal name must be between 3 and 100 characters"),
    body("residentialAddress")
    .notEmpty()
    .withMessage("Residential address is required")
    .isString()
    .isLength({ max: 200 })
    .withMessage("Address must be less than 200 characters"),
    body("city").notEmpty().withMessage("City is required").isString(),
    body("region").notEmpty().withMessage("Region is required").isString(),
    body("whatsapp")
    .notEmpty()
    .withMessage("WhatsApp number is required")
    .matches(/^(\+237)?6[0-9]{8}$/)
    .withMessage("Invalid Cameroon WhatsApp number (must start with 6)"),
    body("facebookUrl")
    .optional()
    .isURL()
    .withMessage("facebookUrl must be a valid URL"),
    body("instagramUrl")
    .optional()
    .isURL()
    .withMessage("instagramUrl must be a valid URL"),
    body("payoutPhoneNumber")
    .notEmpty()
    .withMessage("Payout phone number is required")
    .matches(/^(\+237)?6[0-9]{8}$/)
    .withMessage("Invalid Cameroon phone number format (must start with 6)"),
    body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
    body("idExpiryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
];

const validateIdVerification = [
    body("idFrontImage")
    .notEmpty()
    .withMessage("ID front image is required")
    .isURL()
    .withMessage("ID front image must be a valid URL"),
    body("idBackImage")
    .notEmpty()
    .withMessage("ID back image is required")
    .isURL()
    .withMessage("ID back image must be a valid URL"),
    body("selfieImage")
    .notEmpty()
    .withMessage("Selfie image is required")
    .isURL()
    .withMessage("Selfie image must be a valid URL"),
];

const validateVerificationDecision = [
    body("decision")
    .notEmpty()
    .withMessage("Decision is required")
    .isIn(["VERIFIED", "REJECTED"])
    .withMessage("Decision must be VERIFIED or REJECTED"),
    body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

const validatePayoutDetails = [
    body("payoutPhoneNumber")
    .notEmpty()
    .withMessage("Payout phone number is required")
    .matches(/^(\+237)?6[0-9]{8}$/)
    .withMessage("Invalid Cameroon phone number format (must start with 6)"),
    body("payoutPhoneName")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Payout phone name must be less than 100 characters"),
];

// Host routes (require HOST or ADMIN role)
router.use(authenticateToken);
router.use(requireRole(["HOST", "ADMIN"]));

// Create or update host profile
router.post(
    "/profile",
    validateHostProfile,
    hostOnboardingController.createOrUpdateProfile
);
router.put(
    "/profile",
    validateHostProfile,
    hostOnboardingController.createOrUpdateProfile
);

// Upload ID verification
router.post(
    "/id-verification",
    validateIdVerification,
    hostOnboardingController.uploadIdVerification
);

// Upload ownership documents (optional)
router.post(
    "/ownership-documents",
    hostOnboardingController.uploadOwnershipDocuments
);

// Get onboarding status
router.get("/status", hostOnboardingController.getOnboardingStatus);

// Update payout details
router.put(
    "/payout-details",
    validatePayoutDetails,
    hostOnboardingController.updatePayoutDetails
);

// Admin routes
router.use(requireRole(["ADMIN"]));

// Get pending verifications
router.get(
    "/pending-verifications",
    hostOnboardingController.getPendingVerifications
);

// Verify host ID
router.post(
    "/:userId/verify-id",
    validateVerificationDecision,
    hostOnboardingController.verifyHostId
);

// Verify ownership documents
router.post(
    "/:userId/verify-ownership",
    validateVerificationDecision,
    hostOnboardingController.verifyOwnershipDocuments
);

module.exports = router;