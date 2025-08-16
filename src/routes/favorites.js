const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const { authenticateToken } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateAddToFavorites = [
  body("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .isString()
    .withMessage("Property ID must be a string"),
];

// All routes require authentication
router.use(authenticateToken);

// Add property to favorites
router.post("/", validateAddToFavorites, favoritesController.addToFavorites);

// Remove property from favorites
router.delete("/:propertyId", favoritesController.removeFromFavorites);

// Get user's favorite properties
router.get("/", favoritesController.getUserFavorites);

// Check if property is favorited
router.get("/check/:propertyId", favoritesController.checkIfFavorited);

// Get property favorite count (public route)
router.get("/count/:propertyId", favoritesController.getPropertyFavoriteCount);

// Get user's favorite count
router.get("/user/count", favoritesController.getUserFavoriteCount);

module.exports = router;
