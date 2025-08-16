const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-verification", authController.resendVerification);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);
router.put("/password", authenticateToken, authController.changePassword);

// Admin routes
router.put(
  "/verify/:userId",
  authenticateToken,
  requireRole(["ADMIN"]),
  authController.verifyUser
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

module.exports = router;
