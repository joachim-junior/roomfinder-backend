const express = require("express");
const router = express.Router();
const helpCenterController = require("../controllers/helpCenterController");
const {
  authenticateToken,
  requireRole,
  optionalAuth,
} = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateArticle = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "GETTING_STARTED",
      "BOOKING",
      "HOSTING",
      "PAYMENTS",
      "ACCOUNT",
      "SAFETY",
      "TROUBLESHOOTING",
      "GENERAL",
    ])
    .withMessage("Invalid category"),
  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Priority must be LOW, MEDIUM, HIGH, or CRITICAL"),
];

const validateArticleRating = [
  body("isHelpful")
    .isBoolean()
    .withMessage("isHelpful must be a boolean value"),
];

// Public routes
router.get("/", helpCenterController.getAllArticles);
router.get("/search", helpCenterController.searchArticles);
router.get("/category/:category", helpCenterController.getArticlesByCategory);
router.get("/:slug", helpCenterController.getArticleBySlug);

// Rate article (optional auth for tracking)
router.post(
  "/:articleId/rate",
  optionalAuth,
  validateArticleRating,
  helpCenterController.rateArticle
);

// Admin routes (require ADMIN role)
router.use(authenticateToken, requireRole(["ADMIN"]));

// Article management
router.post("/", validateArticle, helpCenterController.createArticle);
router.put("/:articleId", validateArticle, helpCenterController.updateArticle);
router.delete("/:articleId", helpCenterController.deleteArticle);

// Statistics
router.get("/stats/overview", helpCenterController.getHelpCenterStats);

module.exports = router;
