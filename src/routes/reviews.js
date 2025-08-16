const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  validateReview,
  validateReviewUpdate,
} = require("../middleware/validation");

// Public routes (no authentication required)
router.get("/property/:propertyId", reviewController.getPropertyReviews);
router.get(
  "/property/:propertyId/stats",
  reviewController.getPropertyReviewStats
);

// Protected routes (require authentication)
router.use(authenticateToken);

// Guest routes
router.post("/", validateReview, reviewController.createReview);
router.get("/my-reviews", reviewController.getUserReviews);

// Host routes
router.get(
  "/host/reviews",
  requireRole(["HOST", "ADMIN"]),
  reviewController.getHostReviews
);
router.get(
  "/host/stats",
  requireRole(["HOST", "ADMIN"]),
  reviewController.getHostReviewStats
);

// Review management routes (must come after specific routes)
router.get("/:id", reviewController.getReviewById);
router.put("/:id", validateReviewUpdate, reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
