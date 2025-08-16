# Notification System Documentation

## Overview

The Notification System provides comprehensive email and push notification capabilities for the Room Finder platform, keeping users informed about bookings, reviews, and important updates.

## Features

- **Email Notifications**: Booking confirmations, status updates, review notifications
- **Push Notifications**: Real-time notifications (placeholder for future implementation)
- **User Preferences**: Customizable notification settings
- **Notification Management**: Read/unread status, deletion, statistics
- **Templates**: Professional HTML email templates
- **Multi-channel**: Support for email, push, and SMS notifications

## Base URL

```
http://localhost:5000/api/v1/notifications
```

## Authentication

All notification endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get User Notifications

**GET** `/`

Retrieve user's notifications with pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type (`EMAIL`, `PUSH`, `SMS`)

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif1",
        "title": "Booking Confirmed",
        "body": "Your booking for Beautiful Apartment has been confirmed",
        "type": "EMAIL",
        "status": "UNREAD",
        "data": "{\"bookingId\":\"book1\",\"propertyId\":\"prop1\"}",
        "createdAt": "2025-08-08T18:55:57.591Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Get Notification Statistics

**GET** `/stats`

Get notification statistics for the user.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "unread": 2,
    "read": 3,
    "breakdown": [
      {
        "status": "UNREAD",
        "_count": {
          "status": 2
        }
      },
      {
        "status": "READ",
        "_count": {
          "status": 3
        }
      }
    ]
  }
}
```

### 3. Get Notification Preferences

**GET** `/preferences`

Get user's notification preferences.

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user1",
    "emailNotifications": true,
    "pushNotifications": true,
    "bookingNotifications": true,
    "reviewNotifications": true
  }
}
```

### 4. Update Notification Preferences

**PUT** `/preferences`

Update user's notification preferences.

**Request Body:**

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "bookingNotifications": true,
  "reviewNotifications": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "id": "pref1",
    "userId": "user1",
    "emailNotifications": true,
    "pushNotifications": false,
    "bookingNotifications": true,
    "reviewNotifications": false,
    "createdAt": "2025-08-08T18:55:57.591Z",
    "updatedAt": "2025-08-08T18:55:57.591Z"
  }
}
```

### 5. Mark Notification as Read

**PUT** `/:notificationId/read`

Mark a specific notification as read.

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notif1",
    "title": "Booking Confirmed",
    "body": "Your booking for Beautiful Apartment has been confirmed",
    "type": "EMAIL",
    "status": "READ",
    "readAt": "2025-08-08T18:55:57.591Z",
    "createdAt": "2025-08-08T18:55:57.591Z"
  }
}
```

### 6. Mark All Notifications as Read

**PUT** `/read-all`

Mark all user's notifications as read.

**Response:**

```json
{
  "success": true,
  "message": "3 notifications marked as read",
  "data": {
    "updatedCount": 3
  }
}
```

### 7. Delete Notification

**DELETE** `/:notificationId`

Delete a specific notification.

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## Email Notification Types

### 1. Booking Confirmation

Sent to guests when their booking is confirmed.

**Template Features:**

- Property details
- Booking dates and times
- Guest information
- Total price
- Booking status

### 2. Booking Notification to Host

Sent to property hosts when they receive a new booking request.

**Template Features:**

- Guest information
- Property details
- Booking dates
- Special requests
- Contact information

### 3. Booking Status Update

Sent to guests when their booking status changes.

**Template Features:**

- New status
- Property details
- Booking dates
- Next steps

### 4. Review Notification

Sent to hosts when they receive a new review.

**Template Features:**

- Guest information
- Property details
- Rating and comment
- Review date

### 5. Welcome Email

Sent to new users upon registration.

**Template Features:**

- Welcome message
- Getting started guide
- Platform features
- Support information

### 6. Password Reset Email

Sent when users request password reset.

**Template Features:**

- Reset link
- Security information
- Expiration notice

## Push Notifications

The system includes a placeholder for push notifications that can be integrated with:

- **Firebase Cloud Messaging (FCM)**
- **Apple Push Notification Service (APNs)**
- **Web Push Notifications**

## Database Schema

### Notification Model

```prisma
model Notification {
  id        String   @id @default(cuid())
  title     String
  body      String
  type      NotificationType @default(EMAIL)
  status    NotificationStatus @default(UNREAD)
  data      String? // JSON data for additional info
  readAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

### User Notification Preferences Model

```prisma
model UserNotificationPreferences {
  id                   String @id @default(cuid())
  emailNotifications    Boolean @default(true)
  pushNotifications     Boolean @default(true)
  bookingNotifications  Boolean @default(true)
  reviewNotifications   Boolean @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Relations
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_notification_preferences")
}
```

### Enums

```prisma
enum NotificationType {
  EMAIL
  PUSH
  SMS
}

enum NotificationStatus {
  UNREAD
  READ
  SENT
}
```

## Integration with Other Systems

### Booking System Integration

The notification system automatically sends notifications for:

- **New Booking**: Notifies host of new booking request
- **Booking Confirmation**: Notifies guest when booking is confirmed
- **Booking Status Changes**: Notifies guest of status updates
- **Booking Cancellation**: Notifies both parties of cancellation

### Review System Integration

- **New Review**: Notifies host when property receives a review
- **Review Update**: Notifies host when review is updated

### User System Integration

- **Welcome Email**: Sent to new users
- **Email Verification**: Sent during registration
- **Password Reset**: Sent when requested

## Usage Examples

### Get User Notifications

```bash
curl -X GET "http://localhost:5000/api/v1/notifications" \
  -H "Authorization: Bearer <token>"
```

### Update Notification Preferences

```bash
curl -X PUT "http://localhost:5000/api/v1/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": true,
    "pushNotifications": false,
    "bookingNotifications": true,
    "reviewNotifications": false
  }'
```

### Mark Notification as Read

```bash
curl -X PUT "http://localhost:5000/api/v1/notifications/notif1/read" \
  -H "Authorization: Bearer <token>"
```

### Mark All as Read

```bash
curl -X PUT "http://localhost:5000/api/v1/notifications/read-all" \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@roomfinder.com
FRONTEND_URL=http://localhost:3000

# Notification Configuration
NOTIFICATION_ENABLED=true
PUSH_NOTIFICATIONS_ENABLED=false
```

## Email Service Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication**
2. **Generate App Password**:

   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Update Environment Variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Other Email Providers

The system can be configured for other providers:

- **SendGrid**
- **Mailgun**
- **Amazon SES**
- **SMTP servers**

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own notifications
- **Data Validation**: All input data is validated
- **Rate Limiting**: Prevents notification spam
- **Secure Email**: Uses secure SMTP connections

## Error Handling

### Common Error Responses

**Authentication Error:**

```json
{
  "error": "Access denied",
  "message": "Invalid token"
}
```

**Notification Not Found:**

```json
{
  "error": "Notification not found",
  "message": "Notification not found or you do not have permission to access it"
}
```

**Database Error:**

```json
{
  "error": "Database error",
  "message": "An error occurred while processing your request"
}
```

## Performance Considerations

### Optimization Strategies

1. **Pagination**: All notification lists are paginated
2. **Indexing**: Database indexes on frequently queried fields
3. **Caching**: Consider implementing Redis for notification caching
4. **Batch Operations**: Support for bulk operations

### Monitoring

- **Email Delivery Rates**: Monitor email delivery success
- **Notification Volume**: Track notification frequency
- **User Engagement**: Monitor notification open rates
- **System Performance**: Monitor API response times

## Future Enhancements

### Planned Features

- **Real-time Push Notifications**: Firebase/APNs integration
- **SMS Notifications**: Twilio integration
- **Notification Templates**: Customizable email templates
- **Notification Scheduling**: Delayed notifications
- **Notification Analytics**: Detailed engagement metrics
- **Multi-language Support**: Internationalization
- **Notification Channels**: Webhook integrations

### Advanced Features

- **Smart Notifications**: AI-powered notification timing
- **Notification Preferences UI**: Frontend preference management
- **Notification History**: Extended notification history
- **Notification Export**: Data export capabilities
- **Notification Testing**: Test notification system

## Troubleshooting

### Common Issues

1. **Emails Not Sending**:

   - Check email credentials
   - Verify SMTP settings
   - Check email provider limits

2. **Notifications Not Appearing**:

   - Check user preferences
   - Verify notification creation
   - Check database connectivity

3. **Push Notifications Not Working**:
   - Verify FCM/APNs configuration
   - Check device token registration
   - Test with development certificates

### Debug Commands

```bash
# Test email sending
curl -X POST "http://localhost:5000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check notification preferences
curl -X GET "http://localhost:5000/api/v1/notifications/preferences" \
  -H "Authorization: Bearer <token>"

# Get notification statistics
curl -X GET "http://localhost:5000/api/v1/notifications/stats" \
  -H "Authorization: Bearer <token>"
```

## Deployment Checklist

### Production Setup

1. **Email Service**:

   - Configure production email provider
   - Set up email templates
   - Test email delivery

2. **Database**:

   - Run migrations
   - Set up database indexes
   - Configure backup strategy

3. **Monitoring**:

   - Set up error monitoring
   - Configure performance monitoring
   - Set up notification alerts

4. **Security**:
   - Review security settings
   - Set up rate limiting
   - Configure CORS properly

### Railway Deployment

1. **Environment Variables**:

   - Set all required environment variables
   - Configure email credentials
   - Set up notification preferences

2. **Database Migration**:

   - Run `npm run db:push` on production
   - Verify all tables are created
   - Test notification functionality

3. **Testing**:
   - Test email notifications
   - Verify notification preferences
   - Check notification statistics
