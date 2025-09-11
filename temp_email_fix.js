const nodemailer = require("nodemailer");

// Create transporter (configure for your email service)
const createTransporter = () => {
  // Hostinger SMTP Configuration
  return nodemailer.createTransporter({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || "no-reply@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "#Noreply123@#",
    },
    tls: {
      rejectUnauthorized: false // For development, set to true in production
    }
  });
};
