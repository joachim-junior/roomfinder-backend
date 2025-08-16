const express = require("express");
const router = express.Router();
const pushNotificationController = require("../controllers/pushNotificationController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Apply authentication to all push notification routes
router.use(authenticateToken);

// Device token management
router.post("/register-token", pushNotificationController.registerDeviceToken);
router.post(
  "/unregister-token",
  pushNotificationController.unregisterDeviceToken
);
router.get("/device-tokens", pushNotificationController.getUserDeviceTokens);

// Test notifications
router.post("/test", pushNotificationController.sendTestNotification);

// Topic management
router.post("/subscribe-topic", pushNotificationController.subscribeToTopic);
router.post(
  "/unsubscribe-topic",
  pushNotificationController.unsubscribeFromTopic
);

// Admin routes
router.post(
  "/send-to-topic",
  requireRole(["ADMIN"]),
  pushNotificationController.sendNotificationToTopic
);
router.post(
  "/cleanup-tokens",
  requireRole(["ADMIN"]),
  pushNotificationController.cleanupInactiveTokens
);

module.exports = router;
