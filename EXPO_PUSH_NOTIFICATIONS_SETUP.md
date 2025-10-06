# Expo App Push Notifications Setup Guide

## Overview

This guide explains how to configure your Expo mobile app to receive push notifications from the Room Finder backend using Firebase Cloud Messaging (FCM).

## 🚀 Setup Steps

### 1. Install Required Packages

```bash
# Install Firebase and notification dependencies
npx expo install expo-notifications
npx expo install firebase

# Or if using bare workflow with @react-native-firebase
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 2. Configure Firebase in Your Expo App

Create a Firebase configuration file:

```typescript
// firebase.config.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### 3. Create Push Notification Service

```typescript
// services/pushNotificationService.ts
import * as Notifications from "expo-notifications";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase.config";
import axios from "axios";
import { Platform } from "react-native";

export class PushNotificationService {
  /**
   * Initialize push notifications
   * Call this after user logs in
   */
  static async initialize(userToken: string) {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission not granted for push notifications");
      return;
    }

    // Get FCM token
    try {
      const fcmToken = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY", // Get from Firebase Console → Project Settings → Cloud Messaging
      });

      if (fcmToken) {
        console.log("FCM Token:", fcmToken);
        // Register token with your backend
        await this.registerDeviceToken(fcmToken, userToken);
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }

    // Handle foreground notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listen for notifications
    this.setupNotificationListeners();
  }

  /**
   * Register device token with backend
   */
  static async registerDeviceToken(deviceToken: string, userToken: string) {
    try {
      const response = await axios.post(
        "YOUR_BACKEND_URL/api/v1/push-notifications/register-token",
        {
          deviceToken,
          platform: Platform.OS === "ios" ? "ios" : "android",
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Device token registered successfully:", response.data);
    } catch (error) {
      console.error("Failed to register device token:", error);
    }
  }

  /**
   * Setup notification listeners
   */
  static setupNotificationListeners() {
    // Handle notification when app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received (foreground):", notification);
      // You can show an in-app alert or update UI here
    });

    // Handle notification tap (when user taps the notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      const data = response.notification.request.content.data;

      // Navigate to appropriate screen based on notification data
      if (data.bookingId) {
        // Navigate to booking details
        // navigation.navigate('BookingDetails', { bookingId: data.bookingId });
      } else if (data.propertyId) {
        // Navigate to property details
        // navigation.navigate('PropertyDetails', { propertyId: data.propertyId });
      }
    });

    // Handle notification received in background (Android)
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Background notification:", notification);
    });
  }

  /**
   * Unregister device token
   * Call this when user logs out
   */
  static async unregisterDeviceToken(deviceToken: string, userToken: string) {
    try {
      await axios.post(
        "YOUR_BACKEND_URL/api/v1/push-notifications/unregister-token",
        { deviceToken },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Device token unregistered successfully");
    } catch (error) {
      console.error("Failed to unregister device token:", error);
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(userToken: string) {
    try {
      const response = await axios.post(
        "YOUR_BACKEND_URL/api/v1/push-notifications/test",
        {
          title: "Test Notification",
          body: "This is a test push notification from Room Finder!",
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Test notification sent:", response.data);
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }
}
```

### 4. Initialize in Your App

```typescript
// App.tsx
import React, { useEffect } from "react";
import { PushNotificationService } from "./services/pushNotificationService";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize push notifications after login
      PushNotificationService.initialize(token);
    }
  }, [user, token]);

  return <NavigationContainer>{/* Your app navigation */}</NavigationContainer>;
}
```

### 5. Handle Login/Logout

```typescript
// hooks/useAuth.ts
import { PushNotificationService } from "../services/pushNotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase.config";

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    try {
      // Your login logic
      const response = await authApi.login(email, password);
      const { token, user } = response.data;

      // Save token
      await AsyncStorage.setItem("userToken", token);

      // Initialize push notifications
      await PushNotificationService.initialize(token);

      return { token, user };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const fcmToken = await getToken(messaging);

      if (token && fcmToken) {
        // Unregister device token before logout
        await PushNotificationService.unregisterDeviceToken(fcmToken, token);
      }

      // Clear local storage
      await AsyncStorage.removeItem("userToken");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { login, logout };
};
```

### 6. Configure app.json for Expo

```json
{
  "expo": {
    "name": "Room Finder",
    "slug": "room-finder",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "googleServicesFile": "./google-services.json",
      "package": "com.roomfinder.app",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "NOTIFICATIONS"
      ]
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.roomfinder.app",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to the camera to take property photos.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to select property images.",
        "NSLocationWhenInUseUsageDescription": "This app needs your location to show nearby properties."
      }
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#1976D2",
      "androidMode": "default",
      "androidCollapsedTitle": "{{unread_count}} new notifications"
    }
  }
}
```

### 7. Add Firebase Configuration Files

#### For Android:

1. Go to Firebase Console → Project Settings → General
2. Under "Your apps", select your Android app
3. Download `google-services.json`
4. Place it in your project root directory

#### For iOS:

1. Go to Firebase Console → Project Settings → General
2. Under "Your apps", select your iOS app
3. Download `GoogleService-Info.plist`
4. Place it in your project root directory

### 8. Create Notification Channel (Android Only)

```typescript
// services/notificationChannel.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const createNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("room_finder_channel", {
      name: "Room Finder Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1976D2",
      sound: "default",
      enableVibrate: true,
    });
  }
};

// Call this in App.tsx
useEffect(() => {
  createNotificationChannel();
}, []);
```

## 🔄 Token Registration Behavior

### How Token Registration Works

The backend uses **upsert logic** to handle token registration intelligently:

**Scenario 1: First Login**

```
User logs in → Token doesn't exist → Create new token ✅
```

**Scenario 2: Subsequent Logins (Same User)**

```
User logs in again → Token exists → Update token (set isActive=true) ✅
```

**Scenario 3: Account Switching**

```
User A logs out → Token exists (isActive=false)
User B logs in → Token exists → Update token (change userId to User B, set isActive=true) ✅
```

**Scenario 4: Multiple Devices (Same User)**

```
User logs in on Phone → Token A registered
User logs in on Tablet → Token B registered
Both tokens active ✅
```

### Why Upsert?

The backend uses `upsert` (update or insert) instead of simple `create` to avoid errors when:

- User logs out and logs back in
- User switches accounts on the same device
- Token already exists in database

This ensures seamless token registration without duplicate errors.

## 📱 Backend API Endpoints

Your app will interact with these backend endpoints:

### 1. Register Device Token

```
POST /api/v1/push-notifications/register-token
Headers:
  Authorization: Bearer <userToken>
  Content-Type: application/json
Body:
  {
    "deviceToken": "fcm-device-token-here",
    "platform": "android" // or "ios"
  }

Response (200):
  {
    "success": true,
    "message": "Device token registered successfully",
    "data": {
      "id": "token-id",
      "token": "fcm-device-token-here",
      "platform": "android",
      "isActive": true
    }
  }
```

### 2. Unregister Device Token

```
POST /api/v1/push-notifications/unregister-token
Headers:
  Authorization: Bearer <userToken>
  Content-Type: application/json
Body:
  {
    "deviceToken": "fcm-device-token-here"
  }

Response (200):
  {
    "success": true,
    "message": "Device token unregistered successfully"
  }
```

### 3. Send Test Notification

```
POST /api/v1/push-notifications/test
Headers:
  Authorization: Bearer <userToken>
  Content-Type: application/json
Body:
  {
    "title": "Test Notification",
    "body": "This is a test message"
  }

Response (200):
  {
    "success": true,
    "message": "Test notification sent successfully"
  }
```

### 4. Get User's Device Tokens

```
GET /api/v1/push-notifications/tokens
Headers:
  Authorization: Bearer <userToken>

Response (200):
  {
    "success": true,
    "data": {
      "tokens": [
        {
          "id": "token-id",
          "token": "fcm-device-token",
          "platform": "android",
          "isActive": true,
          "createdAt": "2025-10-06T10:00:00.000Z"
        }
      ]
    }
  }
```

## 🔔 Automatic Notifications

Once set up, your app will automatically receive push notifications for:

### Guest Notifications

- **Booking Created**: When you create a new booking
- **Booking Confirmed**: When payment is completed and booking is confirmed
- **Booking Cancelled**: When a booking is cancelled
- **Review Reminder**: Reminder to review property after checkout
- **Payment Status**: Payment confirmations and updates

### Host Notifications

- **New Booking**: When a guest books your property
- **Booking Cancelled**: When a guest cancels a booking
- **New Review**: When a guest leaves a review for your property
- **Payout Complete**: When your withdrawal is processed
- **Property Approved**: When your property is verified by admin

### System Notifications

- **Welcome Message**: When you create an account
- **Account Verified**: When your email is verified
- **Password Reset**: When you request a password reset
- **Host Application**: Status updates on host application

## 🧪 Testing Push Notifications

### Test in Development

```typescript
// In your app, add a test button
import { Button } from "react-native";
import { PushNotificationService } from "./services/pushNotificationService";

<Button
  title="Send Test Notification"
  onPress={async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      await PushNotificationService.sendTestNotification(token);
    }
  }}
/>;
```

### Test with cURL

```bash
# Get your auth token first, then:
curl -X POST "https://your-backend-url.com/api/v1/push-notifications/test" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Testing push notifications"
  }'
```

## 🎨 Notification UI Customization

### Custom Notification Sound

1. Add sound file to `assets/notification-sound.wav`
2. Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### Custom Notification Icon (Android)

1. Create icon (24x24dp, white foreground, transparent background)
2. Save as `assets/notification-icon.png`
3. Update `app.json`

## 🐛 Troubleshooting

### Issue: Token registration fails with "Unique constraint failed"

**Symptoms:**

- Error: `Unique constraint failed on the fields: (token)`
- Happens on subsequent logins after logout
- First login works, but second login fails

**Cause:** Token already exists in database from previous login.

**Solution:** ✅ **FIXED IN BACKEND** - The backend now uses `upsert` instead of `create`, which automatically handles duplicate tokens by updating them instead of failing.

**What the backend does now:**

- If token exists → Updates it with new userId and sets `isActive: true`
- If token doesn't exist → Creates new token
- Works for account switching (User A → User B on same device)

### Issue: Not receiving notifications

**Solutions:**

1. Check if FCM token was registered:

   ```typescript
   const tokens = await axios.get("/api/v1/push-notifications/tokens", {
     headers: { Authorization: `Bearer ${userToken}` },
   });
   console.log("Registered tokens:", tokens.data);
   ```

2. Verify Firebase configuration is correct
3. Check if notifications are enabled in device settings
4. Ensure Firebase project has Cloud Messaging enabled

### Issue: Notifications work on Android but not iOS

**Solutions:**

1. Add APNs key to Firebase Console (iOS → Cloud Messaging → APNs Authentication Key)
2. Ensure iOS app has proper provisioning profile with push notifications enabled
3. Check iOS notification permissions

### Issue: Token registration fails

**Solutions:**

1. Check backend logs for errors
2. Verify API endpoint URL is correct
3. Ensure user is authenticated (valid JWT token)
4. Check network connectivity

## 📋 Implementation Checklist

- [ ] Install `expo-notifications` and `firebase` packages
- [ ] Create `firebase.config.ts` with your Firebase credentials
- [ ] Create `pushNotificationService.ts` service
- [ ] Download and add `google-services.json` (Android)
- [ ] Download and add `GoogleService-Info.plist` (iOS)
- [ ] Update `app.json` with notification configuration
- [ ] Initialize push notifications in `App.tsx`
- [ ] Register token after login
- [ ] Unregister token on logout
- [ ] Handle notification taps and navigation
- [ ] Create notification channel for Android
- [ ] Test notifications in development
- [ ] Test notifications on physical devices
- [ ] Submit app for review with notification permissions

## 🔗 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Backend Push Notification API](./FIREBASE_PUSH_NOTIFICATIONS.md)

## 📞 Support

If you encounter issues:

1. Check backend logs for push notification errors
2. Review Firebase Console for delivery reports
3. Test with the `/test` endpoint first
4. Verify device token is properly registered in database

---

**Note**: Remember to replace `YOUR_BACKEND_URL`, `YOUR_API_KEY`, and other placeholder values with your actual configuration values.
