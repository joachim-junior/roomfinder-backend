const { prisma, handleDatabaseError } = require("../utils/database");
const notificationService = require("../utils/notificationService");

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await prisma.user.count();
    const totalProperties = await prisma.property.count();
    const totalBookings = await prisma.booking.count();
    const totalReviews = await prisma.review.count();

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: { title: true, address: true },
        },
        guest: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        host: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // Get booking statistics
    const bookingStats = await prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { totalPrice: true },
    });

    // Get user role statistics
    const userRoleStats = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.booking.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: "COMPLETED",
      },
      _sum: { totalPrice: true },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalReviews,
        },
        recentActivity: {
          users: recentUsers,
          bookings: recentBookings,
          properties: recentProperties,
        },
        statistics: {
          bookingStats,
          userRoleStats,
          monthlyRevenue:
            monthlyRevenue[0] && monthlyRevenue[0]._sum
              ? monthlyRevenue[0]._sum.totalPrice
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get all users with pagination and filters
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isVerified,
      hostApprovalStatus,
      search,
    } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (role) where.role = role;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";
    if (hostApprovalStatus) where.hostApprovalStatus = hostApprovalStatus;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        hostApprovalStatus: true,
        hostApprovalDate: true,
        hostApprovalNotes: true,
        hostRejectionReason: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update user role and verification status
 */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      role,
      isVerified,
      hostApprovalStatus,
      hostApprovalNotes,
      hostRejectionReason,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {
      role: role || user.role,
      isVerified: isVerified !== undefined ? isVerified : user.isVerified,
    };

    // Handle host approval status
    if (hostApprovalStatus) {
      updateData.hostApprovalStatus = hostApprovalStatus;
      updateData.hostApprovalDate = new Date();

      if (hostApprovalStatus === "APPROVED") {
        updateData.hostApprovalNotes = hostApprovalNotes || "Approved by admin";
        updateData.hostRejectionReason = null;
      } else if (hostApprovalStatus === "REJECTED") {
        updateData.hostRejectionReason =
          hostRejectionReason || "Rejected by admin";
        updateData.hostApprovalNotes = hostApprovalNotes || null;
      } else if (hostApprovalStatus === "SUSPENDED") {
        updateData.hostApprovalNotes =
          hostApprovalNotes || "Suspended by admin";
        updateData.hostRejectionReason = hostRejectionReason || null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isVerified: true,
        hostApprovalStatus: true,
        hostApprovalDate: true,
        hostApprovalNotes: true,
        hostRejectionReason: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User not found",
      });
    }

    // Check if user has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        guestId: userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        error: "Cannot delete user",
        message: "User has active bookings",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get all properties with filters
 */
const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isVerified,
      isAvailable,
      search,
    } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (type) where.type = type;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";
    if (isAvailable !== undefined) where.isAvailable = isAvailable === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    const total = await prisma.property.count({ where });

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all properties error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update property verification status
 */
const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isVerified } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: "Property not found",
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        isVerified: isVerified !== undefined ? isVerified : property.isVerified,
      },
      include: {
        host: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get all bookings with filters
 */
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        {
          property: {
            title: { contains: search, mode: "insensitive" },
          },
        },
        {
          guest: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            host: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get system notifications
 */
const getSystemNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;

    const notifications = await prisma.notification.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
    console.error("Get system notifications error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Send system-wide notification
 */
const sendSystemNotification = async (req, res) => {
  try {
    const { title, body, type = "EMAIL", targetUsers = "ALL" } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Title and body are required",
      });
    }

    let users = [];

    if (targetUsers === "ALL") {
      users = await prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true, email: true },
      });
    } else if (targetUsers === "HOSTS") {
      users = await prisma.user.findMany({
        where: { role: "HOST" },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
    } else if (targetUsers === "GUESTS") {
      users = await prisma.user.findMany({
        where: { role: "GUEST" },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
    }

    const results = [];

    for (const user of users) {
      try {
        if (type === "EMAIL") {
          // Send email non-blocking
          notificationService
            .sendEmail(user.email, title, body)
            .catch((err) => {
              console.error(
                `Broadcast email to ${user.email} failed:`,
                err && err.message ? err.message : err
              );
            });
        } else if (type === "PUSH") {
          await notificationService.sendPushNotification(user.id, title, body);
        }

        // Store notification in database
        await prisma.notification.create({
          data: {
            userId: user.id,
            title,
            body,
            type,
            status: "SENT",
          },
        });

        results.push({
          userId: user.id,
          success: true,
        });
      } catch (error) {
        results.push({
          userId: user.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `System notification sent to ${successCount} users`,
      data: {
        total: users.length,
        success: successCount,
        failure: failureCount,
        results,
      },
    });
  } catch (error) {
    console.error("Send system notification error:", error);
    res.status(500).json({
      error: "Failed to send system notification",
      message: error.message,
    });
  }
};

/**
 * Get system logs/analytics
 */
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User registration trends
    const userRegistrations = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: daysAgo },
      },
      _count: { id: true },
    });

    // Booking trends
    const bookingTrends = await prisma.booking.groupBy({
      by: ["status", "createdAt"],
      where: {
        createdAt: { gte: daysAgo },
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    // Property creation trends
    const propertyTrends = await prisma.property.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: daysAgo },
      },
      _count: { id: true },
    });

    // Revenue analytics
    const revenue = await prisma.booking.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: daysAgo },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        period: `${period} days`,
        analytics: {
          userRegistrations,
          bookingTrends,
          propertyTrends,
          revenue: {
            total: revenue._sum.totalPrice || 0,
            count: revenue._count.id,
          },
        },
      },
    });
  } catch (error) {
    console.error("Get system analytics error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get all user wallets (admin only)
 */
const getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, minBalance, maxBalance } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (userId) where.userId = userId;
    if (minBalance)
      where.balance = { ...where.balance, gte: parseFloat(minBalance) };
    if (maxBalance)
      where.balance = { ...where.balance, lte: parseFloat(maxBalance) };

    const wallets = await prisma.wallet.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { balance: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            hostApprovalStatus: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const total = await prisma.wallet.count({ where });

    // Calculate total platform wallet balance
    const totalBalance = await prisma.wallet.aggregate({
      _sum: { balance: true },
    });

    res.json({
      success: true,
      data: {
        wallets,
        statistics: {
          totalWallets: total,
          totalBalance: totalBalance._sum.balance || 0,
          currency: "XAF",
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all wallets error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get specific user wallet (admin only)
 */
const getUserWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            hostApprovalStatus: true,
            createdAt: true,
          },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            description: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        message: "User wallet does not exist",
      });
    }

    // Get transaction statistics
    const transactionStats = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          isActive: wallet.isActive,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        },
        user: wallet.user,
        recentTransactions: wallet.transactions,
        statistics: {
          totalTransactions: wallet._count.transactions,
          transactionBreakdown: transactionStats,
        },
      },
    });
  } catch (error) {
    console.error("Get user wallet error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get wallet statistics (admin only)
 */
const getWalletStatistics = async (req, res) => {
  try {
    const [
      totalWallets,
      totalBalance,
      activeWallets,
      walletsByRole,
      topWallets,
      recentTransactions,
    ] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.wallet.count({ where: { isActive: true } }),
      prisma.wallet.groupBy({
        by: ["user"],
        _count: { id: true },
        _sum: { balance: true },
      }),
      prisma.wallet.findMany({
        take: 10,
        orderBy: { balance: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalWallets,
          totalBalance: totalBalance._sum.balance || 0,
          activeWallets,
          currency: "XAF",
        },
        topWallets,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Get wallet statistics error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

// Get admin preferences
const getAdminPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get admin preferences from database (you might want to create a separate table for this)
    // For now, we'll return default preferences
    const preferences = {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        newUserAlerts: true,
        newPropertyAlerts: true,
        bookingAlerts: true,
        revenueAlerts: true,
      },
      dashboard: {
        defaultView: "overview",
        refreshInterval: 300,
        showCharts: true,
        showRecentActivity: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 3600,
        loginAttempts: 5,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error("Get admin preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: "An error occurred while retrieving admin preferences",
    });
  }
};

// Update admin preferences
const updateAdminPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, dashboard, security } = req.body;

    // Validate preferences structure
    if (!notifications || !dashboard || !security) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferences structure",
      });
    }

    // Update admin preferences in database (you might want to create a separate table for this)
    // For now, we'll just return the updated preferences
    const updatedPreferences = {
      notifications: {
        emailNotifications: notifications.emailNotifications ? true : false,
        pushNotifications: notifications.pushNotifications ? true : false,
        newUserAlerts: notifications.newUserAlerts ? true : false,
        newPropertyAlerts: notifications.newPropertyAlerts ? true : false,
        bookingAlerts: notifications.bookingAlerts ? true : false,
        revenueAlerts: notifications.revenueAlerts ? true : false,
      },
      dashboard: {
        defaultView: dashboard.defaultView ? "overview" : "overview",
        refreshInterval: dashboard.refreshInterval ? 300 : 300,
        showCharts: dashboard.showCharts ? true : true,
        showRecentActivity: dashboard.showRecentActivity ? true : true,
      },
      security: {
        twoFactorAuth: security.twoFactorAuth ? true : false,
        sessionTimeout: security.sessionTimeout ? 3600 : 3600,
        loginAttempts: security.loginAttempts ? 5 : 5,
      },
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Admin preferences updated successfully",
      data: {
        preferences: updatedPreferences,
      },
    });
  } catch (error) {
    console.error("Update admin preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: "An error occurred while updating admin preferences",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProperties,
  updateProperty,
  getAllBookings,
  getSystemNotifications,
  sendSystemNotification,
  getSystemAnalytics,
  getAllWallets,
  getUserWallet,
  getWalletStatistics,
  getAdminPreferences,
  updateAdminPreferences,
};
