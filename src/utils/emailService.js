const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || "no-reply@roomfinder237.com",
      pass: process.env.EMAIL_PASSWORD || "#Noreply123@#",
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Room Finder" <${process.env.EMAIL_USER || "no-reply@roomfinder237.com"}>`,
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
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Room Finder" <${process.env.EMAIL_USER || "no-reply@roomfinder237.com"}>`,
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

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Room Finder" <${process.env.EMAIL_USER || "no-reply@roomfinder237.com"}>`,
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
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

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
