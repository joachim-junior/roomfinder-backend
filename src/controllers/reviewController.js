const { prisma, handleDatabaseError } = require("../utils/database");

/**
 * Create a new review
 */
const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: "The requested property does not exist",
      });
    }

    // Check if user has a completed booking for this property
    const completedBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        guestId: userId,
        status: "COMPLETED",
      },
    });

    if (!completedBooking) {
      return res.status(403).json({
        error: "Cannot review property",
        message: "You can only review properties you have stayed at",
      });
    }

    // Check if user has already reviewed this property
    const existingReview = await prisma.review.findUnique({
      where: {
        propertyId_userId: {
          propertyId,
          userId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({
        error: "Review already exists",
        message: "You have already reviewed this property",
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        propertyId,
        userId,
        rating,
        comment: comment || null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Update property average rating
    await updatePropertyRating(propertyId);

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get reviews for a property
 */
const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: "The requested property does not exist",
      });
    }

    // Build filter conditions
    const where = { propertyId };
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Build sort conditions
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    // Get property rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ["rating"],
      where: { propertyId },
      _count: {
        rating: true,
      },
    });

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }
    ratingStats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    res.json({
      message: "Reviews retrieved successfully",
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      ratingDistribution,
      averageRating: await getPropertyAverageRating(propertyId),
    });
  } catch (error) {
    console.error("Get property reviews error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get user's reviews
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "User reviews retrieved successfully",
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get host's reviews (reviews for properties owned by the host)
 */
const getHostReviews = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { page = 1, limit = 10, rating } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      property: { hostId },
    };
    if (rating) {
      where.rating = parseInt(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Host reviews retrieved successfully",
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get host reviews error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get review by ID
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
        message: "The requested review does not exist",
      });
    }

    res.json({
      message: "Review retrieved successfully",
      review,
    });
  } catch (error) {
    console.error("Get review by ID error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update review (user can only update their own reviews)
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
        message: "The requested review does not exist",
      });
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only update your own reviews",
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment: comment || null,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Update property average rating
    await updatePropertyRating(review.propertyId);

    res.json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete review (user can only delete their own reviews)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
        message: "The requested review does not exist",
      });
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only delete your own reviews",
      });
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update property average rating
    await updatePropertyRating(review.propertyId);

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get review statistics for a property
 */
const getPropertyReviewStats = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: "The requested property does not exist",
      });
    }

    const [totalReviews, averageRating, ratingDistribution, recentReviews] =
      await Promise.all([
        prisma.review.count({
          where: { propertyId },
        }),
        prisma.review.aggregate({
          where: { propertyId },
          _avg: { rating: true },
        }),
        prisma.review.groupBy({
          by: ["rating"],
          where: { propertyId },
          _count: {
            rating: true,
          },
        }),
        prisma.review.findMany({
          where: { propertyId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    // Create rating distribution object
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }
    ratingDistribution.forEach((stat) => {
      distribution[stat.rating] = stat._count.rating;
    });

    res.json({
      message: "Property review statistics retrieved successfully",
      stats: {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: distribution,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Get property review stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get host review statistics
 */
const getHostReviewStats = async (req, res) => {
  try {
    const hostId = req.user.id;

    const [
      totalReviews,
      averageRating,
      ratingDistribution,
      propertiesWithReviews,
    ] = await Promise.all([
      prisma.review.count({
        where: {
          property: { hostId },
        },
      }),
      prisma.review.aggregate({
        where: {
          property: { hostId },
        },
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          property: { hostId },
        },
        _count: {
          rating: true,
        },
      }),
      prisma.property.findMany({
        where: {
          hostId,
          reviews: {
            some: {},
          },
        },
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
    ]);

    // Create rating distribution object
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }
    ratingDistribution.forEach((stat) => {
      distribution[stat.rating] = stat._count.rating;
    });

    // Calculate average rating per property
    const propertyAverages = propertiesWithReviews.map((property) => {
      const totalRating = property.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      return {
        propertyId: property.id,
        title: property.title,
        averageRating: totalRating / property.reviews.length,
        totalReviews: property._count.reviews,
      };
    });

    res.json({
      message: "Host review statistics retrieved successfully",
      stats: {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: distribution,
        propertiesWithReviews: propertyAverages,
      },
    });
  } catch (error) {
    console.error("Get host review stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update property average rating
 */
const updatePropertyRating = async (propertyId) => {
  try {
    const result = await prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Note: In a real implementation, you might want to store this in a separate field
    // For now, we'll calculate it on-demand
    console.log(
      `Updated average rating for property ${propertyId}: ${
        result._avg.rating || 0
      }`
    );
  } catch (error) {
    console.error("Error updating property rating:", error);
  }
};

/**
 * Get property average rating
 */
const getPropertyAverageRating = async (propertyId) => {
  try {
    const result = await prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating || 0,
      count: result._count.rating,
    };
  } catch (error) {
    console.error("Error getting property average rating:", error);
    return { average: 0, count: 0 };
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  getUserReviews,
  getHostReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getPropertyReviewStats,
  getHostReviewStats,
};
