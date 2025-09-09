# Room Finder Admin API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Settings](#admin-settings)
3. [User Management](#user-management)
4. [Property Management](#property-management)
5. [Admin Property Creation on Behalf of Hosts](#admin-property-creation-on-behalf-of-hosts)
6. [Booking Management](#booking-management)
7. [Wallet Management](#wallet-management)
8. [Host Approval System](#host-approval-system)
9. [Platform Analytics](#platform-analytics)
10. [Revenue Management](#revenue-management)
11. [Blog Management](#blog-management)
12. [Help Center Management](#help-center-management)
13. [Co-Host Management](#co-host-management)
14. [Favorites Management](#favorites-management)
15. [Enquiry Management](#enquiry-management)
16. [System Administration](#system-administration)
17. [Fapshi Payment Configuration](#fapshi-payment-configuration)
18. [Notifications Management](#notifications-management)
19. [**Booking Process Flow (Admin Perspective)**](#booking-process-flow-admin-perspective)

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require authentication using JWT tokens with ADMIN role. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Authentication

#### 1.1 Admin Login

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@roomfinder.com",
  "password": "admin123"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cme7bxjg60000u9kbzspc5gip",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@roomfinder.com",
      "phone": "+237612345670",
      "role": "ADMIN",
      "isVerified": true,
      "avatar": null,
      "createdAt": "2025-08-11T16:31:06.678Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Admin Settings

#### 2.1 Get Admin Profile

**Request:**

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cme7bxjg60000u9kbzspc5gip",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@roomfinder.com",
      "phone": "+237612345670",
      "role": "ADMIN",
      "isVerified": true,
      "avatar": null,
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T16:31:06.678Z",
      "updatedAt": "2025-08-11T16:31:06.678Z"
    }
  }
}
```

#### 2.2 Update Admin Profile

**Request:**

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+237612345670",
  "avatar": "uploads/avatar/admin-avatar.jpg"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cme7bxjg60000u9kbzspc5gip",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@roomfinder.com",
      "phone": "+237612345670",
      "role": "ADMIN",
      "isVerified": true,
      "avatar": "uploads/avatar/admin-avatar.jpg",
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T16:31:06.678Z",
      "updatedAt": "2025-08-11T16:31:06.678Z"
    }
  }
}
```

#### 2.3 Change Admin Password

**Request:**

```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 2.4 Get Admin Dashboard Statistics

**Request:**

```http
GET /users/dashboard-stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Admin dashboard statistics retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalProperties": 75,
      "totalBookings": 300,
      "totalRevenue": 45000000,
      "pendingApprovals": 5,
      "unverifiedProperties": 15
    },
    "userStats": {
      "guests": 120,
      "hosts": 25,
      "admins": 5,
      "newUsersThisMonth": 15,
      "verifiedUsers": 140,
      "suspendedUsers": 2
    },
    "propertyStats": {
      "total": 75,
      "verified": 60,
      "pending": 15,
      "available": 65,
      "newThisMonth": 8,
      "byType": {
        "VILLA": 25,
        "APARTMENT": 20,
        "ROOM": 15,
        "STUDIO": 10,
        "SUITE": 5
      }
    },
    "bookingStats": {
      "total": 300,
      "pending": 25,
      "confirmed": 200,
      "completed": 70,
      "cancelled": 5,
      "newThisMonth": 45,
      "averageBookingValue": 150000
    },
    "revenueStats": {
      "total": 45000000,
      "thisMonth": 5000000,
      "platformFees": 2250000,
      "hostEarnings": 42750000,
      "averageRevenuePerBooking": 150000,
      "monthlyGrowth": 12.5
    },
    "reviewStats": {
      "total": 180,
      "averageRating": 4.3,
      "thisMonth": 25,
      "ratingBreakdown": {
        "5": 90,
        "4": 60,
        "3": 20,
        "2": 8,
        "1": 2
      }
    },
    "systemStats": {
      "uptime": "72h 15m 30s",
      "activeConnections": 25,
      "databaseSize": "2.5GB",
      "lastBackup": "2025-08-10T23:00:00.000Z",
      "systemHealth": "healthy"
    }
  }
}
```

#### 2.5 Get Admin Activity Log

**Request:**

```http
GET /users/activity?page=1&limit=10
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_001",
        "type": "USER_SUSPENDED",
        "description": "Suspended user john@example.com for policy violation",
        "targetUser": "cme6fo5xz0000u9mo5li7lln7",
        "metadata": {
          "reason": "Policy violation",
          "duration": "30 days"
        },
        "timestamp": "2025-08-11T16:30:00.000Z"
      },
      {
        "id": "activity_002",
        "type": "PROPERTY_VERIFIED",
        "description": "Verified property 'Cozy Beachfront Villa'",
        "targetProperty": "cme6itqoo0001u9i4x6c38wmq",
        "metadata": {
          "verificationNotes": "Property verified after inspection"
        },
        "timestamp": "2025-08-11T16:25:00.000Z"
      },
      {
        "id": "activity_003",
        "type": "HOST_APPROVED",
        "description": "Approved host application for jane@example.com",
        "targetUser": "cme6hostapp0001u9i4x6c38wmq",
        "metadata": {
          "approvalNotes": "Application approved after document verification"
        },
        "timestamp": "2025-08-11T16:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 2.6 Update Admin Preferences

**Request:**

```http
PUT /admin/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "notifications": {
    "emailNotifications": true,
    "pushNotifications": true,
    "newUserAlerts": true,
    "newPropertyAlerts": true,
    "bookingAlerts": true,
    "revenueAlerts": true
  },
  "dashboard": {
    "defaultView": "overview",
    "refreshInterval": 300,
    "showCharts": true,
    "showRecentActivity": true
  },
  "security": {
    "twoFactorAuth": false,
    "sessionTimeout": 3600,
    "loginAttempts": 5
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Admin preferences updated successfully",
  "data": {
    "preferences": {
      "notifications": {
        "emailNotifications": true,
        "pushNotifications": true,
        "newUserAlerts": true,
        "newPropertyAlerts": true,
        "bookingAlerts": true,
        "revenueAlerts": true
      },
      "dashboard": {
        "defaultView": "overview",
        "refreshInterval": 300,
        "showCharts": true,
        "showRecentActivity": true
      },
      "security": {
        "twoFactorAuth": false,
        "sessionTimeout": 3600,
        "loginAttempts": 5
      },
      "updatedAt": "2025-08-11T16:31:06.678Z"
    }
  }
}
```

#### 2.7 Get Admin Preferences

**Request:**

```http
GET /admin/preferences
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "preferences": {
      "notifications": {
        "emailNotifications": true,
        "pushNotifications": true,
        "newUserAlerts": true,
        "newPropertyAlerts": true,
        "bookingAlerts": true,
        "revenueAlerts": true
      },
      "dashboard": {
        "defaultView": "overview",
        "refreshInterval": 300,
        "showCharts": true,
        "showRecentActivity": true
      },
      "security": {
        "twoFactorAuth": false,
        "sessionTimeout": 3600,
        "loginAttempts": 5
      },
      "createdAt": "2025-08-11T16:31:06.678Z",
      "updatedAt": "2025-08-11T16:31:06.678Z"
    }
  }
}
```

#### 2.8 Upload Admin Avatar

**Request:**

```http
POST /uploads/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": file
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image": "uploads/avatar/admin-avatar.jpg",
    "url": "http://localhost:5000/uploads/avatar/admin-avatar.jpg"
  }
}
```

### 3. User Management

#### 2.1 Get All Users

**Request:**

```http
GET /admin/users?role=HOST&hostApprovalStatus=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `role` (optional): Filter by user role (GUEST, HOST, ADMIN)
- `isVerified` (optional): Filter by verification status (true/false)
- `hostApprovalStatus` (optional): Filter by host approval status (PENDING, APPROVED, REJECTED, SUSPENDED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Host",
        "email": "host@example.com",
        "phone": "+237612345678",
        "role": "HOST",
        "isVerified": true,
        "avatar": null,
        "hostApprovalStatus": "APPROVED",
        "hostApprovalDate": "2025-08-11T01:30:00.000Z",
        "hostApprovalNotes": "Approved after document verification",
        "hostRejectionReason": null,
        "createdAt": "2025-08-11T01:28:01.559Z",
        "updatedAt": "2025-08-11T01:28:01.559Z",
        "_count": {
          "properties": 3,
          "bookings": 15,
          "reviews": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 2.2 Get User by ID

**Request:**

```http
GET /admin/users/cme6fo5xz0000u9mo5li7lln7
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "role": "HOST",
      "isVerified": true,
      "avatar": null,
      "hostApprovalStatus": "APPROVED",
      "hostApprovalDate": "2025-08-11T01:30:00.000Z",
      "hostApprovalNotes": "Approved after document verification",
      "createdAt": "2025-08-11T01:28:01.559Z",
      "properties": [
        {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "type": "VILLA",
          "price": 75000,
          "isAvailable": true,
          "isVerified": true
        }
      ],
      "bookings": [
        {
          "id": "cme6itsi5000bu9i4canbgxat",
          "totalPrice": 150000,
          "status": "COMPLETED",
          "createdAt": "2025-08-11T02:53:53.616Z"
        }
      ]
    }
  }
}
```

#### 2.3 Update User

**Request:**

```http
PUT /admin/users/cme6fo5xz0000u9mo5li7lln7
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true,
  "role": "HOST",
  "hostApprovalStatus": "APPROVED",
  "hostApprovalNotes": "Approved after document verification",
  "hostRejectionReason": null
}
```

**Request Body Fields:**

- `role` (optional): User role (GUEST, HOST, ADMIN)
- `isVerified` (optional): Email verification status (true/false)
- `hostApprovalStatus` (optional): Host approval status (PENDING, APPROVED, REJECTED, SUSPENDED)
- `hostApprovalNotes` (optional): Notes when approving a host
- `hostRejectionReason` (optional): Reason when rejecting a host

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "cme6fo5xz0000u9mo5li7lln7",
    "firstName": "John",
    "lastName": "Host",
    "email": "host@example.com",
    "role": "HOST",
    "isVerified": true,
    "hostApprovalStatus": "APPROVED",
    "hostApprovalDate": "2025-08-11T18:30:00.000Z",
    "hostApprovalNotes": "Approved after document verification",
    "hostRejectionReason": null,
    "updatedAt": "2025-08-11T18:30:00.000Z"
  }
}
```

**Example: Reject Host Application**

```http
PUT /admin/users/cme6fo5xz0000u9mo5li7lln7
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostApprovalStatus": "REJECTED",
  "hostRejectionReason": "Incomplete documentation provided"
}
```

**Example: Suspend Host**

```http
PUT /admin/users/cme6fo5xz0000u9mo5li7lln7
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostApprovalStatus": "SUSPENDED",
  "hostApprovalNotes": "Suspended due to policy violations"
}
```

#### 2.4 Suspend User

**Request:**

```http
PUT /admin/users/cme6fo5xz0000u9mo5li7lln7/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violation of platform policies",
  "duration": "30" // days
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "isSuspended": true,
      "suspensionReason": "Violation of platform policies",
      "suspensionEndDate": "2025-09-10T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

### 3. Property Management

#### 3.1 Create Property on Behalf of Host

**Request:**

```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Admin Created Villa",
  "description": "This property was created by admin on behalf of a host",
  "type": "VILLA",
  "address": "456 Admin Street",
  "city": "Douala",
  "state": "Littoral",
  "country": "Cameroon",
  "zipCode": "54321",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "price": 85000,
  "currency": "XAF",
  "bedrooms": 4,
  "bathrooms": 3,
  "maxGuests": 8,
  "amenities": ["WiFi", "Pool", "Kitchen", "Air Conditioning"],
  "images": ["admin-villa1.jpg", "admin-villa2.jpg"],
  "hostId": "cme6fo5xz0000u9mo5li7lln7"
}
```

**Request Body Fields:**

- `hostId` (required for admin): The ID of the host on whose behalf the property is being created
- All other fields are the same as regular property creation

**Response (Success - 201):**

```json
{
  "message": "Property created successfully on behalf of Sample Host",
  "property": {
    "id": "cme93hkcn0001u95gg0z35tq1",
    "title": "Admin Created Villa",
    "description": "This property was created by admin on behalf of a host",
    "type": "VILLA",
    "address": "456 Admin Street",
    "city": "Douala",
    "state": "Littoral",
    "country": "Cameroon",
    "zipCode": "54321",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "price": 85000,
    "currency": "XAF",
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": ["WiFi", "Pool", "Kitchen", "Air Conditioning"],
    "images": ["admin-villa1.jpg", "admin-villa2.jpg"],
    "isAvailable": true,
    "isVerified": true,
    "createdAt": "2025-08-12T22:10:16.775Z",
    "updatedAt": "2025-08-12T22:10:16.775Z",
    "hostId": "cme6fo5xz0000u9mo5li7lln7",
    "host": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "Sample",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "1234567890",
      "avatar": null,
      "isVerified": true,
      "hostApprovalStatus": "APPROVED"
    }
  },
  "createdBy": "ADMIN"
}
```

**Error Responses:**

**Host Not Found (404):**

```json
{
  "error": "Host not found",
  "message": "The specified host does not exist"
}
```

**Invalid Host (400):**

```json
{
  "error": "Invalid host",
  "message": "The specified user is not a host"
}
```

**Host Not Approved (400):**

```json
{
  "error": "Host not approved",
  "message": "The specified host is not approved to create properties"
}
```

#### 3.2 Get All Properties

**Request:**

```http
GET /admin/properties?isVerified=false&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `isVerified` (optional): Filter by verification status (true/false)
- `type` (optional): Filter by property type
- `city` (optional): Filter by city
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "description": "Beautiful villa with stunning ocean views",
        "type": "VILLA",
        "address": "123 Beach Road",
        "city": "Limbe",
        "state": "Southwest",
        "country": "Cameroon",
        "price": 75000,
        "currency": "XAF",
        "isAvailable": true,
        "isVerified": false,
        "host": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        },
        "reviews": {
          "averageRating": 4.5,
          "totalReviews": 5
        },
        "bookings": {
          "totalBookings": 3
        },
        "createdAt": "2025-08-11T02:53:53.616Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 3.2 Verify Property

**Request:**

```http
PUT /admin/properties/cme6itqoo0001u9i4x6c38wmq/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true,
  "notes": "Property verified after inspection"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property verification status updated",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "isVerified": true,
      "verificationNotes": "Property verified after inspection",
      "verifiedAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 3.3 Delete Property

**Request:**

```http
DELETE /admin/properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

### 4. Admin Property Creation on Behalf of Hosts

**Summary:**
Admins can create properties on behalf of approved hosts using the same endpoint as regular property creation (`POST /api/v1/properties`) but with an additional `hostId` field. This feature provides administrative control over property creation while maintaining proper host association and validation.

**Key Features:**

- ✅ Create properties for approved hosts
- ✅ Automatic property verification
- ✅ Host validation and approval checks
- ✅ Quality control and standardization
- ✅ Full audit trail

**Use Cases:**

- Assisting hosts who have difficulty with the platform
- Creating properties for hosts who prefer admin assistance
- Ensuring property quality and compliance
- Onboarding new hosts with sample properties

#### 4.1 Create Property on Behalf of Host

**Endpoint:** `POST /api/v1/properties`

**Request:**

```http
POST /api/v1/properties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Luxury Beachfront Villa",
  "description": "Stunning 4-bedroom villa with panoramic ocean views, private pool, and modern amenities. Perfect for families and groups seeking luxury accommodation.",
  "type": "VILLA",
  "address": "456 Ocean Drive",
  "city": "Limbe",
  "state": "Southwest",
  "country": "Cameroon",
  "zipCode": "54321",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "price": 120000,
  "currency": "XAF",
  "bedrooms": 4,
  "bathrooms": 3,
  "maxGuests": 8,
  "amenities": [
    "WiFi",
    "Air Conditioning",
    "Swimming Pool",
    "Kitchen",
    "Free Parking",
    "Ocean View",
    "Private Beach Access",
    "Security System"
  ],
  "images": [
    "villa-exterior.jpg",
    "villa-living-room.jpg",
    "villa-bedroom.jpg",
    "villa-pool.jpg"
  ],
  "hostId": "cme6fo5xz0000u9mo5li7lln7"
}
```

**Request Body Fields:**

| Field         | Type   | Required | Description                                                                          |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------ |
| `title`       | string | ✅       | Property title (5-100 characters)                                                    |
| `description` | string | ✅       | Property description (10-1000 characters)                                            |
| `type`        | string | ✅       | Property type (ROOM, STUDIO, APARTMENT, VILLA, SUITE, DORMITORY, COTTAGE, PENTHOUSE) |
| `address`     | string | ✅       | Street address (5-200 characters)                                                    |
| `city`        | string | ✅       | City name (2-50 characters)                                                          |
| `state`       | string | ✅       | State/province (2-50 characters)                                                     |
| `country`     | string | ✅       | Country name (2-50 characters)                                                       |
| `zipCode`     | string | ❌       | Postal/ZIP code                                                                      |
| `latitude`    | number | ❌       | GPS latitude coordinate                                                              |
| `longitude`   | number | ❌       | GPS longitude coordinate                                                             |
| `price`       | number | ✅       | Nightly price (must be > 0)                                                          |
| `currency`    | string | ❌       | Currency code (default: XAF)                                                         |
| `bedrooms`    | number | ✅       | Number of bedrooms (1-20)                                                            |
| `bathrooms`   | number | ✅       | Number of bathrooms (1-10)                                                           |
| `maxGuests`   | number | ✅       | Maximum number of guests (1-50)                                                      |
| `amenities`   | array  | ❌       | Array of amenity strings                                                             |
| `images`      | array  | ❌       | Array of image URLs (must be uploaded separately first)                              |
| `hostId`      | string | ✅       | ID of the host on whose behalf the property is created                               |

**Image Handling:**

- **Step 1:** Upload images using `/api/v1/uploads/multiple` endpoint
- **Step 2:** Use returned image URLs in the `images` array
- **Images Field:** Array of image URLs (strings), not file uploads
- **Maximum:** Up to 10 images per property

**Response (Success - 201):**

```json
{
  "message": "Property created successfully on behalf of John Host",
  "property": {
    "id": "cme93hkcn0001u95gg0z35tq1",
    "title": "Luxury Beachfront Villa",
    "description": "Stunning 4-bedroom villa with panoramic ocean views, private pool, and modern amenities. Perfect for families and groups seeking luxury accommodation.",
    "type": "VILLA",
    "address": "456 Ocean Drive",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "zipCode": "54321",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "price": 120000,
    "currency": "XAF",
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": [
      "WiFi",
      "Air Conditioning",
      "Swimming Pool",
      "Kitchen",
      "Free Parking",
      "Ocean View",
      "Private Beach Access",
      "Security System"
    ],
    "images": [
      "villa-exterior.jpg",
      "villa-living-room.jpg",
      "villa-bedroom.jpg",
      "villa-pool.jpg"
    ],
    "isAvailable": true,
    "isVerified": true,
    "createdAt": "2025-08-12T22:10:16.775Z",
    "updatedAt": "2025-08-12T22:10:16.775Z",
    "hostId": "cme6fo5xz0000u9mo5li7lln7",
    "host": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "avatar": null,
      "isVerified": true,
      "hostApprovalStatus": "APPROVED"
    }
  },
  "createdBy": "ADMIN"
}
```

**Error Responses:**

**Host Not Found (404):**

```json
{
  "error": "Host not found",
  "message": "The specified host does not exist"
}
```

**Invalid Host (400):**

```json
{
  "error": "Invalid host",
  "message": "The specified user is not a host"
}
```

**Host Not Approved (400):**

```json
{
  "error": "Host not approved",
  "message": "The specified host is not approved to create properties"
}
```

**Missing Required Fields (400):**

```json
{
  "error": "Missing required fields",
  "message": "Title, description, address, city, state, and country are required"
}
```

**Invalid Price (400):**

```json
{
  "error": "Invalid price",
  "message": "Price must be greater than 0"
}
```

**Invalid Room Count (400):**

```json
{
  "error": "Invalid room count",
  "message": "Bedrooms and bathrooms must be greater than 0"
}
```

#### 4.2 Property Type Options

**Available Property Types:**

- `ROOM` - Single room accommodation
- `STUDIO` - Open-plan living space
- `APARTMENT` - Self-contained apartment unit
- `VILLA` - Standalone house/villa
- `SUITE` - Luxury suite accommodation
- `DORMITORY` - Shared accommodation
- `COTTAGE` - Small house, typically rural
- `PENTHOUSE` - Top-floor luxury apartment

#### 4.3 Admin Property Creation Benefits

**Automatic Verification:**

- Properties created by admins are automatically marked as verified
- No additional verification process required
- Immediate availability for booking

**Host Validation:**

- System automatically validates that the specified host exists
- Ensures host has APPROVED status
- Prevents creation for unapproved or suspended hosts

**Quality Control:**

- Admins can ensure property descriptions meet platform standards
- Consistent formatting and information structure
- Professional presentation for guests

#### 4.4 Example Use Cases

**1. New Host Onboarding:**

```json
{
  "title": "Welcome to Room Finder - Sample Property",
  "description": "This is a sample property to help you get started. You can edit or delete this property and create your own listings.",
  "type": "APARTMENT",
  "address": "123 Sample Street",
  "city": "Douala",
  "state": "Littoral",
  "country": "Cameroon",
  "price": 25000,
  "bedrooms": 1,
  "bathrooms": 1,
  "maxGuests": 2,
  "amenities": ["WiFi", "Kitchen", "Basic Amenities"],
  "hostId": "new-host-id"
}
```

**2. Premium Property Creation:**

```json
{
  "title": "Executive Business Suite",
  "description": "Luxury business accommodation with conference facilities, high-speed internet, and premium amenities for corporate travelers.",
  "type": "SUITE",
  "address": "789 Business District",
  "city": "Yaoundé",
  "state": "Centre",
  "country": "Cameroon",
  "price": 150000,
  "bedrooms": 2,
  "bathrooms": 2,
  "maxGuests": 4,
  "amenities": [
    "WiFi",
    "Conference Room",
    "Business Center",
    "Premium Bedding",
    "24/7 Concierge"
  ],
  "hostId": "premium-host-id"
}
```

#### 4.5 Admin Property Management Workflow

**Step 1: Verify Host Status**

- Ensure host exists and has APPROVED status
- Check host verification and approval history

**Step 2: Create Property**

- Use the property creation endpoint with `hostId`
- Include all required property details
- Set appropriate amenities and pricing

**Step 3: Property Verification**

- Property is automatically verified (no manual verification needed)
- Property becomes immediately available for booking

**Step 4: Host Notification**

- Host receives notification of property creation
- Host can manage and update the property as needed

#### 4.6 Security and Validation

**Admin-Only Access:**

- Only users with ADMIN role can create properties on behalf of hosts
- Requires valid JWT token with admin privileges

**Host Validation:**

- System validates host existence and approval status
- Prevents creation for invalid or unapproved hosts

**Data Validation:**

- All property fields are validated according to platform standards
- Ensures data quality and consistency

**Audit Trail:**

- All admin-created properties are marked with `createdBy: "ADMIN"`
- Full audit trail maintained for compliance

### 4. Booking Management

#### 4.1 Get All Bookings

**Request:**

```http
GET /admin/bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by booking status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cme6itsi5000bu9i4canbgxat",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "guestId": "cme6iqlan0000u9vp9mlbrpb6",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-17T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 150000,
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "paymentMethod": "FAPSHI",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "host": {
            "id": "cme6fo5xz0000u9mo5li7lln7",
            "firstName": "John",
            "lastName": "Host"
          }
        },
        "guest": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "email": "guest@example.com"
        },
        "createdAt": "2025-08-11T02:53:53.616Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 4.2 Update Booking Status

**Request:**

```http
PUT /admin/bookings/cme6itsi5000bu9i4canbgxat/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Booking confirmed by admin"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "booking": {
      "id": "cme6itsi5000bu9i4canbgxat",
      "status": "CONFIRMED",
      "adminNotes": "Booking confirmed by admin",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

### 5. Host Approval System

#### 5.1 Get Pending Host Applications

**Request:**

```http
GET /admin/host-applications?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "cme6hostapp0001u9i4x6c38wmq",
        "userId": "cme6fo5xz0000u9mo5li7lln7",
        "status": "PENDING",
        "applicationDate": "2025-08-11T01:28:01.559Z",
        "applicationNotes": "Interested in hosting properties",
        "documents": ["id_card.jpg", "property_photos.jpg"],
        "user": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com",
          "phone": "+237612345678",
          "isVerified": true
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 5.2 Approve Host Application

**Request:**

```http
PUT /admin/host-applications/cme6hostapp0001u9i4x6c38wmq/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Application approved after document verification",
  "role": "HOST"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Host application approved successfully",
  "data": {
    "application": {
      "id": "cme6hostapp0001u9i4x6c38wmq",
      "status": "APPROVED",
      "approvalDate": "2025-08-11T02:53:53.616Z",
      "approvalNotes": "Application approved after document verification",
      "user": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "role": "HOST",
        "hostApprovalStatus": "APPROVED"
      }
    }
  }
}
```

#### 5.3 Reject Host Application

**Request:**

```http
PUT /admin/host-applications/cme6hostapp0001u9i4x6c38wmq/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Incomplete documentation",
  "notes": "Please provide additional identification documents"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Host application rejected",
  "data": {
    "application": {
      "id": "cme6hostapp0001u9i4x6c38wmq",
      "status": "REJECTED",
      "rejectionDate": "2025-08-11T02:53:53.616Z",
      "rejectionReason": "Incomplete documentation",
      "rejectionNotes": "Please provide additional identification documents"
    }
  }
}
```

### 6. Platform Analytics

#### 6.1 Get Platform Overview

**Request:**

```http
GET /admin/analytics/overview
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "guests": 120,
      "hosts": 25,
      "admins": 5,
      "newThisMonth": 15
    },
    "properties": {
      "total": 75,
      "verified": 60,
      "pending": 15,
      "available": 65,
      "newThisMonth": 8
    },
    "bookings": {
      "total": 300,
      "pending": 25,
      "confirmed": 200,
      "completed": 70,
      "cancelled": 5,
      "newThisMonth": 45
    },
    "revenue": {
      "total": 45000000,
      "thisMonth": 5000000,
      "platformFees": 2250000,
      "averageBookingValue": 150000
    },
    "reviews": {
      "total": 180,
      "averageRating": 4.3,
      "thisMonth": 25
    }
  }
}
```

#### 6.2 Get Revenue Analytics

**Request:**

```http
GET /admin/analytics/revenue?period=monthly&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 45000000,
    "platformFees": 2250000,
    "hostEarnings": 42750000,
    "monthlyTrend": [
      {
        "month": "January",
        "revenue": 3500000,
        "bookings": 25,
        "platformFees": 175000
      },
      {
        "month": "February",
        "revenue": 4200000,
        "bookings": 30,
        "platformFees": 210000
      }
    ],
    "topEarningHosts": [
      {
        "hostId": "cme6fo5xz0000u9mo5li7lln7",
        "hostName": "John Host",
        "totalEarnings": 2250000,
        "properties": 3,
        "bookings": 15
      }
    ]
  }
}
```

### 7. Revenue Management

#### 7.1 Get All Revenue Configurations

**Request:**

```http
GET /api/v1/revenue/configs
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cme90cp7u0002u90nmvakexzu",
      "name": "Updated Configuration",
      "description": "Updated fee structure with higher rates",
      "hostServiceFeePercent": 7,
      "hostServiceFeeMin": 0,
      "hostServiceFeeMax": null,
      "guestServiceFeePercent": 4,
      "guestServiceFeeMin": 0,
      "guestServiceFeeMax": null,
      "isActive": true,
      "appliesToBooking": true,
      "appliesToWithdrawal": false,
      "createdAt": "2025-08-12T20:42:30.954Z",
      "updatedAt": "2025-08-12T20:43:26.288Z"
    }
  ]
}
```

#### 7.2 Create Revenue Configuration

**Request:**

```http
POST /api/v1/revenue/configs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premium Configuration",
  "description": "Premium fee structure for high-end properties",
  "hostServiceFeePercent": 8.0,
  "hostServiceFeeMin": 1000,
  "hostServiceFeeMax": 50000,
  "guestServiceFeePercent": 5.0,
  "guestServiceFeeMin": 500,
  "guestServiceFeeMax": 25000,
  "isActive": false,
  "appliesToBooking": true,
  "appliesToWithdrawal": true
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Revenue configuration created successfully",
  "data": {
    "id": "cme90cp7u0003u90nmvakexzu",
    "name": "Premium Configuration",
    "description": "Premium fee structure for high-end properties",
    "hostServiceFeePercent": 8,
    "hostServiceFeeMin": 1000,
    "hostServiceFeeMax": 50000,
    "guestServiceFeePercent": 5,
    "guestServiceFeeMin": 500,
    "guestServiceFeeMax": 25000,
    "isActive": false,
    "appliesToBooking": true,
    "appliesToWithdrawal": true,
    "createdAt": "2025-08-12T20:45:00.000Z",
    "updatedAt": "2025-08-12T20:45:00.000Z"
  }
}
```

#### 7.3 Update Revenue Configuration

**Request:**

```http
PUT /api/v1/revenue/configs/cme90cp7u0002u90nmvakexzu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Configuration",
  "description": "Updated fee structure with higher rates",
  "hostServiceFeePercent": 7.0,
  "hostServiceFeeMin": 0,
  "guestServiceFeePercent": 4.0,
  "guestServiceFeeMin": 0
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Revenue configuration updated successfully",
  "data": {
    "id": "cme90cp7u0002u90nmvakexzu",
    "name": "Updated Configuration",
    "description": "Updated fee structure with higher rates",
    "hostServiceFeePercent": 7,
    "hostServiceFeeMin": 0,
    "hostServiceFeeMax": null,
    "guestServiceFeePercent": 4,
    "guestServiceFeeMin": 0,
    "guestServiceFeeMax": null,
    "isActive": true,
    "appliesToBooking": true,
    "appliesToWithdrawal": false,
    "createdAt": "2025-08-12T20:42:30.954Z",
    "updatedAt": "2025-08-12T20:43:26.288Z"
  }
}
```

#### 7.4 Activate Revenue Configuration

**Request:**

```http
PUT /api/v1/revenue/configs/cme90cp7u0003u90nmvakexzu/activate
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Revenue configuration activated successfully",
  "data": {
    "id": "cme90cp7u0003u90nmvakexzu",
    "name": "Premium Configuration",
    "isActive": true,
    "updatedAt": "2025-08-12T20:50:00.000Z"
  }
}
```

#### 7.5 Get Fee Breakdown (Public)

**Request:**

```http
GET /api/v1/revenue/fee-breakdown?amount=100000&currency=XAF
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "originalAmount": 100000,
    "fees": {
      "host": {
        "percentage": 7,
        "amount": 7000,
        "description": "Host service fee (7%)"
      },
      "guest": {
        "percentage": 4,
        "amount": 4000,
        "description": "Guest service fee (4%)"
      }
    },
    "totals": {
      "guestPays": 104000,
      "hostReceives": 93000,
      "platformRevenue": 11000
    },
    "currency": "XAF"
  }
}
```

#### 7.6 Calculate Fees (Protected)

**Request:**

```http
POST /api/v1/revenue/calculate-fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150000,
  "currency": "XAF"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "originalAmount": 150000,
    "hostServiceFee": 10500,
    "guestServiceFee": 6000,
    "netAmountForHost": 139500,
    "totalAmountForGuest": 156000,
    "platformRevenue": 16500,
    "currency": "XAF"
  }
}
```

#### 7.7 Get Revenue Statistics

**Request:**

```http
GET /api/v1/revenue/stats?startDate=2025-08-01&endDate=2025-08-31
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 2500000,
    "hostFees": 175000,
    "guestFees": 75000,
    "withdrawalFees": 5000,
    "transactionCount": 25,
    "breakdown": {
      "HOST_FEE": 175000,
      "GUEST_FEE": 75000,
      "WITHDRAWAL_FEE": 5000
    },
    "period": {
      "start": "2025-08-01T00:00:00.000Z",
      "end": "2025-08-31T23:59:59.999Z"
    }
  }
}
```

#### 7.8 Get Current Month Revenue Stats

**Request:**

```http
GET /api/v1/revenue/stats/current-month
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 0,
    "hostFees": 0,
    "guestFees": 0,
    "withdrawalFees": 0,
    "transactionCount": 0,
    "breakdown": {
      "HOST_FEE": 0,
      "GUEST_FEE": 0,
      "WITHDRAWAL_FEE": 0
    },
    "period": {
      "start": "2025-07-31T23:00:00.000Z",
      "end": "2025-08-30T23:00:00.000Z",
      "month": 8,
      "year": 2025
    }
  }
}
```

### 8. Co-Host Management

Admins can manage co-host relationships across all properties on the platform. This includes viewing co-host assignments, managing permissions, and resolving disputes.

#### 8.1 Get All Co-Host Relationships

**Request:**

```http
GET /co-hosts/admin/all?status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by co-host status (PENDING, ACTIVE, SUSPENDED, REMOVED)
- `propertyId` (optional): Filter by specific property
- `hostId` (optional): Filter by specific host
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "coHosts": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "invitedBy": "cme6fo5xz0000u9mo5li7lln7",
        "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY"],
        "status": "ACTIVE",
        "notes": "Local property manager",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z",
        "acceptedAt": "2025-08-11T02:53:53.616Z",
        "user": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Manager",
          "email": "manager@example.com",
          "avatar": "uploads/avatar/manager.jpg"
        },
        "invitedByUser": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        },
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "address": "123 Beach Road",
          "city": "Limbe"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 8.2 Get Co-Host Statistics

**Request:**

```http
GET /co-hosts/admin/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalCoHosts": 15,
    "activeCoHosts": 12,
    "pendingInvitations": 3,
    "suspendedCoHosts": 0,
    "propertiesWithCoHosts": 8,
    "averageCoHostsPerProperty": 1.5,
    "topPermissionLevels": [
      {
        "permission": "MANAGE_BOOKINGS",
        "count": 10
      },
      {
        "permission": "MANAGE_PROPERTY",
        "count": 8
      },
      {
        "permission": "FULL_ACCESS",
        "count": 3
      }
    ],
    "recentActivity": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "action": "INVITATION_ACCEPTED",
        "coHostName": "Jane Manager",
        "propertyTitle": "Cozy Beachfront Villa",
        "timestamp": "2025-08-11T02:53:53.616Z"
      }
    ]
  }
}
```

#### 8.3 Admin Override Co-Host Permissions

**Request:**

```http
PUT /co-hosts/admin/{coHostId}/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["VIEW_ONLY"],
  "notes": "Admin override: Reduced permissions due to policy violation",
  "reason": "POLICY_VIOLATION"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host permissions updated by admin",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "permissions": ["VIEW_ONLY"],
    "notes": "Admin override: Reduced permissions due to policy violation",
    "updatedAt": "2025-08-11T02:53:53.616Z",
    "adminOverride": {
      "reason": "POLICY_VIOLATION",
      "adminId": "cme7bxjg60000u9kbzspc5gip",
      "timestamp": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 8.4 Admin Suspend Co-Host

**Request:**

```http
PUT /co-hosts/admin/{coHostId}/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "SERIOUS_POLICY_VIOLATION",
  "duration": "30_DAYS",
  "notes": "Suspended for inappropriate behavior"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host suspended by admin",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "status": "SUSPENDED",
    "suspendedAt": "2025-08-11T02:53:53.616Z",
    "suspensionDetails": {
      "reason": "SERIOUS_POLICY_VIOLATION",
      "duration": "30_DAYS",
      "adminId": "cme7bxjg60000u9kbzspc5gip",
      "notes": "Suspended for inappropriate behavior"
    }
  }
}
```

#### 8.5 Admin Remove Co-Host

**Request:**

```http
DELETE /co-hosts/admin/{coHostId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "REPEATED_VIOLATIONS",
  "notes": "Removed due to multiple policy violations"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host removed by admin",
  "data": {
    "removalDetails": {
      "reason": "REPEATED_VIOLATIONS",
      "adminId": "cme7bxjg60000u9kbzspc5gip",
      "timestamp": "2025-08-11T02:53:53.616Z",
      "notes": "Removed due to multiple policy violations"
    }
  }
}
```

#### 8.6 Get Co-Host Disputes

**Request:**

```http
GET /co-hosts/admin/disputes?status=OPEN&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by dispute status (OPEN, RESOLVED, ESCALATED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "coHostId": "cme6iqlan0000u9vp9mlbrpb6",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "reportedBy": "cme6fo5xz0000u9mo5li7lln7",
        "reason": "UNAUTHORIZED_ACCESS",
        "description": "Co-host accessed financial data without permission",
        "status": "OPEN",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z",
        "coHost": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Manager",
          "email": "manager@example.com"
        },
        "reporter": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        },
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 8.7 Resolve Co-Host Dispute

**Request:**

```http
PUT /co-hosts/admin/disputes/{disputeId}/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution": "SUSPEND_CO_HOST",
  "notes": "Co-host suspended for 30 days due to unauthorized access",
  "action": "SUSPEND"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Dispute resolved successfully",
  "data": {
    "dispute": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "status": "RESOLVED",
      "resolution": "SUSPEND_CO_HOST",
      "resolvedAt": "2025-08-11T02:53:53.616Z",
      "resolvedBy": "cme7bxjg60000u9kbzspc5gip"
    },
    "action": {
      "type": "SUSPEND",
      "coHostId": "cme6iqlan0000u9vp9mlbrpb6",
      "duration": "30_DAYS"
    }
  }
}
```

### 9. Favorites Management

Admins can view and manage user favorites across the platform.

#### 9.1 Get All User Favorites

**Request:**

```http
GET /favorites/admin/all?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `userId` (optional): Filter by specific user
- `propertyId` (optional): Filter by specific property
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "user": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "email": "guest@example.com"
        },
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "price": 75000,
          "currency": "XAF",
          "images": ["villa1.jpg", "villa2.jpg"]
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 9.2 Get Favorites Statistics

**Request:**

```http
GET /favorites/admin/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalFavorites": 150,
    "uniqueUsers": 45,
    "uniqueProperties": 25,
    "averageFavoritesPerUser": 3.3,
    "mostFavoritedProperties": [
      {
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "favoriteCount": 12
      }
    ],
    "topUsers": [
      {
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "firstName": "Jane",
        "lastName": "Guest",
        "favoriteCount": 8
      }
    ]
  }
}
```

### 10. Enquiry Management

Admins can view and manage property enquiries across the platform.

#### 10.1 Get All Enquiries

**Request:**

```http
GET /enquiries/admin/all?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by status (PENDING, RESPONDED, CLOSED)
- `propertyId` (optional): Filter by specific property
- `guestId` (optional): Filter by specific guest
- `hostId` (optional): Filter by specific host
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": "cme6itv8j0003u9i4x6c38wmq",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "guestId": "cme6iqlan0000u9vp9mlbrpb6",
        "hostId": "cme6fo5xz0000u9mo5li7lln7",
        "subject": "Availability for next weekend",
        "message": "Hi, I'm interested in booking your villa for next weekend. Is it available?",
        "status": "PENDING",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z",
        "guest": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "email": "guest@example.com"
        },
        "host": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        },
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "price": 75000,
          "currency": "XAF"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### 10.2 Get Enquiry Statistics

**Request:**

```http
GET /enquiries/admin/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalEnquiries": 85,
    "pendingEnquiries": 12,
    "respondedEnquiries": 65,
    "closedEnquiries": 8,
    "averageResponseTime": "2.5 hours",
    "responseRate": 85.9,
    "topProperties": [
      {
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "enquiryCount": 15
      }
    ],
    "recentActivity": [
      {
        "id": "cme6itv8j0003u9i4x6c38wmq",
        "action": "ENQUIRY_CREATED",
        "guestName": "Jane Guest",
        "propertyTitle": "Cozy Beachfront Villa",
        "timestamp": "2025-08-11T02:53:53.616Z"
      }
    ]
  }
}
```

### 11. Blog Management

#### 11.1 Get All Blogs

**Request:**

```http
GET /api/v1/blog?page=1&limit=10&status=PUBLISHED
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED, ALL)
- `tag` (optional): Filter by tag slug
- `search` (optional): Search in title, content, or excerpt

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "cme91ihxg0001u9ce9l7qsd6l",
        "title": "Top 10 Travel Destinations in Cameroon",
        "slug": "top-10-travel-destinations-cameroon",
        "excerpt": "Discover the most beautiful and exciting places to visit in Cameroon",
        "featuredImage": null,
        "status": "PUBLISHED",
        "publishedAt": "2025-08-12T21:15:01.058Z",
        "viewCount": 0,
        "createdAt": "2025-08-12T21:15:01.060Z",
        "updatedAt": "2025-08-12T21:15:01.060Z",
        "author": {
          "id": "cme7bxjg60000u9kbzspc5gip",
          "firstName": "Admin",
          "lastName": "User",
          "avatar": null
        },
        "tags": [
          {
            "id": "cme91epzr0001u9cpnephefdr",
            "name": "Travel Tips",
            "slug": "travel-tips"
          }
        ],
        "_count": {
          "comments": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 11.2 Create Blog Post

**Request:**

```http
POST /api/v1/blog
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Top 10 Travel Destinations in Cameroon",
  "slug": "top-10-travel-destinations-cameroon",
  "excerpt": "Discover the most beautiful and exciting places to visit in Cameroon",
  "content": "Cameroon is a beautiful country with diverse landscapes and cultures. Here are the top 10 destinations you must visit...",
  "featuredImage": "https://example.com/image.jpg",
  "status": "PUBLISHED",
  "tagIds": ["cme91epzr0001u9cpnephefdr"]
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "id": "cme91ihxg0001u9ce9l7qsd6l",
    "title": "Top 10 Travel Destinations in Cameroon",
    "slug": "top-10-travel-destinations-cameroon",
    "excerpt": "Discover the most beautiful and exciting places to visit in Cameroon",
    "content": "Cameroon is a beautiful country with diverse landscapes and cultures. Here are the top 10 destinations you must visit...",
    "featuredImage": "https://example.com/image.jpg",
    "status": "PUBLISHED",
    "publishedAt": "2025-08-12T21:15:01.058Z",
    "viewCount": 0,
    "createdAt": "2025-08-12T21:15:01.060Z",
    "updatedAt": "2025-08-12T21:15:01.060Z",
    "author": {
      "id": "cme7bxjg60000u9kbzspc5gip",
      "firstName": "Admin",
      "lastName": "User"
    },
    "tags": [
      {
        "id": "cme91epzr0001u9cpnephefdr",
        "name": "Travel Tips",
        "slug": "travel-tips",
        "createdAt": "2025-08-12T21:12:04.887Z",
        "updatedAt": "2025-08-12T21:12:04.887Z"
      }
    ]
  }
}
```

#### 8.3 Update Blog Post

**Request:**

```http
PUT /api/v1/blog/cme91ihxg0001u9ce9l7qsd6l
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated: Top 10 Travel Destinations in Cameroon",
  "content": "Updated content with more details...",
  "status": "PUBLISHED"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Blog updated successfully",
  "data": {
    "id": "cme91ihxg0001u9ce9l7qsd6l",
    "title": "Updated: Top 10 Travel Destinations in Cameroon",
    "slug": "top-10-travel-destinations-cameroon",
    "content": "Updated content with more details...",
    "status": "PUBLISHED",
    "updatedAt": "2025-08-12T21:20:00.000Z"
  }
}
```

#### 8.4 Delete Blog Post

**Request:**

```http
DELETE /api/v1/blog/cme91ihxg0001u9ce9l7qsd6l
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

#### 8.5 Get All Blog Tags

**Request:**

```http
GET /api/v1/blog/tags
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cme91epzr0001u9cpnephefdr",
      "name": "Travel Tips",
      "slug": "travel-tips",
      "createdAt": "2025-08-12T21:12:04.887Z",
      "updatedAt": "2025-08-12T21:12:04.887Z",
      "_count": {
        "blogs": 1
      }
    }
  ]
}
```

#### 8.6 Create Blog Tag

**Request:**

```http
POST /api/v1/blog/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Travel Tips",
  "slug": "travel-tips"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "id": "cme91epzr0001u9cpnephefdr",
    "name": "Travel Tips",
    "slug": "travel-tips",
    "createdAt": "2025-08-12T21:12:04.887Z",
    "updatedAt": "2025-08-12T21:12:04.887Z"
  }
}
```

#### 8.7 Moderate Blog Comment

**Request:**

```http
PUT /api/v1/blog/comments/cme91comment0001u9ce9l7qsd6l/moderate
Authorization: Bearer <token>
Content-Type: application/json

{
  "isApproved": true
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Comment approved successfully",
  "data": {
    "id": "cme91comment0001u9ce9l7qsd6l",
    "content": "Great article! Very helpful.",
    "isApproved": true,
    "createdAt": "2025-08-12T21:25:00.000Z",
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Guest",
      "avatar": null
    }
  }
}
```

### 9. Help Center Management

#### 9.1 Get All Help Articles

**Request:**

```http
GET /api/v1/help-center?page=1&limit=10&category=GETTING_STARTED&isPublished=true
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `search` (optional): Search in title or content
- `isPublished` (optional): Filter by publication status (true/false)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "cme91iv7c0003u9cewtn6b4ys",
        "title": "How to Book Your First Property",
        "slug": "how-to-book-first-property",
        "content": "Booking your first property on Room Finder is easy! Follow these simple steps...",
        "category": "GETTING_STARTED",
        "priority": "HIGH",
        "isPublished": true,
        "viewCount": 0,
        "helpfulCount": 0,
        "notHelpfulCount": 0,
        "createdAt": "2025-08-12T21:15:18.264Z",
        "updatedAt": "2025-08-12T21:15:18.264Z",
        "author": {
          "id": "cme7bxjg60000u9kbzspc5gip",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 9.2 Create Help Article

**Request:**

```http
POST /api/v1/help-center
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How to Book Your First Property",
  "slug": "how-to-book-first-property",
  "content": "Booking your first property on Room Finder is easy! Follow these simple steps...",
  "category": "GETTING_STARTED",
  "priority": "HIGH",
  "isPublished": true
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": "cme91iv7c0003u9cewtn6b4ys",
    "title": "How to Book Your First Property",
    "slug": "how-to-book-first-property",
    "content": "Booking your first property on Room Finder is easy! Follow these simple steps...",
    "category": "GETTING_STARTED",
    "priority": "HIGH",
    "isPublished": true,
    "viewCount": 0,
    "helpfulCount": 0,
    "notHelpfulCount": 0,
    "createdAt": "2025-08-12T21:15:18.264Z",
    "updatedAt": "2025-08-12T21:15:18.264Z",
    "author": {
      "id": "cme7bxjg60000u9kbzspc5gip",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

#### 9.3 Update Help Article

**Request:**

```http
PUT /api/v1/help-center/cme91iv7c0003u9cewtn6b4ys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated: How to Book Your First Property",
  "content": "Updated content with more detailed steps...",
  "priority": "CRITICAL"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Article updated successfully",
  "data": {
    "id": "cme91iv7c0003u9cewtn6b4ys",
    "title": "Updated: How to Book Your First Property",
    "content": "Updated content with more detailed steps...",
    "priority": "CRITICAL",
    "updatedAt": "2025-08-12T21:25:00.000Z"
  }
}
```

#### 9.4 Delete Help Article

**Request:**

```http
DELETE /api/v1/help-center/cme91iv7c0003u9cewtn6b4ys
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

#### 9.5 Get Help Center Statistics

**Request:**

```http
GET /api/v1/help-center/stats/overview
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalArticles": 1,
    "publishedArticles": 1,
    "draftArticles": 0,
    "categoryStats": [
      {
        "_count": {
          "id": 1
        },
        "category": "GETTING_STARTED"
      }
    ],
    "priorityStats": [
      {
        "_count": {
          "id": 1
        },
        "priority": "HIGH"
      }
    ],
    "topArticles": [
      {
        "id": "cme91iv7c0003u9cewtn6b4ys",
        "title": "How to Book Your First Property",
        "slug": "how-to-book-first-property",
        "viewCount": 0,
        "helpfulCount": 0,
        "category": "GETTING_STARTED"
      }
    ]
  }
}
```

### 10. System Administration

#### 10.1 Get System Health

**Request:**

```http
GET /admin/system/health
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": "72h 15m 30s",
    "memoryUsage": "45%",
    "cpuUsage": "12%",
    "activeConnections": 25,
    "lastBackup": "2025-08-10T23:00:00.000Z"
  }
}
```

#### 10.2 Get System Logs

**Request:**

```http
GET /admin/system/logs?level=ERROR&page=1&limit=50
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "level": "ERROR",
        "message": "Database connection failed",
        "timestamp": "2025-08-11T02:53:53.616Z",
        "userId": "cme6fo5xz0000u9mo5li7lln7",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 50,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 9. Notifications Management

#### 9.1 Send System Notification

**Request:**

```http
POST /admin/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "SYSTEM_ANNOUNCEMENT",
  "title": "Platform Maintenance",
  "body": "Scheduled maintenance on August 15th from 2-4 AM",
  "targetUsers": "ALL", // ALL, HOSTS, GUESTS, or specific user IDs
  "priority": "HIGH"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "System notification sent successfully",
  "data": {
    "notification": {
      "id": "cme6sysnotif0001u9i4x6c38wmq",
      "type": "SYSTEM_ANNOUNCEMENT",
      "title": "Platform Maintenance",
      "body": "Scheduled maintenance on August 15th from 2-4 AM",
      "targetUsers": "ALL",
      "priority": "HIGH",
      "sentAt": "2025-08-11T02:53:53.616Z",
      "recipientsCount": 150
    }
  }
}
```

#### 9.2 Get Notification Statistics

**Request:**

```http
GET /admin/notifications/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalNotifications": 500,
    "sentToday": 25,
    "deliveryRate": 98.5,
    "byType": {
      "SYSTEM_ANNOUNCEMENT": 50,
      "BOOKING_CONFIRMED": 200,
      "PAYMENT_RECEIVED": 150,
      "REVIEW_RECEIVED": 100
    },
    "byPriority": {
      "HIGH": 75,
      "MEDIUM": 300,
      "LOW": 125
    }
  }
}
```

### 15. Fapshi Payment Configuration

Admins can configure Fapshi payment settings for collection and disbursement services.

#### 15.1 Get All Fapshi Configurations

**Request:**

```http
GET /fapshi-config
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cmebc65sz0000u996m8xakb5g",
      "serviceType": "COLLECTION",
      "isActive": true,
      "apiKey": "test_api_key_123",
      "apiUser": "test_user_123",
      "webhookUrl": "https://roomfinder.com/webhook/fapshi",
      "environment": "SANDBOX",
      "createdAt": "2025-08-14T11:48:53.603Z",
      "updatedAt": "2025-08-14T11:48:53.603Z"
    },
    {
      "id": "cmebc6b560001u9966bh1crsl",
      "serviceType": "DISBURSEMENT",
      "isActive": true,
      "apiKey": "disbursement_api_key_123",
      "apiUser": "disbursement_user_123",
      "webhookUrl": "https://roomfinder.com/webhook/fapshi/disbursement",
      "environment": "SANDBOX",
      "createdAt": "2025-08-14T11:49:00.522Z",
      "updatedAt": "2025-08-14T11:49:00.522Z"
    }
  ]
}
```

#### 15.2 Get Fapshi Configuration Statistics

**Request:**

```http
GET /fapshi-config/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "total": 2,
    "active": 2,
    "inactive": 0,
    "byServiceType": {
      "COLLECTION": { "total": 1, "active": 1, "inactive": 0 },
      "DISBURSEMENT": { "total": 1, "active": 1, "inactive": 0 }
    },
    "byEnvironment": {
      "SANDBOX": { "total": 2, "active": 2, "inactive": 0 },
      "PRODUCTION": { "total": 0, "active": 0, "inactive": 0 }
    }
  }
}
```

#### 15.3 Get Fapshi Configuration by Service Type and Environment

**Request:**

```http
GET /fapshi-config/COLLECTION/SANDBOX
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "cmebc65sz0000u996m8xakb5g",
    "serviceType": "COLLECTION",
    "isActive": true,
    "apiKey": "test_api_key_123",
    "apiUser": "test_user_123",
    "webhookUrl": "https://roomfinder.com/webhook/fapshi",
    "environment": "SANDBOX",
    "createdAt": "2025-08-14T11:48:53.603Z",
    "updatedAt": "2025-08-14T11:48:53.603Z"
  }
}
```

#### 15.4 Create or Update Fapshi Configuration

**Request:**

```http
POST /fapshi-config
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceType": "COLLECTION",
  "environment": "PRODUCTION",
  "apiKey": "live_api_key_456",
  "apiUser": "live_user_456",
  "webhookUrl": "https://roomfinder.com/webhook/fapshi/live",
  "isActive": true
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Fapshi COLLECTION configuration updated successfully",
  "data": {
    "id": "cmebc65sz0000u996m8xakb5g",
    "serviceType": "COLLECTION",
    "isActive": true,
    "apiKey": "live_api_key_456",
    "apiUser": "live_user_456",
    "webhookUrl": "https://roomfinder.com/webhook/fapshi/live",
    "environment": "PRODUCTION",
    "createdAt": "2025-08-14T11:48:53.603Z",
    "updatedAt": "2025-08-14T11:48:53.603Z"
  }
}
```

#### 15.5 Update Fapshi Configuration

**Request:**

```http
PUT /fapshi-config/cmebc65sz0000u996m8xakb5g
Authorization: Bearer <token>
Content-Type: application/json

{
  "apiKey": "updated_api_key_789",
  "apiUser": "updated_user_789",
  "webhookUrl": "https://roomfinder.com/webhook/fapshi/updated",
  "isActive": false
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Fapshi configuration updated successfully",
  "data": {
    "id": "cmebc65sz0000u996m8xakb5g",
    "serviceType": "COLLECTION",
    "isActive": false,
    "apiKey": "updated_api_key_789",
    "apiUser": "updated_user_789",
    "webhookUrl": "https://roomfinder.com/webhook/fapshi/updated",
    "environment": "PRODUCTION",
    "createdAt": "2025-08-14T11:48:53.603Z",
    "updatedAt": "2025-08-14T11:49:30.000Z"
  }
}
```

#### 15.6 Toggle Fapshi Configuration Status

**Request:**

```http
PATCH /fapshi-config/cmebc65sz0000u996m8xakb5g/toggle
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Fapshi COLLECTION configuration activated successfully",
  "data": {
    "id": "cmebc65sz0000u996m8xakb5g",
    "serviceType": "COLLECTION",
    "isActive": true,
    "apiKey": "updated_api_key_789",
    "apiUser": "updated_user_789",
    "webhookUrl": "https://roomfinder.com/webhook/fapshi/updated",
    "environment": "PRODUCTION",
    "createdAt": "2025-08-14T11:48:53.603Z",
    "updatedAt": "2025-08-14T11:49:45.000Z"
  }
}
```

#### 15.7 Test Fapshi Configuration

**Request:**

```http
POST /fapshi-config/cmebc65sz0000u996m8xakb5g/test
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Fapshi configuration test completed",
  "data": {
    "config": {
      "serviceType": "COLLECTION",
      "environment": "PRODUCTION",
      "isActive": true
    },
    "testResult": {
      "success": true,
      "message": "Connection successful",
      "data": {
        "balance": 50000,
        "currency": "XAF"
      }
    }
  }
}
```

#### 15.8 Delete Fapshi Configuration

**Request:**

```http
DELETE /fapshi-config/cmebc65sz0000u996m8xakb5g
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Fapshi configuration deleted successfully"
}
```

### Fapshi Service Types

- `COLLECTION` - For collecting payments from guests
- `DISBURSEMENT` - For paying out to hosts

### Fapshi Environments

- `SANDBOX` - Testing environment
- `PRODUCTION` - Live environment

## Error Responses

### Common Error Codes

**400 - Bad Request:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "userId": "User ID is required",
    "status": "Invalid status value"
  }
}
```

**401 - Unauthorized:**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

**403 - Forbidden:**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin privileges required"
}
```

**404 - Not Found:**

```json
{
  "success": false,
  "message": "User not found",
  "error": "User does not exist"
}
```

**500 - Internal Server Error:**

```json
{
  "success": false,
  "message": "Database error",
  "error": "An error occurred while processing your request"
}
```

## User Roles

- `GUEST` - Regular user who can book properties
- `HOST` - Property owner who can list and manage properties
- `ADMIN` - Platform administrator with full access

## Host Approval Statuses

- `PENDING` - Application submitted, awaiting review
- `APPROVED` - Application approved, user can host
- `REJECTED` - Application rejected
- `SUSPENDED` - Host privileges suspended

## Booking Statuses

- `PENDING` - Awaiting host confirmation
- `CONFIRMED` - Host has confirmed the booking
- `COMPLETED` - Stay has been completed
- `CANCELLED` - Booking has been cancelled
- `REFUNDED` - Payment has been refunded

## Notification Types

- `SYSTEM_ANNOUNCEMENT` - Platform-wide announcements
- `BOOKING_CONFIRMED` - Booking confirmation
- `PAYMENT_RECEIVED` - Payment confirmation
- `REVIEW_RECEIVED` - New review notification
- `HOST_APPROVED` - Host application approved
- `HOST_REJECTED` - Host application rejected

## 10. Booking Process Flow (Admin Perspective)

### Complete Booking Process Overview

This section details the booking process from an admin's perspective, including system monitoring, payment processing, and revenue management.

#### 10.1 System Monitoring

**Real-time Dashboard Overview:**

```http
GET /api/v1/admin/dashboard-stats
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalProperties": 89,
    "totalBookings": 456,
    "pendingBookings": 23,
    "confirmedBookings": 398,
    "cancelledBookings": 35,
    "totalRevenue": 67500000,
    "platformFees": 3375000,
    "monthlyRevenue": 12500000,
    "activeHosts": 67,
    "pendingHostApprovals": 12
  }
}
```

#### 10.2 Booking Flow Monitoring

**Step 1: Booking Creation**

- Guest creates booking → Status: `PENDING`
- System logs booking creation
- Admin can view in booking management

**Step 2: Payment Initiation**

- Guest initiates payment → Payment Status: `PENDING`
- Fapshi processes payment request
- System logs payment initiation

**Step 3: Payment Processing**

- Fapshi sends webhook → Payment Status: `COMPLETED`
- System automatically:
  - Updates booking status to `CONFIRMED`
  - Credits host wallet (95% of amount)
  - Records platform revenue (5% of amount)
  - Creates transaction records

**Step 4: Host Payout**

- Host requests payout → System processes via Fapshi
- Money sent to host's mobile money account
- Transaction recorded in system

#### 10.3 Payment Processing Monitoring

**Monitor Payment Status:**

```http
GET /api/v1/admin/bookings?paymentStatus=COMPLETED&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cme7md4iw0001u90n81c0jqlj",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "guestId": "cme6fo5xz0000u9mo5li7lln7",
        "hostId": "cme6fo5xz0000u9mo5li7lln7",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-17T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 150000,
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "paymentMethod": "MOBILE_MONEY",
        "paymentReference": "ABC123XYZ",
        "transactionId": "FIN456789",
        "createdAt": "2025-08-14T19:30:00.000Z",
        "updatedAt": "2025-08-14T19:35:00.000Z",
        "property": {
          "title": "Beach Villa",
          "address": "123 Beach Road"
        },
        "guest": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "host": {
          "firstName": "Host",
          "lastName": "Name",
          "email": "host@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalItems": 500
    }
  }
}
```

#### 10.4 Revenue Management

**Platform Revenue Tracking:**

```http
GET /api/v1/admin/revenue?startDate=2025-08-01&endDate=2025-08-31
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 12500000,
    "platformFees": 625000,
    "hostPayouts": 11875000,
    "pendingPayouts": 475000,
    "revenueBreakdown": {
      "bookingFees": 625000,
      "withdrawalFees": 0,
      "otherFees": 0
    },
    "monthlyTrend": [
      {
        "month": "August 2025",
        "revenue": 12500000,
        "fees": 625000
      }
    ]
  }
}
```

**Revenue Configuration Management:**

```http
GET /api/v1/admin/revenue-config
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hostServiceFeePercent": 5.0,
    "hostServiceFeeMin": 0,
    "hostServiceFeeMax": null,
    "guestServiceFeePercent": 3.0,
    "guestServiceFeeMin": 0,
    "guestServiceFeeMax": null,
    "isActive": true,
    "appliesToBooking": true,
    "appliesToWithdrawal": false
  }
}
```

#### 10.5 Fapshi Integration Monitoring

**Fapshi Configuration Status:**

```http
GET /api/v1/admin/fapshi-config
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "config-id-1",
      "serviceType": "COLLECTION",
      "isActive": true,
      "environment": "PRODUCTION",
      "apiKey": "FAK_925bc0c9772829017a4d26455f72d069",
      "apiUser": "8d643e25-76de-4296-9490-77af285644b5",
      "webhookUrl": "https://roomfinder.com/api/v1/payments/webhook",
      "createdAt": "2025-08-14T18:49:07.564Z"
    },
    {
      "id": "config-id-2",
      "serviceType": "DISBURSEMENT",
      "isActive": true,
      "environment": "PRODUCTION",
      "apiKey": "FAK_9c13f1ce7786468b56ce36ca0b6c59f2",
      "apiUser": "b0a41145-920c-4b63-adb6-01381493bf76",
      "webhookUrl": "https://roomfinder.com/api/v1/payments/webhook",
      "createdAt": "2025-08-14T18:49:22.520Z"
    }
  ]
}
```

**Test Fapshi Configuration:**

```http
POST /api/v1/admin/fapshi-config/{configId}/test
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Fapshi configuration test successful",
  "data": {
    "serviceType": "COLLECTION",
    "environment": "PRODUCTION",
    "testResult": "SUCCESS",
    "balance": 5000000,
    "lastTested": "2025-08-14T20:00:00.000Z"
  }
}
```

#### 10.6 Transaction Monitoring

**View All Transactions:**

```http
GET /api/v1/admin/transactions?type=PAYMENT&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 150000,
        "currency": "XAF",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for booking cme7md4iw0001u90n81c0jqlj",
        "reference": "ABC123XYZ",
        "metadata": {
          "medium": "mobile money",
          "payerName": "John Doe",
          "email": "john@example.com",
          "financialTransId": "FIN456789"
        },
        "createdAt": "2025-08-14T19:35:00.000Z",
        "booking": {
          "id": "cme7md4iw0001u90n81c0jqlj",
          "property": {
            "title": "Beach Villa"
          }
        },
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000
    }
  }
}
```

#### 10.7 Platform Revenue Tracking

**Platform Revenue Details:**

```http
GET /api/v1/admin/platform-revenue?startDate=2025-08-01&endDate=2025-08-31
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 625000,
    "revenueBreakdown": [
      {
        "revenueType": "BOOKING_FEE",
        "amount": 625000,
        "count": 125,
        "percentage": 100
      }
    ],
    "monthlyTrend": [
      {
        "month": "August 2025",
        "revenue": 625000,
        "transactions": 125
      }
    ],
    "topRevenueSources": [
      {
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "propertyTitle": "Beach Villa",
        "revenue": 75000,
        "bookings": 15
      }
    ]
  }
}
```

#### 10.8 System Health Monitoring

**Payment System Status:**

```http
GET /api/v1/admin/system-health
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "paymentSystem": {
      "status": "HEALTHY",
      "fapshiCollection": "ACTIVE",
      "fapshiDisbursement": "ACTIVE",
      "webhookEndpoint": "ACTIVE",
      "lastWebhookReceived": "2025-08-14T19:35:00.000Z"
    },
    "database": {
      "status": "HEALTHY",
      "connectionPool": "ACTIVE",
      "lastBackup": "2025-08-14T18:00:00.000Z"
    },
    "notifications": {
      "email": "ACTIVE",
      "sms": "INACTIVE",
      "push": "INACTIVE"
    }
  }
}
```

### Admin Responsibilities

**System Monitoring:**

- Monitor booking flow and payment processing
- Track platform revenue and fee collection
- Ensure Fapshi integration is functioning properly
- Monitor system health and performance

**Revenue Management:**

- Configure platform fee percentages
- Monitor revenue trends and analytics
- Handle payment disputes and refunds
- Manage host payout processes

**Support & Troubleshooting:**

- Handle payment processing issues
- Resolve booking disputes
- Support hosts with payout problems
- Monitor and fix system errors

### Error Handling & Troubleshooting

**Common Issues:**

- **Payment Failures**: Monitor failed payments and investigate causes
- **Webhook Issues**: Check webhook endpoint status and Fapshi configuration
- **Host Payout Problems**: Verify host wallet balances and payout status
- **System Errors**: Monitor logs and resolve technical issues

**Admin Actions:**

- Review transaction logs for discrepancies
- Test Fapshi configuration when issues arise
- Contact Fapshi support for payment gateway problems
- Update system configuration as needed

### Security & Compliance

**Data Protection:**

- All payment data encrypted and secure
- Transaction logs maintained for audit purposes
- User data protected according to privacy regulations
- Secure API access with proper authentication

**Fraud Prevention:**

- Monitor for suspicious payment patterns
- Verify transaction authenticity with Fapshi
- Implement rate limiting on payment endpoints
- Regular security audits and updates

### Analytics & Reporting

**Key Metrics to Monitor:**

- Daily/Monthly booking volume
- Payment success rates
- Platform revenue trends
- Host payout statistics
- User growth and retention

**Reporting Tools:**

- Real-time dashboard analytics
- Revenue and transaction reports
- User activity monitoring
- System performance metrics

This comprehensive booking process monitoring ensures admins can effectively manage the platform, track revenue, and maintain system reliability while providing support to both guests and hosts.
