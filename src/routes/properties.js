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

// Protected routes (require authentication)
// These must be defined BEFORE /:id to avoid the catch-all matching "host" as an id
router.get(
  "/host/my-properties",
  authenticateToken,
  propertyController.getHostProperties
);
router.get(
  "/host/stats",
  authenticateToken,
  propertyController.getPropertyStats
);

// Public single property route (must come after /host/* routes)
router.get("/:id", optionalAuth, propertyController.getPropertyById);

// Protected write routes
router.use(authenticateToken);

router.post(
  "/",
  validateProperty,
  requireRole(["HOST", "ADMIN"]),
  requireVerification,
  propertyController.createProperty
);

// Property management (owner or admin only)
router.put("/:id", validatePropertyUpdate, propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;
