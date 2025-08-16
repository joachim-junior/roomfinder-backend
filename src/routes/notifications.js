const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication to all notification routes
router.use(authenticateToken);

// Get user's notifications
router.get("/", notificationController.getUserNotifications);

// Get notification statistics
router.get("/stats", notificationController.getNotificationStats);

// Get notification preferences
router.get("/preferences", notificationController.getNotificationPreferences);

// Update notification preferences
router.put(
  "/preferences",
  notificationController.updateNotificationPreferences
);

// Mark notification as read
router.put(
  "/:notificationId/read",
  notificationController.markNotificationAsRead
);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
