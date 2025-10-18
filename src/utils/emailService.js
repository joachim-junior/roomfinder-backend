const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ?
    new Resend(process.env.RESEND_API_KEY) :
    null;

// Logo utility functions
const getLogoBase64 = () => {
    try {
        const logoPath = path.join(__dirname, "..", "..", "logo-main.png");
        const logoBuffer = fs.readFileSync(logoPath);
        return logoBuffer.toString("base64");
    } catch (error) {
        console.error("Error reading logo file:", error);
        return null;
    }
};

const getEmailHeader = (title, backgroundColor = "#1976D2") => {
    const logoBase64 = getLogoBase64();
    const logoImg = logoBase64 ?
        `<img src="data:image/png;base64,${logoBase64}" alt="Room Finder" style="max-width: 200px; height: auto; margin-bottom: 10px;">` :
        '<h1 style="margin: 0; font-size: 24px;">Room Finder</h1>';

    return `
        <div style="background-color: ${backgroundColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            ${logoImg}
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">${title}</h2>
        </div>
    `;
};

// Connection pool to reuse connections (SMTP fallback)
let transporter = null;

const createTransporter = () => {
    if (transporter) {
        return transporter;
    }

    const config = {
        host: process.env.EMAIL_HOST || "smtp.titan.email",
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER || "no-reply@roomfinder237.com",
            pass: process.env.EMAIL_PASSWORD || "#Noreply123@#",
        },
        tls: {
            rejectUnauthorized: false,
            minVersion: "TLSv1.2",
            ciphers: "HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
        },
        // Connection timeout settings
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        // Pool settings for connection reuse
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000, // 20 seconds
        rateLimit: 5, // max 5 messages per rateDelta
        // Retry settings
        retryDelay: 5000, // 5 seconds
        retryAttempts: 3,
    };

    transporter = nodemailer.createTransport(config);

    // Verify connection configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error("SMTP connection verification failed:", error);
        } else {
            console.log("SMTP server is ready to take our messages");
        }
    });

    return transporter;
};

// Fallback SMTP configuration
const createFallbackTransporter = () => {
    const fallbackConfig = {
        host: process.env.EMAIL_FALLBACK_HOST || "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_FALLBACK_USER || process.env.EMAIL_USER,
            pass: process.env.EMAIL_FALLBACK_PASS || process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
            minVersion: "TLSv1.2",
        },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    };

    return nodemailer.createTransport(fallbackConfig);
};

// Enhanced email sending with Resend (primary) and SMTP (fallback)
const sendEmailWithRetry = async(mailOptions, maxRetries = 3) => {
    let lastError = null;

    // Try Resend first if configured
    if (resend) {
        try {
            console.log("Sending email via Resend...");

            // Use verified domain if set, otherwise use Resend's default domain
            const fromEmail = process.env.RESEND_VERIFIED_DOMAIN ?
                `Room Finder <no-reply@${process.env.RESEND_VERIFIED_DOMAIN}>` :
                "Room Finder <onboarding@resend.dev>";

            const { data, error } = await resend.emails.send({
                from: mailOptions.from || fromEmail,
                to: [mailOptions.to],
                subject: mailOptions.subject,
                html: mailOptions.html,
            });

            if (error) {
                throw error;
            }

            console.log("Email sent successfully via Resend:", data.id);
            return { messageId: data.id };
        } catch (error) {
            console.error("Resend failed, falling back to SMTP:", error.message);
            lastError = error;
            // Continue to SMTP fallback
        }
    }

    // Fallback to SMTP
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Email send attempt ${attempt}/${maxRetries} (SMTP)`);

            // Try primary transporter first
            let currentTransporter = createTransporter();

            // If attempt > 1, try fallback
            if (attempt > 1) {
                console.log("Trying fallback SMTP configuration...");
                currentTransporter = createFallbackTransporter();
            }

            const result = await currentTransporter.sendMail(mailOptions);
            console.log("Email sent successfully:", result.messageId);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Email send attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
                console.log(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

const sendVerificationEmail = async(email, firstName, verificationToken) => {
    try {
        const verificationUrl = `${
      process.env.FRONTEND_URL || "https://roomfinder237.com"
    }/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: `"Room Finder" <${
        process.env.EMAIL_USER || "no-reply@roomfinder237.com"
      }>`,
            to: email,
            subject: "Verify Your Email - Room Finder",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with Room Finder. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              If you didn't create an account with Room Finder, please ignore this email.
            </p>
          </div>
        </div>
      `,
        };

        await sendEmailWithRetry(mailOptions);
        console.log("Verification email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};

const sendPasswordResetEmail = async(email, firstName, resetToken) => {
    try {
        const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Room Finder" <${
        process.env.EMAIL_USER || "no-reply@roomfinder237.com"
      }>`,
            to: email,
            subject: "Reset Your Password - Room Finder",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${firstName}!</h2>
            <p>We received a request to reset your password for your Room Finder account. If you made this request, click the button below to reset your password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
        };

        await sendEmailWithRetry(mailOptions);
        console.log("Password reset email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

const sendWelcomeEmail = async(email, firstName) => {
    try {
        const mailOptions = {
            from: `"Room Finder" <${
        process.env.EMAIL_USER || "no-reply@roomfinder237.com"
      }>`,
            to: email,
            subject: "Welcome to Room Finder!",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Welcome ${firstName}!</h2>
            <p>Congratulations! Your email has been successfully verified. You're now ready to explore amazing accommodations with Room Finder.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Exploring
              </a>
            </div>
            <p>What you can do now:</p>
            <ul>
              <li>Browse thousands of verified accommodations</li>
              <li>Find the perfect place for your next trip</li>
              <li>Book with confidence and secure payments</li>
              <li>Get the best prices with our price guarantee</li>
            </ul>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Need help? Our support team is here to assist you. Contact us anytime!
            </p>
          </div>
        </div>
      `,
        };

        await sendEmailWithRetry(mailOptions);
        console.log("Welcome email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
};

// Generic email sending function
const sendEmail = async(to, subject, html, from = null) => {
    try {
        const mailOptions = {
            from: from ||
                `"Room Finder" <${
          process.env.EMAIL_USER || "no-reply@roomfinder237.com"
        }>`,
            to: to,
            subject: subject,
            html: html,
        };

        await sendEmailWithRetry(mailOptions);
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

/**
 * Send host application confirmation email
 */
const sendHostApplicationEmail = async(email, firstName) => {
    const subject = "Host Application Received - Room Finder";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .timeline { background-color: white; padding: 20px; border-left: 4px solid #1976D2; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      ${getEmailHeader("Host Application Received!", "#1976D2")}
      <div class="content">
        <p>Hello ${firstName},</p>
        <p>Thank you for applying to become a host on Room Finder! We have received your application and our team is currently reviewing it.</p>
        <div class="timeline">
          <h3>What Happens Next?</h3>
          <ol>
            <li><strong>Review Process</strong> - Our team will review your application (typically 1-3 business days)</li>
            <li><strong>Verification</strong> - We may contact you for additional information if needed</li>
            <li><strong>Decision</strong> - You'll receive an email with our decision</li>
            <li><strong>Get Started</strong> - Once approved, you can immediately start listing your properties!</li>
          </ol>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Room Finder Team</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Room Finder. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

    try {
        await sendEmail(email, subject, html);
        console.log("Host application email sent to:", email);
    } catch (error) {
        console.error("Error sending host application email:", error);
        throw error;
    }
};

/**
 * Send host approval email
 */
const sendHostApprovalEmail = async(email, firstName, notes = "") => {
        const subject =
            "Congratulations! Your Host Application Has Been Approved - Room Finder";

        const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .next-steps { background-color: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      ${getEmailHeader("🎉 Congratulations!", "#4CAF50")}
      <div class="content">
        <p>Hello ${firstName},</p>
        <p><strong>Great news! Your host application has been approved!</strong></p>
        <p>Welcome to the Room Finder hosting community! You can now start listing your properties and earning money.</p>
        ${
          notes
            ? `<div class="next-steps"><p><strong>Note from our team:</strong></p><p>${notes}</p></div>`
            : ""
        }
        <div class="next-steps">
          <h3>Next Steps:</h3>
          <ol>
            <li>Create your first property listing</li>
            <li>Add photos and details</li>
            <li>Set your pricing and availability</li>
            <li>Start receiving bookings!</li>
          </ol>
        </div>
        <p>We're excited to have you on board!</p>
        <p>Best regards,<br>The Room Finder Team</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Room Finder. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, subject, html);
    console.log("Host approval email sent to:", email);
  } catch (error) {
    console.error("Error sending host approval email:", error);
    throw error;
  }
};

/**
 * Send host rejection email
 */
const sendHostRejectionEmail = async (email, firstName, reason) => {
  const subject = "Update on Your Host Application - Room Finder";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .reason-box { background-color: white; padding: 20px; border-left: 4px solid #FF9800; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      ${getEmailHeader("Host Application Update", "#FF9800")}
      <div class="content">
        <p>Hello ${firstName},</p>
        <p>Thank you for your interest in becoming a host on Room Finder. After careful review, we are unable to approve your host application at this time.</p>
        <div class="reason-box">
          <p><strong>Reason:</strong></p>
          <p>${reason}</p>
        </div>
        <p>You can contact our support team for more information or reapply once you've addressed the concerns.</p>
        <p>Best regards,<br>The Room Finder Team</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Room Finder. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, subject, html);
    console.log("Host rejection email sent to:", email);
  } catch (error) {
    console.error("Error sending host rejection email:", error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const testTransporter = createTransporter();
    await testTransporter.verify();
    console.log("✅ Primary SMTP configuration is working");
    return true;
  } catch (error) {
    console.error("❌ Primary SMTP configuration failed:", error.message);

    try {
      const fallbackTransporter = createFallbackTransporter();
      await fallbackTransporter.verify();
      console.log("✅ Fallback SMTP configuration is working");
      return true;
    } catch (fallbackError) {
      console.error(
        "❌ Fallback SMTP configuration also failed:",
        fallbackError.message
      );
      return false;
    }
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendHostApplicationEmail,
  sendHostApprovalEmail,
  sendHostRejectionEmail,
  sendEmail,
  testEmailConfiguration,
  createTransporter,
  createFallbackTransporter,
  getLogoBase64,
  getEmailHeader,
};