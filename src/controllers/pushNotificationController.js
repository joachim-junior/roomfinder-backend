const { prisma, handleDatabaseError } = require("../utils/database");
const firebaseService = require("../utils/firebaseService");

/**
 * Register device token for push notifications
 */
const registerDeviceToken = async (req, res) => {
  try {
    const { deviceToken, platform = "android" } = req.body;
    const userId = req.user.id;

    if (!deviceToken) {
      return res.status(400).json({
        error: "Device token required",
        message: "Please provide a device token",
      });
    }

    const result = await firebaseService.registerDeviceToken(
      userId,
      deviceToken,
      platform
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          deviceToken,
          platform,
          registeredAt: new Date(),
        },
      });
    } else {
      res.status(400).json({
        error: "Registration failed",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Register device token error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Unregister device token
 */
const unregisterDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user.id;

    if (!deviceToken) {
      return res.status(400).json({
        error: "Device token required",
        message: "Please provide a device token",
      });
    }

    const result = await firebaseService.unregisterDeviceToken(
      userId,
      deviceToken
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        error: "Unregistration failed",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Unregister device token error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get user's device tokens
 */
const getUserDeviceTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await firebaseService.getUserDeviceTokens(userId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
      });
    } else {
      res.status(400).json({
        error: "Failed to get device tokens",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Get user device tokens error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Send test push notification
 */
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title = "Test Notification",
      body = "This is a test push notification",
    } = req.body;

    const result = await firebaseService.sendPushNotification(
      userId,
      title,
      body,
      {
        type: "test",
        timestamp: new Date().toISOString(),
      }
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        error: "Failed to send notification",
        message: result.message || result.error,
      });
    }
  } catch (error) {
    console.error("Send test notification error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Subscribe to topic
 */
const subscribeToTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required",
        message: "Please provide a topic name",
      });
    }

    const result = await firebaseService.subscribeToTopic(userId, topic);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        error: "Subscription failed",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Subscribe to topic error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Unsubscribe from topic
 */
const unsubscribeFromTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required",
        message: "Please provide a topic name",
      });
    }

    const result = await firebaseService.unsubscribeFromTopic(userId, topic);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.results,
      });
    } else {
      res.status(400).json({
        error: "Unsubscription failed",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Unsubscribe from topic error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Send notification to topic (admin only)
 */
const sendNotificationToTopic = async (req, res) => {
  try {
    const { topic, title, body, data = {} } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Topic, title, and body are required",
      });
    }

    const result = await firebaseService.sendPushNotificationToTopic(
      topic,
      title,
      body,
      data
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          messageId: result.messageId,
          topic,
        },
      });
    } else {
      res.status(400).json({
        error: "Failed to send notification",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Send notification to topic error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Clean up inactive tokens (admin only)
 */
const cleanupInactiveTokens = async (req, res) => {
  try {
    const result = await firebaseService.cleanupInactiveTokens();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        error: "Cleanup failed",
        message: result.error,
      });
    }
  } catch (error) {
    console.error("Cleanup inactive tokens error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  sendTestNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendNotificationToTopic,
  cleanupInactiveTokens,
};
