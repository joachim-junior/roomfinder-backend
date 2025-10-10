# Guest Notifications Guide

## 📱 Available Notification Types for Guests

Guests receive notifications for various events throughout their booking journey. Here's a complete list:

---

## 🎯 Booking & Payment Notifications

### 1. **Payment Success** ✅
**Type:** `PAYMENT_SUCCESS`  
**Trigger:** When payment is successfully processed via Fapshi  
**Title:** "Payment Successful"  
**Body:** "Your payment of [amount] XAF for [property] has been confirmed."  
**Metadata:** 
- `bookingId`
- `amount`
- `status`

**When you'll see it:**
- After completing mobile money payment
- When Fapshi webhook confirms payment

---

### 2. **Payment Failed** ❌
**Type:** `PAYMENT_FAILED`  
**Trigger:** When payment fails or is declined  
**Title:** "Payment Failed"  
**Body:** "Your payment of [amount] XAF for [property] has failed."  
**Metadata:**
- `bookingId`
- `amount`
- `status`

**When you'll see it:**
- Insufficient balance
- Payment timeout
- Network error
- Cancelled payment

---

### 3. **Booking Confirmed** 🎉
**Type:** `BOOKING_CONFIRMED`  
**Trigger:** When host/admin confirms your booking  
**Title:** "Booking Confirmed"  
**Body:** "Your booking for [property] has been confirmed!"  
**Metadata:**
- `bookingId`
- `propertyId`
- `checkIn`
- `checkOut`

**When you'll see it:**
- After payment succeeds
- When host approves booking

---

### 4. **Booking Status Update** 📊
**Type:** `BOOKING_STATUS_UPDATE`  
**Trigger:** When booking status changes  
**Title:** "Booking Status Updated"  
**Body:** "Your booking for [property] status has changed to [status]"  
**Metadata:**
- `bookingId`
- `oldStatus`
- `newStatus`

**Possible statuses:**
- `PENDING` → Waiting for confirmation
- `CONFIRMED` → Approved
- `COMPLETED` → You've checked out
- `CANCELLED` → Cancelled by you/host
- `REJECTED` → Host declined

---

### 5. **Booking Cancellation** 🚫
**Type:** `BOOKING_CANCELLED`  
**Trigger:** When you or host cancels booking  
**Title:** "Booking Cancelled"  
**Body:** "Your booking for [property] has been cancelled. [Refund info]"  
**Metadata:**
- `bookingId`
- `cancelledBy` (guest/host/admin)
- `refundAmount`
- `cancellationReason`

**When you'll see it:**
- You cancel before check-in
- Host cancels your booking
- Automatic cancellation (no payment)

---

## ⭐ Review Notifications

### 6. **Review Reminder** 📝
**Type:** `REVIEW_REMINDER`  
**Trigger:** After checkout, prompting you to leave a review  
**Title:** "How was your stay?"  
**Body:** "Please rate your experience at [property]"  
**Metadata:**
- `bookingId`
- `propertyId`
- `checkOutDate`

**When you'll see it:**
- 1 day after checkout
- If you haven't left a review yet

---

### 7. **Host Response to Review** 💬
**Type:** `HOST_REVIEW_RESPONSE`  
**Trigger:** When host replies to your review  
**Title:** "Host Responded to Your Review"  
**Body:** "[Host] responded to your review of [property]"  
**Metadata:**
- `reviewId`
- `propertyId`
- `hostResponse`

**When you'll see it:**
- Host adds a reply to your review

---

## 📧 Account & System Notifications

### 8. **Welcome Email** 👋
**Type:** `WELCOME`  
**Trigger:** When you register an account  
**Title:** "Welcome to Room Finder!"  
**Body:** "Thanks for joining! Start exploring properties."  
**Metadata:**
- `userId`
- `firstName`

**When you'll see it:**
- Immediately after registration

---

### 9. **Email Verification** ✉️
**Type:** `EMAIL_VERIFICATION`  
**Trigger:** When you register or request verification  
**Title:** "Verify Your Email"  
**Body:** "Please verify your email to complete registration"  
**Metadata:**
- `verificationToken`
- `expiresAt`

**When you'll see it:**
- After registration
- When requesting new verification link

---

### 10. **Password Reset** 🔐
**Type:** `PASSWORD_RESET`  
**Trigger:** When you request password reset  
**Title:** "Reset Your Password"  
**Body:** "Click the link to reset your password"  
**Metadata:**
- `resetToken`
- `expiresAt`

**When you'll see it:**
- When you click "Forgot Password"

---

## 💰 Payment & Refund Notifications

### 11. **Refund Processed** 💵
**Type:** `REFUND_PROCESSED`  
**Trigger:** When refund is issued to your account  
**Title:** "Refund Processed"  
**Body:** "You've been refunded [amount] XAF for booking [bookingId]"  
**Metadata:**
- `bookingId`
- `refundAmount`
- `transactionId`
- `refundReason`

**When you'll see it:**
- Cancellation refund issued
- Booking dispute resolved
- Overpayment correction

---

### 12. **Service Fee Notice** 📋
**Type:** `FEE_NOTICE`  
**Trigger:** When service fees are applied  
**Title:** "Service Fee Applied"  
**Body:** "A service fee of [amount] XAF was applied to your booking"  
**Metadata:**
- `bookingId`
- `feeAmount`
- `feeType`
- `feePercent`

**When you'll see it:**
- During payment process
- When viewing booking details

---

## 📞 Support Notifications

### 13. **Support Ticket Update** 🎫
**Type:** `SUPPORT_UPDATE`  
**Trigger:** When support responds to your ticket  
**Title:** "Support Ticket Update"  
**Body:** "Your support ticket #[ticketId] has been updated"  
**Metadata:**
- `ticketId`
- `status`
- `lastMessage`

**When you'll see it:**
- Support agent responds
- Ticket status changes
- Ticket resolved

---

## 🎁 Promotional Notifications

### 14. **Special Offers** 🏷️
**Type:** `PROMOTION`  
**Trigger:** New deals or discounts available  
**Title:** "Special Offer on [Property]"  
**Body:** "Get [X]% off on your next booking!"  
**Metadata:**
- `promoCode`
- `discount`
- `expiresAt`

**When you'll see it:**
- Seasonal promotions
- First-time booking offers
- Loyalty rewards

---

### 15. **Favorite Property Update** ⭐
**Type:** `FAVORITE_UPDATE`  
**Trigger:** Changes to properties in your favorites  
**Title:** "Price Drop on Favorite Property"  
**Body:** "[Property] now available at a lower price!"  
**Metadata:**
- `propertyId`
- `oldPrice`
- `newPrice`

**When you'll see it:**
- Price changes
- New availability
- Special host offers

---

## 📊 Notification Settings

### How to Manage Notifications

**Email Notifications:**
- Go to Settings → Notifications
- Toggle email preferences
- Choose notification types

**Push Notifications:**
- Enable in mobile app settings
- Register device token
- Customize notification types

**In-App Notifications:**
- Always enabled
- View in notifications tab
- Mark as read/unread

---

## 🔔 Notification Priority

### High Priority (Immediate)
- Payment Success/Failure
- Booking Confirmation
- Booking Cancellation

### Medium Priority (Within 1 hour)
- Booking Status Updates
- Review Reminders
- Support Updates

### Low Priority (Daily digest)
- Promotional offers
- Favorite property updates
- Tips and guides

---

## 📱 How to Check Notifications

### Mobile App
```
1. Open Room Finder app
2. Tap bell icon (top right)
3. View all notifications
4. Tap to read details
5. Swipe to dismiss
```

### API Endpoint
```bash
GET /api/v1/notifications
Authorization: Bearer <your-token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- type: Filter by type (optional)
```

### Web Dashboard
```
1. Login to Room Finder
2. Click notifications icon
3. View notification list
4. Click to mark as read
```

---

## 🚀 Test Notifications

### Get Test Notifications

To see notifications in action, you need to:

1. **Make a Booking** → Creates payment and booking notifications
2. **Complete Payment** → Triggers payment success notification
3. **Cancel Booking** → Generates cancellation notification
4. **Leave a Review** → May trigger host response notification
5. **Contact Support** → Generates support ticket notifications

### Sample Test Flow

```bash
# 1. Create a booking
POST /api/v1/bookings
{
  "propertyId": "xxx",
  "checkIn": "2025-11-01",
  "checkOut": "2025-11-03",
  "guests": 2
}

# 2. Initialize payment
POST /api/v1/payments/booking/{bookingId}/initialize
{
  "paymentMethod": "MOBILE_MONEY"
}

# 3. Complete payment (via mobile money app)
# Webhook will trigger notification automatically

# 4. Check notifications
GET /api/v1/notifications
```

---

## 💡 Tips

- **Enable push notifications** for real-time updates
- **Check notifications daily** for important updates
- **Mark as read** to keep inbox clean
- **Turn off promotional emails** if you prefer
- **Set notification preferences** in settings

---

## ❓ FAQ

**Q: Why am I not receiving notifications?**
A: Check if:
- You're logged in
- Email is verified
- Notification preferences are enabled
- There's been activity (bookings, payments, etc.)

**Q: Can I disable certain notification types?**
A: Yes, go to Settings → Notifications and toggle specific types.

**Q: How long are notifications stored?**
A: Notifications are kept for 90 days, then automatically deleted.

**Q: Can I get SMS notifications?**
A: SMS notifications are currently not supported, but coming soon!

---

## 🆘 Support

If you're not receiving expected notifications:

1. Check notification settings
2. Verify email/phone number
3. Check spam/junk folder
4. Contact support with ticket ID

**Support Email:** support@roomfinder.com  
**Support API:** `/api/v1/customer-support`

