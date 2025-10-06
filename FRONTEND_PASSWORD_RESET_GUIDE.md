# Frontend Password Reset Guide - Room Finder

## Overview

This document explains how the frontend should handle the complete password reset flow when a user forgets their password.

=============================================================================

## PASSWORD RESET FLOW

=============================================================================

### Step 1: User Clicks "Forgot Password"

Frontend displays a form asking for email address

### Step 2: User Submits Email

Frontend calls API to request password reset

### Step 3: User Receives Email

Backend sends password reset email with link:
https://roomfinder237.com/reset-password?token=xyz789...

### Step 4: User Clicks Link

Opens frontend page: /reset-password?token=xyz789...

### Step 5: User Enters New Password

Frontend shows form to enter new password

### Step 6: Frontend Submits New Password

Calls API with token and new password

### Step 7: Success

User is notified and redirected to login

=============================================================================

## API ENDPOINTS

=============================================================================

---

## ENDPOINT 1: REQUEST PASSWORD RESET

ENDPOINT: POST /api/v1/auth/forgot-password
BASE URL: https://your-api.railway.app/api/v1
AUTHENTICATION: Not required (public endpoint)

REQUEST BODY:
{
"email": "user@example.com"
}

SUCCESS RESPONSE (200):
{
"message": "If an account with this email exists, a password reset link has been sent."
}

NOTE: For security, always returns success even if email doesn't exist

---

## ENDPOINT 2: RESET PASSWORD

ENDPOINT: POST /api/v1/auth/reset-password
BASE URL: https://your-api.railway.app/api/v1
AUTHENTICATION: Not required (uses token)

REQUEST BODY:
{
"token": "xyz789...",
"newPassword": "NewSecurePass123!"
}

SUCCESS RESPONSE (200):
{
"message": "Password reset successfully"
}

ERROR RESPONSE (400):
{
"error": "Password reset failed",
"message": "Invalid or expired reset token"
}

ERROR RESPONSE (400):
{
"error": "Password reset failed",
"message": "Token and new password are required"
}

=============================================================================

## FRONTEND IMPLEMENTATION - FORGOT PASSWORD PAGE

=============================================================================

PAGE: /forgot-password

PURPOSE: Collect user's email and request password reset

STEPS:

1. Show form with email input
2. On submit, call POST /api/v1/auth/forgot-password
3. Show success message regardless of result (security)
4. Tell user to check email for reset link

---

## EXAMPLE CODE - VANILLA JAVASCRIPT

<!-- HTML -->
<form id="forgot-password-form">
  <h2>Reset Your Password</h2>
  <p>Enter your email address and we'll send you a link to reset your password.</p>
  
  <input 
    type="email" 
    id="email" 
    placeholder="Email address" 
    required 
  />
  
  <button type="submit">Send Reset Link</button>
  
  <div id="message"></div>
</form>

// JavaScript
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
e.preventDefault();

const email = document.getElementById('email').value;
const messageDiv = document.getElementById('message');
const submitButton = e.target.querySelector('button[type="submit"]');

// Disable button and show loading
submitButton.disabled = true;
submitButton.textContent = 'Sending...';

try {
const response = await fetch('https://your-api.railway.app/api/v1/auth/forgot-password', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ email })
});

    const data = await response.json();

    if (response.ok) {
      // Success
      messageDiv.className = 'success';
      messageDiv.textContent = 'Check your email for a password reset link. It will expire in 1 hour.';
      e.target.reset();
    } else {
      messageDiv.className = 'error';
      messageDiv.textContent = data.message || 'An error occurred. Please try again.';
    }

} catch (error) {
messageDiv.className = 'error';
messageDiv.textContent = 'Network error. Please check your connection.';
} finally {
submitButton.disabled = false;
submitButton.textContent = 'Send Reset Link';
}
});

---

## EXAMPLE CODE - REACT / NEXT.JS

'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState(''); // 'success' | 'error'

async function handleSubmit(e) {
e.preventDefault();
setLoading(true);
setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Check your email for a password reset link. It will expire in 1 hour.');
        setEmail('');
      } else {
        setMessageType('error');
        setMessage(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }

}

return (
<div className="forgot-password-container">
<h2>Reset Your Password</h2>
<p>Enter your email address and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <a href="/login">Back to Login</a>
    </div>

);
}

=============================================================================

## FRONTEND IMPLEMENTATION - RESET PASSWORD PAGE

=============================================================================

PAGE: /reset-password?token=xyz789...

PURPOSE: Allow user to set a new password using the token from email

STEPS:

1. Extract token from URL
2. Show form to enter new password (and confirm password)
3. Validate password strength
4. On submit, call POST /api/v1/auth/reset-password
5. Show success and redirect to login

---

## EXAMPLE CODE - VANILLA JAVASCRIPT

<!-- HTML -->
<form id="reset-password-form">
  <h2>Set New Password</h2>
  
  <input 
    type="password" 
    id="newPassword" 
    placeholder="New password" 
    minlength="8"
    required 
  />
  
  <input 
    type="password" 
    id="confirmPassword" 
    placeholder="Confirm password" 
    minlength="8"
    required 
  />
  
  <div id="password-requirements">
    Password must be at least 8 characters long
  </div>
  
  <button type="submit">Reset Password</button>
  
  <div id="message"></div>
</form>

// JavaScript
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
document.getElementById('message').className = 'error';
document.getElementById('message').textContent = 'Invalid reset link';
document.getElementById('reset-password-form').style.display = 'none';
}

document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
e.preventDefault();

const newPassword = document.getElementById('newPassword').value;
const confirmPassword = document.getElementById('confirmPassword').value;
const messageDiv = document.getElementById('message');
const submitButton = e.target.querySelector('button[type="submit"]');

// Validate passwords match
if (newPassword !== confirmPassword) {
messageDiv.className = 'error';
messageDiv.textContent = 'Passwords do not match';
return;
}

// Validate password strength
if (newPassword.length < 8) {
messageDiv.className = 'error';
messageDiv.textContent = 'Password must be at least 8 characters long';
return;
}

// Disable button and show loading
submitButton.disabled = true;
submitButton.textContent = 'Resetting...';
messageDiv.textContent = '';

try {
const response = await fetch('https://your-api.railway.app/api/v1/auth/reset-password', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
token: token,
newPassword: newPassword
})
});

    const data = await response.json();

    if (response.ok) {
      // Success
      messageDiv.className = 'success';
      messageDiv.textContent = 'Password reset successfully! Redirecting to login...';

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } else {
      messageDiv.className = 'error';
      messageDiv.textContent = data.message || 'Failed to reset password. The link may be expired.';

      // Show "Request new link" button if token expired
      if (data.message.includes('expired') || data.message.includes('Invalid')) {
        showRequestNewLinkButton();
      }
    }

} catch (error) {
messageDiv.className = 'error';
messageDiv.textContent = 'Network error. Please check your connection.';
} finally {
submitButton.disabled = false;
submitButton.textContent = 'Reset Password';
}
});

function showRequestNewLinkButton() {
const button = document.createElement('a');
button.href = '/forgot-password';
button.textContent = 'Request New Reset Link';
button.className = 'btn-secondary';
document.getElementById('message').appendChild(button);
}

---

## EXAMPLE CODE - REACT / NEXT.JS

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
const searchParams = useSearchParams();
const router = useRouter();
const [token, setToken] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState(''); // 'success' | 'error'

useEffect(() => {
const tokenParam = searchParams.get('token');

    if (!tokenParam) {
      setMessageType('error');
      setMessage('Invalid reset link');
    } else {
      setToken(tokenParam);
    }

}, [searchParams]);

async function handleSubmit(e) {
e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setMessageType('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Password reset successfully! Redirecting to login...');

        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to reset password. The link may be expired.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }

}

if (!token) {
return (
<div className="reset-password-container">
<div className="error-message">Invalid reset link</div>
<a href="/forgot-password">Request New Reset Link</a>
</div>
);
}

return (
<div className="reset-password-container">
<h2>Set New Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          minLength={8}
          required
          disabled={loading}
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          minLength={8}
          required
          disabled={loading}
        />

        <div className="password-requirements">
          Password must be at least 8 characters long
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
          {messageType === 'error' && message.includes('expired') && (
            <div>
              <a href="/forgot-password">Request New Reset Link</a>
            </div>
          )}
        </div>
      )}
    </div>

);
}

=============================================================================

## PASSWORD VALIDATION RECOMMENDATIONS

=============================================================================

MINIMUM REQUIREMENTS:

- At least 8 characters long
- (Optional) At least one uppercase letter
- (Optional) At least one lowercase letter
- (Optional) At least one number
- (Optional) At least one special character

EXAMPLE VALIDATION FUNCTION:
function validatePassword(password) {
const errors = [];

if (password.length < 8) {
errors.push('Password must be at least 8 characters long');
}

if (!/[A-Z]/.test(password)) {
errors.push('Password must contain at least one uppercase letter');
}

if (!/[a-z]/.test(password)) {
errors.push('Password must contain at least one lowercase letter');
}

if (!/[0-9]/.test(password)) {
errors.push('Password must contain at least one number');
}

if (!/[!@#$%^&*]/.test(password)) {
errors.push('Password must contain at least one special character (!@#$%^&\*)');
}

return errors;
}

// Usage
const errors = validatePassword(newPassword);
if (errors.length > 0) {
showErrors(errors);
return;
}

=============================================================================

## SECURITY BEST PRACTICES

=============================================================================

1. TOKEN HANDLING

   - Never store tokens in localStorage or cookies
   - Only use token from URL immediately for password reset
   - Clear URL after successful reset

2. PASSWORD VALIDATION

   - Validate on both frontend and backend
   - Show password strength indicator
   - Require confirmation password

3. ERROR MESSAGES

   - Don't reveal if email exists (forgot password endpoint)
   - Generic error for expired tokens
   - Clear instructions for user

4. USER FEEDBACK

   - Always show "check your email" message
   - Inform about token expiration (1 hour)
   - Provide link to request new reset

5. RATE LIMITING
   - Backend should rate limit reset requests
   - Show appropriate message if too many attempts

=============================================================================

## TOKEN EXPIRATION

=============================================================================

PASSWORD RESET TOKEN:

- Valid for: 1 hour
- One-time use: Token is invalidated after successful reset
- Backend handles: Token validation and expiration

WHAT TO TELL USERS:

- "The reset link will expire in 1 hour"
- "For security reasons, reset links can only be used once"
- "If the link has expired, please request a new one"

=============================================================================

## UI/UX RECOMMENDATIONS

=============================================================================

FORGOT PASSWORD PAGE:

- Simple, single email input
- Clear description of what will happen
- Link back to login page
- Show success message after submission

RESET PASSWORD PAGE:

- Show both password inputs clearly
- Real-time password strength indicator
- Show password requirements before user types
- Confirm password must match
- Show/hide password toggle (optional)

LOADING STATES:

- Disable button during API call
- Change button text: "Sending..." or "Resetting..."
- Show spinner if applicable

SUCCESS STATES:

- Green checkmark ✅
- Clear success message
- Auto-redirect countdown: "Redirecting in 3... 2... 1..."

ERROR STATES:

- Red warning icon ⚠️
- Clear error message
- Actionable next step (request new link, try again)

=============================================================================

## MOBILE APP CONSIDERATIONS

=============================================================================

DEEP LINKING:
If you have a mobile app, configure deep links:

EMAIL LINK: https://roomfinder237.com/reset-password?token=xyz...
DEEP LINK: roomfinder://reset-password?token=xyz...

Handle both web and app scenarios:

- If app installed: Open in app
- If app not installed: Open in browser

=============================================================================

## TESTING CHECKLIST

=============================================================================

FORGOT PASSWORD PAGE:
☐ Submit with valid email → Success message
☐ Submit with invalid email → Success message (don't reveal)
☐ Submit without internet → Network error
☐ Multiple rapid submissions → Rate limit handling

RESET PASSWORD PAGE:
☐ Open with valid token → Form displays
☐ Open without token → Error displayed
☐ Submit with matching passwords → Success + redirect
☐ Submit with non-matching passwords → Error
☐ Submit with weak password → Validation error
☐ Submit with expired token → Expired token error
☐ Submit with already-used token → Invalid token error
☐ Test password visibility toggle
☐ Test back button after successful reset

EMAIL VERIFICATION:
☐ Check email arrives (inbox and spam)
☐ Click link in email → Opens correct page
☐ Link works on mobile devices
☐ Link works in different browsers

=============================================================================

## COMPLETE FLOW DIAGRAM

=============================================================================

1. User clicks "Forgot Password" on login page
   ↓
2. User enters email on /forgot-password page
   ↓
3. Frontend calls POST /api/v1/auth/forgot-password
   ↓
4. User sees "Check your email" message
   ↓
5. User receives email with reset link
   ↓
6. User clicks link → Opens /reset-password?token=xyz
   ↓
7. Frontend extracts token from URL
   ↓
8. User enters new password (twice)
   ↓
9. Frontend validates passwords match and strength
   ↓
10. Frontend calls POST /api/v1/auth/reset-password
    ↓
11. Success → Redirect to /login
    ↓
12. User logs in with new password

=============================================================================

## SUMMARY CHECKLIST

=============================================================================

PAGES TO IMPLEMENT:
☐ /forgot-password - Request reset email
☐ /reset-password - Set new password

API ENDPOINTS TO CALL:
☐ POST /api/v1/auth/forgot-password
☐ POST /api/v1/auth/reset-password

FEATURES TO IMPLEMENT:
☐ Email input validation
☐ Password strength validation
☐ Password confirmation matching
☐ Loading states
☐ Success messages
☐ Error handling
☐ Token extraction from URL
☐ Auto-redirect after success
☐ "Request new link" for expired tokens
☐ Back to login links

BACKEND AUTOMATICALLY HANDLES:
✅ Sending reset email (non-blocking)
✅ Token generation and expiration (1 hour)
✅ Token validation
✅ Password hashing
✅ Token invalidation after use

=============================================================================
END OF GUIDE
=============================================================================
