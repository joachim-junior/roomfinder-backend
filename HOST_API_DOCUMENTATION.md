# Room Finder Host API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Host Application Management](#host-application-management)
3. [Host Profile Management](#host-profile-management)
4. [Property Management](#property-management)
5. [Co-Host Management](#co-host-management)
6. [Booking Management](#booking-management)
7. [Host Dashboard & Analytics](#host-dashboard--analytics)
8. [Earnings & Revenue](#earnings--revenue)
9. [Reviews Management](#reviews-management)
10. [Enquiry Management](#enquiry-management)
11. [Favorites Management](#favorites-management)
12. [Notifications](#notifications)
13. [Push Notifications](#push-notifications)
14. [File Upload](#file-upload)

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Authentication

#### 1.1 Host Registration

**Request:**

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Host",
  "email": "host@example.com",
  "password": "password123",
  "phone": "+237612345678",
  "role": "HOST"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "role": "HOST",
      "isVerified": false,
      "avatar": null,
      "createdAt": "2025-08-11T01:28:01.559Z",
      "updatedAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

#### 1.2 Host Login

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "host@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Login successful",
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
      "createdAt": "2025-08-11T01:28:01.559Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU2Zm81eHowMDAwdTltbzVsaTdsbG43IiwiaWF0IjoxNzU0ODgxMTIxLCJleHAiOjE3NTU0ODU5MjF9.K04-PZmwPn-0sveaRzbotYuIR2wp0wDTAtU0iQgJbN4"
  }
}
```

### 2. Host Application Management

#### 2.1 Submit Host Application

**Request:**

```http
POST /host-applications/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "I have experience managing vacation rentals and would like to list my properties on your platform."
}
```

**Request Body Fields:**

- `notes` (optional): Additional notes about your application (max 1000 characters)

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Host application submitted successfully. We will review your application and contact you soon.",
  "data": {
    "id": "cme6hostapp0001u9i4x6c38wmq",
    "userId": "cme6fo5xz0000u9mo5li7lln7",
    "status": "PENDING",
    "notes": "I have experience managing vacation rentals and would like to list my properties on your platform.",
    "applicationDate": "2025-08-11T01:28:01.559Z",
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z"
  }
}
```

**Error Responses:**

**Already Applied (400):**

```json
{
  "success": false,
  "message": "You have already submitted a host application"
}
```

**Invalid Role (403):**

```json
{
  "success": false,
  "message": "Only guests can submit host applications"
}
```

#### 2.2 Get Application Status

**Request:**

```http
GET /host-applications/status
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "cme6hostapp0001u9i4x6c38wmq",
    "userId": "cme6fo5xz0000u9mo5li7lln7",
    "status": "PENDING",
    "notes": "I have experience managing vacation rentals and would like to list my properties on your platform.",
    "applicationDate": "2025-08-11T01:28:01.559Z",
    "approvalDate": null,
    "approvalNotes": null,
    "rejectionDate": null,
    "rejectionReason": null,
    "rejectionNotes": null,
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z"
  }
}
```

**Response for No Application (200):**

```json
{
  "success": true,
  "data": null
}
```

### 3. Host Profile Management

#### 3.1 Get Host Profile

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
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "role": "HOST",
      "isVerified": true,
      "avatar": null,
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

#### 3.2 Update Host Profile

**Request:**

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Host",
  "phone": "+237612345678",
  "avatar": "uploads/avatar/host-avatar.jpg"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "role": "HOST",
      "isVerified": true,
      "avatar": "uploads/avatar/host-avatar.jpg",
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

### 4. Property Management

#### 4.1 Create Property

**Request:**

```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cozy Beachfront Villa",
  "description": "Beautiful villa with stunning ocean views, private beach access, and modern amenities.",
  "type": "VILLA",
  "address": "123 Beach Road",
  "city": "Limbe",
  "state": "Southwest",
  "country": "Cameroon",
  "zipCode": "12345",
  "latitude": 4.0095,
  "longitude": 9.2085,
  "price": 75000,
  "currency": "XAF",
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["WiFi", "Air Conditioning", "Kitchen", "Pool", "Beach Access"],
  "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"]
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "description": "Beautiful villa with stunning ocean views, private beach access, and modern amenities.",
      "type": "VILLA",
      "address": "123 Beach Road",
      "city": "Limbe",
      "state": "Southwest",
      "country": "Cameroon",
      "zipCode": "12345",
      "latitude": 4.0095,
      "longitude": 9.2085,
      "price": 75000,
      "currency": "XAF",
      "bedrooms": 3,
      "bathrooms": 2,
      "maxGuests": 6,
      "amenities": [
        "WiFi",
        "Air Conditioning",
        "Kitchen",
        "Pool",
        "Beach Access"
      ],
      "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"],
      "isAvailable": true,
      "isVerified": false,
      "host": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Host",
        "email": "host@example.com",
        "phone": "+237612345678",
        "isVerified": true
      },
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 4.2 Get Host Properties

**Request:**

```http
GET /properties/host/my-properties?page=1&limit=10
Authorization: Bearer <token>
```

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
        "bedrooms": 3,
        "bathrooms": 2,
        "maxGuests": 6,
        "amenities": [
          "WiFi",
          "Air Conditioning",
          "Kitchen",
          "Pool",
          "Beach Access"
        ],
        "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"],
        "isAvailable": true,
        "isVerified": true,
        "reviews": {
          "averageRating": 4.5,
          "totalReviews": 5
        },
        "bookings": {
          "totalBookings": 3
        },
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z"
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

#### 4.3 Get Property by ID (Host's Property)

**Request:**

```http
GET /properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "description": "Beautiful villa with stunning ocean views",
      "type": "VILLA",
      "address": "123 Beach Road",
      "city": "Limbe",
      "state": "Southwest",
      "country": "Cameroon",
      "zipCode": "12345",
      "latitude": 4.0095,
      "longitude": 9.2085,
      "price": 75000,
      "currency": "XAF",
      "bedrooms": 3,
      "bathrooms": 2,
      "maxGuests": 6,
      "amenities": [
        "WiFi",
        "Air Conditioning",
        "Kitchen",
        "Pool",
        "Beach Access"
      ],
      "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"],
      "isAvailable": true,
      "isVerified": true,
      "host": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Host",
        "email": "host@example.com",
        "phone": "+237612345678",
        "isVerified": true
      },
      "reviews": {
        "averageRating": 4.5,
        "totalReviews": 5
      },
      "bookings": {
        "totalBookings": 3
      },
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 4.4 Update Property

**Request:**

```http
PUT /properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Villa Title",
  "price": 80000,
  "isAvailable": true
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Updated Villa Title",
      "price": 80000,
      "isAvailable": true,
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 4.5 Delete Property

**Request:**

```http
DELETE /properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

#### 4.6 Get Host Property Stats

**Request:**

```http
GET /properties/host/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalProperties": 3,
    "availableProperties": 2,
    "totalBookings": 15,
    "averageRating": 4.5,
    "totalEarnings": 2250000,
    "monthlyEarnings": 450000
  }
}
```

### 5. Co-Host Management

The co-host system allows property owners to invite other users to help manage their properties with different permission levels. This is useful for family properties, business properties, or when you need local managers.

#### 5.1 Get Property Co-Hosts

**Request:**

```http
GET /co-hosts/property/{propertyId}
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by co-host status (PENDING, ACTIVE, SUSPENDED, REMOVED)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
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
        "address": "123 Beach Road"
      }
    }
  ]
}
```

#### 5.2 Invite Co-Host

**Request:**

```http
POST /co-hosts/property/{propertyId}/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "co-host@example.com",
  "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY"],
  "notes": "Please help manage this property"
}
```

**Permission Levels:**

- `VIEW_ONLY` - Can only view property details
- `MANAGE_BOOKINGS` - Can manage bookings, respond to messages
- `MANAGE_PROPERTY` - Can edit property details, photos, pricing
- `MANAGE_FINANCES` - Can view earnings, manage payouts
- `FULL_ACCESS` - Full access like the primary host

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Co-host invitation sent successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "propertyId": "cme6itqoo0001u9i4x6c38wmq",
    "userId": "cme6iqlan0000u9vp9mlbrpb6",
    "invitedBy": "cme6fo5xz0000u9mo5li7lln7",
    "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY"],
    "status": "PENDING",
    "notes": "Please help manage this property",
    "createdAt": "2025-08-11T02:53:53.616Z",
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Manager",
      "email": "co-host@example.com",
      "avatar": null
    },
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "address": "123 Beach Road"
    }
  }
}
```

#### 5.3 Update Co-Host Permissions

**Request:**

```http
PUT /co-hosts/{coHostId}/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY", "MANAGE_FINANCES"],
  "notes": "Updated permissions for financial management"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host permissions updated successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY", "MANAGE_FINANCES"],
    "notes": "Updated permissions for financial management",
    "updatedAt": "2025-08-11T02:53:53.616Z",
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Manager",
      "email": "manager@example.com",
      "avatar": "uploads/avatar/manager.jpg"
    },
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa"
    }
  }
}
```

#### 5.4 Suspend Co-Host

**Request:**

```http
PUT /co-hosts/{coHostId}/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Temporary suspension due to policy violation"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host suspended successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "status": "SUSPENDED",
    "notes": "Temporary suspension due to policy violation",
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Manager",
      "email": "manager@example.com"
    }
  }
}
```

#### 5.5 Reactivate Co-Host

**Request:**

```http
PUT /co-hosts/{coHostId}/reactivate
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host reactivated successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "status": "ACTIVE",
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Manager",
      "email": "manager@example.com"
    }
  }
}
```

#### 5.6 Remove Co-Host

**Request:**

```http
DELETE /co-hosts/{coHostId}
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host removed successfully"
}
```

#### 5.7 Check Co-Host Permissions

**Request:**

```http
GET /co-hosts/permissions/{propertyId}?action=manage_bookings
Authorization: Bearer <token>
```

**Query Parameters:**

- `action` (required): The action to check permissions for (view, manage_bookings, manage_property, manage_finances)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "hasPermission": true,
    "role": "CO_HOST",
    "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY"]
  }
}
```

**Response for Primary Host:**

```json
{
  "success": true,
  "data": {
    "hasPermission": true,
    "role": "PRIMARY_HOST",
    "permissions": ["FULL_ACCESS"]
  }
}
```

**Response for No Access:**

```json
{
  "success": true,
  "data": {
    "hasPermission": false,
    "role": "NONE",
    "permissions": []
  }
}
```

#### 5.8 Get My Co-Host Invitations

**Request:**

```http
GET /co-hosts/invitations?status=PENDING
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by invitation status (PENDING, ACTIVE, SUSPENDED, REMOVED)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "propertyId": "cme6itqoo0001u9i4x6c38wmq",
      "userId": "cme6iqlan0000u9vp9mlbrpb6",
      "invitedBy": "cme6fo5xz0000u9mo5li7lln7",
      "permissions": ["MANAGE_BOOKINGS", "MANAGE_PROPERTY"],
      "status": "PENDING",
      "notes": "Please help manage this property",
      "createdAt": "2025-08-11T02:53:53.616Z",
      "property": {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "address": "123 Beach Road",
        "city": "Limbe",
        "images": ["villa1.jpg", "villa2.jpg"],
        "host": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        }
      },
      "invitedByUser": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Host",
        "email": "host@example.com"
      }
    }
  ]
}
```

#### 5.9 Accept Co-Host Invitation

**Request:**

```http
PUT /co-hosts/invitations/{invitationId}/accept
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host invitation accepted successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "status": "ACTIVE",
    "acceptedAt": "2025-08-11T02:53:53.616Z",
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Manager",
      "email": "manager@example.com"
    },
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa"
    }
  }
}
```

#### 5.10 Decline Co-Host Invitation

**Request:**

```http
PUT /co-hosts/invitations/{invitationId}/decline
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host invitation declined successfully"
}
```

#### 5.11 Leave Co-Host Position

**Request:**

```http
PUT /co-hosts/{coHostId}/leave
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "You have successfully left the co-host position"
}
```

#### Co-Host Status Values

- `PENDING` - Invitation sent, waiting for acceptance
- `ACTIVE` - Co-host is active and has access
- `SUSPENDED` - Co-host access temporarily suspended
- `REMOVED` - Co-host has been removed

#### Co-Host Permission Levels

- `VIEW_ONLY` - Can only view property details
- `MANAGE_BOOKINGS` - Can manage bookings, respond to messages
- `MANAGE_PROPERTY` - Can edit property details, photos, pricing
- `MANAGE_FINANCES` - Can view earnings, manage payouts
- `FULL_ACCESS` - Full access like the primary host

### 6. Booking Management

#### 6.1 Get Host Bookings

**Request:**

```http
GET /bookings/host/bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
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
        "specialRequests": "Early check-in if possible",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "price": 75000,
          "currency": "XAF",
          "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"]
        },
        "guest": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "email": "guest@example.com"
        },
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z"
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

#### 6.2 Update Booking Status

**Request:**

```http
PUT /bookings/cme6itsi5000bu9i4canbgxat/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED"
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
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 6.3 Get Booking by ID (Host's Property)

**Request:**

```http
GET /bookings/cme6itsi5000bu9i4canbgxat
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "cme6itsi5000bu9i4canbgxat",
      "propertyId": "cme6itqoo0001u9i4x6c38wmq",
      "guestId": "cme6iqlan0000u9vp9mlbrpb6",
      "checkIn": "2025-08-15T00:00:00.000Z",
      "checkOut": "2025-08-17T00:00:00.000Z",
      "guests": 2,
      "totalPrice": 150000,
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED",
      "paymentMethod": "FAPSHI",
      "specialRequests": "Early check-in if possible",
      "property": {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "price": 75000,
        "currency": "XAF"
      },
      "guest": {
        "id": "cme6iqlan0000u9vp9mlbrpb6",
        "firstName": "Jane",
        "lastName": "Guest",
        "email": "guest@example.com",
        "phone": "+237612345679"
      },
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

### 7. Host Dashboard & Analytics

#### 7.1 Get Host Dashboard Statistics

**Request:**

```http
GET /users/dashboard-stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Host dashboard statistics retrieved successfully",
  "data": {
    "overview": {
      "totalBookings": 15,
      "activeBookings": 3,
      "totalSpent": 2250000,
      "averageRating": 4.5,
      "totalReviews": 8,
      "favoriteProperties": 5
    },
    "financial": {
      "totalSpent": 2250000,
      "averageSpending": 150000,
      "monthlySpending": 450000,
      "spendingLast30Days": 450000,
      "currency": "XAF",
      "walletBalance": 142500,
      "totalTransactions": 15,
      "totalRefunds": 0
    },
    "bookings": {
      "total": 15,
      "pending": 2,
      "confirmed": 10,
      "completed": 3,
      "cancelled": 0,
      "cancellationRate": 0,
      "averageStayDuration": 2,
      "upcomingBookings": 3,
      "recentBookings": [
        {
          "id": "cme6itsi5000bu9i4canbgxat",
          "propertyTitle": "Cozy Beachfront Villa",
          "checkIn": "2025-08-15T00:00:00.000Z",
          "checkOut": "2025-08-17T00:00:00.000Z",
          "totalPrice": 150000,
          "status": "CONFIRMED"
        }
      ]
    },
    "reviews": {
      "total": 8,
      "averageRating": 4.5,
      "ratingBreakdown": {
        "5": 5,
        "4": 2,
        "3": 1,
        "2": 0,
        "1": 0
      },
      "recentReviews": [
        {
          "id": "cme6itv8j0002u9i4x6c38wmq",
          "rating": 5,
          "comment": "Excellent stay! The villa was beautiful and the host was very accommodating.",
          "propertyTitle": "Cozy Beachfront Villa",
          "createdAt": "2025-08-11T02:53:53.616Z"
        }
      ]
    },
    "enquiries": {
      "total": 5,
      "pending": 1,
      "responded": 4,
      "closed": 0,
      "responseRate": 80,
      "recentEnquiries": [
        {
          "id": "cme6itv8j0003u9i4x6c38wmq",
          "subject": "Availability for next weekend",
          "status": "RESPONDED",
          "propertyTitle": "Cozy Beachfront Villa",
          "createdAt": "2025-08-11T02:53:53.616Z"
        }
      ]
    },
    "activity": {
      "lastLogin": "2025-08-11T02:53:53.616Z",
      "memberSince": "2025-08-11T01:28:01.559Z",
      "totalTransactions": 15,
      "favoriteDestinations": ["Limbe", "Douala"],
      "preferredPropertyTypes": ["VILLA", "APARTMENT"]
    },
    "analytics": {
      "monthlySpendingTrend": [
        {
          "month": 8,
          "total": 450000
        }
      ],
      "seasonalBookingPattern": [
        {
          "month": 8,
          "count": 15
        }
      ],
      "topDestinations": [
        {
          "city": "Limbe",
          "bookings": 10,
          "totalSpent": 1500000
        }
      ],
      "propertyTypePreferences": [
        {
          "type": "VILLA",
          "bookings": 8,
          "totalSpent": 1200000
        }
      ]
    },
    "hostStats": {
      "totalProperties": 3,
      "totalGrossEarnings": 2250000,
      "totalNetEarnings": 2137500,
      "totalPlatformFees": 112500,
      "netEarningsLast30Days": 427500,
      "averageEarningsPerBooking": 142500,
      "platformFeePercentage": 5
    }
  }
}
```

### 8. Earnings & Revenue

#### 8.1 Get Host Earnings

**Request:**

```http
GET /wallet/earnings?page=1&limit=10
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "earnings": [
      {
        "id": "cme6iw0450012u9znmc2towge",
        "amount": 225000,
        "currency": "XAF",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for Cozy Beachfront Villa booking",
        "reference": "TXN001",
        "metadata": {
          "bookingId": "cme6itsi5000bu9i4canbgxat",
          "propertyId": "cme6itqoo0001u9i4x6c38wmq"
        },
        "hostServiceFee": 11250,
        "guestServiceFee": 11250,
        "platformRevenue": 22500,
        "netAmount": 202500,
        "walletId": "cme6iw0450012u9znmc2towge",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "bookingId": "cme6itsi5000bu9i4canbgxat",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z"
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

#### 8.2 Get Host Wallet Balance

**Request:**

```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "balance": 100000,
    "currency": "XAF",
    "isActive": true,
    "walletId": "cme6iw0450012u9znmc2towge"
  }
}
```

#### 8.3 Initialize Payout

**Request:**

```http
POST /payments/payout
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "paymentMethod": "MOBILE_MONEY"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Payout initialized successfully",
  "data": {
    "transactionId": "cme6iw0450012u9znmc2towge",
    "reference": "PAYOUT_123456",
    "status": "PROCESSING",
    "amount": 50000
  }
}
```

#### 8.4 Get Available Payment Methods

**Request:**

```http
GET /payments/methods
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "MOBILE_MONEY",
      "name": "MTN Mobile Money",
      "description": "Pay with MTN Mobile Money",
      "icon": "mtn-momo"
    },
    {
      "id": "ORANGE_MONEY",
      "name": "Orange Money",
      "description": "Pay with Orange Money",
      "icon": "orange-money"
    }
  ]
}
```

#### 8.5 Get Payment History

**Request:**

```http
GET /payments/history?page=1&limit=10&type=WITHDRAWAL
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cme6iw0450012u9znmc2towge",
        "amount": 50000,
        "currency": "XAF",
        "type": "WITHDRAWAL",
        "status": "COMPLETED",
        "description": "Payout to MOBILE_MONEY",
        "reference": "PAYOUT_123456",
        "metadata": {
          "paymentMethod": "MOBILE_MONEY",
          "recipient": {
            "name": "John Host",
            "phone": "+237612345678",
            "email": "host@example.com"
          },
          "completedAt": "2025-08-11T02:53:53.616Z"
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

#### 8.6 Withdraw from Wallet

**Request:**

```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "withdrawalMethod": "MOBILE_MONEY",
  "phone": "+237612345678"
}
```

**Request Body Fields:**

- `amount` (required): Amount to withdraw (must be greater than 0)
- `withdrawalMethod` (required): Payment method (MOBILE_MONEY, BANK_TRANSFER)
- `phone` (required for mobile money): Phone number for mobile money transfer

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Withdrawal processed successfully",
  "data": {
    "transaction": {
      "id": "cme6itv8j0006u9i4x6c38wmq",
      "amount": 50000,
      "currency": "XAF",
      "type": "WITHDRAWAL",
      "status": "PENDING",
      "description": "Withdrawal to MOBILE_MONEY",
      "reference": "WD-1734567890123",
      "metadata": {
        "paymentMethod": "MOBILE_MONEY",
        "accountNumber": "+237612345678",
        "withdrawalFee": 500,
        "netAmount": 49500
      },
      "createdAt": "2025-08-11T02:53:53.616Z"
    },
    "withdrawalFees": {
      "originalAmount": 50000,
      "withdrawalFee": 500,
      "netAmount": 49500,
      "feePercentage": 1
    },
    "newBalance": 92500
  }
}
```

**Error Responses:**

**Insufficient Balance (400):**

```json
{
  "success": false,
  "error": "Insufficient balance",
  "message": "Insufficient balance"
}
```

**Invalid Amount (400):**

```json
{
  "success": false,
  "error": "Invalid amount",
  "message": "Amount must be greater than 0"
}
```

**Withdrawal Method Required (400):**

```json
{
  "success": false,
  "error": "Withdrawal method required",
  "message": "Please specify withdrawal method"
}
```

#### 8.7 Get Withdrawal History

**Request:**

```http
GET /wallet/withdrawals?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "id": "cme6itv8j0006u9i4x6c38wmq",
        "amount": 50000,
        "currency": "XAF",
        "type": "WITHDRAWAL",
        "status": "COMPLETED",
        "description": "Withdrawal to MOBILE_MONEY",
        "reference": "WD-1734567890123",
        "metadata": {
          "paymentMethod": "MOBILE_MONEY",
          "accountNumber": "+237612345678",
          "withdrawalFee": 500,
          "netAmount": 49500,
          "fapshiTransactionId": "FIN123456789"
        },
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:55:00.000Z"
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

#### 8.8 Get Wallet Balance

**Request:**

```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "balance": 92500,
    "currency": "XAF",
    "isActive": true,
    "walletId": "cme6iw0450012u9znmc2towge",
    "lastUpdated": "2025-08-11T02:53:53.616Z"
  }
}
```

#### 8.9 Get Wallet Details

**Request:**

```http
GET /wallet/details
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "cme6iw0450012u9znmc2towge",
      "balance": 92500,
      "currency": "XAF",
      "isActive": true,
      "userId": "cme6fo5xz0000u9mo5li7lln7",
      "createdAt": "2025-08-11T01:28:01.559Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    },
    "recentTransactions": [
      {
        "id": "cme6itv8j0006u9i4x6c38wmq",
        "amount": 50000,
        "currency": "XAF",
        "type": "WITHDRAWAL",
        "status": "COMPLETED",
        "description": "Withdrawal to MOBILE_MONEY",
        "reference": "WD-1734567890123",
        "createdAt": "2025-08-11T02:53:53.616Z"
      },
      {
        "id": "cme6iw0450012u9znmc2towge",
        "amount": 142500,
        "currency": "XAF",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for Cozy Beachfront Villa booking",
        "reference": "TXN001",
        "createdAt": "2025-08-11T02:30:00.000Z"
      }
    ]
  }
}
```

#### 8.10 Get Transaction History

**Request:**

```http
GET /wallet/transactions?page=1&limit=10&type=WITHDRAWAL
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by transaction type (PAYMENT, WITHDRAWAL, REFUND)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cme6itv8j0006u9i4x6c38wmq",
        "amount": 50000,
        "currency": "XAF",
        "type": "WITHDRAWAL",
        "status": "COMPLETED",
        "description": "Withdrawal to MOBILE_MONEY",
        "reference": "WD-1734567890123",
        "metadata": {
          "paymentMethod": "MOBILE_MONEY",
          "accountNumber": "+237612345678",
          "withdrawalFee": 500,
          "netAmount": 49500,
          "fapshiTransactionId": "FIN123456789"
        },
        "createdAt": "2025-08-11T02:53:53.616Z",
        "booking": {
          "id": "cme6itsi5000bu9i4canbgxat",
          "property": {
            "title": "Cozy Beachfront Villa",
            "address": "123 Beach Road"
          }
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

### Withdrawal Process Flow

#### 1. **Check Wallet Balance**

Before making a withdrawal, hosts should check their current wallet balance:

```http
GET /wallet/balance
Authorization: Bearer <token>
```

#### 2. **Request Withdrawal**

Submit withdrawal request with amount and payment method:

```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "withdrawalMethod": "MOBILE_MONEY",
  "phone": "+237612345678"
}
```

#### 3. **Withdrawal Processing**

The system will:

1. **Validate Request**: Check balance, amount, and payment method
2. **Calculate Fees**: Apply withdrawal fees (if configured)
3. **Create Transaction**: Record withdrawal transaction
4. **Update Balance**: Deduct amount from wallet
5. **Process Payment**: Send money via Fapshi (mobile money)
6. **Update Status**: Mark transaction as completed

#### 4. **Track Withdrawal Status**

Monitor withdrawal status through transaction history:

```http
GET /wallet/withdrawals?page=1&limit=10
Authorization: Bearer <token>
```

### Withdrawal Status Values

- `PENDING` - Withdrawal request submitted, processing
- `COMPLETED` - Money successfully sent to recipient
- `FAILED` - Withdrawal failed (insufficient funds, network error, etc.)
- `CANCELLED` - Withdrawal cancelled by user or system

### Supported Payment Methods

- `MOBILE_MONEY` - MTN Mobile Money, Orange Money
- `BANK_TRANSFER` - Direct bank transfer (if configured)

### Withdrawal Fees

The platform may apply withdrawal fees based on the configured revenue settings:

- **Fee Structure**: Configurable percentage or fixed amount
- **Minimum Withdrawal**: May have minimum withdrawal amounts
- **Fee Calculation**: Automatically calculated and deducted

### Security Features

- **Balance Validation**: Prevents withdrawals exceeding available balance
- **Transaction Limits**: Configurable daily/monthly withdrawal limits
- **Phone Verification**: Mobile money transfers to verified phone numbers
- **Audit Trail**: Complete transaction history for all withdrawals

### Error Handling

**Common Withdrawal Errors:**

- **Insufficient Balance**: Wallet balance less than requested amount
- **Invalid Amount**: Amount must be greater than 0
- **Invalid Payment Method**: Unsupported withdrawal method
- **Network Error**: Payment provider temporarily unavailable
- **Phone Number Error**: Invalid or unregistered mobile money number

**Resolution:**

- Check wallet balance before requesting withdrawal
- Ensure phone number is registered for mobile money
- Contact support for failed transactions
- Retry withdrawal after network issues are resolved

### 9. Reviews Management

#### 9.1 Get Host Reviews

**Request:**

```http
GET /reviews/host/reviews?page=1&limit=10
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "cme6itv8j0002u9i4x6c38wmq",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "bookingId": "cme6itsi5000bu9i4canbgxat",
        "rating": 5,
        "comment": "Excellent stay! The villa was beautiful and the host was very accommodating.",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z",
        "user": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "avatar": null
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

#### 9.2 Get Host Review Stats

**Request:**

```http
GET /reviews/host/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "message": "Host review statistics retrieved successfully",
  "stats": {
    "totalReviews": 8,
    "averageRating": 4.5,
    "ratingDistribution": {
      "1": 0,
      "2": 0,
      "3": 1,
      "4": 2,
      "5": 5
    },
    "propertiesWithReviews": [
      {
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "averageRating": 4.5,
        "totalReviews": 5
      },
      {
        "propertyId": "cme6itqoo0002u9i4x6c38wmq",
        "title": "Downtown Apartment",
        "averageRating": 4.3,
        "totalReviews": 3
      }
    ]
  }
}
```

### 10. Enquiry Management

#### 10.1 Get Host Enquiries

**Request:**

```http
GET /enquiries/host/enquiries?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

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

#### 10.2 Respond to Enquiry

**Request:**

```http
PUT /enquiries/cme6itv8j0003u9i4x6c38wmq/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Yes, the villa is available for next weekend. The rate is 75,000 XAF per night."
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Enquiry responded successfully",
  "data": {
    "enquiry": {
      "id": "cme6itv8j0003u9i4x6c38wmq",
      "status": "RESPONDED",
      "hostResponse": "Yes, the villa is available for next weekend. The rate is 75,000 XAF per night.",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

### 11. Favorites Management

Hosts can view which users have favorited their properties.

#### 11.1 Get Property Favorites

**Request:**

```http
GET /favorites/property/{propertyId}?page=1&limit=10
Authorization: Bearer <token>
```

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
          "email": "guest@example.com",
          "avatar": null
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

#### 11.2 Get All Host Property Favorites

**Request:**

```http
GET /favorites/host/all?page=1&limit=10
Authorization: Bearer <token>
```

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

#### 11.3 Get Favorites Statistics

**Request:**

```http
GET /favorites/host/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalFavorites": 25,
    "uniqueUsers": 18,
    "propertiesWithFavorites": 3,
    "mostFavoritedProperty": {
      "propertyId": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "favoriteCount": 12
    },
    "recentFavorites": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "userName": "Jane Guest",
        "propertyTitle": "Cozy Beachfront Villa",
        "createdAt": "2025-08-11T02:53:53.616Z"
      }
    ]
  }
}
```

### 12. Notifications

#### 12.1 Get Host Notifications

**Request:**

```http
GET /notifications?page=1&limit=10&type=NEW_BOOKING&read=false
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type
- `read` (optional): Filter by read status (true/false)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "cme6itv8j0004u9i4x6c38wmq",
        "title": "New Booking Request",
        "body": "You have a new booking request for Cozy Beachfront Villa",
        "type": "NEW_BOOKING",
        "data": {
          "bookingId": "cme6itsi5000bu9i4canbgxat",
          "propertyId": "cme6itqoo0001u9i4x6c38wmq"
        },
        "status": "UNREAD",
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

#### 12.2 Get Notification Statistics

**Request:**

```http
GET /notifications/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "unread": 8,
    "read": 7,
    "breakdown": [
      {
        "status": "UNREAD",
        "_count": {
          "status": 8
        }
      },
      {
        "status": "READ",
        "_count": {
          "status": 7
        }
      }
    ]
  }
}
```

#### 12.3 Mark Notification as Read

**Request:**

```http
PUT /notifications/cme6itv8j0004u9i4x6c38wmq/read
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 12.4 Mark All Notifications as Read

**Request:**

```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "8 notifications marked as read",
  "data": {
    "updatedCount": 8
  }
}
```

#### 12.5 Delete Notification

**Request:**

```http
DELETE /notifications/cme6itv8j0004u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### 12.6 Get Notification Preferences

**Request:**

```http
GET /notifications/preferences
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "userId": "cme6fo5xz0000u9mo5li7lln7",
    "emailNotifications": true,
    "pushNotifications": true,
    "bookingNotifications": true,
    "reviewNotifications": true,
    "paymentNotifications": true,
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z"
  }
}
```

#### 12.7 Update Notification Preferences

**Request:**

```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true,
  "bookingNotifications": true,
  "reviewNotifications": false,
  "paymentNotifications": true
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "userId": "cme6fo5xz0000u9mo5li7lln7",
    "emailNotifications": true,
    "pushNotifications": true,
    "bookingNotifications": true,
    "reviewNotifications": false,
    "paymentNotifications": true,
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T02:55:00.000Z"
  }
}
```

### 13. Push Notifications

#### 13.1 Register Device Token

**Request:**

```http
POST /push-notifications/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceToken": "fcm-token-from-device",
  "platform": "android"
}
```

**Request Body Fields:**

- `deviceToken` (required): FCM token from mobile device
- `platform` (optional): Device platform (android, ios, web) - default: android

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Device token registered successfully",
  "data": {
    "deviceToken": "fcm-token-from-device",
    "platform": "android",
    "registeredAt": "2025-08-11T02:53:53.616Z"
  }
}
```

#### 13.2 Unregister Device Token

**Request:**

```http
POST /push-notifications/unregister-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceToken": "fcm-token-from-device"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Device token unregistered successfully"
}
```

#### 13.3 Get User's Device Tokens

**Request:**

```http
GET /push-notifications/device-tokens
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cme6device0001u9i4x6c38wmq",
      "token": "fcm-token-1",
      "platform": "android",
      "isActive": true,
      "createdAt": "2025-08-11T02:53:53.616Z",
      "lastUsed": "2025-08-11T02:53:53.616Z"
    },
    {
      "id": "cme6device0002u9i4x6c38wmq",
      "token": "fcm-token-2",
      "platform": "ios",
      "isActive": true,
      "createdAt": "2025-08-11T02:54:00.000Z",
      "lastUsed": "2025-08-11T02:54:00.000Z"
    }
  ]
}
```

#### 13.4 Send Test Push Notification

**Request:**

```http
POST /push-notifications/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test push notification for hosts"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "sentTo": 2,
    "devices": [
      {
        "platform": "android",
        "token": "fcm-token-1",
        "status": "sent"
      },
      {
        "platform": "ios",
        "token": "fcm-token-2",
        "status": "sent"
      }
    ]
  }
}
```

#### 13.5 Subscribe to Topic

**Request:**

```http
POST /push-notifications/subscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "booking_updates"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Successfully subscribed to booking_updates topic",
  "data": {
    "topic": "booking_updates",
    "subscribedDevices": 2
  }
}
```

#### 13.6 Unsubscribe from Topic

**Request:**

```http
POST /push-notifications/unsubscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "booking_updates"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Successfully unsubscribed from booking_updates topic",
  "data": {
    "topic": "booking_updates",
    "unsubscribedDevices": 2
  }
}
```

### 14. File Upload

#### 14.1 Upload Property Images

**Request:**

```http
POST /uploads/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [file1, file2, file3]
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "uploads/properties/villa1.jpg",
      "uploads/properties/villa2.jpg",
      "uploads/properties/villa3.jpg"
    ],
    "urls": [
      "http://localhost:5000/uploads/properties/villa1.jpg",
      "http://localhost:5000/uploads/properties/villa2.jpg",
      "http://localhost:5000/uploads/properties/villa3.jpg"
    ]
  }
}
```

#### 14.2 Upload Profile Avatar

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
    "image": "uploads/avatar/host-avatar.jpg",
    "url": "http://localhost:5000/uploads/avatar/host-avatar.jpg"
  }
}
```

## Error Responses

### Common Error Codes

**400 - Bad Request:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "price": "Price must be a positive number"
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
  "error": "Insufficient permissions. Host role required."
}
```

**404 - Not Found:**

```json
{
  "success": false,
  "message": "Property not found",
  "error": "Property does not exist"
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

## Property Types

Available property types for hosts:

- `ROOM` - Single room
- `STUDIO` - Studio apartment
- `APARTMENT` - Full apartment
- `VILLA` - Villa or house
- `SUITE` - Hotel-style suite
- `DORMITORY` - Shared accommodation
- `COTTAGE` - Small house
- `PENTHOUSE` - Luxury apartment

## Booking Statuses

- `PENDING` - Awaiting host confirmation
- `CONFIRMED` - Host has confirmed the booking
- `COMPLETED` - Stay has been completed
- `CANCELLED` - Booking has been cancelled
- `REFUNDED` - Payment has been refunded

## Payment Methods

- `FAPSHI` - Fapshi mobile money
- `CARD` - Credit/Debit card
- `BANK_TRANSFER` - Bank transfer
- `CASH` - Cash payment

## 9. Booking Process Flow (Host Perspective)

### Complete Booking Process Overview

This section details the booking process from a host's perspective, including how bookings flow through the system and how hosts can track and manage them.

#### 9.1 Booking Creation (Guest Side)

**What Happens When a Guest Books:**

1. Guest selects property and dates
2. Guest creates booking with status: `PENDING`
3. Host receives notification of new booking request
4. Booking appears in host's dashboard

**Host Notification:**

```json
{
  "type": "NEW_BOOKING",
  "title": "New Booking Request",
  "message": "John Doe has requested to book Beach Villa from Aug 15-17",
  "bookingId": "cme7md4iw0001u90n81c0jqlj",
  "propertyId": "cme6itqoo0001u9i4x6c38wmq"
}
```

#### 9.2 Payment Processing (Guest Side)

**Payment Flow:**

1. Guest initiates payment via mobile money
2. Fapshi processes the payment
3. Webhook confirms payment success
4. System automatically updates booking status

**Host Dashboard Updates:**

- Booking status changes from `PENDING` to `CONFIRMED`
- Payment status changes from `PENDING` to `COMPLETED`
- Host wallet is automatically credited

#### 9.3 Host Wallet Management

**Automatic Wallet Credit:**
When payment is successful, the system automatically:

1. Calculates platform fees (5%)
2. Credits host's wallet with 95% of booking amount
3. Records the transaction

**Example Transaction:**

```json
{
  "bookingAmount": 150000,
  "platformFee": 7500,
  "hostReceives": 142500,
  "currency": "XAF",
  "transactionId": "FIN456789"
}
```

#### 9.4 Host Payout Process

**Step 1: Check Wallet Balance**

```http
GET /api/v1/wallet/balance
Authorization: Bearer {host_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 142500,
    "currency": "XAF",
    "lastUpdated": "2025-08-14T19:35:00.000Z"
  }
}
```

**Step 2: Request Payout**

```http
POST /api/v1/payments/payout
Authorization: Bearer {host_token}
Content-Type: application/json

{
  "amount": 142500,
  "paymentMethod": "MOBILE_MONEY"
}
```

**Process:**

1. System validates wallet balance
2. Calls Fapshi's `payout` endpoint:

   ```json
   {
     "amount": 142500,
     "phone": "612345678",
     "medium": "mobile money",
     "name": "Host Name",
     "email": "host@example.com",
     "userId": "host-id",
     "externalId": "transaction-id",
     "message": "Payout for booking"
   }
   ```

3. Fapshi sends money to host's mobile money account
4. System updates transaction status

**Response:**

```json
{
  "success": true,
  "message": "Payout initialized successfully",
  "data": {
    "transactionId": "transaction-id",
    "transId": "PAY123XYZ",
    "status": "PROCESSING",
    "amount": 142500,
    "message": "Payout initiated",
    "dateInitiated": "2023-12-25"
  }
}
```

#### 9.5 Booking Status Tracking

**Host Dashboard - Booking Statuses:**

| Status              | Description                                  | Host Action Required     |
| ------------------- | -------------------------------------------- | ------------------------ |
| `PENDING`           | Guest created booking, payment not completed | Monitor for payment      |
| `CONFIRMED`         | Payment successful, booking confirmed        | Prepare property         |
| `CANCELLED`         | Payment failed/expired, booking cancelled    | None                     |
| `COMPLETED`         | Guest stay completed                         | None                     |
| `CANCELLED_BY_HOST` | Host cancelled booking                       | Process refund if needed |

**API Endpoint to Track Bookings:**

```http
GET /api/v1/host/bookings?status=CONFIRMED&page=1&limit=10
Authorization: Bearer {host_token}
```

#### 9.6 Revenue Tracking

**Platform Fee Structure:**

- **Platform Fee**: 5% of total booking amount
- **Host Receives**: 95% of total booking amount
- **Automatic Deduction**: Fees deducted before wallet credit

**Revenue Dashboard:**

```http
GET /api/v1/host/revenue?startDate=2025-08-01&endDate=2025-08-31
Authorization: Bearer {host_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalBookings": 15,
    "totalRevenue": 2250000,
    "platformFees": 112500,
    "netRevenue": 2137500,
    "pendingPayouts": 142500,
    "completedPayouts": 1995000
  }
}
```

#### 9.7 Transaction History

**View All Transactions:**

```http
GET /api/v1/payments/history?type=PAYMENT&page=1&limit=20
Authorization: Bearer {host_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 142500,
        "currency": "XAF",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for booking cme7md4iw0001u90n81c0jqlj",
        "reference": "ABC123XYZ",
        "createdAt": "2025-08-14T19:35:00.000Z",
        "booking": {
          "id": "cme7md4iw0001u90n81c0jqlj",
          "property": {
            "title": "Beach Villa",
            "address": "123 Beach Road"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
}
```

#### 9.8 Host Dashboard Statistics

**Real-time Dashboard:**

```http
GET /api/v1/host/dashboard-stats
Authorization: Bearer {host_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalProperties": 5,
    "activeBookings": 8,
    "pendingBookings": 2,
    "totalRevenue": 2250000,
    "monthlyRevenue": 750000,
    "averageRating": 4.8,
    "totalReviews": 45,
    "walletBalance": 142500,
    "pendingPayouts": 142500
  }
}
```

### Payment Processing Timeline

**Typical Booking Timeline:**

1. **T+0**: Guest creates booking → Status: `PENDING`
2. **T+1min**: Guest initiates payment → Payment Status: `PENDING`
3. **T+2min**: Guest confirms payment on mobile → Payment Status: `PROCESSING`
4. **T+3min**: Fapshi confirms payment → Payment Status: `COMPLETED`
5. **T+3min**: Webhook updates booking → Status: `CONFIRMED`
6. **T+3min**: Host wallet credited → Balance updated
7. **T+5min**: Host receives notification → Booking confirmed

### Host Responsibilities

**During Booking Process:**

- Monitor new booking requests
- Ensure property is available for confirmed dates
- Prepare property for guest arrival
- Respond to guest inquiries promptly

**After Payment Confirmation:**

- Confirm booking details with guest
- Provide check-in instructions
- Ensure property is ready for guest arrival
- Handle any special requests

### Error Handling for Hosts

**Common Issues:**

- **Payment Delays**: Monitor booking status for payment confirmation
- **Guest Cancellations**: Handle according to cancellation policy
- **Property Issues**: Contact guest immediately if problems arise

**Support Actions:**

- Contact platform support for payment issues
- Use messaging system to communicate with guests
- Update property availability if needed

### Security & Verification

**Host Protection:**

- All payments verified with Fapshi API
- Automatic wallet crediting prevents manual errors
- Transaction history provides full audit trail
- Secure payout process to verified mobile numbers

**Best Practices:**

- Regularly check booking dashboard
- Monitor wallet balance and transactions
- Keep property availability updated
- Respond promptly to guest communications

This booking process ensures hosts receive payments reliably while providing transparency and security throughout the transaction process.
