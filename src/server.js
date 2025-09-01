const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection } = require("./utils/database");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const uploadRoutes = require("./routes/uploads"); // Added for file uploads
const notificationRoutes = require("./routes/notifications"); // Added for notifications
const pushNotificationRoutes = require("./routes/pushNotifications"); // Added for push notifications
const adminRoutes = require("./routes/admin"); // Added for admin panel
const paymentRoutes = require("./routes/payments"); // Added for Fapshi payments
const walletRoutes = require("./routes/wallet"); // Added for wallet system
const favoritesRoutes = require("./routes/favorites"); // Added for favorites system
const hostApplicationRoutes = require("./routes/hostApplications"); // Added for host applications
const revenueRoutes = require("./routes/revenue"); // Added for revenue management
const enquiryRoutes = require("./routes/enquiries"); // Added for property enquiries
const blogRoutes = require("./routes/blog"); // Added for blog management
const helpCenterRoutes = require("./routes/helpCenter"); // Added for help center management
const coHostRoutes = require("./routes/coHost"); // Added for co-host management
const fapshiConfigRoutes = require("./routes/fapshiConfig"); // Added for Fapshi configuration management
const customerSupportRoutes = require("./routes/customerSupport"); // Added for customer support system

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging

// Configure body parser with larger limits for file uploads
// Note: These limits are for JSON/URL-encoded data, not file uploads
// File uploads are handled by Multer middleware with their own limits
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies with 10MB limit
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Parse URL-encoded bodies with 10MB limit

// Skip body parsing for multipart form data to avoid conflicts with Multer
app.use((req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data")
  ) {
    // Skip body parsing for multipart form data
    return next();
  }
  next();
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Room Finder API - Airbnb clone for Cameroon",
    version: "1.0.0",
    status: "running",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? "OK" : "ERROR",
      database: isConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/reviews", reviewRoutes);
// Upload routes with specific configuration for large files
app.use(
  "/api/v1/uploads",
  (req, res, next) => {
    // Set higher limits specifically for upload routes
    req.setTimeout(300000); // 5 minutes timeout for uploads
    next();
  },
  uploadRoutes
);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/push-notifications", pushNotificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/favorites", favoritesRoutes);
app.use("/api/v1/host-applications", hostApplicationRoutes);
app.use("/api/v1/revenue", revenueRoutes); // Added revenue routes
app.use("/api/v1/enquiries", enquiryRoutes); // Added enquiry routes
app.use("/api/v1/blog", blogRoutes); // Added blog routes
app.use("/api/v1/help-center", helpCenterRoutes); // Added help center routes
app.use("/api/v1/co-hosts", coHostRoutes); // Added co-host routes
app.use("/api/v1/fapshi-config", fapshiConfigRoutes); // Added Fapshi configuration routes
app.use("/api/v1/support", customerSupportRoutes); // Added customer support routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      message: "The request body contains invalid JSON format",
      details: {
        error: err.message,
        suggestion: "Please check your request body format",
      },
    });
  }

  // Handle payload too large errors specifically
  if (
    err.type === "entity.too.large" ||
    err.message === "request entity too large"
  ) {
    return res.status(413).json({
      error: "Payload too large",
      message:
        "The request payload is too large. Please reduce file size or number of files.",
      details: {
        maxSize: "10MB",
        maxFiles: "10 files per request",
        maxFileSize: "5MB per file",
      },
    });
  }

  // Handle other errors
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Room Finder API is ready!`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
