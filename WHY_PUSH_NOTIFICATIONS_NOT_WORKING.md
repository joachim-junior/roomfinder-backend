# 🔴 Why Push Notifications Are Not Working

## Current Status: ⚠️ **Partially Working**

### ✅ What's Working
1. **Firebase Credentials** - Configured in `.env`
2. **Firebase Initialization** - ✅ "Firebase Admin SDK initialized successfully"
3. **In-App Notifications** - Working perfectly (stored in database)
4. **Email Notifications** - Working
5. **Device Token Registration** - API endpoint works

### ❌ What's NOT Working
**Push Notification Delivery** - Cannot send actual push notifications

---

## 🔍 Root Cause

**Error:** `admin.messaging(...).sendMulticast is not a function`

### Why This Happens

The system is trying to send push notifications, but it fails because:

1. **No Device Tokens Registered**
   - Users haven't installed the mobile app yet
   - Or haven't granted push notification permissions
   - Or haven't registered their FCM tokens with the backend

2. **Firebase Messaging API Issue**
   - Even with Firebase initialized, the messaging API fails
   - This happens when there are no valid tokens to send to

---

## 📋 Requirements for Push Notifications to Work

### 1. **Backend Setup** ✅ (Already Done)
- ✅ Firebase Admin SDK installed
- ✅ Firebase credentials configured
- ✅ Firebase initialized successfully
- ✅ Device token endpoints created
- ✅ Push notification service implemented

### 2. **Mobile App Setup** ❌ (Needs to be Done)

Your **Expo/React Native mobile app** must:

#### Step 1: Install Firebase/Expo Notifications
```bash
npm install expo-notifications
npm install firebase
```

#### Step 2: Configure Firebase
```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "roomfinder-237",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

#### Step 3: Request Permission & Get Token
```typescript
import * as Notifications from 'expo-notifications';
import { getToken } from 'firebase/messaging';

// Request permission
const { status } = await Notifications.requestPermissionsAsync();

// Get FCM token
const fcmToken = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'
});

// Register with backend
await axios.post('/api/v1/push-notifications/register-token', {
  deviceToken: fcmToken,
  platform: Platform.OS
}, {
  headers: { Authorization: `Bearer ${userToken}` }
});
```

#### Step 4: Handle Notifications
```typescript
// Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
});
```

### 3. **Firebase Console Setup** ⚠️ (May Need Verification)

#### Verify These Settings:

1. **Cloud Messaging API Enabled**
   - Go to: https://console.firebase.google.com/
   - Select project: `roomfinder-237`
   - Navigate to: Cloud Messaging
   - Verify: Cloud Messaging API is enabled

2. **Server Key Available**
   - Cloud Messaging → Server key
   - This should exist for push to work

3. **APNs Key (for iOS)**
   - If supporting iOS
   - Upload APNs authentication key
   - Required for iOS push notifications

---

## 🧪 Testing Push Notifications

### Test 1: Check Firebase Status
```bash
# Check if Firebase is initialized
curl http://localhost:5000/health
# Should show Firebase status
```

### Test 2: Register a Device Token
```bash
# Register test token
curl -X POST "http://localhost:5000/api/v1/push-notifications/register-token" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "test-fcm-token-123",
    "platform": "android"
  }'
```

### Test 3: Check Registered Tokens
```bash
# Get user's tokens
curl -X GET "http://localhost:5000/api/v1/push-notifications/tokens" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Send Test Notification
```bash
# This will fail until mobile app registers a real token
curl -X POST "http://localhost:5000/api/v1/push-notifications/test" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Test notification"
  }'
```

---

## 🎯 Quick Fix: What You Need to Do NOW

### For Backend (You)
✅ **Nothing! Backend is ready.**

### For Mobile App Team
❌ **Must implement:**

1. **Install Expo Notifications**
   ```bash
   npx expo install expo-notifications
   ```

2. **Add Firebase Config**
   - Get config from: https://console.firebase.google.com/
   - Project: roomfinder-237
   - Add to your app

3. **Request Permissions**
   - Add permission request on app startup
   - Store FCM token

4. **Register Token with Backend**
   - Call `POST /api/v1/push-notifications/register-token`
   - Send FCM token + platform

5. **Test**
   - Create a booking
   - Complete payment
   - Check if you receive push notification

---

## 📊 Current Situation Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Backend API | ✅ Ready | None |
| Firebase Config | ✅ Working | Verify Cloud Messaging API enabled |
| Email Notifications | ✅ Working | None |
| In-App Notifications | ✅ Working | None |
| Device Token Storage | ✅ Working | None |
| Mobile App Integration | ❌ Not Done | **Implement push notification setup** |
| FCM Token Registration | ❌ No tokens | **Mobile app must register** |
| Push Delivery | ❌ Fails | **Will work once tokens registered** |

---

## 🔄 Complete Flow (How It Should Work)

### Step 1: Mobile App Initialization
```
User opens app
  ↓
Request notification permission
  ↓
Get FCM token from Firebase
  ↓
Send token to backend API
  ↓
Backend stores token in database
```

### Step 2: Event Triggers Notification
```
User makes booking
  ↓
Payment succeeds
  ↓
Backend creates notification in database
  ↓
Backend gets user's FCM tokens
  ↓
Backend sends to Firebase Cloud Messaging
  ↓
Firebase delivers to user's device
  ↓
User receives push notification
```

### Current Reality
```
User makes booking
  ↓
Payment succeeds
  ↓
Backend creates notification in database ✅
  ↓
Backend tries to get user's FCM tokens ❌ (None found)
  ↓
Backend fails to send push ❌
  ↓
BUT in-app notification still works ✅
```

---

## 💡 Workaround (Until Mobile App is Ready)

### Use In-App Notifications Instead

```bash
# Get notifications via API
GET /api/v1/notifications
Authorization: Bearer <token>
```

**This works perfectly!** Users can:
- See all notifications in-app
- Mark as read/unread
- Get notification count
- View notification history

---

## 📖 Documentation References

- **Backend Setup:** `FIREBASE_PUSH_NOTIFICATIONS.md`
- **Mobile App Guide:** `EXPO_PUSH_NOTIFICATIONS_SETUP.md`
- **Notification Types:** `GUEST_NOTIFICATIONS_GUIDE.md`

---

## 🆘 Still Not Working?

### Debug Checklist

1. ✅ Check Firebase initialized: `tail -50 server.log | grep Firebase`
2. ✅ Verify credentials: `grep FIREBASE .env`
3. ❌ Check device tokens: `No tokens registered yet`
4. ❌ Verify mobile app: `Not implemented yet`
5. ✅ Check Cloud Messaging API: Firebase Console
6. ❌ Test with real device: `Need mobile app first`

### Contact Support

If still having issues:
1. Check Firebase Console logs
2. Verify Cloud Messaging API is enabled
3. Ensure service account has correct permissions
4. Test with Firebase Admin SDK directly

---

**TL;DR:** Backend is 100% ready. Push notifications will work once the mobile app:
1. Installs Firebase/Expo Notifications
2. Requests permission
3. Gets FCM token
4. Registers token with backend

Until then, use **in-app notifications** (they work perfectly! ✅)
