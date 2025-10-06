const admin = require("firebase-admin");
const { prisma } = require("./database");

class FirebaseService {
  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        // Check if Firebase credentials are properly configured
        if (
          !process.env.FIREBASE_PROJECT_ID ||
          !process.env.FIREBASE_PRIVATE_KEY ||
          !process.env.FIREBASE_CLIENT_EMAIL ||
          process.env.FIREBASE_PROJECT_ID === "your-firebase-project-id" ||
          process.env.FIREBASE_PRIVATE_KEY === "your-private-key" ||
          process.env.FIREBASE_CLIENT_EMAIL === "your-client-email"
        ) {
          console.log(
            "⚠️ Firebase credentials not configured. Push notifications will be disabled."
          );
          return;
        }

        // For Railway deployment, we'll use environment variables
        const serviceAccount = {
          type: process.env.FIREBASE_TYPE || "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri:
            process.env.FIREBASE_AUTH_URI ||
            "https://accounts.google.com/o/oauth2/auth",
          token_uri:
            process.env.FIREBASE_TOKEN_URI ||
            "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        console.log("✅ Firebase Admin SDK initialized successfully");
      }
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error.message);
      console.log(
        "⚠️ Push notifications will be disabled. Configure Firebase credentials to enable."
      );
      // Don't throw error, allow app to continue without Firebase
    }
  }

  /**
   * Register device token for a user
   * Uses upsert to handle cases where:
   * - Same token is re-registered by same user (update)
   * - Same token is registered by different user (update userId)
   * - New token is registered (create)
   */
  async registerDeviceToken(userId, deviceToken, platform = "android") {
    try {
      // Use upsert to handle duplicate tokens gracefully
      await prisma.deviceToken.upsert({
        where: {
          token: deviceToken,
        },
        update: {
          userId: userId,
          platform: platform,
          isActive: true,
          lastUsed: new Date(),
        },
        create: {
          userId: userId,
          token: deviceToken,
          platform: platform,
          isActive: true,
        },
      });

      return { success: true, message: "Device token registered successfully" };
    } catch (error) {
      console.error("Error registering device token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(userId, deviceToken) {
    try {
      await prisma.deviceToken.updateMany({
        where: {
          userId,
          token: deviceToken,
        },
        data: {
          isActive: false,
          lastUsed: new Date(),
        },
      });

      return {
        success: true,
        message: "Device token unregistered successfully",
      };
    } catch (error) {
      console.error("Error unregistering device token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Get user's device tokens
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          token: true,
          platform: true,
        },
      });

      if (deviceTokens.length === 0) {
        return {
          success: false,
          message: "No active device tokens found for user",
        };
      }

      const results = [];
      const tokens = deviceTokens.map((dt) => dt.token);

      // Send to all user's devices
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // For Flutter apps
          sound: "default",
          badge: "1",
        },
        android: {
          notification: {
            sound: "default",
            channel_id: "room_finder_channel",
            priority: "high",
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              alert: {
                title,
                body,
              },
            },
          },
        },
        tokens,
      };

      // Check if Firebase messaging is available and send notification
      let response;
      try {
        if (!admin.apps.length) {
          throw new Error("Firebase not initialized");
        }
        response = await admin.messaging().sendMulticast(message);
      } catch (error) {
        console.error("Firebase messaging error:", error.message);
        return {
          success: false,
          message: "Firebase messaging service not available: " + error.message,
        };
      }

      // Handle results
      response.responses.forEach((result, index) => {
        if (result.success) {
          results.push({
            token: tokens[index],
            success: true,
          });
        } else {
          console.error(
            "Failed to send to token:",
            tokens[index],
            result.error
          );

          // If token is invalid, mark it as inactive
          if (
            result.error.code === "messaging/invalid-registration-token" ||
            result.error.code === "messaging/registration-token-not-registered"
          ) {
            this.markTokenInactive(tokens[index]);
          }

          results.push({
            token: tokens[index],
            success: false,
            error: result.error.message,
          });
        }
      });

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId,
          title,
          body,
          type: "PUSH",
          status: "SENT",
          data: JSON.stringify(data),
        },
      });

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: true,
        message: `Push notification sent to ${successCount} devices`,
        results: {
          total: results.length,
          success: successCount,
          failure: failureCount,
          details: results,
        },
      };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendPushNotificationToUsers(userIds, title, body, data = {}) {
    try {
      const results = [];

      for (const userId of userIds) {
        const result = await this.sendPushNotification(
          userId,
          title,
          body,
          data
        );
        results.push({ userId, ...result });
      }

      return {
        success: true,
        message: `Push notifications sent to ${userIds.length} users`,
        results,
      };
    } catch (error) {
      console.error("Error sending push notifications to users:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to topic subscribers
   */
  async sendPushNotificationToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        android: {
          notification: {
            sound: "default",
            channel_id: "room_finder_channel",
            priority: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              alert: {
                title,
                body,
              },
            },
          },
        },
        topic,
      };

      const response = await admin.messaging().send(message);

      // Store notification for topic subscribers
      await prisma.notification.create({
        data: {
          title,
          body,
          type: "PUSH",
          status: "SENT",
          data: JSON.stringify({ ...data, topic }),
        },
      });

      return {
        success: true,
        message: `Push notification sent to topic: ${topic}`,
        messageId: response,
      };
    } catch (error) {
      console.error("Error sending push notification to topic:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe user to a topic
   */
  async subscribeToTopic(userId, topic) {
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: { token: true },
      });

      if (deviceTokens.length === 0) {
        return {
          success: false,
          message: "No active device tokens found for user",
        };
      }

      const tokens = deviceTokens.map((dt) => dt.token);
      const response = await admin.messaging().subscribeToTopic(tokens, topic);

      return {
        success: true,
        message: `Subscribed ${response.successCount} devices to topic: ${topic}`,
        results: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
      };
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe user from a topic
   */
  async unsubscribeFromTopic(userId, topic) {
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: { token: true },
      });

      if (deviceTokens.length === 0) {
        return {
          success: false,
          message: "No active device tokens found for user",
        };
      }

      const tokens = deviceTokens.map((dt) => dt.token);
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokens, topic);

      return {
        success: true,
        message: `Unsubscribed ${response.successCount} devices from topic: ${topic}`,
        results: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
      };
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark device token as inactive
   */
  async markTokenInactive(token) {
    try {
      await prisma.deviceToken.updateMany({
        where: { token },
        data: {
          isActive: false,
          lastUsed: new Date(),
        },
      });
    } catch (error) {
      console.error("Error marking token inactive:", error);
    }
  }

  /**
   * Get user's device tokens
   */
  async getUserDeviceTokens(userId) {
    try {
      const tokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          token: true,
          platform: true,
          createdAt: true,
          lastUsed: true,
        },
      });

      return { success: true, data: tokens };
    } catch (error) {
      console.error("Error getting user device tokens:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up inactive tokens
   */
  async cleanupInactiveTokens() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.deviceToken.deleteMany({
        where: {
          isActive: false,
          lastUsed: {
            lt: thirtyDaysAgo,
          },
        },
      });

      return {
        success: true,
        message: `Cleaned up ${result.count} inactive tokens`,
      };
    } catch (error) {
      console.error("Error cleaning up inactive tokens:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FirebaseService();
