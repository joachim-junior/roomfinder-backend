# Email Production Fix - SMTP Timeout Resolution

## 🚨 Problem
SMTP connection timeouts (`ETIMEDOUT`) in production environment.

## ✅ Solution Implemented

### 1. Enhanced Connection Configuration
- **Connection pooling**: Reuse connections instead of creating new ones
- **Extended timeouts**: 60s connection, 30s greeting, 60s socket
- **Rate limiting**: Max 5 messages per 20 seconds
- **Retry logic**: 3 attempts with exponential backoff

### 2. Fallback SMTP Configuration
- Primary: Titan Email (smtp.titan.email:465)
- Fallback: Gmail SMTP (smtp.gmail.com:587)

### 3. Environment Variables to Set

```bash
# Primary SMTP (Titan Email)
EMAIL_HOST=smtp.titan.email
EMAIL_PORT=465
EMAIL_USER=no-reply@roomfinder237.com
EMAIL_PASSWORD=#Noreply123@#

# Fallback SMTP (Gmail - optional)
EMAIL_FALLBACK_HOST=smtp.gmail.com
EMAIL_FALLBACK_USER=your-gmail@gmail.com
EMAIL_FALLBACK_PASS=your-app-password

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### 4. Production Deployment Steps

1. **Set environment variables** in your hosting platform
2. **Test email configuration**:
   ```bash
   node test-email.js
   ```
3. **Monitor logs** for connection issues
4. **Set up DNS records** for better deliverability

### 5. DNS Records for Better Deliverability

Add these DNS records to your domain:

**SPF Record (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.titan.email ~all
```

**DKIM Record (TXT)**
Contact Hostinger support for your DKIM public key.

**DMARC Record (TXT)**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@roomfinder237.com
```

### 6. Alternative SMTP Providers

If Titan Email continues to have issues, consider:

1. **SendGrid** (Recommended)
   - More reliable
   - Better deliverability
   - Free tier: 100 emails/day

2. **Mailgun**
   - Good for transactional emails
   - Free tier: 5,000 emails/month

3. **Amazon SES**
   - Very reliable
   - Pay per use
   - Good for high volume

### 7. Testing Commands

```bash
# Test email configuration
node test-email.js

# Test with specific email
node -e "
const emailService = require('./src/utils/emailService');
emailService.sendVerificationEmail('your-email@example.com', 'Test', 'token123')
  .then(() => console.log('Success'))
  .catch(err => console.error('Error:', err.message));
"
```

### 8. Monitoring

Watch for these log messages:
- ✅ `SMTP server is ready to take our messages`
- ✅ `Email sent successfully`
- ❌ `SMTP connection verification failed`
- ❌ `Email send attempt X failed`

### 9. Quick Fixes

If still having issues:

1. **Check firewall**: Ensure ports 465/587 are open
2. **Verify credentials**: Double-check email/password
3. **Try different port**: Use 587 instead of 465
4. **Contact hosting provider**: May be blocking SMTP
5. **Use external service**: Switch to SendGrid/Mailgun

## 📞 Support

If issues persist:
1. Check hosting provider's SMTP restrictions
2. Verify domain DNS settings
3. Consider switching to a dedicated email service
4. Contact Titan Email support for account issues
