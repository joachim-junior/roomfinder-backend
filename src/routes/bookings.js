const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { validateBooking } = require("../middleware/validation");

// Public routes (no authentication required)
router.post("/webhook/payment", bookingController.handlePaymentWebhook);

// Protected routes (require authentication)
router.use(authenticateToken);

// Guest routes
router.get("/calculate-fees", bookingController.calculateBookingFees);
router.post("/", validateBooking, bookingController.createBooking);
router.get("/my-bookings", bookingController.getUserBookings);
router.get("/availability", bookingController.checkAvailability);
router.get("/stats", bookingController.getBookingStats);
router.get("/:id", bookingController.getBookingById);
router.put("/:id/cancel", bookingController.cancelBooking);

// Host routes
router.get(
    "/host/bookings",
    requireRole(["HOST", "ADMIN"]),
    bookingController.getHostBookings
);
router.put(
    "/:id/status",
    requireRole(["HOST", "ADMIN"]),
    bookingController.updateBookingStatus
);

module.exports = router;