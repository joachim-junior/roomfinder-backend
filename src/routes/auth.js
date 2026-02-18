const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");
const {
  registerLimiter,
  loginLimiter,
  emailActionLimiter,
} = require("../middleware/rateLimiter");
const { verifyTurnstile } = require("../middleware/turnstile");

// Public routes (with rate limiting)
router.post("/register", registerLimiter, verifyTurnstile, validateRegistration, authController.register);
router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", emailActionLimiter, authController.requestPasswordReset);
router.post("/reset-password", emailActionLimiter, authController.resetPassword);
router.post("/resend-verification", emailActionLimiter, authController.resendVerification);
router.post("/google", loginLimiter, authController.googleAuth);

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
