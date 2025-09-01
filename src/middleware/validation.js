const { body, validationResult } = require("express-validator");

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Please check your input",
      details: errors.array(),
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .if(body("phone").notEmpty())
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  handleValidationErrors,
];

/**
 * User login validation
 */
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

/**
 * Property creation validation
 */
const validateProperty = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("type")
    .isIn([
      "ROOM",
      "STUDIO",
      "APARTMENT",
      "VILLA",
      "SUITE",
      "DORMITORY",
      "COTTAGE",
      "PENTHOUSE",
    ])
    .withMessage("Invalid property type"),
  body("address")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("country")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("bedrooms")
    .isInt({ min: 0, max: 20 })
    .withMessage("Bedrooms must be between 0 and 20"),
  body("bathrooms")
    .isInt({ min: 0, max: 10 })
    .withMessage("Bathrooms must be between 0 and 10"),
  body("maxGuests")
    .isInt({ min: 1, max: 50 })
    .withMessage("Max guests must be between 1 and 50"),
  handleValidationErrors,
];

/**
 * Property update validation (optional fields)
 */
const validatePropertyUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("type")
    .optional()
    .isIn([
      "APARTMENT",
      "HOUSE",
      "VILLA",
      "STUDIO",
      "GUESTHOUSE",
      "ROOM",
      "OTHER",
    ])
    .withMessage("Invalid property type"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("bedrooms")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Bedrooms must be between 0 and 20"),
  body("bathrooms")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Bathrooms must be between 0 and 10"),
  body("maxGuests")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Max guests must be between 1 and 50"),
  handleValidationErrors,
];

/**
 * Message validation
 */
const validateMessage = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("receiverId").notEmpty().withMessage("Receiver ID is required"),
  handleValidationErrors,
];

/**
 * Booking validation
 */
const validateBooking = [
  body("propertyId").isString().withMessage("Property ID is required"),
  body("checkIn").isISO8601().withMessage("Check-in date must be a valid date"),
  body("checkOut")
    .isISO8601()
    .withMessage("Check-out date must be a valid date"),
  body("guests")
    .isInt({ min: 1, max: 50 })
    .withMessage("Number of guests must be between 1 and 50"),
  body("specialRequests")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Special requests must be less than 500 characters"),
  body("paymentMethod")
    .optional()
    .isIn(["MOBILE_MONEY", "CARD", "CASH"])
    .withMessage("Payment method must be MOBILE_MONEY, CARD, or CASH"),
  handleValidationErrors,
];

/**
 * Review validation
 */
const validateReview = [
  body("propertyId").isString().withMessage("Property ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
  handleValidationErrors,
];

/**
 * Review update validation
 */
const validateReviewUpdate = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProperty,
  validatePropertyUpdate,
  validateBooking,
  validateReview,
  validateReviewUpdate,
  validateMessage,
};
