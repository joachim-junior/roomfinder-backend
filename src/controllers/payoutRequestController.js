const payoutRequestService = require("../utils/payoutRequestService");
const { validationResult } = require("express-validator");
const { handleDatabaseError } = require("../utils/database");

class PayoutRequestController {
  /**
   * Calculate payout fees (preview before requesting)
   */
  async calculatePayoutFees(req, res) {
    try {
      const { amount } = req.query;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount is required and must be greater than 0",
        });
      }

      const feesBreakdown = await payoutRequestService.calculatePayoutWithFees(
        parseFloat(amount)
      );

      res.json({
        success: true,
        data: feesBreakdown,
      });
    } catch (error) {
      console.error("Calculate payout fees error:", error);
      const dbError = handleDatabaseError(error);
      res.status(500).json(dbError);
    }
  }

  /**
   * Get eligible payout amount
   */
  async getEligibleAmount(req, res) {
        try {
            const userId = req.user.id;
            const eligibility = await payoutRequestService.calculateEligibleAmount(
                userId
            );

            res.json({
                success: true,
                data: eligibility,
            });
        } catch (error) {
            console.error("Get eligible amount error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Create payout request
     */
    async createPayoutRequest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const userId = req.user.id;
            const payoutRequest = await payoutRequestService.createPayoutRequest(
                userId,
                req.body
            );

            res.status(201).json({
                success: true,
                message: "Payout request submitted successfully. Awaiting admin approval.",
                data: payoutRequest,
            });
        } catch (error) {
            console.error("Create payout request error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create payout request",
            });
        }
    }

    /**
     * Get host's payout requests
     */
    async getHostPayoutRequests(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await payoutRequestService.getHostPayoutRequests(
                userId,
                page,
                limit
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("Get host payout requests error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Cancel payout request
     */
    async cancelPayoutRequest(req, res) {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;

            const payoutRequest = await payoutRequestService.cancelPayoutRequest(
                requestId,
                userId
            );

            res.json({
                success: true,
                message: "Payout request cancelled successfully",
                data: payoutRequest,
            });
        } catch (error) {
            console.error("Cancel payout request error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to cancel payout request",
            });
        }
    }

    /**
     * Admin: Get all payout requests
     */
    async getAllPayoutRequests(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { status, userId } = req.query;

            const result = await payoutRequestService.getAllPayoutRequests({ status, userId },
                page,
                limit
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("Get all payout requests error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Admin: Approve payout request
     */
    async approvePayoutRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { notes } = req.body;
            const adminId = req.user.id;

            const payoutRequest = await payoutRequestService.approvePayoutRequest(
                requestId,
                adminId,
                notes
            );

            res.json({
                success: true,
                message: "Payout request approved and processing",
                data: payoutRequest,
            });
        } catch (error) {
            console.error("Approve payout request error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to approve payout request",
            });
        }
    }

    /**
     * Admin: Reject payout request
     */
    async rejectPayoutRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { reason } = req.body;
            const adminId = req.user.id;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason is required",
                });
            }

            const payoutRequest = await payoutRequestService.rejectPayoutRequest(
                requestId,
                adminId,
                reason
            );

            res.json({
                success: true,
                message: "Payout request rejected",
                data: payoutRequest,
            });
        } catch (error) {
            console.error("Reject payout request error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to reject payout request",
            });
        }
    }

    /**
     * Admin: Get payout statistics
     */
    async getPayoutStatistics(req, res) {
        try {
            const stats = await payoutRequestService.getPayoutStatistics();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("Get payout statistics error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }
}

module.exports = new PayoutRequestController();