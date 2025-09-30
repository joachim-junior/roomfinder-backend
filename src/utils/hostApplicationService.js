const { prisma, handleDatabaseError } = require("./database");
const {
  sendHostApplicationEmail,
  sendHostApprovalEmail,
  sendHostRejectionEmail,
} = require("./emailService");

class HostApplicationService {
  // Submit host application
  async submitHostApplication(userId, applicationData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== "GUEST") {
        throw new Error("Only guests can apply to become hosts");
      }

      if (user.hostApprovalStatus === "PENDING") {
        throw new Error("You already have a pending host application");
      }

      if (user.hostApprovalStatus === "APPROVED") {
        throw new Error("You are already an approved host");
      }

      if (user.hostApprovalStatus === "REJECTED") {
        throw new Error(
          "Your previous host application was rejected. Please contact support to reapply."
        );
      }

      if (user.hostApprovalStatus === "SUSPENDED") {
        throw new Error(
          "Your host account has been suspended. Please contact support for more information."
        );
      }

      // Update user with host application
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: "HOST",
          hostApprovalStatus: "PENDING",
          hostApplicationDate: new Date(),
          hostApplicationNotes: applicationData.notes || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          hostApprovalStatus: true,
          hostApplicationDate: true,
          hostApplicationNotes: true,
        },
      });

      // Send application confirmation email (non-blocking)
      sendHostApplicationEmail(user.email, user.firstName).catch((err) => {
        console.error(
          "sendHostApplicationEmail failed:",
          err && err.message ? err.message : err
        );
      });

      // Send notification to admins (you can implement this)
      await this.notifyAdminsOfNewApplication(updatedUser);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Get host application details
  async getHostApplication(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          hostApprovalStatus: true,
          hostApplicationDate: true,
          hostApplicationNotes: true,
          hostApprovalDate: true,
          hostApprovalNotes: true,
          hostRejectionReason: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all host applications with filtering
  async getAllHostApplications(where, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isVerified: true,
            hostApprovalStatus: true,
            hostApplicationDate: true,
            hostApplicationNotes: true,
            hostApprovalDate: true,
            hostApprovalNotes: true,
            hostRejectionReason: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { hostApplicationDate: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      // Get counts for properties and bookings for all users in one query
      const userIds = applications.map((user) => user.id);

      const [propertiesCounts, bookingsCounts] = await Promise.all([
        prisma.property.groupBy({
          by: ["hostId"],
          where: { hostId: { in: userIds } },
          _count: { hostId: true },
        }),
        prisma.booking.groupBy({
          by: ["guestId"],
          where: { guestId: { in: userIds } },
          _count: { guestId: true },
        }),
      ]);

      // Create lookup maps for efficient access
      const propertiesCountMap = propertiesCounts.reduce((acc, item) => {
        acc[item.hostId] = item._count.hostId;
        return acc;
      }, {});

      const bookingsCountMap = bookingsCounts.reduce((acc, item) => {
        acc[item.guestId] = item._count.guestId;
        return acc;
      }, {});

      // Add counts to applications
      const applicationsWithCounts = applications.map((user) => ({
        ...user,
        _count: {
          properties: propertiesCountMap[user.id] || 0,
          bookings: bookingsCountMap[user.id] || 0,
        },
      }));

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        applications: applicationsWithCounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all pending host applications
  async getPendingHostApplications(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: "HOST",
            hostApprovalStatus: "PENDING",
          },
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isVerified: true,
            hostApplicationDate: true,
            hostApplicationNotes: true,
            createdAt: true,
          },
          orderBy: { hostApplicationDate: "asc" },
        }),
        prisma.user.count({
          where: {
            role: "HOST",
            hostApprovalStatus: "PENDING",
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Approve host application
  async approveHostApplication(userId, adminId, approvalNotes = null) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.hostApprovalStatus !== "PENDING") {
        throw new Error("Application is not pending approval");
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          hostApprovalStatus: "APPROVED",
          hostApprovalDate: new Date(),
          hostApprovalNotes: approvalNotes,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          hostApprovalStatus: true,
          hostApprovalDate: true,
          hostApprovalNotes: true,
        },
      });

      // Send approval email (non-blocking)
      sendHostApprovalEmail(user.email, user.firstName).catch((err) => {
        console.error(
          "sendHostApprovalEmail failed:",
          err && err.message ? err.message : err
        );
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: userId,
          title: "Host Application Approved",
          body: "Congratulations! Your host application has been approved. You can now start adding properties.",
          type: "SYSTEM",
          status: "UNREAD",
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Reject host application
  async rejectHostApplication(userId, adminId, rejectionReason) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.hostApprovalStatus !== "PENDING") {
        throw new Error("Application is not pending approval");
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          hostApprovalStatus: "REJECTED",
          hostRejectionReason: rejectionReason,
          role: "GUEST", // Revert to guest role
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          hostApprovalStatus: true,
          hostRejectionReason: true,
        },
      });

      // Send rejection email (non-blocking)
      sendHostRejectionEmail(user.email, user.firstName, rejectionReason).catch(
        (err) => {
          console.error(
            "sendHostRejectionEmail failed:",
            err && err.message ? err.message : err
          );
        }
      );

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: userId,
          title: "Host Application Rejected",
          body: `Your host application has been rejected. Reason: ${rejectionReason}`,
          type: "SYSTEM",
          status: "UNREAD",
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Suspend host
  async suspendHost(userId, adminId, suspensionReason) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== "HOST") {
        throw new Error("User is not a host");
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          hostApprovalStatus: "SUSPENDED",
          hostRejectionReason: suspensionReason,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          hostApprovalStatus: true,
          hostRejectionReason: true,
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: userId,
          title: "Host Account Suspended",
          body: `Your host account has been suspended. Reason: ${suspensionReason}`,
          type: "SYSTEM",
          status: "UNREAD",
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Get host statistics for admin dashboard
  async getHostApplicationStats() {
    try {
      const [pending, approved, rejected, suspended] = await Promise.all([
        prisma.user.count({
          where: {
            role: "HOST",
            hostApprovalStatus: "PENDING",
          },
        }),
        prisma.user.count({
          where: {
            role: "HOST",
            hostApprovalStatus: "APPROVED",
          },
        }),
        prisma.user.count({
          where: {
            role: "HOST",
            hostApprovalStatus: "REJECTED",
          },
        }),
        prisma.user.count({
          where: {
            role: "HOST",
            hostApprovalStatus: "SUSPENDED",
          },
        }),
      ]);

      return {
        pending,
        approved,
        rejected,
        suspended,
        total: pending + approved + rejected + suspended,
      };
    } catch (error) {
      throw error;
    }
  }

  // Notify admins of new application (placeholder)
  async notifyAdminsOfNewApplication(application) {
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true },
      });

      // Create notifications for all admins
      const notifications = admins.map((admin) => ({
        userId: admin.id,
        title: "New Host Application",
        body: `${application.firstName} ${application.lastName} has submitted a host application.`,
        type: "SYSTEM",
        status: "UNREAD",
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      console.error("Failed to notify admins:", error);
    }
  }
}

module.exports = new HostApplicationService();
