const settingsService = require("../utils/settingsService");
const { handleDatabaseError } = require("../utils/database");

class SettingsController {
    async getPayoutHoldingDays(req, res) {
        try {
            const days = await settingsService.getPayoutHoldingDays();
            res.json({ success: true, data: { holdingDays: days } });
        } catch (error) {
            const dbError = handleDatabaseError(error);
            res.status(500).json(dbError);
        }
    }

    async updatePayoutHoldingDays(req, res) {
        try {
            const { holdingDays } = req.body;
            const saved = await settingsService.setPayoutHoldingDays(holdingDays);
            res.json({
                success: true,
                message: "Updated",
                data: { holdingDays: parseInt(saved.value, 10) },
            });
        } catch (error) {
            res
                .status(400)
                .json({ success: false, message: error.message || "Invalid value" });
        }
    }
}

module.exports = new SettingsController();