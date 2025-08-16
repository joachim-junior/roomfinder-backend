const nodemailer = require("nodemailer");

// Create transporter (configure for your email service)
const createTransporter = () => {
  // For development, you can use Gmail or other services
  // For production, use services like SendGrid, Mailgun, etc.

  // Gmail example (you'll need to enable 2FA and use app password)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password",
    },
  });

  // For production with SendGrid:
  // return nodemailer.createTransport({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@roomfinder.com",
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

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@roomfinder.com",
      to: email,
      subject: "Reset Your Password - Room Finder",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${firstName}!</h2>
            <p>You requested to reset your password for your Room Finder account.</p>
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

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@roomfinder.com",
      to: email,
      subject: "Welcome to Room Finder!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Welcome to Room Finder, ${firstName}!</h2>
            <p>Your account has been successfully verified. You can now:</p>
            <ul>
              <li>Browse and book properties</li>
              <li>List your own properties (if you're a host)</li>
              <li>Connect with other users</li>
              <li>Leave reviews and ratings</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Exploring
              </a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Thank you for choosing Room Finder!
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

// Host application emails
const sendHostApplicationEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Host Application Received - Room Finder",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Hello ${firstName},</h2>
                    <p>Thank you for submitting your host application to Room Finder!</p>
                    <p>We have received your application and our team will review it carefully. This process typically takes 2-3 business days.</p>
                    <p>During the review process, we will:</p>
                    <ul>
                        <li>Verify your contact information</li>
                        <li>Review your application details</li>
                        <li>Conduct property verification if needed</li>
                        <li>Contact you for any additional information</li>
                    </ul>
                    <p>You will receive an email notification once your application has been reviewed.</p>
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    <p>Best regards,<br>The Room Finder Team</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Host application email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send host application email:", error);
  }
};

const sendHostApprovalEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject:
        "Congratulations! Your Host Application is Approved - Room Finder",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Congratulations ${firstName}!</h2>
                    <p>Great news! Your host application has been approved.</p>
                    <p>You can now start adding your properties to Room Finder and begin welcoming guests.</p>
                    <p>Here's what you can do next:</p>
                    <ul>
                        <li>Add your first property</li>
                        <li>Set up your property details and photos</li>
                        <li>Configure your availability calendar</li>
                        <li>Set your pricing and policies</li>
                    </ul>
                    <p>If you need any help getting started, our support team is here to assist you.</p>
                    <p>Welcome to the Room Finder community!</p>
                    <p>Best regards,<br>The Room Finder Team</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Host approval email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send host approval email:", error);
  }
};

const sendHostRejectionEmail = async (email, firstName, reason) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Host Application Update - Room Finder",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Hello ${firstName},</h2>
                    <p>Thank you for your interest in becoming a host on Room Finder.</p>
                    <p>After careful review of your application, we regret to inform you that we are unable to approve your host application at this time.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>If you believe this decision was made in error or if you would like to provide additional information, please contact our support team.</p>
                    <p>You may reapply in the future if your circumstances change.</p>
                    <p>Thank you for your understanding.</p>
                    <p>Best regards,<br>The Room Finder Team</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Host rejection email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send host rejection email:", error);
  }
};

// Property enquiry emails
const sendEnquiryNotificationEmail = async (
  hostEmail,
  hostFirstName,
  enquiry,
  property
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@roomfinder.com",
      to: hostEmail,
      subject: `New Enquiry for ${property.title} - Room Finder`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${hostFirstName}!</h2>
            <p>You have received a new enquiry for your property <strong>${
              property.title
            }</strong> in ${property.city}.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Enquiry Details:</h3>
              <p><strong>From:</strong> ${enquiry.guest.firstName} ${
        enquiry.guest.lastName
      }</p>
              <p><strong>Subject:</strong> ${enquiry.subject}</p>
              <p><strong>Priority:</strong> ${enquiry.priority}</p>
              <p><strong>Message:</strong></p>
              <p style="background-color: white; padding: 10px; border-left: 3px solid #007bff; margin: 10px 0;">
                ${enquiry.message}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/dashboard/enquiries/${enquiry.id}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Respond to Enquiry
              </a>
            </div>
            
            <p>Please respond to this enquiry as soon as possible to maintain good communication with potential guests.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from Room Finder. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Enquiry notification email sent to:", hostEmail);
    return true;
  } catch (error) {
    console.error("Error sending enquiry notification email:", error);
    return false;
  }
};

const sendEnquiryResponseEmail = async (
  guestEmail,
  guestFirstName,
  enquiry,
  property
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@roomfinder.com",
      to: guestEmail,
      subject: `Response to your enquiry about ${property.title} - Room Finder`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Room Finder</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${guestFirstName}!</h2>
            <p>You have received a response to your enquiry about <strong>${
              property.title
            }</strong> in ${property.city}.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Original Enquiry:</h3>
              <p><strong>Subject:</strong> ${enquiry.subject}</p>
              <p><strong>Your Message:</strong></p>
              <p style="background-color: white; padding: 10px; border-left: 3px solid #28a745; margin: 10px 0;">
                ${enquiry.message}
              </p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Host's Response:</h3>
              <p style="background-color: white; padding: 10px; border-left: 3px solid #28a745; margin: 10px 0;">
                ${enquiry.response}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/properties/${property.id}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Property
              </a>
            </div>
            
            <p>If you have any further questions, feel free to send another enquiry or contact the host directly.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from Room Finder. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Enquiry response email sent to:", guestEmail);
    return true;
  } catch (error) {
    console.error("Error sending enquiry response email:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendHostApplicationEmail,
  sendHostApprovalEmail,
  sendHostRejectionEmail,
  sendEnquiryNotificationEmail,
  sendEnquiryResponseEmail,
};
