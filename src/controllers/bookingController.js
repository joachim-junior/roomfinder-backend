const { prisma, handleDatabaseError } = require("../utils/database");
const axios = require("axios");
const fapshi = require("../../fapshi");

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
      phone, // Guest's phone number for payment
    } = req.body;

    const guestId = req.user.id;

    // Validate phone number for payment
    if (!phone) {
      return res.status(400).json({
        error: "Phone number required",
        message: "Phone number is required for payment processing",
      });
    }

    // Validate phone number format (Cameroon format: 6XXXXXXXX)
    const phoneRegex = /^6[\d]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Invalid phone number",
        message:
          "Phone number must be in format: 6XXXXXXXX (Cameroon mobile number)",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();

    if (checkInDate < today) {
      return res.status(400).json({
        error: "Invalid check-in date",
        message: "Check-in date must be in the future",
      });
    }

    if (checkOutDate < checkInDate) {
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
    const revenueService = require("../utils/revenueService");
    const feeCalculation = await revenueService.calculateBookingFees(
      totalPrice,
      property.currency,
      property.hostId
    );

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        guestId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice: feeCalculation.totalGuestPays,
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

    // Initialize Fapshi direct payment immediately
    let paymentResult = null;
    try {
      paymentResult = await initializeFapshiDirectPayment(
        booking,
        req.user,
        phone,
        paymentMethod
      );

      // Update booking with payment details
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentReference: paymentResult.transId,
          paymentStatus: "PENDING",
          paymentMethod: paymentMethod,
        },
      });
    } catch (error) {
      console.error("Fapshi payment initialization error:", error);
      // Delete the booking if payment initialization fails
      await prisma.booking.delete({
        where: { id: booking.id },
      });

      return res.status(500).json({
        error: "Payment initialization failed",
        message: "Failed to initialize payment. Please try again.",
        details: error.message,
      });
    }

    res.status(201).json({
      message: "Booking created and payment initiated successfully",
      booking: {
        ...booking,
        paymentReference: paymentResult.transId,
        paymentStatus: "PENDING",
      },
      payment: {
        transId: paymentResult.transId,
        status: paymentResult.status,
        message: paymentResult.message,
        dateInitiated: paymentResult.dateInitiated,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Initialize Fapshi direct payment using direct-pay endpoint
 */
const initializeFapshiDirectPayment = async (
  booking,
  user,
  phone,
  paymentMethod
) => {
  try {
    // Map payment method to Fapshi medium
    const mediumMap = {
      MOBILE_MONEY: "mobile money",
      ORANGE_MONEY: "orange money",
    };

    const medium = mediumMap[paymentMethod] || "mobile money";

    // Prepare data for Fapshi direct-pay
    const paymentData = {
      amount: Math.floor(booking.totalPrice), // Must be integer
      phone: phone, // Guest's phone number
      medium: medium,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      userId: user.id,
      externalId: booking.id,
      message: `Payment for ${booking.property.title} booking`,
    };

    // Call Fapshi direct-pay
    const result = await fapshi.directPay(paymentData);

    if (result.statusCode !== 200) {
      throw new Error(result.message || "Payment initialization failed");
    }

    return {
      transId: result.transId,
      status: result.status || "PENDING",
      message: result.message || "Payment request sent to your phone",
      dateInitiated: result.dateInitiated,
    };
  } catch (error) {
    console.error("Fapshi direct payment initialization error:", error);
    throw new Error("Payment initialization failed: " + error.message);
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
 * Fapshi payment webhook handler for direct-pay
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    // Fapshi direct-pay webhook payload structure
    const {
      transId,
      status,
      medium,
      amount,
      payerName,
      email,
      externalId,
      financialTransId,
    } = req.body;

    console.log("Fapshi webhook received:", req.body);

    // Verify webhook signature (implement based on Fapshi docs)
    // const signature = req.headers['x-fapshi-signature'];
    // if (!verifyWebhookSignature(req.body, signature)) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    // Find booking by externalId (which is the booking ID)
    const booking = await prisma.booking.findUnique({
      where: { id: externalId },
      include: {
        property: {
          select: { hostId: true },
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

    if (!booking) {
      console.error("Booking not found for externalId:", externalId);
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking based on payment status
    let bookingStatus = "PENDING";
    let paymentStatus = "PENDING";

    if (status === "SUCCESSFUL") {
      bookingStatus = "CONFIRMED";
      paymentStatus = "COMPLETED";

      // Calculate fees using revenue service
      const revenueService = require("../utils/revenueService");
      const feeCalculation = await revenueService.calculateBookingFees(
        booking.property.price,
        "XAF",
        booking.property.hostId
      );

      // Credit host wallet (original amount minus host fee)
      const hostAmount = Math.floor(feeCalculation.netAmountForHost);
      await prisma.wallet.update({
        where: { userId: booking.property.hostId },
        data: {
          balance: {
            increment: hostAmount,
          },
        },
      });

      // Create transaction record for host payment
      await prisma.transaction.create({
        data: {
          userId: booking.property.hostId,
          amount: hostAmount,
          type: "CREDIT",
          description: `Payment received for booking ${booking.id}`,
          reference: financialTransId,
          status: "COMPLETED",
          metadata: JSON.stringify({
            bookingId: booking.id,
            originalAmount: booking.totalPrice,
            hostServiceFee: feeCalculation.hostServiceFee,
            guestServiceFee: feeCalculation.guestServiceFee,
            medium: medium,
            payerName: payerName,
            feeCalculation: feeCalculation,
          }),
        },
      });

      // Create transaction record for host service fee (deducted from host)
      await prisma.transaction.create({
        data: {
          userId: booking.property.hostId,
          amount: feeCalculation.hostServiceFee,
          type: "DEBIT",
          description: `Host service fee for booking ${booking.id}`,
          reference: `HOST_FEE_${financialTransId}`,
          status: "COMPLETED",
          metadata: JSON.stringify({
            bookingId: booking.id,
            originalAmount: booking.totalPrice,
            feeType: "HOST_SERVICE_FEE",
            feePercent: feeCalculation.config.hostServiceFeePercent,
            medium: medium,
          }),
        },
      });

      // Create transaction record for guest service fee (guest already paid this)
      await prisma.transaction.create({
        data: {
          userId: booking.guestId,
          amount: feeCalculation.guestServiceFee,
          type: "DEBIT",
          description: `Guest service fee for booking ${booking.id}`,
          reference: `GUEST_FEE_${financialTransId}`,
          status: "COMPLETED",
          metadata: JSON.stringify({
            bookingId: booking.id,
            originalAmount: booking.totalPrice,
            feeType: "GUEST_SERVICE_FEE",
            feePercent: feeCalculation.config.guestServiceFeePercent,
            medium: medium,
            totalPaid: amount, // Total amount guest actually paid
          }),
        },
      });
    } else if (status === "FAILED" || status === "EXPIRED") {
      bookingStatus = "CANCELLED";
      paymentStatus = "FAILED";
    }

    // Update booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: bookingStatus,
        paymentStatus: paymentStatus,
        transactionId: financialTransId,
        updatedAt: new Date(),
      },
    });

    // Send notifications
    try {
      // Send notification to guest
      await prisma.notification.create({
        data: {
          userId: booking.guestId,
          type: status === "SUCCESSFUL" ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
          title:
            status === "SUCCESSFUL" ? "Payment Successful" : "Payment Failed",
          body:
            status === "SUCCESSFUL"
              ? `Your payment of ${amount} XAF for ${booking.property.title} has been confirmed.`
              : `Your payment of ${amount} XAF for ${booking.property.title} has failed.`,
          metadata: JSON.stringify({
            bookingId: booking.id,
            amount: amount,
            status: status,
          }),
        },
      });

      // Send notification to host
      if (status === "SUCCESSFUL") {
        await prisma.notification.create({
          data: {
            userId: booking.property.hostId,
            type: "PAYMENT_RECEIVED",
            title: "Payment Received",
            body: `You have received ${hostAmount} XAF for booking ${booking.id}`,
            metadata: JSON.stringify({
              bookingId: booking.id,
              amount: hostAmount,
              guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            }),
          },
        });
      }
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      // Don't fail the webhook if notifications fail
    }

    res.json({
      message: "Payment webhook processed successfully",
      bookingId: booking.id,
      status: status,
    });
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

/**
 * Calculate booking fees before creating a booking
 */
const calculateBookingFees = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.query;

    // Validate required parameters
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "propertyId, checkIn, checkOut, and guests are required",
      });
    }

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

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        maxGuests: true,
        isAvailable: true,
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
    const baseAmount = property.price * nights;

    // Calculate fees using revenue service
    const revenueService = require("../utils/revenueService");
    const feeCalculation = await revenueService.calculateBookingFees(
      baseAmount,
      property.currency,
      property.hostId
    );

    res.json({
      message: "Fee calculation successful",
      data: {
        property: {
          id: property.id,
          title: property.title,
          price: property.price,
          currency: property.currency,
        },
        booking: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights: nights,
          guests: parseInt(guests),
          baseAmount: baseAmount,
        },
        fees: {
          hostServiceFee: feeCalculation.hostServiceFee,
          hostServiceFeePercent: feeCalculation.config.hostServiceFeePercent,
          guestServiceFee: feeCalculation.guestServiceFee,
          guestServiceFeePercent: feeCalculation.config.guestServiceFeePercent,
        },
        totals: {
          baseAmount: feeCalculation.originalAmount,
          guestServiceFee: feeCalculation.guestServiceFee,
          totalGuestPays: feeCalculation.totalGuestPays,
          hostServiceFee: feeCalculation.hostServiceFee,
          netAmountForHost: feeCalculation.netAmountForHost,
          platformRevenue: feeCalculation.platformRevenue,
        },
        currency: property.currency,
      },
    });
  } catch (error) {
    console.error("Calculate booking fees error:", error);
    res.status(500).json({
      error: "Failed to calculate booking fees",
      message: "An error occurred while calculating fees",
    });
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
  calculateBookingFees,
};

/**
 * Check if a user has booked a specific property
 */
const hasUserBookedProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Validate propertyId
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if user has any bookings for this property
    const booking = await prisma.booking.findFirst({
      where: {
        propertyId: propertyId,
        guestId: userId,
      },
      select: {
        id: true,
        status: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasBooked = !!booking;

    res.json({
      success: true,
      data: {
        hasBooked,
        property: {
          id: property.id,
          title: property.title,
        },
        latestBooking: hasBooked
          ? {
              id: booking.id,
              status: booking.status,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              totalPrice: booking.totalPrice,
              createdAt: booking.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Check user booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check booking status",
    });
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
  calculateBookingFees,
  hasUserBookedProperty,
};
