const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const {
  authenticateToken,
  requireRole,
  requireVerification,
  optionalAuth,
} = require("../middleware/auth");
const {
  validateProperty,
  validatePropertyUpdate,
} = require("../middleware/validation");

// Public routes (with optional authentication)
router.get("/", optionalAuth, propertyController.getProperties);
router.get("/search", optionalAuth, propertyController.searchProperties);
router.get("/:id", optionalAuth, propertyController.getPropertyById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Host-only routes (require verification for hosts)
router.post(
  "/",
  validateProperty,
  requireRole(["HOST", "ADMIN"]),
  requireVerification,
  propertyController.createProperty
);
router.get("/host/my-properties", propertyController.getHostProperties);
router.get("/host/stats", propertyController.getPropertyStats);

// Property management (owner or admin only)
router.put("/:id", validatePropertyUpdate, propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;
