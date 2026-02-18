const rateLimit = require("express-rate-limit");

// General API rate limiter — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message: "Too many requests from this IP, please try again after 15 minutes.",
    },
});

// Strict limiter for registration — 5 registrations per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many accounts",
        message: "Too many accounts created from this IP, please try again after an hour.",
    },
});

// Strict limiter for login — 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many login attempts",
        message: "Too many login attempts from this IP, please try again after 15 minutes.",
    },
});

// Limiter for password reset / resend verification — 3 per 15 minutes
const emailActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message: "Too many email requests from this IP, please try again after 15 minutes.",
    },
});

module.exports = {
    apiLimiter,
    registerLimiter,
    loginLimiter,
    emailActionLimiter,
};
