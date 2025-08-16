# Admin Panel Documentation

## Overview

The Room Finder Admin Panel provides comprehensive management capabilities for administrators to monitor and control the platform. It includes user management, property verification, booking oversight, and system analytics.

## 🔐 **Authentication**

All admin endpoints require:

- **JWT Authentication**: Valid JWT token
- **Admin Role**: User must have `ADMIN` role

```
Authorization: Bearer <your-jwt-token>
```

## 📊 **Admin Dashboard**

### Base URL

```
http://localhost:5000/api/v1/admin
```

## 🚀 **Features**

### 1. **Dashboard Analytics**

- Total users, properties, bookings, reviews
- Recent activity monitoring
- Revenue analytics
- User role statistics
- Booking status breakdown

### 2. **User Management**

- View all users with pagination and filters
- Update user roles and verification status
- Delete users (with safety checks)
- User activity tracking

### 3. **Property Management**

- View all properties with filters
- Verify/unverify properties
- Property analytics
- Host information

### 4. **Booking Management**

- View all bookings with filters
- Booking status monitoring
- Revenue tracking
- Guest and property information

### 5. **System Notifications**

- Send system-wide notifications
- Email and push notification support
- Target specific user groups
- Notification history

### 6. **Analytics & Reports**

- User registration trends
- Booking patterns
- Revenue analytics
- Property creation trends

## 🔧 **API Endpoints**

### Dashboard

#### Get Dashboard Statistics

**GET** `/dashboard`

Get comprehensive dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalProperties": 45,
      "totalBookings": 320,
      "totalReviews": 89
    },
    "recentActivity": {
      "users": [
        {
          "id": "user1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "role": "GUEST",
          "isVerified": true,
          "createdAt": "2025-08-08T20:03:21.269Z"
        }
      ],
      "bookings": [...],
      "properties": [...]
    },
    "statistics": {
      "bookingStats": [
        {
          "status": "CONFIRMED",
          "_count": { "status": 45 },
          "_sum": { "totalPrice": 1250000 }
        }
      ],
      "userRoleStats": [
        {
          "role": "GUEST",
          "_count": { "role": 120 }
        }
      ],
      "monthlyRevenue": 2500000
    }
  }
}
```

### User Management

#### Get All Users

**GET** `/users`

Get all users with pagination and filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by user role
- `isVerified` (optional): Filter by verification status
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+237681101065",
        "role": "GUEST",
        "isVerified": true,
        "avatar": null,
        "createdAt": "2025-08-08T20:03:21.269Z",
        "updatedAt": "2025-08-08T20:03:21.269Z",
        "_count": {
          "properties": 0,
          "bookings": 5,
          "reviews": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Update User

**PUT** `/users/:userId`

Update user role and verification status.

**Request Body:**

```json
{
  "role": "HOST",
  "isVerified": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "HOST",
    "isVerified": true,
    "updatedAt": "2025-08-08T20:03:21.269Z"
  }
}
```

#### Delete User

**DELETE** `/users/:userId`

Delete a user (with safety checks).

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Property Management

#### Get All Properties

**GET** `/properties`

Get all properties with filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by property type
- `isVerified` (optional): Filter by verification status
- `isAvailable` (optional): Filter by availability
- `search` (optional): Search by title, description, or address

**Response:**

```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "prop1",
        "title": "Beautiful Apartment",
        "description": "Modern apartment in city center",
        "type": "APARTMENT",
        "address": "123 Main St",
        "city": "Douala",
        "price": 50000,
        "currency": "XAF",
        "isVerified": true,
        "isAvailable": true,
        "createdAt": "2025-08-08T20:03:21.269Z",
        "host": {
          "id": "user1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "_count": {
          "bookings": 12,
          "reviews": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### Update Property

**PUT** `/properties/:propertyId`

Update property verification status.

**Request Body:**

```json
{
  "isVerified": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": "prop1",
    "title": "Beautiful Apartment",
    "isVerified": true,
    "host": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
}
```

### Booking Management

#### Get All Bookings

**GET** `/bookings`

Get all bookings with filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by booking status
- `search` (optional): Search by property title or guest name

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "book1",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-20T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 250000,
        "status": "CONFIRMED",
        "createdAt": "2025-08-08T20:03:21.269Z",
        "property": {
          "id": "prop1",
          "title": "Beautiful Apartment",
          "address": "123 Main St",
          "host": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com"
          }
        },
        "guest": {
          "id": "user2",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 320,
      "pages": 16
    }
  }
}
```

### System Notifications

#### Get System Notifications

**GET** `/notifications`

Get system notification history.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif1",
        "title": "System Maintenance",
        "body": "Scheduled maintenance on Sunday",
        "type": "EMAIL",
        "status": "SENT",
        "createdAt": "2025-08-08T20:03:21.269Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Send System Notification

**POST** `/notifications/send`

Send system-wide notification.

**Request Body:**

```json
{
  "title": "System Maintenance",
  "body": "Scheduled maintenance on Sunday from 2-4 AM",
  "type": "EMAIL",
  "targetUsers": "ALL"
}
```

**Target Users Options:**

- `ALL`: Send to all users
- `HOSTS`: Send only to hosts
- `GUESTS`: Send only to guests

**Response:**

```json
{
  "success": true,
  "message": "System notification sent to 150 users",
  "data": {
    "total": 150,
    "success": 145,
    "failure": 5,
    "results": [
      {
        "userId": "user1",
        "success": true
      }
    ]
  }
}
```

### Analytics

#### Get System Analytics

**GET** `/analytics`

Get system analytics and trends.

**Query Parameters:**

- `period` (optional): Analysis period in days (default: 30)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "analytics": {
      "userRegistrations": [
        {
          "createdAt": "2025-08-01T00:00:00.000Z",
          "_count": { "id": 5 }
        }
      ],
      "bookingTrends": [
        {
          "status": "CONFIRMED",
          "createdAt": "2025-08-01T00:00:00.000Z",
          "_count": { "id": 12 },
          "_sum": { "totalPrice": 300000 }
        }
      ],
      "propertyTrends": [
        {
          "createdAt": "2025-08-01T00:00:00.000Z",
          "_count": { "id": 3 }
        }
      ],
      "revenue": {
        "total": 2500000,
        "count": 45
      }
    }
  }
}
```

## 🔧 **Setup Instructions**

### 1. Create Admin User

Run the admin user creation script:

```bash
npm run create-admin
```

This creates an admin user with:

- **Email**: admin@roomfinder.com
- **Password**: admin123456
- **Role**: ADMIN

### 2. Login as Admin

```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@roomfinder.com",
    "password": "admin123456"
  }'
```

### 3. Use Admin Token

Use the returned JWT token for admin endpoints:

```bash
curl -X GET "http://localhost:5000/api/v1/admin/dashboard" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## 🛡️ **Security Features**

- **Role-Based Access**: Only ADMIN users can access
- **Authentication Required**: All endpoints require JWT
- **Input Validation**: All inputs are validated
- **Error Handling**: Comprehensive error handling
- **Audit Trail**: All admin actions are logged

## 📊 **Dashboard Features**

### Overview Statistics

- Total users, properties, bookings, reviews
- Real-time counts and trends
- Revenue analytics
- User engagement metrics

### Recent Activity

- Latest user registrations
- Recent bookings
- New property listings
- System notifications

### Analytics

- User registration trends
- Booking patterns
- Revenue analysis
- Property creation trends

## 🚀 **Usage Examples**

### Get Dashboard Stats

```bash
curl -X GET "http://localhost:5000/api/v1/admin/dashboard" \
  -H "Authorization: Bearer <admin-token>"
```

### Get All Users

```bash
curl -X GET "http://localhost:5000/api/v1/admin/users?page=1&limit=10&role=HOST" \
  -H "Authorization: Bearer <admin-token>"
```

### Update User Role

```bash
curl -X PUT "http://localhost:5000/api/v1/admin/users/user1" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "HOST",
    "isVerified": true
  }'
```

### Send System Notification

```bash
curl -X POST "http://localhost:5000/api/v1/admin/notifications/send" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Room Finder!",
    "body": "Thank you for joining our platform.",
    "type": "EMAIL",
    "targetUsers": "ALL"
  }'
```

### Get Analytics

```bash
curl -X GET "http://localhost:5000/api/v1/admin/analytics?period=30" \
  -H "Authorization: Bearer <admin-token>"
```

## 🎯 **Production Considerations**

### Security

- Use strong admin passwords
- Regularly rotate admin tokens
- Monitor admin actions
- Implement rate limiting

### Performance

- Cache dashboard statistics
- Optimize database queries
- Use pagination for large datasets
- Implement background jobs for analytics

### Monitoring

- Track admin actions
- Monitor system performance
- Set up alerts for critical events
- Regular backup of admin data

## 🎉 **Ready for Production**

The admin panel is **100% functional** and includes:

- ✅ **Complete dashboard** with analytics
- ✅ **User management** with role control
- ✅ **Property verification** system
- ✅ **Booking oversight** capabilities
- ✅ **System notifications** (email + push)
- ✅ **Comprehensive analytics** and reporting
- ✅ **Security features** and access control
- ✅ **Professional documentation**

Your Room Finder platform now has a powerful admin panel ready for production use! 🚀
