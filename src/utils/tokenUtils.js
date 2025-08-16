const crypto = require("crypto");

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate email verification token
 */
const generateEmailVerificationToken = () => {
    return generateToken(32);
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = () => {
    return generateToken(32);
};

/**
 * Check if token is expired
 */
const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    return new Date() > new Date(expiresAt);
};

/**
 * Generate expiration date (24 hours from now)
 */
const generateExpirationDate = (hours = 24) => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    return expiration;
};

/**
 * Generate password reset expiration (1 hour from now)
 */
const generatePasswordResetExpiration = () => {
    return generateExpirationDate(1);
};

module.exports = {
    generateToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    isTokenExpired,
    generateExpirationDate,
    generatePasswordResetExpiration,
};