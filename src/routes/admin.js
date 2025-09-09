const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateToken,
  requireRole,
  requireAdmin,
} = require("../middleware/auth");

// Apply authentication and admin role to all admin routes
router.use(authenticateToken);
router.use(requireRole(["ADMIN"]));

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// User Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

// Property Management
router.get("/properties", adminController.getAllProperties);
router.put("/properties/:propertyId", adminController.updateProperty);

// Booking Management
router.get("/bookings", adminController.getAllBookings);

// Notification Management
router.get("/notifications", adminController.getSystemNotifications);
router.post("/notifications/send", adminController.sendSystemNotification);

// Analytics
router.get("/analytics", adminController.getSystemAnalytics);

// Wallet Management
router.get("/wallets", adminController.getAllWallets);
router.get("/wallets/statistics", adminController.getWalletStatistics);
router.get("/wallets/user/:userId", adminController.getUserWallet);

// Admin preferences
router.get(
  "/preferences",
  authenticateToken,
  requireAdmin,
  adminController.getAdminPreferences
);
router.put(
  "/preferences",
  authenticateToken,
  requireAdmin,
  adminController.updateAdminPreferences
);

module.exports = router;
