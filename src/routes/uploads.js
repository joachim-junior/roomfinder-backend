const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} = require("../middleware/upload");

// Apply authentication to all upload routes
router.use(authenticateToken);

// Single image upload (avatar, property main image)
router.post(
  "/single",
  uploadSingle,
  handleUploadError,
  uploadController.uploadSingleImage
);

// Multiple images upload (property galleries)
router.post(
  "/multiple",
  uploadMultiple,
  handleUploadError,
  uploadController.uploadMultipleImages
);

// Update property images (host only)
router.put(
  "/property/:propertyId",
  requireRole(["HOST", "ADMIN"]),
  uploadMultiple,
  handleUploadError,
  uploadController.updatePropertyImages
);

// Delete image (owner or admin only)
router.delete("/:folder/:fileName", uploadController.deleteImage);

// Get image info
router.get("/:folder/:fileName", uploadController.getImageInfo);

module.exports = router;
