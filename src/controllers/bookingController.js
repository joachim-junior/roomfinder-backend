const { prisma, handleDatabaseError } = require("../utils/database");
const axios = require("axios");

/**
 * Create a new booking
 */
const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      paymentMethod = "MOBILE_MONEY",
    } = req.body;

    const guestId = req.user.id;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();

    if (checkInDate <= today) {
      return res.status(400).json({
        error: "Invalid check-in date",
        message: "Check-in date must be in the future",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        error: "Invalid dates",
        message: "Check-out date must be after check-in date",
      });
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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

    if (!property.isAvailable) {
      return res.status(400).json({
        error: "Property unavailable",
        message: "This property is currently not available for booking",
      });
    }

    // Check if property can accommodate the number of guests
    if (guests > property.maxGuests) {
      return res.status(400).json({
        error: "Too many guests",
        message: `This property can only accommodate up to ${property.maxGuests} guests`,
      });
    }

    // Check availability for the requested dates
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        error: "Property not available",
        message: "The property is not available for the selected dates",
      });
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = property.price * nights;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        guestId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        specialRequests: specialRequests || null,
        status: "PENDING",
        paymentMethod,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
            currency: true,
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
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
            phone: true,
          },
        },
      },
    });

    // Initialize payment with Fapshi (if configured)
    let paymentData = null;
    try {
      paymentData = await initializeFapshiPayment(booking, req.user);
    } catch (error) {
      console.log(
        "Fapshi payment not configured, proceeding without payment integration"
      );
      // Continue without payment integration for development
    }

    res.status(201).json({
      message:
        "Booking created successfully. Please complete payment to confirm.",
      booking: {
        ...booking,
        paymentData,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Initialize Fapshi payment
 */
const initializeFapshiPayment = async (booking, user) => {
  try {
    const fapshiConfig = {
      apiKey: process.env.FAPSHI_API_KEY,
      secretKey: process.env.FAPSHI_SECRET_KEY,
      baseUrl: process.env.FAPSHI_BASE_URL || "https://api.fapshi.com",
    };

    const paymentPayload = {
      amount: booking.totalPrice,
      currency: booking.property.currency || "XAF",
      reference: `BOOKING_${booking.id}`,
      description: `Booking for ${booking.property.title}`,
      customer: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
      },
      callback_url: `${process.env.FRONTEND_URL}/booking/payment/callback`,
      return_url: `${process.env.FRONTEND_URL}/booking/payment/return`,
    };

    const response = await axios.post(
      `${fapshiConfig.baseUrl}/v1/payments/initialize`,
      paymentPayload,
      {
        headers: {
          Authorization: `Bearer ${fapshiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update booking with payment reference
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentReference: response.data.reference,
        paymentUrl: response.data.payment_url,
      },
    });

    return {
      paymentUrl: response.data.payment_url,
      reference: response.data.reference,
      status: "PENDING",
    };
  } catch (error) {
    console.error("Fapshi payment initialization error:", error);
    throw new Error("Payment initialization failed");
  }
};

/**
 * Get all bookings for the authenticated user
 */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { guestId: userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              images: true,
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Bookings retrieved successfully",
      bookings,
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
    console.error("Get user bookings error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get host bookings (bookings for properties owned by the host)
 */
const getHostBookings = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      property: { hostId },
    };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      message: "Host bookings retrieved successfully",
      bookings,
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
    console.error("Get host bookings error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
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
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
        message: "The requested booking does not exist",
      });
    }

    // Check if user has access to this booking
    if (
      booking.guestId !== userId &&
      booking.property.hostId !== userId &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to view this booking",
      });
    }

    res.json({
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update booking status (host or admin only)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message:
          "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: { hostId: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
        message: "The requested booking does not exist",
      });
    }

    // Check if user can update this booking
    if (booking.property.hostId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied",
        message: "Only the property host or admin can update booking status",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        statusReason: reason || null,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
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

    res.json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Cancel booking (guest only)
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: { hostId: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
        message: "The requested booking does not exist",
      });
    }

    // Only the guest can cancel their own booking
    if (booking.guestId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only cancel your own bookings",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        error: "Booking already cancelled",
        message: "This booking has already been cancelled",
      });
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        error: "Cannot cancel completed booking",
        message: "Cannot cancel a completed booking",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        statusReason: reason || "Cancelled by guest",
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
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

    res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Check property availability for specific dates
 */
const checkAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        error: "Missing parameters",
        message: "Property ID, check-in, and check-out dates are required",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

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

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate },
          },
        ],
      },
    });

    const isAvailable =
      property.isAvailable && conflictingBookings.length === 0;

    res.json({
      message: "Availability checked successfully",
      availability: {
        propertyId,
        checkIn,
        checkOut,
        isAvailable,
        conflictingBookings: conflictingBookings.length,
        propertyAvailable: property.isAvailable,
      },
    });
  } catch (error) {
    console.error("Check availability error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Fapshi payment webhook handler
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const { reference, status, transaction_id } = req.body;

    // Verify webhook signature (implement based on Fapshi docs)
    // const signature = req.headers['x-fapshi-signature'];
    // if (!verifyWebhookSignature(req.body, signature)) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    const booking = await prisma.booking.findFirst({
      where: { paymentReference: reference },
      include: {
        property: {
          select: { hostId: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    let bookingStatus = "PENDING";
    if (status === "SUCCESS") {
      bookingStatus = "CONFIRMED";
    } else if (status === "FAILED") {
      bookingStatus = "CANCELLED";
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: bookingStatus,
        paymentStatus: status,
        transactionId: transaction_id,
        updatedAt: new Date(),
      },
    });

    res.json({ message: "Payment webhook processed successfully" });
  } catch (error) {
    console.error("Payment webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

/**
 * Get booking statistics
 */
const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isHost = req.user.role === "HOST" || req.user.role === "ADMIN";

    let stats;

    if (isHost) {
      // Host statistics
      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalEarnings,
        averageRating,
      ] = await Promise.all([
        prisma.booking.count({
          where: { property: { hostId: userId } },
        }),
        prisma.booking.count({
          where: {
            property: { hostId: userId },
            status: "PENDING",
          },
        }),
        prisma.booking.count({
          where: {
            property: { hostId: userId },
            status: "CONFIRMED",
          },
        }),
        prisma.booking.count({
          where: {
            property: { hostId: userId },
            status: "COMPLETED",
          },
        }),
        prisma.booking.aggregate({
          where: {
            property: { hostId: userId },
            status: "COMPLETED",
          },
          _sum: { totalPrice: true },
        }),
        prisma.review.aggregate({
          where: { property: { hostId: userId } },
          _avg: { rating: true },
        }),
      ]);

      stats = {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalEarnings: totalEarnings._sum.totalPrice || 0,
        averageRating: averageRating._avg.rating || 0,
      };
    } else {
      // Guest statistics
      const [
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
      ] = await Promise.all([
        prisma.booking.count({
          where: { guestId: userId },
        }),
        prisma.booking.count({
          where: {
            guestId: userId,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        }),
        prisma.booking.count({
          where: {
            guestId: userId,
            status: "COMPLETED",
          },
        }),
        prisma.booking.count({
          where: {
            guestId: userId,
            status: "CANCELLED",
          },
        }),
      ]);

      stats = {
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
      };
    }

    res.json({
      message: "Booking statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  handlePaymentWebhook,
  getBookingStats,
};
