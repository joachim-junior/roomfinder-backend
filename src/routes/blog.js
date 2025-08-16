const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const {
  authenticateToken,
  requireRole,
  optionalAuth,
} = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateBlog = [
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
  body("excerpt")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Excerpt must be less than 500 characters"),
  body("status")
    .optional()
    .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .withMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED"),
];

const validateTag = [
  body("name")
    .notEmpty()
    .withMessage("Tag name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tag name must be between 2 and 50 characters"),
  body("slug")
    .notEmpty()
    .withMessage("Tag slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Tag slug must contain only lowercase letters, numbers, and hyphens"
    ),
];

const validateComment = [
  body("content")
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
];

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/tags", blogController.getAllTags);

// Protected routes (require authentication)
router.use(authenticateToken);

// Add comment to blog
router.post("/:blogId/comments", validateComment, blogController.addComment);

// Admin routes (require ADMIN role)
router.use(requireRole(["ADMIN"]));

// Blog management
router.post("/", validateBlog, blogController.createBlog);
router.put("/:blogId", validateBlog, blogController.updateBlog);
router.delete("/:blogId", blogController.deleteBlog);

// Tag management
router.post("/tags", validateTag, blogController.createTag);

// Comment moderation
router.put("/comments/:commentId/moderate", blogController.moderateComment);

// Public route for getting blog by slug (must be last to avoid conflicts)
router.get("/:slug", blogController.getBlogBySlug);

module.exports = router;
