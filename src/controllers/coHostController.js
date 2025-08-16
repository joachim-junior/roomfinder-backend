const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

class CoHostController {
  // Get all co-hosts for a property
  async getPropertyCoHosts(req, res) {
    try {
      const { propertyId } = req.params;
      const { status } = req.query;

      // Check if user has access to this property
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          OR: [
            { hostId: req.user.id },
            {
              coHosts: {
                some: {
                  userId: req.user.id,
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found or access denied",
        });
      }

      const where = { propertyId };
      if (status) {
        where.status = status;
      }

      const coHosts = await prisma.coHost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          invitedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        data: coHosts,
      });
    } catch (error) {
      console.error("Get property co-hosts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get co-hosts",
      });
    }
  }

  // Get co-host invitations for current user
  async getMyCoHostInvitations(req, res) {
    try {
      const { status } = req.query;

      const where = { userId: req.user.id };
      if (status) {
        where.status = status;
      }

      const invitations = await prisma.coHost.findMany({
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
                  email: true,
                },
              },
            },
          },
          invitedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      console.error("Get my co-host invitations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get invitations",
      });
    }
  }

  // Invite a co-host to a property
  async inviteCoHost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { propertyId } = req.params;
      const { email, permissions, notes } = req.body;

      // Check if user is the primary host of this property
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          hostId: req.user.id,
        },
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message:
            "Property not found or you don't have permission to invite co-hosts",
        });
      }

      // Find the user to invite
      const userToInvite = await prisma.user.findUnique({
        where: { email },
      });

      if (!userToInvite) {
        return res.status(404).json({
          success: false,
          message: "User not found with this email address",
        });
      }

      // Check if user is already a co-host
      const existingCoHost = await prisma.coHost.findUnique({
        where: {
          propertyId_userId: {
            propertyId,
            userId: userToInvite.id,
          },
        },
      });

      if (existingCoHost) {
        return res.status(400).json({
          success: false,
          message: "User is already a co-host for this property",
        });
      }

      // Check if user is the primary host
      if (userToInvite.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "You cannot invite yourself as a co-host",
        });
      }

      const coHost = await prisma.coHost.create({
        data: {
          propertyId,
          userId: userToInvite.id,
          invitedBy: req.user.id,
          permissions,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              address: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Co-host invitation sent successfully",
        data: coHost,
      });
    } catch (error) {
      console.error("Invite co-host error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to invite co-host",
      });
    }
  }

  // Accept co-host invitation
  async acceptCoHostInvitation(req, res) {
    try {
      const { invitationId } = req.params;

      const invitation = await prisma.coHost.findFirst({
        where: {
          id: invitationId,
          userId: req.user.id,
          status: "PENDING",
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or already processed",
        });
      }

      const updatedInvitation = await prisma.coHost.update({
        where: { id: invitationId },
        data: {
          status: "ACTIVE",
          acceptedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Co-host invitation accepted successfully",
        data: updatedInvitation,
      });
    } catch (error) {
      console.error("Accept co-host invitation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept invitation",
      });
    }
  }

  // Decline co-host invitation
  async declineCoHostInvitation(req, res) {
    try {
      const { invitationId } = req.params;

      const invitation = await prisma.coHost.findFirst({
        where: {
          id: invitationId,
          userId: req.user.id,
          status: "PENDING",
        },
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or already processed",
        });
      }

      await prisma.coHost.delete({
        where: { id: invitationId },
      });

      res.json({
        success: true,
        message: "Co-host invitation declined successfully",
      });
    } catch (error) {
      console.error("Decline co-host invitation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to decline invitation",
      });
    }
  }

  // Update co-host permissions
  async updateCoHostPermissions(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { coHostId } = req.params;
      const { permissions, notes } = req.body;

      // Check if user is the primary host
      const coHost = await prisma.coHost.findFirst({
        where: {
          id: coHostId,
          property: {
            hostId: req.user.id,
          },
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!coHost) {
        return res.status(404).json({
          success: false,
          message: "Co-host not found or you don't have permission to update",
        });
      }

      const updatedCoHost = await prisma.coHost.update({
        where: { id: coHostId },
        data: {
          permissions,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Co-host permissions updated successfully",
        data: updatedCoHost,
      });
    } catch (error) {
      console.error("Update co-host permissions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update co-host permissions",
      });
    }
  }

  // Suspend co-host
  async suspendCoHost(req, res) {
    try {
      const { coHostId } = req.params;
      const { reason } = req.body;

      // Check if user is the primary host
      const coHost = await prisma.coHost.findFirst({
        where: {
          id: coHostId,
          property: {
            hostId: req.user.id,
          },
        },
      });

      if (!coHost) {
        return res.status(404).json({
          success: false,
          message: "Co-host not found or you don't have permission to suspend",
        });
      }

      const updatedCoHost = await prisma.coHost.update({
        where: { id: coHostId },
        data: {
          status: "SUSPENDED",
          notes: reason
            ? `${coHost.notes || ""}\nSuspended: ${reason}`
            : coHost.notes,
        },
        include: {
          user: {
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
        success: true,
        message: "Co-host suspended successfully",
        data: updatedCoHost,
      });
    } catch (error) {
      console.error("Suspend co-host error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to suspend co-host",
      });
    }
  }

  // Reactivate co-host
  async reactivateCoHost(req, res) {
    try {
      const { coHostId } = req.params;

      // Check if user is the primary host
      const coHost = await prisma.coHost.findFirst({
        where: {
          id: coHostId,
          property: {
            hostId: req.user.id,
          },
        },
      });

      if (!coHost) {
        return res.status(404).json({
          success: false,
          message:
            "Co-host not found or you don't have permission to reactivate",
        });
      }

      const updatedCoHost = await prisma.coHost.update({
        where: { id: coHostId },
        data: {
          status: "ACTIVE",
        },
        include: {
          user: {
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
        success: true,
        message: "Co-host reactivated successfully",
        data: updatedCoHost,
      });
    } catch (error) {
      console.error("Reactivate co-host error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reactivate co-host",
      });
    }
  }

  // Remove co-host
  async removeCoHost(req, res) {
    try {
      const { coHostId } = req.params;

      // Check if user is the primary host
      const coHost = await prisma.coHost.findFirst({
        where: {
          id: coHostId,
          property: {
            hostId: req.user.id,
          },
        },
      });

      if (!coHost) {
        return res.status(404).json({
          success: false,
          message: "Co-host not found or you don't have permission to remove",
        });
      }

      await prisma.coHost.update({
        where: { id: coHostId },
        data: {
          status: "REMOVED",
          removedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Co-host removed successfully",
      });
    } catch (error) {
      console.error("Remove co-host error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove co-host",
      });
    }
  }

  // Leave co-host position (for co-hosts)
  async leaveCoHostPosition(req, res) {
    try {
      const { coHostId } = req.params;

      // Check if user is the co-host
      const coHost = await prisma.coHost.findFirst({
        where: {
          id: coHostId,
          userId: req.user.id,
        },
      });

      if (!coHost) {
        return res.status(404).json({
          success: false,
          message: "Co-host position not found",
        });
      }

      await prisma.coHost.update({
        where: { id: coHostId },
        data: {
          status: "REMOVED",
          removedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "You have successfully left the co-host position",
      });
    } catch (error) {
      console.error("Leave co-host position error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to leave co-host position",
      });
    }
  }

  // Check if user has permission for specific action
  async checkPermission(req, res) {
    try {
      const { propertyId } = req.params;
      const { action } = req.query;

      // Check if user is primary host
      const isPrimaryHost = await prisma.property.findFirst({
        where: {
          id: propertyId,
          hostId: req.user.id,
        },
      });

      if (isPrimaryHost) {
        return res.json({
          success: true,
          data: {
            hasPermission: true,
            role: "PRIMARY_HOST",
            permissions: ["FULL_ACCESS"],
          },
        });
      }

      // Check co-host permissions
      const coHost = await prisma.coHost.findFirst({
        where: {
          propertyId,
          userId: req.user.id,
          status: "ACTIVE",
        },
      });

      if (!coHost) {
        return res.json({
          success: true,
          data: {
            hasPermission: false,
            role: "NONE",
            permissions: [],
          },
        });
      }

      // Check specific permission based on action
      let hasPermission = false;
      switch (action) {
        case "view":
          hasPermission = true; // All co-hosts can view
          break;
        case "manage_bookings":
          hasPermission =
            coHost.permissions.includes("MANAGE_BOOKINGS") ||
            coHost.permissions.includes("MANAGE_PROPERTY") ||
            coHost.permissions.includes("FULL_ACCESS");
          break;
        case "manage_property":
          hasPermission =
            coHost.permissions.includes("MANAGE_PROPERTY") ||
            coHost.permissions.includes("FULL_ACCESS");
          break;
        case "manage_finances":
          hasPermission =
            coHost.permissions.includes("MANAGE_FINANCES") ||
            coHost.permissions.includes("FULL_ACCESS");
          break;
        default:
          hasPermission = coHost.permissions.includes("FULL_ACCESS");
      }

      res.json({
        success: true,
        data: {
          hasPermission,
          role: "CO_HOST",
          permissions: coHost.permissions,
        },
      });
    } catch (error) {
      console.error("Check permission error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check permissions",
      });
    }
  }
}

module.exports = new CoHostController();
