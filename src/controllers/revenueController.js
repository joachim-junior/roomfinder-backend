const revenueService = require("../utils/revenueService");
const { validationResult } = require("express-validator");

class RevenueController {
  // Get current revenue configuration
  async getRevenueConfig(req, res) {
    try {
      const config = await revenueService.getActiveRevenueConfig();

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Get revenue config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get revenue configuration",
      });
    }
  }

  // Get all revenue configurations (admin)
  async getAllRevenueConfigs(req, res) {
    try {
      const configs = await revenueService.getRevenueConfigs();

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error("Get all revenue configs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get revenue configurations",
      });
    }
  }

  // Create new revenue configuration (admin)
  async createRevenueConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const config = await revenueService.createRevenueConfig(req.body);

      res.status(201).json({
        success: true,
        message: "Revenue configuration created successfully",
        data: config,
      });
    } catch (error) {
      console.error("Create revenue config error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create revenue configuration",
      });
    }
  }

  // Update revenue configuration (admin)
  async updateRevenueConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { configId } = req.params;
      const config = await revenueService.updateRevenueConfig(
        configId,
        req.body
      );

      res.json({
        success: true,
        message: "Revenue configuration updated successfully",
        data: config,
      });
    } catch (error) {
      console.error("Update revenue config error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update revenue configuration",
      });
    }
  }

  // Activate revenue configuration (admin)
  async activateRevenueConfig(req, res) {
    try {
      const { configId } = req.params;
      const config = await revenueService.activateRevenueConfig(configId);

      res.json({
        success: true,
        message: "Revenue configuration activated successfully",
        data: config,
      });
    } catch (error) {
      console.error("Activate revenue config error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to activate revenue configuration",
      });
    }
  }

  // Calculate fees for a booking
  async calculateFees(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { amount, currency = "XAF" } = req.body;

      const fees = await revenueService.calculateBookingFees(amount, currency);

      res.json({
        success: true,
        data: fees,
      });
    } catch (error) {
      console.error("Calculate fees error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate fees",
      });
    }
  }

  // Get fee breakdown for display
  async getFeeBreakdown(req, res) {
    try {
      const { amount, currency = "XAF" } = req.query;

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "Amount is required",
        });
      }

      const breakdown = await revenueService.getFeeBreakdown(
        parseFloat(amount),
        currency
      );

      res.json({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      console.error("Get fee breakdown error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get fee breakdown",
      });
    }
  }

  // Get platform revenue statistics (admin)
  async getRevenueStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      const stats = await revenueService.getPlatformRevenueStats(
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get revenue stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get revenue statistics",
      });
    }
  }

  // Get current month revenue stats (admin)
  async getCurrentMonthStats(req, res) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const stats = await revenueService.getPlatformRevenueStats(
        startOfMonth,
        endOfMonth
      );

      res.json({
        success: true,
        data: {
          ...stats,
          period: {
            start: startOfMonth,
            end: endOfMonth,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        },
      });
    } catch (error) {
      console.error("Get current month stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get current month statistics",
      });
    }
  }
}

module.exports = new RevenueController();
