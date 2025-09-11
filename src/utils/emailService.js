const nodemailer = require('nodemailer');

// Connection pool to reuse connections
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
      minVersion: 'TLSv1.2',
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
    },
    // Connection timeout settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    // Pool settings for connection reuse
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000, // 20 seconds
    rateLimit: 5, // max 5 messages per rateDelta
    // Retry settings
    retryDelay: 5000, // 5 seconds
    retryAttempts: 3
  };

  transporter = nodemailer.createTransport(config);

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection verification failed:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
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
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  };

  return nodemailer.createTransport(fallbackConfig);
};

// Enhanced email sending with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Email send attempt ${attempt}/${maxRetries}`);
      
      // Try primary transporter first
      let currentTransporter = createTransporter();
      
      // If attempt > 1, try fallback
      if (attempt > 1) {
        console.log('Trying fallback SMTP configuration...');
        currentTransporter = createFallbackTransporter();
      }

      const result = await currentTransporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`Email send attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
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

    await sendEmailWithRetry(mailOptions);
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
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

    await sendEmailWithRetry(mailOptions);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  try {
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

    await sendEmailWithRetry(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Generic email sending function
const sendEmail = async (to, subject, html, from = null) => {
  try {
    const mailOptions = {
      from: from || `"Room Finder" <${process.env.EMAIL_USER || "no-reply@roomfinder237.com"}>`,
      to: to,
      subject: subject,
      html: html,
    };

    await sendEmailWithRetry(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const testTransporter = createTransporter();
    await testTransporter.verify();
    console.log('✅ Primary SMTP configuration is working');
    return true;
  } catch (error) {
    console.error('❌ Primary SMTP configuration failed:', error.message);
    
    try {
      const fallbackTransporter = createFallbackTransporter();
      await fallbackTransporter.verify();
      console.log('✅ Fallback SMTP configuration is working');
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback SMTP configuration also failed:', fallbackError.message);
      return false;
    }
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEmail,
  testEmailConfiguration,
  createTransporter,
  createFallbackTransporter
};
