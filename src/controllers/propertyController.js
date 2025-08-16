const { prisma, handleDatabaseError } = require("../utils/database");

/**
 * Create a new property
 */
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      price,
      currency = "XAF",
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      images,
    } = req.body;

    // Determine host ID based on user role
    let hostId = req.user.id;

    // If admin is creating property on behalf of a host
    if (req.user.role === "ADMIN" && req.body.hostId) {
      hostId = req.body.hostId;

      // Validate that the specified host exists and is approved
      const targetHost = await prisma.user.findUnique({
        where: { id: hostId },
        select: {
          id: true,
          role: true,
          isVerified: true,
          hostApprovalStatus: true,
        },
      });

      if (!targetHost) {
        return res.status(404).json({
          error: "Host not found",
          message: "The specified host does not exist",
        });
      }

      if (targetHost.role !== "HOST") {
        return res.status(400).json({
          error: "Invalid host",
          message: "The specified user is not a host",
        });
      }

      if (targetHost.hostApprovalStatus !== "APPROVED") {
        return res.status(400).json({
          error: "Host not approved",
          message: "The specified host is not approved to create properties",
        });
      }
    } else {
      // For regular hosts, validate their permissions
      if (req.user.role !== "HOST" && req.user.role !== "ADMIN") {
        return res.status(403).json({
          error: "Access denied",
          message: "Only hosts can create properties",
        });
      }

      // Check if user email is verified (for HOST role)
      if (req.user.role === "HOST" && !req.user.isVerified) {
        return res.status(403).json({
          error: "Email verification required",
          message:
            "Please verify your email address before creating properties. Check your email for the verification link.",
        });
      }

      // Check if host is approved (for HOST role)
      if (
        req.user.role === "HOST" &&
        req.user.hostApprovalStatus !== "APPROVED"
      ) {
        if (req.user.hostApprovalStatus === "PENDING") {
          return res.status(403).json({
            error: "Host approval pending",
            message:
              "Your host application is currently under review. We will contact you once your application is approved.",
          });
        } else if (req.user.hostApprovalStatus === "REJECTED") {
          return res.status(403).json({
            error: "Host application rejected",
            message:
              "Your host application was rejected. Please contact support for more information.",
          });
        } else if (req.user.hostApprovalStatus === "SUSPENDED") {
          return res.status(403).json({
            error: "Host account suspended",
            message:
              "Your host account has been suspended. Please contact support for more information.",
          });
        }
      }
    }

    // Additional validation for required fields
    if (!title || !description || !address || !city || !state || !country) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "Title, description, address, city, state, and country are required",
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        error: "Invalid price",
        message: "Price must be greater than 0",
      });
    }

    if (!bedrooms || bedrooms <= 0 || !bathrooms || bathrooms <= 0) {
      return res.status(400).json({
        error: "Invalid room count",
        message: "Bedrooms and bathrooms must be greater than 0",
      });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        type,
        address,
        city,
        state,
        country,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        price: parseFloat(price),
        currency,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        maxGuests: parseInt(maxGuests),
        amenities: Array.isArray(amenities) ? amenities : [],
        images: Array.isArray(images) ? images : [],
        hostId,
        isVerified: req.user.role === "ADMIN", // Auto-verify admin properties
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
            hostApprovalStatus: true,
          },
        },
      },
    });

    const message =
      req.user.role === "ADMIN" && req.body.hostId
        ? `Property created successfully on behalf of ${property.host.firstName} ${property.host.lastName}`
        : "Property created successfully";

    res.status(201).json({
      message,
      property,
      createdBy: req.user.role === "ADMIN" ? "ADMIN" : "HOST",
    });
  } catch (error) {
    console.error("Create property error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get all properties with filtering and pagination
 */
const getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      type,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      guests,
      amenities,
      isAvailable = true,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};

    // Only apply isAvailable filter if explicitly provided
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === "true";
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minBedrooms || maxBedrooms) {
      where.bedrooms = {};
      if (minBedrooms) where.bedrooms.gte = parseInt(minBedrooms);
      if (maxBedrooms) where.bedrooms.lte = parseInt(maxBedrooms);
    }

    if (guests) {
      where.maxGuests = {
        gte: parseInt(guests),
      };
    }

    if (amenities) {
      const amenityArray = amenities.split(",").map((a) => a.trim());
      where.amenities = {
        hasSome: amenityArray,
      };
    }

    // Build sort conditions
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Properties retrieved successfully",
      properties,
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
    console.error("Get properties error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get property by ID with detailed information
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
          },
        },
        reviews: {
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
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
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

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: { rating: true },
    });

    const propertyWithRating = {
      ...property,
      averageRating: avgRating._avg.rating || 0,
    };

    res.json({
      message: "Property retrieved successfully",
      property: propertyWithRating,
    });
  } catch (error) {
    console.error("Get property by ID error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update property
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: "Property not found",
        message: "The requested property does not exist",
      });
    }

    if (existingProperty.hostId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only update your own properties",
      });
    }

    // Handle numeric fields
    if (updateData.latitude)
      updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude)
      updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.bedrooms)
      updateData.bedrooms = parseInt(updateData.bedrooms);
    if (updateData.bathrooms)
      updateData.bathrooms = parseInt(updateData.bathrooms);
    if (updateData.maxGuests)
      updateData.maxGuests = parseInt(updateData.maxGuests);

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Delete property
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
      },
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: "Property not found",
        message: "The requested property does not exist",
      });
    }

    if (existingProperty.hostId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only delete your own properties",
      });
    }

    // Check if property has active bookings
    if (existingProperty.bookings.length > 0) {
      return res.status(400).json({
        error: "Cannot delete property",
        message: "Property has active bookings and cannot be deleted",
      });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get properties by host
 */
const getHostProperties = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { hostId },
        include: {
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.property.count({ where: { hostId } }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Host properties retrieved successfully",
      properties,
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
    console.error("Get host properties error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Search properties
 */
const searchProperties = async (req, res) => {
  try {
    const {
      query,
      city,
      checkIn,
      checkOut,
      guests,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search conditions
    const where = {
      isAvailable: true,
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (guests) {
      where.maxGuests = { gte: parseInt(guests) };
    }

    // Check availability for specific dates
    if (checkIn && checkOut) {
      where.bookings = {
        none: {
          OR: [
            {
              checkIn: { lte: new Date(checkOut) },
              checkOut: { gte: new Date(checkIn) },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
          ],
        },
      };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Search completed successfully",
      properties,
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
    console.error("Search properties error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get property statistics for host
 */
const getPropertyStats = async (req, res) => {
  try {
    const hostId = req.user.id;

    const [
      totalProperties,
      availableProperties,
      totalBookings,
      totalEarnings,
      averageRating,
    ] = await Promise.all([
      prisma.property.count({ where: { hostId } }),
      prisma.property.count({ where: { hostId, isAvailable: true } }),
      prisma.booking.count({
        where: {
          property: { hostId },
        },
      }),
      prisma.booking.aggregate({
        where: {
          property: { hostId },
          status: "COMPLETED",
        },
        _sum: { totalPrice: true },
      }),
      prisma.review.aggregate({
        where: {
          property: { hostId },
        },
        _avg: { rating: true },
      }),
    ]);

    res.json({
      message: "Property statistics retrieved successfully",
      stats: {
        totalProperties,
        availableProperties,
        totalBookings,
        totalEarnings: totalEarnings._sum.totalPrice || 0,
        averageRating: averageRating._avg.rating || 0,
      },
    });
  } catch (error) {
    console.error("Get property stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getHostProperties,
  searchProperties,
  getPropertyStats,
};
