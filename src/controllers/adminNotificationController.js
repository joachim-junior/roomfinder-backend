const adminNotificationService = require("../utils/adminNotificationService");
const { validationResult } = require("express-validator");
const { handleDatabaseError } = require("../utils/database");

class AdminNotificationController {
    /**
     * Send notification to specific users
     */
    async sendToUsers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const adminId = req.user.id;
            const result = await adminNotificationService.sendNotificationToUsers(
                adminId,
                req.body
            );

            res.json({
                success: true,
                message: "Notifications sent successfully",
                data: result,
            });
        } catch (error) {
            console.error("Send notification to users error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Send notification to users by role
     */
    async sendToRole(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const adminId = req.user.id;
            const result = await adminNotificationService.sendNotificationToRole(
                adminId,
                req.body
            );

            res.json({
                success: true,
                message: `Notifications sent to all ${req.body.role} users successfully`,
                data: result,
            });
        } catch (error) {
            console.error("Send notification to role error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Send notification to all users
     */
    async sendToAll(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const adminId = req.user.id;
            const result = await adminNotificationService.sendNotificationToAll(
                adminId,
                req.body
            );

            res.json({
                success: true,
                message: "Notifications sent to all users successfully",
                data: result,
            });
        } catch (error) {
            console.error("Send notification to all error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Get notification statistics
     */
    async getStats(req, res) {
        try {
            const stats = await adminNotificationService.getNotificationStats();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("Get notification stats error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Get users for notification targeting
     */
    async getUsers(req, res) {
        try {
            const filters = {
                role: req.query.role,
                isVerified: req.query.isVerified === "true" ?
                    true :
                    req.query.isVerified === "false" ?
                    false :
                    undefined,
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50,
            };

            const result = await adminNotificationService.getUsersForNotification(
                filters
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("Get users for notification error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }
}

module.exports = new AdminNotificationController();