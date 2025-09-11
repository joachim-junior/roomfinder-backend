// Hostinger SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 587, // TLS port
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
