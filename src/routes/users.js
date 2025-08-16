const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Profile management
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.get("/stats", userController.getUserStats);
router.get("/activity", userController.getUserActivity);
router.get("/dashboard-stats", userController.getGuestDashboardStats);

// Account management
router.delete("/account", userController.deleteUserAccount);

module.exports = router;
