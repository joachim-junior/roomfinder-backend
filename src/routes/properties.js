const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const {
  authenticateToken,
  requireRole,
  optionalAuth,
} = require("../middleware/auth");

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
  requireRole(["HOST", "ADMIN"]),
  propertyController.createProperty
);

// Property management (owner or admin only)
router.put("/:id", propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;
