const { prisma, handleDatabaseError } = require("../utils/database");
const revenueService = require("../utils/revenueService");

/**
 * Get user profile with additional data
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        properties: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
            price: true,
            isAvailable: true,
            isVerified: true,
            createdAt: true,
          },
        },
        bookings: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
            totalPrice: true,
            createdAt: true,
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                images: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            property: {
              select: {
                id: true,
                title: true,
                city: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "Profile not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update user profile with enhanced validation
 */
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "Validation failed",
        message: "First name and last name are required",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null,
        avatar: avatar ? avatar.trim() : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalProperties,
      totalBookings,
      totalReviews,
      averageRating,
      totalEarnings,
    ] = await Promise.all([
      // Count user's properties
      prisma.property.count({
        where: { hostId: userId },
      }),
      // Count user's bookings
      prisma.booking.count({
        where: { guestId: userId },
      }),
      // Count user's reviews
      prisma.review.count({
        where: { userId },
      }),
      // Average rating of user's reviews
      prisma.review.aggregate({
        where: { userId },
        _avg: { rating: true },
      }),
      // Total earnings from properties (for hosts)
      prisma.booking.aggregate({
        where: {
          property: { hostId: userId },
          status: "COMPLETED",
        },
        _sum: { totalPrice: true },
      }),
    ]);

    res.json({
      message: "User statistics retrieved successfully",
      stats: {
        totalProperties,
        totalBookings,
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        totalEarnings: totalEarnings._sum.totalPrice || 0,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete user account
 */
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        guestId: userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeBookings) {
      return res.status(400).json({
        error: "Account deletion failed",
        message: "Cannot delete account with active bookings",
      });
    }

    // Check if user has properties with active bookings
    const propertiesWithBookings = await prisma.property.findFirst({
      where: {
        hostId: userId,
        bookings: {
          some: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
      },
    });

    if (propertiesWithBookings) {
      return res.status(400).json({
        error: "Account deletion failed",
        message:
          "Cannot delete account with properties that have active bookings",
      });
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user account error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get user activity
 */
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const activities = await prisma.$transaction([
      // Recent bookings
      prisma.booking.findMany({
        where: { guestId: userId },
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      // Recent reviews
      prisma.review.findMany({
        where: { userId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
    ]);

    const [recentBookings, recentReviews] = activities;

    res.json({
      message: "User activity retrieved successfully",
      activity: {
        recentBookings,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get comprehensive guest dashboard statistics
 */
const getGuestDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    console.log("Starting dashboard stats calculation for user:", userId);

    // Start with basic queries first
    const totalBookings = await prisma.booking.count({
      where: { guestId: userId },
    });
    console.log("Total bookings:", totalBookings);

    const totalReviews = await prisma.review.count({
      where: { userId },
    });
    console.log("Total reviews:", totalReviews);

    const totalEnquiries = await prisma.propertyEnquiry.count({
      where: { guestId: userId },
    });
    console.log("Total enquiries:", totalEnquiries);

    const walletBalance = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });
    console.log("Wallet balance:", walletBalance);

    // Continue with more complex queries
    const activeBookings = await prisma.booking.count({
      where: {
        guestId: userId,
        status: "CONFIRMED",
        checkIn: { gt: now },
      },
    });

    const completedBookings = await prisma.booking.count({
      where: {
        guestId: userId,
        status: "COMPLETED",
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        guestId: userId,
        status: "CANCELLED",
      },
    });

    const pendingBookings = await prisma.booking.count({
      where: {
        guestId: userId,
        status: "PENDING",
      },
    });

    // Financial statistics - Guest spending (what guest paid)
    const totalSpent = await prisma.booking.aggregate({
      where: {
        guestId: userId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
      },
      _sum: { totalPrice: true },
    });

    const totalSpentLast30Days = await prisma.booking.aggregate({
      where: {
        guestId: userId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalPrice: true },
    });

    const totalSpentLast90Days = await prisma.booking.aggregate({
      where: {
        guestId: userId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
        createdAt: { gte: ninetyDaysAgo },
      },
      _sum: { totalPrice: true },
    });

    const averageBookingValue = await prisma.booking.aggregate({
      where: {
        guestId: userId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
      },
      _avg: { totalPrice: true },
    });

    // Review statistics
    const averageRating = await prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
    });

    const reviewsLast30Days = await prisma.review.count({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Enquiry statistics
    const pendingEnquiries = await prisma.propertyEnquiry.count({
      where: {
        guestId: userId,
        status: "PENDING",
      },
    });

    const respondedEnquiries = await prisma.propertyEnquiry.count({
      where: {
        guestId: userId,
        status: "RESPONDED",
      },
    });

    // Recent activity
    const recentBookings = await prisma.booking.findMany({
      where: { guestId: userId },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentReviews = await prisma.review.findMany({
      where: { userId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentEnquiries = await prisma.propertyEnquiry.findMany({
      where: { guestId: userId },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Host statistics (if user is also a host) - Calculate NET earnings after fees
    const totalProperties = await prisma.property.count({
      where: { hostId: userId },
    });

    // Get all completed bookings for this host to calculate net earnings
    const hostBookings = await prisma.booking.findMany({
      where: {
        property: { hostId: userId },
        status: "COMPLETED",
      },
      select: {
        id: true,
        totalPrice: true,
      },
    });

    // Calculate net earnings by applying revenue model to each booking
    let totalGrossEarnings = 0;
    let totalNetEarnings = 0;
    let totalPlatformFees = 0;

    // Only calculate if there are bookings
    if (hostBookings.length > 0) {
      for (const booking of hostBookings) {
        try {
          const fees = await revenueService.calculateBookingFees(
            booking.totalPrice,
            "XAF" // Default currency
          );

          totalGrossEarnings += booking.totalPrice;
          totalNetEarnings += fees.netAmountForHost;
          totalPlatformFees += fees.hostServiceFee;
        } catch (error) {
          console.error(
            "Error calculating fees for booking:",
            booking.id,
            error
          );
          // Continue with other bookings even if one fails
        }
      }
    }

    // Calculate net earnings for different time periods
    const hostBookingsLast30Days = await prisma.booking.findMany({
      where: {
        property: { hostId: userId },
        status: "COMPLETED",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        totalPrice: true,
      },
    });

    let netEarningsLast30Days = 0;
    if (hostBookingsLast30Days.length > 0) {
      for (const booking of hostBookingsLast30Days) {
        try {
          const fees = await revenueService.calculateBookingFees(
            booking.totalPrice,
            "XAF" // Default currency
          );
          netEarningsLast30Days += fees.netAmountForHost;
        } catch (error) {
          console.error(
            "Error calculating fees for 30-day booking:",
            booking.id,
            error
          );
        }
      }
    }

    // Wallet and transaction statistics
    const totalTransactions = await prisma.transaction.count({
      where: { userId },
    });

    const totalRefunds = await prisma.transaction.count({
      where: {
        userId,
        type: "REFUND",
      },
    });

    const totalFavorites = await prisma.favorite.count({
      where: { userId },
    });

    // Upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        guestId: userId,
        status: "CONFIRMED",
        checkIn: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            images: true,
          },
        },
      },
      orderBy: { checkIn: "asc" },
      take: 5,
    });

    // Booking status breakdown
    const bookingStatusBreakdown = await prisma.booking.groupBy({
      by: ["status"],
      where: { guestId: userId },
      _count: { status: true },
    });

    // Calculate derived statistics
    const totalSpentAmount = totalSpent._sum.totalPrice || 0;
    const totalSpent30Days = totalSpentLast30Days._sum.totalPrice || 0;
    const totalSpent90Days = totalSpentLast90Days._sum.totalPrice || 0;
    const averageBookingValueAmount = averageBookingValue._avg.totalPrice || 0;
    const averageRatingValue = averageRating._avg.rating || 0;
    const walletBalanceAmount =
      walletBalance && walletBalance.balance ? walletBalance.balance : 0;

    // Calculate cancellation rate
    const cancellationRate =
      totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Calculate host response rate
    const hostResponseRate =
      totalEnquiries > 0 ? (respondedEnquiries / totalEnquiries) * 100 : 0;

    // Process booking status breakdown
    const statusBreakdown = bookingStatusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      message: "Guest dashboard statistics retrieved successfully",
      data: {
        // Overview
        overview: {
          totalBookings,
          activeBookings,
          totalSpent: totalSpentAmount,
          averageRating: averageRatingValue,
          totalReviews,
          favoriteProperties: totalFavorites,
        },

        // Financial Overview
        financial: {
          totalSpent: totalSpentAmount,
          totalSpentLast30Days: totalSpent30Days,
          totalSpentLast90Days: totalSpent90Days,
          averageSpending: averageBookingValueAmount,
          monthlySpending: totalSpent30Days,
          spendingLast30Days: totalSpent30Days,
          currency: "XAF",
          walletBalance: walletBalanceAmount,
          totalTransactions,
          totalRefunds,
        },

        // Bookings
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: completedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          cancellationRate,
          averageStayDuration: 0, // Simplified for now
          upcomingBookings,
          recentBookings,
        },

        // Reviews
        reviews: {
          total: totalReviews,
          averageRating: averageRatingValue,
          ratingBreakdown: {}, // Simplified for now
          recentReviews,
        },

        // Enquiries
        enquiries: {
          total: totalEnquiries,
          pending: pendingEnquiries,
          responded: respondedEnquiries,
          closed: 0, // Simplified for now
          responseRate: hostResponseRate,
          recentEnquiries,
        },

        // Activity
        activity: {
          lastLogin: new Date().toISOString(), // Simplified for now
          memberSince: new Date().toISOString(), // Simplified for now
          totalTransactions,
          favoriteDestinations: [], // Simplified for now
          preferredPropertyTypes: {}, // Simplified for now
        },

        // Analytics
        analytics: {
          monthlySpendingTrend: [], // Simplified for now
          seasonalBookingPattern: {}, // Simplified for now
          topDestinations: [], // Simplified for now
          propertyTypePreferences: {}, // Simplified for now
        },

        // Notifications
        notifications: {
          unread: 0, // Simplified for now
          recent: [], // Simplified for now
        },

        // Host Statistics (if applicable)
        hostStats: {
          totalProperties,
          totalGrossEarnings, // Total booking amounts before fees
          totalNetEarnings, // Net earnings after platform fees
          totalPlatformFees, // Total fees paid to platform
          netEarningsLast30Days,
          averageEarningsPerBooking:
            totalProperties > 0 ? totalNetEarnings / totalProperties : 0,
          platformFeePercentage:
            totalGrossEarnings > 0
              ? (totalPlatformFees / totalGrossEarnings) * 100
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting guest dashboard stats:", error);
    res.status(500).json({
      error: "Database error",
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  deleteUserAccount,
  getUserActivity,
  getGuestDashboardStats,
};
