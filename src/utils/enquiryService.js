const { prisma, handleDatabaseError } = require("./database");
const {
  sendEnquiryNotificationEmail,
  sendEnquiryResponseEmail,
} = require("./emailService");
const notificationService = require("./notificationService");

class EnquiryService {
  // Create a new property enquiry
  async createEnquiry(enquiryData, guestId) {
    try {
      // Get property and host information
      const property = await prisma.property.findUnique({
        where: { id: enquiryData.propertyId },
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
        throw new Error("Property not found");
      }

      if (!property.isAvailable) {
        throw new Error("Property is not available for enquiries");
      }

      // Get guest information
      const guest = await prisma.user.findUnique({
        where: { id: guestId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

      if (!guest) {
        throw new Error("Guest not found");
      }

      // Check if guest has already sent an enquiry for this property recently
      const recentEnquiry = await prisma.propertyEnquiry.findFirst({
        where: {
          propertyId: enquiryData.propertyId,
          guestId: guestId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentEnquiry) {
        throw new Error(
          "You have already sent an enquiry for this property recently. Please wait 24 hours before sending another enquiry."
        );
      }

      // Create the enquiry
      const enquiry = await prisma.propertyEnquiry.create({
        data: {
          subject: enquiryData.subject,
          message: enquiryData.message,
          priority: enquiryData.priority || "NORMAL",
          propertyId: enquiryData.propertyId,
          guestId: guestId,
          hostId: property.host.id,
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
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

      // Send email notification to host (non-blocking)
      sendEnquiryNotificationEmail(
        property.host.email,
        property.host.firstName,
        enquiry,
        property
      ).catch((err) => {
        console.error(
          "sendEnquiryNotificationEmail failed:",
          err && err.message ? err.message : err
        );
      });

      // Create notification for host
      await notificationService.createNotification({
        userId: property.host.id,
        type: "EMAIL",
        title: "New Property Enquiry",
        body: `You have a new enquiry for "${property.title}" from ${guest.firstName} ${guest.lastName}`,
        data: {
          enquiryId: enquiry.id,
          propertyId: property.id,
          guestId: guest.id,
        },
      });

      return enquiry;
    } catch (error) {
      console.error("Create enquiry error:", error);
      throw error;
    }
  }

  // Get enquiries for a user (as guest or host)
  async getUserEnquiries(userId, userRole, filters = {}) {
    try {
      const { page = 1, limit = 10, status, priority, propertyId } = filters;
      const skip = (page - 1) * limit;

      let where = {};

      if (userRole === "HOST" || userRole === "ADMIN") {
        where.hostId = userId;
      } else {
        where.guestId = userId;
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (propertyId) {
        where.propertyId = propertyId;
      }

      const [enquiries, total] = await Promise.all([
        prisma.propertyEnquiry.findMany({
          where,
          include: {
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                images: true,
              },
            },
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: parseInt(limit),
        }),
        prisma.propertyEnquiry.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      return {
        enquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Get user enquiries error:", error);
      throw error;
    }
  }

  // Get a specific enquiry by ID
  async getEnquiryById(enquiryId, userId, userRole) {
    try {
      const enquiry = await prisma.propertyEnquiry.findUnique({
        where: { id: enquiryId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
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
              avatar: true,
            },
          },
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

      if (!enquiry) {
        throw new Error("Enquiry not found");
      }

      // Check if user has permission to view this enquiry
      if (
        userRole !== "ADMIN" &&
        enquiry.guestId !== userId &&
        enquiry.hostId !== userId
      ) {
        throw new Error("Access denied");
      }

      // Mark as read if user is the host and enquiry is unread
      if (enquiry.hostId === userId && !enquiry.isRead) {
        await prisma.propertyEnquiry.update({
          where: { id: enquiryId },
          data: { isRead: true },
        });
        enquiry.isRead = true;
      }

      return enquiry;
    } catch (error) {
      console.error("Get enquiry by ID error:", error);
      throw error;
    }
  }

  // Respond to an enquiry (host only)
  async respondToEnquiry(enquiryId, response, hostId) {
    try {
      const enquiry = await prisma.propertyEnquiry.findUnique({
        where: { id: enquiryId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
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

      if (!enquiry) {
        throw new Error("Enquiry not found");
      }

      if (enquiry.hostId !== hostId) {
        throw new Error("Only the property host can respond to this enquiry");
      }

      if (enquiry.status === "RESPONDED") {
        throw new Error("Enquiry has already been responded to");
      }

      // Update enquiry with response
      const updatedEnquiry = await prisma.propertyEnquiry.update({
        where: { id: enquiryId },
        data: {
          response,
          status: "RESPONDED",
          respondedAt: new Date(),
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
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

      // Send email notification to guest (non-blocking)
      sendEnquiryResponseEmail(
        enquiry.guest.email,
        enquiry.guest.firstName,
        updatedEnquiry,
        enquiry.property
      ).catch((err) => {
        console.error(
          "sendEnquiryResponseEmail failed:",
          err && err.message ? err.message : err
        );
      });

      // Create notification for guest
      await notificationService.createNotification({
        userId: enquiry.guest.id,
        type: "EMAIL",
        title: "Response to Your Enquiry",
        body: `${enquiry.host.firstName} has responded to your enquiry about "${enquiry.property.title}"`,
        data: {
          enquiryId: enquiry.id,
          propertyId: enquiry.property.id,
          hostId: enquiry.host.id,
        },
      });

      return updatedEnquiry;
    } catch (error) {
      console.error("Respond to enquiry error:", error);
      throw error;
    }
  }

  // Update enquiry status (admin or host)
  async updateEnquiryStatus(enquiryId, status, userId, userRole) {
    try {
      const enquiry = await prisma.propertyEnquiry.findUnique({
        where: { id: enquiryId },
      });

      if (!enquiry) {
        throw new Error("Enquiry not found");
      }

      // Check permissions
      if (userRole !== "ADMIN" && enquiry.hostId !== userId) {
        throw new Error("Access denied");
      }

      const updatedEnquiry = await prisma.propertyEnquiry.update({
        where: { id: enquiryId },
        data: { status },
        include: {
          property: {
            select: {
              id: true,
              title: true,
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updatedEnquiry;
    } catch (error) {
      console.error("Update enquiry status error:", error);
      throw error;
    }
  }

  // Get enquiry statistics for a user
  async getEnquiryStats(userId, userRole) {
    try {
      let where = {};

      if (userRole === "HOST" || userRole === "ADMIN") {
        where.hostId = userId;
      } else {
        where.guestId = userId;
      }

      const stats = await prisma.propertyEnquiry.groupBy({
        by: ["status"],
        where,
        _count: {
          status: true,
        },
      });

      const totalEnquiries = await prisma.propertyEnquiry.count({ where });
      const unreadEnquiries = await prisma.propertyEnquiry.count({
        where: {
          ...where,
          isRead: false,
        },
      });

      const statsMap = {
        total: totalEnquiries,
        unread: unreadEnquiries,
        pending: 0,
        responded: 0,
        closed: 0,
        spam: 0,
      };

      stats.forEach((stat) => {
        statsMap[stat.status.toLowerCase()] = stat._count.status;
      });

      return statsMap;
    } catch (error) {
      console.error("Get enquiry stats error:", error);
      throw error;
    }
  }

  // Get enquiries for a specific property (host only)
  async getPropertyEnquiries(propertyId, hostId, filters = {}) {
    try {
      // Verify host owns the property
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property || property.hostId !== hostId) {
        throw new Error("Access denied");
      }

      const { page = 1, limit = 10, status, priority } = filters;
      const skip = (page - 1) * limit;

      let where = { propertyId };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      const [enquiries, total] = await Promise.all([
        prisma.propertyEnquiry.findMany({
          where,
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: parseInt(limit),
        }),
        prisma.propertyEnquiry.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      return {
        enquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Get property enquiries error:", error);
      throw error;
    }
  }
}

module.exports = new EnquiryService();
