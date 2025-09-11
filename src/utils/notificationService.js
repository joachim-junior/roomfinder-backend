const nodemailer = require('nodemailer');

class NotificationService {
  createTransporter() {
    return nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendBookingConfirmationEmail(booking, guest, property) {
    try {
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `"Room Finder" <${process.env.EMAIL_USER}>`,
        to: guest.email,
        subject: `Booking Confirmation - ${property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
              <h1>Room Finder</h1>
            </div>
            <div style="padding: 20px;">
              <h2>Booking Confirmed!</h2>
              <p>Hello ${guest.firstName}! Your booking has been confirmed. Here are your booking details:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${property.title}</h3>
                <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> ${booking.totalPrice} FCFA</p>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
              </div>
              <p style="color: #666; font-size: 12px;">
                Please keep this email for your records. If you have any questions, contact our support team.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent successfully to:', guest.email);
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw error;
    }
  }

  async sendBookingCancellationEmail(booking, guest, property) {
    try {
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `"Room Finder" <${process.env.EMAIL_USER}>`,
        to: guest.email,
        subject: `Booking Cancelled - ${property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1>Room Finder</h1>
            </div>
            <div style="padding: 20px;">
              <h2>Booking Cancelled</h2>
              <p>Hello ${guest.firstName}! Your booking has been cancelled. Here are the details of the cancelled booking:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${property.title}</h3>
                <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> ${booking.totalPrice} FCFA</p>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
              </div>
              <p style="color: #666; font-size: 12px;">
                If you have any questions about this cancellation, please contact our support team.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent successfully to:', guest.email);
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
