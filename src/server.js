const express = require("express");
const path = require("path");
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
const hostOnboardingRoutes = require("./routes/hostOnboarding"); // Added for enhanced host onboarding
const payoutRequestRoutes = require("./routes/payoutRequests"); // Added for manual payout approval system
const adminNotificationRoutes = require("./routes/adminNotifications"); // Added for admin notification system
const settingsRoutes = require("./routes/settings"); // Admin settings

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Trust reverse proxy (so req.protocol uses X-Forwarded-Proto and can be https)
app.set("trust proxy", 1);

// Optional: Force HTTPS redirect when enabled
if (process.env.FORCE_HTTPS === "true") {
  app.use((req, res, next) => {
    const protoHeader = (
      req.headers["x-forwarded-proto"] ||
      req.protocol ||
      "http"
    )
      .toString()
      .split(",")[0];
    if (protoHeader !== "https") {
      const hostHeader = (
        req.headers["x-forwarded-host"] ||
        req.get("host") ||
        ""
      )
        .toString()
        .split(",")[0];
      const redirectUrl = `https://${hostHeader}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }
    next();
  });
}
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging

// Configure body parser with larger limits for file uploads
// Note: These limits are for JSON/URL-encoded data, not file uploads
// File uploads are handled by Multer middleware with their own limits
// We'll apply body parsing only to non-upload routes to avoid conflicts

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

// Static file serving for uploads (use absolute path to avoid cwd issues)
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// API Routes
// Upload routes with specific configuration for large files (NO body parser)
app.use(
  "/api/v1/uploads",
  (req, res, next) => {
    // Set higher limits specifically for upload routes
    req.setTimeout(300000); // 5 minutes timeout for uploads
    next();
  },
  uploadRoutes
);

// All other routes with body parser middleware
app.use(
  "/api/v1/auth",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  authRoutes
);
app.use(
  "/api/v1/users",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  userRoutes
);
app.use(
  "/api/v1/properties",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  propertyRoutes
);
app.use(
  "/api/v1/bookings",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  bookingRoutes
);
app.use(
  "/api/v1/reviews",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  reviewRoutes
);
app.use(
  "/api/v1/notifications",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  notificationRoutes
);
app.use(
  "/api/v1/push-notifications",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  pushNotificationRoutes
);
app.use(
  "/api/v1/admin",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  adminRoutes
);
app.use(
  "/api/v1/payments",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  paymentRoutes
);
app.use(
  "/api/v1/wallet",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  walletRoutes
);
app.use(
  "/api/v1/favorites",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  favoritesRoutes
);
app.use(
  "/api/v1/host-applications",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  hostApplicationRoutes
);
app.use(
  "/api/v1/revenue",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  revenueRoutes
); // Added revenue routes
app.use(
  "/api/v1/enquiries",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  enquiryRoutes
); // Added enquiry routes
app.use(
  "/api/v1/blog",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  blogRoutes
); // Added blog routes
app.use(
  "/api/v1/help-center",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  helpCenterRoutes
); // Added help center routes
app.use(
  "/api/v1/co-hosts",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  coHostRoutes
); // Added co-host routes
app.use(
  "/api/v1/fapshi-config",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  fapshiConfigRoutes
); // Added Fapshi configuration routes
app.use(
  "/api/v1/support",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  customerSupportRoutes
); // Added customer support routes
app.use(
  "/api/v1/host-onboarding",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  hostOnboardingRoutes
); // Added enhanced host onboarding routes
app.use(
  "/api/v1/payout-requests",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  payoutRequestRoutes
); // Added manual payout approval routes
app.use(
  "/api/v1/admin/notifications",
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  adminNotificationRoutes
); // Added admin notification routes

app.use(
  "/api/v1/admin/settings",
  express.json({ limit: "1mb" }),
  express.urlencoded({ extended: true }),
  settingsRoutes
); // Admin settings routes

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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Room Finder API is ready!`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
