# Resend Email Integration

## Overview

The backend now uses **Resend** as the primary email delivery service. This works on Railway and other cloud platforms that block SMTP ports (465/587).

## How It Works

1. **Primary**: Resend API (HTTPS - port 443) ✅ Works on Railway
2. **Fallback**: SMTP (if Resend not configured)

## Environment Variables

### Production (Railway)

Add this to your Railway environment variables:

```bash
RESEND_API_KEY=re_UBocByYH_KVh9LrhHURC5iopvPGtSAhRT
```

### Local Development

Add to your `.env` file:

```bash
RESEND_API_KEY=re_UBocByYH_KVh9LrhHURC5iopvPGtSAhRT
FRONTEND_URL=https://roomfinder237.com
```

## Email Types Sent

All these now work through Resend:

1. **Verification Email** - User registration
2. **Password Reset Email** - Forgot password
3. **Welcome Email** - After email verification
4. **Booking Confirmation** - To guests
5. **Booking Notification** - To hosts
6. **Enquiry Notifications** - Property enquiries
7. **Host Application Emails** - Application status
8. **Wallet Notifications** - Transaction alerts
9. **System Notifications** - Admin broadcasts

## Domain Verification (Required for Production)

To send from `no-reply@roomfinder237.com`:

1. Go to **Resend Dashboard** → **Domains**
2. Add domain: `roomfinder237.com`
3. Add the DNS records provided:
   - SPF
   - DKIM
   - DMARC
4. Wait for verification (usually 5-10 minutes)

### Until Domain is Verified

Resend will send from `onboarding@resend.dev` temporarily. Emails will still work, but show a different sender.

## Testing

```bash
# Test forgot password
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Test registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "firstName":"Test",
    "lastName":"User"
  }'
```

## Benefits

✅ **Works on Railway** - No SMTP port blocking  
✅ **Faster delivery** - HTTP-based API  
✅ **Better reliability** - 99.99% uptime SLA  
✅ **Email analytics** - Open rates, click tracking  
✅ **Free tier** - 3,000 emails/month  
✅ **Better deliverability** - Improved inbox placement

## Fallback to SMTP

If `RESEND_API_KEY` is not set, the system automatically falls back to SMTP using:

```bash
EMAIL_HOST=smtp.titan.email
EMAIL_PORT=465
EMAIL_USER=no-reply@roomfinder237.com
EMAIL_PASSWORD=#Noreply123@#
```

**Note**: SMTP fallback won't work on Railway due to port blocking.

## Monitoring

Check Resend dashboard for:

- Email delivery status
- Bounce rates
- Open rates
- Failed deliveries

## Support

- **Resend Docs**: https://resend.com/docs
- **API Status**: https://status.resend.com
- **Dashboard**: https://resend.com/emails
