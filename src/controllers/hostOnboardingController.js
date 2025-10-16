const hostOnboardingService = require("../utils/hostOnboardingService");
const { validationResult } = require("express-validator");
const { handleDatabaseError } = require("../utils/database");

class HostOnboardingController {
    /**
     * Create or update host profile
     */
    async createOrUpdateProfile(req, res) {
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
            const profile = await hostOnboardingService.createOrUpdateHostProfile(
                userId,
                req.body
            );

            res.json({
                success: true,
                message: "Host profile saved successfully",
                data: profile,
            });
        } catch (error) {
            console.error("Create/Update host profile error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to save host profile",
            });
        }
    }

    /**
     * Upload ID verification documents
     */
    async uploadIdVerification(req, res) {
        try {
            const userId = req.user.id;
            const { idFrontImage, idBackImage, selfieImage } = req.body;

            const verification = await hostOnboardingService.uploadIdVerification(
                userId, { idFrontImage, idBackImage, selfieImage }
            );

            res.json({
                success: true,
                message: "ID verification documents uploaded successfully. Awaiting admin review.",
                data: verification,
            });
        } catch (error) {
            console.error("Upload ID verification error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to upload ID verification",
            });
        }
    }

    /**
     * Upload property ownership documents (optional)
     */
    async uploadOwnershipDocuments(req, res) {
        try {
            const userId = req.user.id;
            const { documents } = req.body;

            if (!Array.isArray(documents)) {
                return res.status(400).json({
                    success: false,
                    message: "Documents must be an array of URLs",
                });
            }

            const verification = await hostOnboardingService.uploadOwnershipDocuments(
                userId,
                documents
            );

            res.json({
                success: true,
                message: "Property ownership documents uploaded successfully",
                data: verification,
            });
        } catch (error) {
            console.error("Upload ownership documents error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to upload ownership documents",
            });
        }
    }

    /**
     * Get onboarding status
     */
    async getOnboardingStatus(req, res) {
        try {
            const userId = req.user.id;
            const status = await hostOnboardingService.getOnboardingStatus(userId);

            res.json({
                success: true,
                data: status,
            });
        } catch (error) {
            console.error("Get onboarding status error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    /**
     * Admin: Verify host ID
     */
    async verifyHostId(req, res) {
        try {
            const { userId } = req.params;
            const { decision, notes } = req.body;
            const adminId = req.user.id;

            if (!decision || !["VERIFIED", "REJECTED"].includes(decision)) {
                return res.status(400).json({
                    success: false,
                    message: "Decision must be either VERIFIED or REJECTED",
                });
            }

            const verification = await hostOnboardingService.verifyHostId(
                userId,
                adminId,
                decision,
                notes
            );

            res.json({
                success: true,
                message: `Host ID ${decision.toLowerCase()} successfully`,
                data: verification,
            });
        } catch (error) {
            console.error("Verify host ID error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to verify host ID",
            });
        }
    }

    /**
     * Admin: Verify ownership documents
     */
    async verifyOwnershipDocuments(req, res) {
        try {
            const { userId } = req.params;
            const { decision, notes } = req.body;
            const adminId = req.user.id;

            if (!decision || !["VERIFIED", "REJECTED"].includes(decision)) {
                return res.status(400).json({
                    success: false,
                    message: "Decision must be either VERIFIED or REJECTED",
                });
            }

            const verification = await hostOnboardingService.verifyOwnershipDocuments(
                userId,
                adminId,
                decision,
                notes
            );

            res.json({
                success: true,
                message: `Ownership documents ${decision.toLowerCase()} successfully`,
                data: verification,
            });
        } catch (error) {
            console.error("Verify ownership documents error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to verify ownership documents",
            });
        }
    }

    /**
     * Admin: Get pending verifications
     */
    async getPendingVerifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await hostOnboardingService.getPendingVerifications(
                page,
                limit
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error("Get pending verifications error:", error);
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }
}

module.exports = new HostOnboardingController();