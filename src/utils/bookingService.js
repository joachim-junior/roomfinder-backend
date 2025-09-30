const { prisma, handleDatabaseError } = require("./database");
const revenueService = require("./revenueService");
const {
  sendBookingConfirmationEmail,
  sendBookingNotificationEmail,
} = require("./emailService");

class BookingService {
  // Create a new booking with revenue calculation
  async createBooking(bookingData, userId) {
    try {
      // Calculate fees for the booking
      const fees = await revenueService.calculateBookingFees(
        bookingData.totalPrice
      );

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          checkIn: new Date(bookingData.checkIn),
          checkOut: new Date(bookingData.checkOut),
          guests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
          specialRequests: bookingData.specialRequests,
          paymentMethod: bookingData.paymentMethod || "MOBILE_MONEY",
          guestId: userId,
          propertyId: bookingData.propertyId,
          // Store fee information in metadata
          metadata: JSON.stringify({
            fees: {
              hostServiceFee: fees.hostServiceFee,
              guestServiceFee: fees.guestServiceFee,
              platformRevenue: fees.platformRevenue,
              netAmountForHost: fees.netAmountForHost,
              totalGuestPays: fees.totalGuestPays,
            },
          }),
        },
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
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
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Record platform revenue
      await revenueService.recordPlatformRevenue({
        revenueType: "HOST_FEE",
        amount: fees.hostServiceFee,
        bookingId: booking.id,
        userId: booking.property.host.id,
        description: `Host service fee for booking ${booking.id}`,
        metadata: {
          bookingId: booking.id,
          propertyId: booking.propertyId,
          guestId: userId,
        },
      });

      await revenueService.recordPlatformRevenue({
        revenueType: "GUEST_FEE",
        amount: fees.guestServiceFee,
        bookingId: booking.id,
        userId: userId,
        description: `Guest service fee for booking ${booking.id}`,
        metadata: {
          bookingId: booking.id,
          propertyId: booking.propertyId,
          guestId: userId,
        },
      });

      // Send confirmation emails (non-blocking)
      sendBookingConfirmationEmail(
        booking.guest.email,
        booking.guest.firstName,
        booking
      ).catch((err) => {
        console.error(
          "sendBookingConfirmationEmail failed:",
          err && err.message ? err.message : err
        );
      });

      sendBookingNotificationEmail(
        booking.property.host.email,
        booking.property.host.firstName,
        booking
      ).catch((err) => {
        console.error(
          "sendBookingNotificationEmail failed:",
          err && err.message ? err.message : err
        );
      });

      return {
        ...booking,
        fees: fees,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BookingService();
