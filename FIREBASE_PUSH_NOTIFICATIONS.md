# Firebase Push Notifications Implementation

## Overview

Firebase Cloud Messaging (FCM) has been successfully integrated into the Room Finder backend to provide **cross-platform push notifications** for both **Android and iOS** devices.

## ✅ **Cross-Platform Support**

**Yes, Firebase works for both Android and iOS!**

- **Android**: Uses Firebase Cloud Messaging (FCM)
- **iOS**: Uses Apple Push Notification Service (APNs) through Firebase
- **Web**: Supports web push notifications
- **Flutter/React Native**: Works with mobile apps

## 🚀 **Features Implemented**

### Core Functionality

- ✅ **Device Token Management**: Register/unregister device tokens
- ✅ **Cross-Platform Support**: Android, iOS, Web
- ✅ **User-Specific Notifications**: Send to specific users
- ✅ **Topic Subscriptions**: Subscribe/unsubscribe to topics
- ✅ **Batch Notifications**: Send to multiple users
- ✅ **Notification History**: Store notifications in database
- ✅ **Token Cleanup**: Automatic cleanup of invalid tokens
- ✅ **Error Handling**: Robust error handling and recovery

### Notification Types

- **Booking Notifications**: Confirmations, updates, cancellations
- **Review Notifications**: New reviews, rating updates
- **System Notifications**: Welcome messages, updates
- **Custom Notifications**: Any custom notification type

## 📱 **Platform-Specific Features**

### Android

```javascript
android: {
  notification: {
    sound: 'default',
    channel_id: 'room_finder_channel',
    priority: 'high',
    default_sound: true,
    default_vibrate_timings: true,
    default_light_settings: true
  }
}
```

### iOS (Apple Push Notifications)

```javascript
apns: {
  payload: {
    aps: {
      sound: 'default',
      badge: 1,
      alert: {
        title: 'Notification Title',
        body: 'Notification Body'
      }
    }
  }
}
```

## 🔧 **API Endpoints**

### Base URL

```
http://localhost:5000/api/v1/push-notifications
```

### Authentication

All endpoints require JWT authentication:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Register Device Token

**POST** `/register-token`

Register a device token for push notifications.

**Request Body:**

```json
{
  "deviceToken": "fcm-token-from-device",
  "platform": "android" // android, ios, web
}
```

**Response:**

```json
{
  "success": true,
  "message": "Device token registered successfully",
  "data": {
    "deviceToken": "fcm-token-from-device",
    "platform": "android",
    "registeredAt": "2025-08-08T20:03:21.269Z"
  }
}
```

#### 2. Unregister Device Token

**POST** `/unregister-token`

Unregister a device token.

**Request Body:**

```json
{
  "deviceToken": "fcm-token-from-device"
}
```

#### 3. Get User's Device Tokens

**GET** `/device-tokens`

Get all device tokens for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "token1",
      "token": "fcm-token-1",
      "platform": "android",
      "createdAt": "2025-08-08T20:03:21.269Z",
      "lastUsed": "2025-08-08T20:03:21.269Z"
    }
  ]
}
```

#### 4. Send Test Notification

**POST** `/test`

Send a test push notification to the authenticated user.

**Request Body:**

```json
{
  "title": "Test Notification",
  "body": "This is a test push notification"
}
```

#### 5. Subscribe to Topic

**POST** `/subscribe-topic`

Subscribe user's devices to a topic.

**Request Body:**

```json
{
  "topic": "booking_updates"
}
```

#### 6. Unsubscribe from Topic

**POST** `/unsubscribe-topic`

Unsubscribe user's devices from a topic.

**Request Body:**

```json
{
  "topic": "booking_updates"
}
```

#### 7. Send to Topic (Admin Only)

**POST** `/send-to-topic`

Send notification to all subscribers of a topic.

**Request Body:**

```json
{
  "topic": "booking_updates",
  "title": "New Booking Available",
  "body": "Check out our latest properties!",
  "data": {
    "type": "promotion",
    "url": "/properties"
  }
}
```

#### 8. Cleanup Tokens (Admin Only)

**POST** `/cleanup-tokens`

Clean up inactive device tokens.

## 🗄️ **Database Schema**

### DeviceToken Model

```prisma
model DeviceToken {
  id        String   @id @default(cuid())
  token     String   @unique
  platform  String   @default("android") // android, ios, web
  isActive  Boolean  @default(true)
  lastUsed  DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("device_tokens")
}
```

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

## 🔧 **Environment Variables**

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-client-x509-cert-url
```

## 🚀 **Firebase Setup Guide**

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging

### Step 2: Get Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values to environment variables

### Step 3: Configure Mobile Apps

#### Android Setup

1. Add `google-services.json` to your Android app
2. Configure Firebase in your app
3. Get FCM token and send to backend

#### iOS Setup

1. Add `GoogleService-Info.plist` to your iOS app
2. Configure Firebase in your app
3. Get FCM token and send to backend

### Step 4: Test Integration

```bash
# Register device token
curl -X POST "http://localhost:5000/api/v1/push-notifications/register-token" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "your-fcm-token",
    "platform": "android"
  }'

# Send test notification
curl -X POST "http://localhost:5000/api/v1/push-notifications/test" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification"
  }'
```

## 📱 **Mobile App Integration**

### Flutter Example

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Request permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get FCM token
    String? token = await _firebaseMessaging.getToken();

    if (token != null) {
      // Send token to backend
      await registerDeviceToken(token);
    }

    // Handle token refresh
    _firebaseMessaging.onTokenRefresh.listen((newToken) {
      registerDeviceToken(newToken);
    });
  }

  Future<void> registerDeviceToken(String token) async {
    // Send to your backend API
    await http.post(
      Uri.parse('http://localhost:5000/api/v1/push-notifications/register-token'),
      headers: {
        'Authorization': 'Bearer $userToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'deviceToken': token,
        'platform': 'android', // or 'ios'
      }),
    );
  }
}
```

### React Native Example

```javascript
import messaging from "@react-native-firebase/messaging";

class PushNotificationService {
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission();

    // Get FCM token
    const token = await messaging().getToken();

    if (token) {
      // Send token to backend
      await this.registerDeviceToken(token);
    }

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      this.registerDeviceToken(token);
    });
  }

  async registerDeviceToken(token) {
    // Send to your backend API
    await fetch(
      "http://localhost:5000/api/v1/push-notifications/register-token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceToken: token,
          platform: "android", // or 'ios'
        }),
      }
    );
  }
}
```

## 🔄 **Automatic Notifications**

The system automatically sends push notifications for:

### Booking Events

- **New Booking**: Notifies host of new booking request
- **Booking Confirmation**: Notifies guest when booking is confirmed
- **Booking Status Update**: Notifies guest of status changes
- **Booking Cancellation**: Notifies both parties

### Review Events

- **New Review**: Notifies host when property receives a review
- **Review Update**: Notifies host when review is updated

### System Events

- **Welcome Message**: Sent to new users
- **Account Verification**: Sent when account is verified
- **Password Reset**: Sent when password reset is requested

## 🛡️ **Security Features**

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only manage their own device tokens
- **Token Validation**: Automatic cleanup of invalid tokens
- **Rate Limiting**: Prevents abuse
- **Secure Storage**: Tokens stored securely in database

## 📊 **Monitoring & Analytics**

### Token Management

- Track active/inactive tokens
- Monitor token registration success rates
- Clean up invalid tokens automatically

### Notification Analytics

- Track notification delivery rates
- Monitor user engagement
- Analyze notification performance

### Error Handling

- Invalid token detection
- Failed delivery tracking
- Automatic retry mechanisms

## 🚀 **Production Deployment**

### Railway Deployment

1. **Set Environment Variables**:

   ```bash
   # In Railway dashboard, add all Firebase environment variables
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   # ... etc
   ```

2. **Deploy Application**:

   ```bash
   git push railway main
   ```

3. **Test Push Notifications**:
   ```bash
   # Test with real device tokens
   curl -X POST "https://your-app.railway.app/api/v1/push-notifications/test"
   ```

### Performance Optimization

- **Token Caching**: Cache frequently used tokens
- **Batch Operations**: Send notifications in batches
- **Async Processing**: Process notifications asynchronously
- **Error Recovery**: Automatic retry for failed deliveries

## 🔧 **Troubleshooting**

### Common Issues

1. **Firebase Initialization Failed**:

   - Check environment variables
   - Verify Firebase project configuration
   - Ensure service account has proper permissions

2. **Tokens Not Registering**:

   - Check authentication token
   - Verify API endpoint
   - Check database connectivity

3. **Notifications Not Delivering**:

   - Verify device token is valid
   - Check Firebase project settings
   - Ensure app has proper permissions

4. **iOS Notifications Not Working**:
   - Verify APNs certificate
   - Check iOS app configuration
   - Ensure proper provisioning profile

### Debug Commands

```bash
# Check Firebase initialization
curl -X GET "http://localhost:5000/health"

# Test device token registration
curl -X POST "http://localhost:5000/api/v1/push-notifications/register-token" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "test-token", "platform": "android"}'

# Get user's device tokens
curl -X GET "http://localhost:5000/api/v1/push-notifications/device-tokens" \
  -H "Authorization: Bearer <token>"

# Send test notification
curl -X POST "http://localhost:5000/api/v1/push-notifications/test" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'
```

## 🎯 **Success Metrics**

✅ **Cross-Platform Support**: Android, iOS, Web
✅ **Real-time Delivery**: Instant notification delivery
✅ **User Management**: Per-user notification preferences
✅ **Topic Subscriptions**: Broadcast notifications
✅ **Error Handling**: Robust error recovery
✅ **Security**: Authentication and authorization
✅ **Scalability**: Ready for production scale
✅ **Monitoring**: Comprehensive analytics

## 🚀 **Ready for Production**

The Firebase push notification system is **100% functional** and ready for production deployment. It supports:

- **Cross-platform notifications** (Android, iOS, Web)
- **User-specific notifications**
- **Topic-based broadcasts**
- **Automatic error handling**
- **Comprehensive monitoring**
- **Production-ready security**

The implementation is complete and ready to enhance your Room Finder app with professional push notifications! 🎉
