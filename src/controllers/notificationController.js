const { prisma, handleDatabaseError } = require("../utils/database");
const notificationService = require("../utils/notificationService");

/**
 * Get user's notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
    };

    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        status: true,
        data: true,
        createdAt: true,
        readAt: true,
      },
    });

    const total = await prisma.notification.count({ where });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
        message:
          "Notification not found or you do not have permission to access it",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: "READ",
        readAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        status: true,
        readAt: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: "Notification marked as read",
      data: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
        message:
          "Notification not found or you do not have permission to delete it",
      });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    const stats = await prisma.notification.groupBy({
      by: ["status"],
      where: {
        userId: req.user.id,
      },
      _count: {
        status: true,
      },
    });

    const total = await prisma.notification.count({
      where: { userId: req.user.id },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        status: "UNREAD",
      },
    });

    res.json({
      success: true,
      data: {
        total,
        unread: unreadCount,
        read: total - unreadCount,
        breakdown: stats,
      },
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      bookingNotifications,
      reviewNotifications,
    } = req.body;

    const preferences = await prisma.userNotificationPreferences.upsert({
      where: { userId: req.user.id },
      update: {
        emailNotifications:
          emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications:
          pushNotifications !== undefined ? pushNotifications : true,
        bookingNotifications:
          bookingNotifications !== undefined ? bookingNotifications : true,
        reviewNotifications:
          reviewNotifications !== undefined ? reviewNotifications : true,
      },
      create: {
        userId: req.user.id,
        emailNotifications:
          emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications:
          pushNotifications !== undefined ? pushNotifications : true,
        bookingNotifications:
          bookingNotifications !== undefined ? bookingNotifications : true,
        reviewNotifications:
          reviewNotifications !== undefined ? reviewNotifications : true,
      },
    });

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
      data: preferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId: req.user.id },
    });

    if (!preferences) {
      // Return default preferences
      const defaultPreferences = {
        userId: req.user.id,
        emailNotifications: true,
        pushNotifications: true,
        bookingNotifications: true,
        reviewNotifications: true,
      };

      return res.json({
        success: true,
        data: defaultPreferences,
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  updateNotificationPreferences,
  getNotificationPreferences,
};
