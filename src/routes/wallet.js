const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication to all wallet routes
router.use(authenticateToken);

// Get wallet balance and statistics
router.get("/balance", walletController.getWalletBalance);

// Get wallet details with recent transactions
router.get("/details", walletController.getWalletDetails);

// Get transaction history
router.get("/transactions", walletController.getTransactionHistory);

// Get specific transaction
router.get("/transactions/:transactionId", walletController.getTransactionById);

// Get refund history
router.get("/refunds", walletController.getRefundHistory);

// Get withdrawal history
router.get("/withdrawals", walletController.getWithdrawalHistory);

// Process refund for booking
router.post("/refund/:bookingId", walletController.processRefund);

// Note: Direct withdrawals are now disabled
// Hosts must use the manual payout request system:
// POST /api/v1/payout-requests/request
// This provides better fraud protection and admin control

module.exports = router;