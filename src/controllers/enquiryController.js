const enquiryService = require("../utils/enquiryService");
const { validationResult } = require("express-validator");

class EnquiryController {
  // Create a new property enquiry
  async createEnquiry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const enquiry = await enquiryService.createEnquiry(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: "Enquiry sent successfully",
        data: enquiry,
      });
    } catch (error) {
      console.error("Create enquiry error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send enquiry",
      });
    }
  }

  // Get user's enquiries (as guest or host)
  async getUserEnquiries(req, res) {
    try {
      const { page, limit, status, priority, propertyId } = req.query;
      const filters = { page, limit, status, priority, propertyId };

      const result = await enquiryService.getUserEnquiries(
        req.user.id,
        req.user.role,
        filters
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get user enquiries error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get enquiries",
      });
    }
  }

  // Get a specific enquiry by ID
  async getEnquiryById(req, res) {
    try {
      const { enquiryId } = req.params;

      const enquiry = await enquiryService.getEnquiryById(
        enquiryId,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: enquiry,
      });
    } catch (error) {
      console.error("Get enquiry by ID error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Enquiry not found",
      });
    }
  }

  // Respond to an enquiry (host only)
  async respondToEnquiry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { enquiryId } = req.params;
      const { response } = req.body;

      const enquiry = await enquiryService.respondToEnquiry(
        enquiryId,
        response,
        req.user.id
      );

      res.json({
        success: true,
        message: "Response sent successfully",
        data: enquiry,
      });
    } catch (error) {
      console.error("Respond to enquiry error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to respond to enquiry",
      });
    }
  }

  // Update enquiry status (admin or host)
  async updateEnquiryStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { enquiryId } = req.params;
      const { status } = req.body;

      const enquiry = await enquiryService.updateEnquiryStatus(
        enquiryId,
        status,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        message: "Enquiry status updated successfully",
        data: enquiry,
      });
    } catch (error) {
      console.error("Update enquiry status error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update enquiry status",
      });
    }
  }

  // Get enquiry statistics
  async getEnquiryStats(req, res) {
    try {
      const stats = await enquiryService.getEnquiryStats(
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get enquiry stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get enquiry statistics",
      });
    }
  }

  // Get enquiries for a specific property (host only)
  async getPropertyEnquiries(req, res) {
    try {
      const { propertyId } = req.params;
      const { page, limit, status, priority } = req.query;
      const filters = { page, limit, status, priority };

      const result = await enquiryService.getPropertyEnquiries(
        propertyId,
        req.user.id,
        filters
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get property enquiries error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get property enquiries",
      });
    }
  }

  // Admin: Get all enquiries
  async getAllEnquiries(req, res) {
    try {
      const { page, limit, status, priority, propertyId, guestId, hostId } =
        req.query;
      const filters = {
        page,
        limit,
        status,
        priority,
        propertyId,
        guestId,
        hostId,
      };

      const result = await enquiryService.getAllEnquiries(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get all enquiries error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get enquiries",
      });
    }
  }
}

module.exports = new EnquiryController();
