# Frontend Email Verification Guide - Room Finder

## Overview

This document explains how the frontend should handle email verification after a user signs up.

=============================================================================

## EMAIL VERIFICATION FLOW

=============================================================================

### Step 1: User Signs Up

Backend creates account and sends verification email with link:
https://roomfinder237.com/verify-email?token=abc123xyz...

### Step 2: User Clicks Link

Opens frontend page: /verify-email?token=abc123xyz...

### Step 3: Frontend Extracts Token

Parse the token from URL query parameter

### Step 4: Frontend Calls Verification API

POST /api/v1/auth/verify-email with the token

### Step 5: Handle Response

Show success/error message and redirect accordingly

=============================================================================

## API ENDPOINT DETAILS

=============================================================================

ENDPOINT: POST /api/v1/auth/verify-email
BASE URL: https://your-api.railway.app/api/v1
AUTHENTICATION: Not required (public endpoint)

REQUEST BODY:
{
"token": "the_verification_token_from_url"
}

SUCCESS RESPONSE (200):
{
"message": "Email verified successfully",
"user": {
"id": "cme7...",
"email": "user@example.com",
"firstName": "John",
"lastName": "Doe",
"role": "GUEST",
"isVerified": true,
"phone": null,
"avatar": null,
"createdAt": "2025-09-30T..."
}
}

ERROR RESPONSE (400):
{
"error": "Verification failed",
"message": "Invalid or expired verification token"
}

ERROR RESPONSE (500):
{
"error": "Database error",
"message": "An error occurred while processing your request"
}

=============================================================================

## FRONTEND IMPLEMENTATION (Pseudo-code)

=============================================================================

PAGE: /verify-email

1. EXTRACT TOKEN FROM URL

   - Get 'token' from query parameters
   - If no token, show error and redirect to home

2. CALL VERIFICATION API

   - POST to /api/v1/auth/verify-email
   - Send token in request body
   - Show loading state while waiting

3. HANDLE SUCCESS

   - Show success message: "Email verified successfully! ✅"
   - Optional: Save user data to state/context
   - Optional: Auto-login the user
   - Redirect to login page or dashboard after 2-3 seconds

4. HANDLE ERROR
   - Show error message: "Verification failed. Link may be invalid or expired."
   - Provide "Resend Verification Email" button
   - Link to login page

=============================================================================

## EXAMPLE CODE - VANILLA JAVASCRIPT

=============================================================================

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
showError('No verification token found');
setTimeout(() => window.location.href = '/', 2000);
} else {
verifyEmail(token);
}

async function verifyEmail(token) {
try {
showLoading('Verifying your email...');

    const response = await fetch('https://your-api.railway.app/api/v1/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (response.ok) {
      // SUCCESS
      hideLoading();
      showSuccess('Email verified successfully! ✅');
      console.log('User data:', data.user);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } else {
      // ERROR
      hideLoading();
      showError(data.message || 'Verification failed');
      showResendButton();
    }

} catch (error) {
hideLoading();
showError('Network error. Please check your connection and try again.');
console.error('Verification error:', error);
}
}

=============================================================================

## EXAMPLE CODE - REACT / NEXT.JS

=============================================================================

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
const searchParams = useSearchParams();
const router = useRouter();
const [status, setStatus] = useState('loading'); // loading | success | error
const [message, setMessage] = useState('Verifying your email...');

useEffect(() => {
const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found');
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    verifyEmail(token);

}, [searchParams]);

async function verifyEmail(token) {
try {
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ token })
});

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! ✅');

        // Optional: Store user data
        // localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to login
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      console.error('Verification error:', error);
    }

}

function handleResend() {
router.push('/resend-verification');
}

return (
<div className="verify-email-container">
{status === 'loading' && <LoadingSpinner message={message} />}

      {status === 'success' && (
        <SuccessMessage message={message} />
      )}

      {status === 'error' && (
        <>
          <ErrorMessage message={message} />
          <button onClick={handleResend}>Resend Verification Email</button>
        </>
      )}
    </div>

);
}

=============================================================================

## RESEND VERIFICATION EMAIL (Optional)

=============================================================================

If verification fails, allow users to resend the email:

ENDPOINT: POST /api/v1/auth/resend-verification

REQUEST BODY:
{
"email": "user@example.com"
}

SUCCESS RESPONSE (200):
{
"message": "Verification email sent successfully"
}

EXAMPLE CODE:
async function resendVerification(email) {
try {
const response = await fetch('https://your-api.railway.app/api/v1/auth/resend-verification', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email })
});

    const data = await response.json();

    if (response.ok) {
      showSuccess('Verification email sent! Check your inbox.');
    } else {
      showError(data.message || 'Failed to resend email');
    }

} catch (error) {
showError('Network error');
}
}

=============================================================================

## PASSWORD RESET FLOW (Similar Implementation)

=============================================================================

VERIFICATION EMAIL LINK:
https://roomfinder237.com/verify-email?token=abc123...

PASSWORD RESET LINK:
https://roomfinder237.com/reset-password?token=xyz789...

Both follow the same pattern:

1. Extract token from URL
2. Call backend API with token
3. Handle success/error
4. Redirect user

PASSWORD RESET ENDPOINT: POST /api/v1/auth/reset-password

REQUEST BODY:
{
"token": "xyz789...",
"newPassword": "NewSecurePass123!"
}

=============================================================================

## IMPORTANT NOTES

=============================================================================

1. TOKEN EXPIRATION

   - Verification tokens expire after 24 hours
   - Password reset tokens expire after 1 hour
   - Always handle expired token errors gracefully

2. SECURITY

   - Never expose tokens in logs or error messages
   - Use HTTPS in production
   - Validate password strength on frontend before sending

3. USER EXPERIENCE

   - Show loading states during API calls
   - Provide clear success/error messages
   - Auto-redirect after successful verification
   - Offer "Resend Email" option for expired tokens

4. ERROR HANDLING

   - Network errors: Allow retry
   - Invalid token: Offer resend option
   - Server errors: Show friendly message

5. TESTING
   - Test with valid token
   - Test with expired token
   - Test with invalid token
   - Test without token
   - Test network failures

=============================================================================

## UI/UX RECOMMENDATIONS

=============================================================================

LOADING STATE:

- Show spinner or skeleton
- Message: "Verifying your email..."
- Disable any interactive elements

SUCCESS STATE:

- Green checkmark icon ✅
- Message: "Email verified successfully!"
- Sub-message: "Redirecting you to login..."
- Auto-redirect after 2-3 seconds

ERROR STATE:

- Red X icon or warning icon ❌
- Clear error message
- "Resend Verification Email" button
- "Back to Login" link

MOBILE CONSIDERATIONS:

- Ensure links work in email clients (Gmail, Outlook, etc.)
- Test on different devices
- Handle app deep links if using mobile app

=============================================================================

## SUMMARY CHECKLIST

=============================================================================

Frontend must implement:
☐ /verify-email page
☐ Extract token from URL query params
☐ Call POST /api/v1/auth/verify-email with token
☐ Show loading state
☐ Handle success: show message + redirect
☐ Handle error: show error + resend option
☐ (Optional) /resend-verification page
☐ (Optional) /reset-password page (similar flow)

Backend automatically handles:
✅ Sending verification email on signup
✅ Validating token and expiration
✅ Marking user as verified
✅ Sending welcome email after verification
✅ Non-blocking email sending (fast API responses)

=============================================================================
END OF GUIDE
=============================================================================
