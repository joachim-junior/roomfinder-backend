const hostApplicationService = require("../utils/hostApplicationService");
const { validationResult } = require("express-validator");

class HostApplicationController {
  // Submit host application
  async submitApplication(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { notes } = req.body;
      const userId = req.user.id;

      const application = await hostApplicationService.submitHostApplication(
        userId,
        { notes }
      );

      res.status(201).json({
        success: true,
        message:
          "Host application submitted successfully. We will review your application and contact you soon.",
        data: application,
      });
    } catch (error) {
      console.error("Submit host application error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to submit host application",
      });
    }
  }

  // Get user's host application status
  async getApplicationStatus(req, res) {
    try {
      const userId = req.user.id;

      const application = await hostApplicationService.getHostApplication(
        userId
      );

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error("Get application status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get application status",
      });
    }
  }

  // Admin: Get all host applications with filtering
  async getAllApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: "Page number must be greater than 0",
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      const { status, isVerified, search } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        role: "HOST",
      };

      // Filter by approval status
      if (status) {
        where.hostApprovalStatus = status;
      }

      // Filter by verification status
      if (isVerified !== undefined) {
        where.isVerified = isVerified === "true";
      }

      // Search functionality
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const applications = await hostApplicationService.getAllHostApplications(
        where,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Host applications retrieved successfully",
        data: applications,
      });
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get host applications",
      });
    }
  }

  // Admin: Get all pending applications
  async getPendingApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: "Page number must be greater than 0",
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      const result = await hostApplicationService.getPendingHostApplications(
        page,
        limit
      );

      res.json({
        success: true,
        message: "Pending applications retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get pending applications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get pending applications",
      });
    }
  }

  // Admin: Approve host application
  async approveApplication(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { userId } = req.params;
      const { notes } = req.body;
      const adminId = req.user.id;

      const result = await hostApplicationService.approveHostApplication(
        userId,
        adminId,
        notes
      );

      res.json({
        success: true,
        message: "Host application approved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Approve application error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to approve application",
      });
    }
  }

  // Admin: Reject host application
  async rejectApplication(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const result = await hostApplicationService.rejectHostApplication(
        userId,
        adminId,
        reason
      );

      res.json({
        success: true,
        message: "Host application rejected successfully",
        data: result,
      });
    } catch (error) {
      console.error("Reject application error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reject application",
      });
    }
  }

  // Admin: Suspend host
  async suspendHost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Suspension reason is required",
        });
      }

      const result = await hostApplicationService.suspendHost(
        userId,
        adminId,
        reason
      );

      res.json({
        success: true,
        message: "Host suspended successfully",
        data: result,
      });
    } catch (error) {
      console.error("Suspend host error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to suspend host",
      });
    }
  }

  // Admin: Get host application statistics
  async getApplicationStats(req, res) {
    try {
      const stats = await hostApplicationService.getHostApplicationStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get application stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get application statistics",
      });
    }
  }
}

module.exports = new HostApplicationController();
