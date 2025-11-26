const express = require("express");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get("/payout-holding-days", settingsController.getPayoutHoldingDays);
router.put("/payout-holding-days", settingsController.updatePayoutHoldingDays);

module.exports = router;