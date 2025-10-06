const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma, handleDatabaseError } = require("../utils/database");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../utils/emailService");
const {
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateExpirationDate,
  generatePasswordResetExpiration,
  isTokenExpired,
} = require("../utils/tokenUtils");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "GUEST",
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Registration failed",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = generateExpirationDate();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Send verification email
    // Make email sending non-blocking so signup doesn't depend on SMTP speed
    sendVerificationEmail(email, firstName, verificationToken).catch((err) => {
      console.error(
        "sendVerificationEmail failed:",
        err && err.message ? err.message : err
      );
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        avatar,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: "An error occurred while changing password",
    });
  }
};

/**
 * Verify user account (admin function)
 */
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({
      message: "User verified successfully",
      user,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Verify email address
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Verification failed",
        message: "Verification token is required",
      });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Verification failed",
        message: "Invalid or expired verification token",
      });
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch((err) => {
      console.error(
        "sendWelcomeEmail failed:",
        err && err.message ? err.message : err
      );
    });

    res.json({
      message: "Email verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Password reset failed",
        message: "Email is required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetExpires = generatePasswordResetExpiration();

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email (non-blocking)
    sendPasswordResetEmail(email, user.firstName, resetToken).catch((err) => {
      console.error(
        "sendPasswordResetEmail failed:",
        err && err.message ? err.message : err
      );
    });

    res.json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Password reset failed",
        message: "Token and new password are required",
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Password reset failed",
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Verification failed",
        message: "Email is required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        error: "Verification failed",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: "Verification failed",
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = generateExpirationDate();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, user.firstName, verificationToken).catch(
      (err) => {
        console.error(
          "sendVerificationEmail failed:",
          err && err.message ? err.message : err
        );
      }
    );

    res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    const dbError = handleDatabaseError(error);
    res.status(500).json(dbError);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerification,
};
