const nodemailer = require("nodemailer");
const { prisma } = require("./database");
const firebaseService = require("./firebaseService");

class NotificationService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, htmlContent, textContent = "") {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking, user, property) {
    const subject = "Booking Confirmation - Room Finder";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Booking Confirmation</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your booking has been confirmed! Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e;">Property: ${property.title}</h3>
          <p><strong>Address:</strong> ${property.address}, ${property.city}</p>
          <p><strong>Check-in:</strong> ${new Date(
            booking.checkIn
          ).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(
            booking.checkOut
          ).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
          <p><strong>Total Price:</strong> ${property.currency} ${
      booking.totalPrice
    }</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        </div>
        
        <p>Thank you for choosing Room Finder!</p>
        <p>Best regards,<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, htmlContent);
  }

  /**
   * Send booking notification to host
   */
  async sendBookingNotificationToHost(booking, guest, property) {
    const host = await prisma.user.findUnique({
      where: { id: property.hostId },
    });

    if (!host) return { success: false, error: "Host not found" };

    const subject = "New Booking Request - Room Finder";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Booking Request</h2>
        <p>Hello ${host.firstName},</p>
        <p>You have received a new booking request for your property:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e;">Property: ${property.title}</h3>
          <p><strong>Guest:</strong> ${guest.firstName} ${guest.lastName}</p>
          <p><strong>Email:</strong> ${guest.email}</p>
          <p><strong>Phone:</strong> ${guest.phone || "Not provided"}</p>
          <p><strong>Check-in:</strong> ${new Date(
            booking.checkIn
          ).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(
            booking.checkOut
          ).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
          <p><strong>Total Price:</strong> ${property.currency} ${
      booking.totalPrice
    }</p>
          <p><strong>Special Requests:</strong> ${
            booking.specialRequests || "None"
          }</p>
        </div>
        
        <p>Please review and respond to this booking request.</p>
        <p>Best regards,<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(host.email, subject, htmlContent);
  }

  /**
   * Send booking status update notification
   */
  async sendBookingStatusUpdate(booking, user, property, status) {
    const subject = `Booking ${status} - Room Finder`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Booking Status Update</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your booking status has been updated:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e;">Property: ${property.title}</h3>
          <p><strong>New Status:</strong> ${status.toUpperCase()}</p>
          <p><strong>Check-in:</strong> ${new Date(
            booking.checkIn
          ).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(
            booking.checkOut
          ).toLocaleDateString()}</p>
          <p><strong>Total Price:</strong> ${property.currency} ${
      booking.totalPrice
    }</p>
        </div>
        
        <p>Thank you for choosing Room Finder!</p>
        <p>Best regards,<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, htmlContent);
  }

  /**
   * Send review notification to host
   */
  async sendReviewNotification(review, user, property) {
    const host = await prisma.user.findUnique({
      where: { id: property.hostId },
    });

    if (!host) return { success: false, error: "Host not found" };

    const subject = "New Review - Room Finder";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Review Received</h2>
        <p>Hello ${host.firstName},</p>
        <p>You have received a new review for your property:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e;">Property: ${property.title}</h3>
          <p><strong>Guest:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Rating:</strong> ${review.rating}/5 ⭐</p>
          <p><strong>Comment:</strong> "${review.comment}"</p>
          <p><strong>Date:</strong> ${new Date(
            review.createdAt
          ).toLocaleDateString()}</p>
        </div>
        
        <p>Thank you for hosting on Room Finder!</p>
        <p>Best regards,<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(host.email, subject, htmlContent);
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    const subject = "Welcome to Room Finder!";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Room Finder!</h2>
        <p>Hello ${user.firstName},</p>
        <p>Welcome to Room Finder - your trusted platform for finding and booking guest houses in Cameroon!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e;">Getting Started</h3>
          <ul>
            <li>Browse available properties</li>
            <li>Book your perfect stay</li>
            <li>Leave reviews and ratings</li>
            <li>Manage your bookings</li>
          </ul>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy travels!<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, htmlContent);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Password Reset Request - Room Finder";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset for your Room Finder account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>Room Finder Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, htmlContent);
  }

  /**
   * Send push notification using Firebase Cloud Messaging
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Check if user has push notifications enabled
      const preferences = await prisma.userNotificationPreferences.findUnique({
        where: { userId },
      });

      if (preferences && !preferences.pushNotifications) {
        return {
          success: false,
          message: "Push notifications disabled for user",
        };
      }

      // Send push notification using Firebase
      const result = await firebaseService.sendPushNotification(
        userId,
        title,
        body,
        data
      );

      return result;
    } catch (error) {
      console.error("Push notification failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple notifications
   */
  async sendMultipleNotifications(notifications) {
    const results = [];
    for (const notification of notifications) {
      try {
        const result = await this.sendPushNotification(
          notification.userId,
          notification.title,
          notification.body,
          notification.data
        );
        results.push({ ...notification, result });
      } catch (error) {
        console.error("Error sending notification:", error);
        results.push({ ...notification, error: error.message });
      }
    }
    return results;
  }

  /**
   * Create a notification in the database
   */
  async createNotification(notificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data
            ? JSON.stringify(notificationData.data)
            : null,
          status: "UNREAD",
        },
      });

      // Send push notification if device tokens exist
      const deviceTokens = await prisma.deviceToken.findMany({
        where: { userId: notificationData.userId },
      });

      if (deviceTokens.length > 0) {
        await this.sendPushNotification(
          notificationData.userId,
          notificationData.title,
          notificationData.body,
          notificationData.data
        );
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
