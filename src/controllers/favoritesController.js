const favoritesService = require("../utils/favoritesService");
const { validationResult } = require("express-validator");

class FavoritesController {
  // Add property to favorites
  async addToFavorites(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { propertyId } = req.body;
      const userId = req.user.id;

      const favorite = await favoritesService.addToFavorites(
        userId,
        propertyId
      );

      res.status(201).json({
        success: true,
        message: "Property added to favorites successfully",
        data: favorite,
      });
    } catch (error) {
      console.error("Add to favorites error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add property to favorites",
      });
    }
  }

  // Remove property from favorites
  async removeFromFavorites(req, res) {
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      const result = await favoritesService.removeFromFavorites(
        userId,
        propertyId
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Remove from favorites error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove property from favorites",
      });
    }
  }

  // Get user's favorite properties
  async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await favoritesService.getUserFavorites(
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Favorites retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve favorites",
      });
    }
  }

  // Check if property is favorited
  async checkIfFavorited(req, res) {
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      const isFavorited = await favoritesService.isPropertyFavorited(
        userId,
        propertyId
      );

      res.json({
        success: true,
        data: { isFavorited },
      });
    } catch (error) {
      console.error("Check favorited error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check favorite status",
      });
    }
  }

  // Get property favorite count
  async getPropertyFavoriteCount(req, res) {
    try {
      const { propertyId } = req.params;

      const count = await favoritesService.getPropertyFavoriteCount(propertyId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Get favorite count error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get favorite count",
      });
    }
  }

  // Get user's favorite count
  async getUserFavoriteCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await favoritesService.getUserFavoriteCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Get user favorite count error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user favorite count",
      });
    }
  }
}

module.exports = new FavoritesController();
