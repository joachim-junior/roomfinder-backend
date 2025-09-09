# Room Finder API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Properties](#properties)
4. [Bookings](#bookings)
5. [Reviews](#reviews)
6. [Payments](#payments)
7. [Wallet](#wallet)
8. [Notifications](#notifications)
9. [File Upload](#file-upload)
10. [Admin Dashboard](#admin-dashboard)
11. [Push Notifications](#push-notifications)
12. [Favorites System](#favorites-system)
13. [Host Approval System](#host-approval-system)
14. [Revenue Model](#revenue-model)
15. [Property Enquiry System](#property-enquiry-system)
16. [Guest Dashboard Statistics](#guest-dashboard-statistics)
17. [Property Owner Guide](#property-owner-guide)

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints Summary

### Complete Endpoint List with Examples

| Method | Endpoint                              | Description                     | Auth Required    |
| ------ | ------------------------------------- | ------------------------------- | ---------------- |
| POST   | `/auth/register`                      | User registration               | No               |
| POST   | `/auth/login`                         | User login                      | No               |
| GET    | `/auth/profile`                       | Get user profile                | Yes              |
| PUT    | `/auth/profile`                       | Update user profile             | Yes              |
| GET    | `/users/dashboard-stats`              | Get guest dashboard statistics  | Yes              |
| GET    | `/properties`                         | Get all properties (public)     | No               |
| POST   | `/properties`                         | Create property                 | Yes (Host)       |
| GET    | `/properties/:id`                     | Get property by ID              | No               |
| GET    | `/properties/host/my-properties`      | Get host properties             | Yes (Host)       |
| GET    | `/properties/host/stats`              | Get host property stats         | Yes (Host)       |
| POST   | `/bookings`                           | Create booking                  | Yes              |
| GET    | `/bookings/my-bookings`               | Get user bookings               | Yes              |
| GET    | `/bookings/has-booked/:propertyId`     | Check if user booked property      | Yes              |
| GET    | `/bookings/:id`                       | Get booking by ID               | Yes              |
| PUT    | `/bookings/:id/cancel`                | Cancel booking                  | Yes              |
| GET    | `/bookings/availability`              | Check availability              | Yes              |
| GET    | `/bookings/stats`                     | Get booking stats               | Yes              |
| GET    | `/bookings/host/bookings`             | Get host bookings               | Yes (Host)       |
| PUT    | `/bookings/:id/status`                | Update booking status           | Yes (Host/Admin) |
| GET    | `/reviews/property/:propertyId`       | Get property reviews            | No               |
| GET    | `/reviews/property/:propertyId/stats` | Get property review stats       | No               |
| POST   | `/reviews`                            | Create review                   | Yes              |
| GET    | `/reviews/my-reviews`                 | Get user reviews                | Yes              |
| GET    | `/reviews/host/reviews`               | Get host reviews                | Yes (Host)       |
| GET    | `/reviews/host/stats`                 | Get host review stats           | Yes (Host)       |
| GET    | `/reviews/:id`                        | Get review by ID                | Yes              |
| PUT    | `/reviews/:id`                        | Update review                   | Yes              |
| DELETE | `/reviews/:id`                        | Delete review                   | Yes              |
| POST   | `/payments/booking/:bookingId`        | Create payment                  | Yes              |
| GET    | `/payments/booking/:bookingId/status` | Check payment status            | Yes              |
| GET    | `/wallet/balance`                     | Get wallet balance              | Yes              |
| GET    | `/wallet/transactions`                | Get transaction history         | Yes              |
| POST   | `/wallet/refund/:bookingId`           | Process refund                  | Yes              |
| POST   | `/wallet/withdraw`                    | Withdraw from wallet            | Yes              |
| GET    | `/notifications`                      | Get user notifications          | Yes              |
| GET    | `/notifications/stats`                | Get notification stats          | Yes              |
| GET    | `/notifications/preferences`          | Get notification preferences    | Yes              |
| PUT    | `/notifications/preferences`          | Update notification preferences | Yes              |
| PUT    | `/notifications/:id/read`             | Mark notification as read       | Yes              |
| PUT    | `/notifications/read-all`             | Mark all notifications as read  | Yes              |
| DELETE | `/notifications/:id`                  | Delete notification             | Yes              |
| POST   | `/uploads/single`                     | Upload single image             | Yes              |
| POST   | `/uploads/multiple`                   | Upload multiple images          | Yes              |
| POST   | `/enquiries`                          | Create property enquiry         | Yes              |
| GET    | `/enquiries/my-enquiries`             | Get user enquiries              | Yes              |
| GET    | `/enquiries/host/enquiries`           | Get host enquiries              | Yes (Host)       |
| PUT    | `/enquiries/:id/respond`              | Respond to enquiry              | Yes (Host)       |
| GET    | `/favorites`                          | Get user favorites              | Yes              |
| POST   | `/favorites/:propertyId`              | Add to favorites                | Yes              |
| DELETE | `/favorites/:propertyId`              | Remove from favorites           | Yes              |

### 1. Authentication & User Management

#### 1.1 User Registration

**Request:**

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+237612345678",
  "role": "GUEST"
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
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+237612345678",
      "role": "GUEST",
      "isVerified": false,
      "avatar": null,
      "createdAt": "2025-08-11T01:28:01.559Z",
      "updatedAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters",
    "firstName": "First name is required"
  }
}
```

**Response (Error - 409):**

```json
{
  "success": false,
  "message": "User already exists",
  "error": "Email already registered"
}
```

#### 1.2 User Login

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
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
      "lastName": "Doe",
      "email": "john@example.com",
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

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Login failed",
  "error": "Invalid email or password"
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

      "email": "john@example.com",
      "role": "GUEST",
      "isVerified": true
    },
    "token": "jwt-token-here"

}
}

````

#### 1.3 Email Verification

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
````

#### 1.4 Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 1.5 Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "new-password"
}
```

#### 1.6 Resend Verification Email

```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 1.7 Get User Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

#### 1.8 Update User Profile

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+237612345678",
  "avatar": "avatar-url"
}
```

#### 1.9 Change Password

```http
PUT /auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

#### 1.10 Verify User (Admin Only)

```http
PUT /auth/verify/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true
}
```

### 2. Users

#### 2.1 Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

#### 2.2 Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+237612345678",
  "avatar": "avatar-url"
}
```

#### 2.3 Get User Stats

```http
GET /users/stats
Authorization: Bearer <token>
```

#### 2.4 Get User Activity

```http
GET /users/activity
Authorization: Bearer <token>
```

#### 2.5 Delete User Account

```http
DELETE /users/account
Authorization: Bearer <token>
```

#### 2.6 Get Guest Dashboard Statistics

**Request:**

```http
GET /users/dashboard-stats
Authorization: Bearer <token>
```

**Description**: Get comprehensive statistics for the guest dashboard including bookings, financial data, reviews, enquiries, and activity metrics. For users who are also hosts, includes detailed host earnings statistics with platform fee calculations.

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Guest dashboard statistics retrieved successfully",
  "data": {
    "overview": {
      "totalBookings": 3,
      "activeBookings": 1,
      "totalSpent": 225000,
      "averageRating": 4.5,
      "totalReviews": 2,
      "favoriteProperties": 1
    },
    "financial": {
      "totalSpent": 225000,
      "averageSpending": 75000,
      "monthlySpending": 225000,
      "spendingLast30Days": 225000,
      "currency": "XAF",
      "walletBalance": 100000
    },
    "bookings": {
      "total": 3,
      "pending": 0,
      "confirmed": 1,
      "completed": 2,
      "cancelled": 0,
      "cancellationRate": 0,
      "averageStayDuration": 2,
      "upcomingBookings": 1,
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
      "total": 2,
      "averageRating": 4.5,
      "ratingBreakdown": {
        "5": 1,
        "4": 1,
        "3": 0,
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
      "total": 2,
      "pending": 0,
      "responded": 2,
      "closed": 0,
      "responseRate": 100,
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
      "totalTransactions": 3,
      "favoriteDestinations": ["Limbe"],
      "preferredPropertyTypes": ["VILLA"]
    },
    "analytics": {
      "monthlySpendingTrend": [
        {
          "month": 8,
          "total": 225000
        }
      ],
      "seasonalBookingPattern": [
        {
          "month": 8,
          "count": 3
        }
      ],
      "topDestinations": [
        {
          "city": "Limbe",
          "bookings": 3,
          "totalSpent": 225000
        }
      ],
      "propertyTypePreferences": [
        {
          "type": "VILLA",
          "bookings": 3,
          "totalSpent": 225000
        }
      ]
    },
    "hostStats": {
      "totalProperties": 1,
      "totalGrossEarnings": 225000,
      "totalNetEarnings": 213750,
      "totalPlatformFees": 11250,
      "netEarningsLast30Days": 213750,
      "averageEarningsPerBooking": 213750,
      "platformFeePercentage": 5
    }
  }
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

**Response (Error - 500):**

```json
{
  "success": false,
  "message": "Database error",
  "error": "An error occurred while processing your request"
}
```

        {
          "type": "APARTMENT",
          "bookings": 5,
          "totalSpent": 150000
        }
      ]
    },
    "notifications": {
      "unread": 3,
      "recent": [
        {
          "id": "notification-id",
          "title": "Booking Confirmed",
          "body": "Your booking for Cozy Beachfront Villa has been confirmed",
          "type": "BOOKING",
          "createdAt": "2025-08-11T08:30:00Z"
        }
      ]
    },
    "hostStats": {
      "totalProperties": 3,
      "totalGrossEarnings": 300000,
      "totalNetEarnings": 285000,
      "totalPlatformFees": 15000,
      "netEarningsLast30Days": 95000,
      "averageEarningsPerBooking": 95000,
      "platformFeePercentage": 5.0
    }

}
}

````

**Statistics Included:**

- **Overview**: Key metrics at a glance
- **Financial**: Spending patterns and wallet information
- **Bookings**: Booking history and status breakdown
- **Reviews**: Rating statistics and recent reviews
- **Enquiries**: Communication history with hosts
- **Activity**: User engagement and preferences
- **Analytics**: Trends and patterns over time
- **Notifications**: Recent system notifications
- **Host Statistics**: Detailed earnings analysis for hosts

**Host Earnings Calculation:**

The `hostStats` section provides comprehensive earnings analysis for users who are also hosts:

- **totalGrossEarnings**: Total booking amounts before platform fees
- **totalNetEarnings**: Net earnings after deducting platform fees
- **totalPlatformFees**: Total fees paid to the platform
- **netEarningsLast30Days**: Net earnings for the last 30 days
- **averageEarningsPerBooking**: Average net earnings per property
- **platformFeePercentage**: Effective platform fee percentage

**Fee Calculation:**

Host earnings are calculated using the active revenue model:

- Platform fees are deducted from each completed booking
- Fees are calculated based on the current revenue configuration
- Net earnings = Gross booking amount - Host service fee
- All calculations use the current active revenue model

**Features:**

- Real-time data from database
- Comprehensive financial tracking
- Booking pattern analysis
- Review and rating statistics
- Enquiry communication tracking
- User activity monitoring
- Trend analysis and insights
- Notification status
- Accurate host earnings with fee deductions
- Platform revenue transparency

### 3. Properties

#### 3.1 Get All Properties (Public)

**Request:**

```http
GET /properties?page=1&limit=10&isAvailable=true&type=ROOM&city=Douala&minPrice=10000&maxPrice=50000
````

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isAvailable`: Filter by availability (true/false)
- `type`: Property type (ROOM, STUDIO, APARTMENT, VILLA, SUITE, DORMITORY, COTTAGE, PENTHOUSE)
- `city`: Filter by city
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `maxGuests`: Maximum guests

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "cme6itqoo0001u9i4x6c38wmq",
        "title": "Cozy Beachfront Villa",
        "description": "Beautiful villa with stunning ocean views, private beach access, and modern amenities.",
        "type": "VILLA",
        "address": "123 Beach Road",
        "city": "Limbe",
        "state": "Southwest",
        "country": "Cameroon",
        "zipCode": null,
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

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Invalid query parameters",
  "error": "Invalid property type"
}
```

#### 3.2 Search Properties

```http
GET /properties/search?q=cozy&city=Douala&type=ROOM&minPrice=10000&maxPrice=50000
```

#### 3.3 Get Property by ID

```http
GET /properties/:id
```

#### 3.4 Create Property (Host Only)

**Important Note:** Property images must be uploaded separately before property creation. See [Property Image Handling Documentation](./PROPERTY_IMAGE_HANDLING.md) for complete details.

**Request:**

```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cozy Room in Douala",
  "description": "Beautiful room with modern amenities",
  "type": "ROOM",
  "address": "123 Main St",
  "city": "Douala",
  "state": "Littoral",
  "country": "Cameroon",
  "zipCode": "12345",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "price": 25000,
  "currency": "XAF",
  "bedrooms": 1,
  "bathrooms": 1,
  "maxGuests": 2,
  "amenities": ["WiFi", "AC", "Kitchen"],
  "images": [
    "http://localhost:5000/uploads/properties/temp-123/image1-1735729943123-123456789.jpg",
    "http://localhost:5000/uploads/properties/temp-123/image2-1735729943123-987654321.jpg"
  ]
}
```

**Image Handling:**

- **Step 1:** Upload images using `/api/v1/uploads/multiple` endpoint
- **Step 2:** Use returned image URLs in the `images` array
- **Images Field:** Array of image URLs (strings), not file uploads
- **Maximum:** Up to 10 images per property

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Room in Douala",
      "description": "Beautiful room with modern amenities",
      "type": "ROOM",
      "address": "123 Main St",
      "city": "Douala",
      "state": "Littoral",
      "country": "Cameroon",
      "zipCode": "12345",
      "latitude": 4.0511,
      "longitude": 9.7679,
      "price": 25000,
      "currency": "XAF",
      "bedrooms": 1,
      "bathrooms": 1,
      "maxGuests": 2,
      "amenities": ["WiFi", "AC", "Kitchen"],
      "images": ["image1.jpg", "image2.jpg"],
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

**Response (Error - 403):**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "Insufficient permissions. Host role required."
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "price": "Price must be a positive number",
    "type": "Invalid property type"
  }
}
```

#### 3.5 Get Host Properties

```http
GET /properties/host/my-properties
Authorization: Bearer <token>
```

#### 3.6 Get Property Stats (Host Only)

```http
GET /properties/host/stats
Authorization: Bearer <token>
```

#### 3.7 Update Property

```http
PUT /properties/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Room Title",
  "price": 30000,
  "isAvailable": true
}
```

#### 3.8 Delete Property

```http
DELETE /properties/:id
Authorization: Bearer <token>
```

### 4. Bookings

#### 4.1 Create Booking

**Request:**

```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "cme6itqoo0001u9i4x6c38wmq",
  "checkIn": "2025-08-15",
  "checkOut": "2025-08-17",
  "guests": 2,
  "specialRequests": "Early check-in if possible",
  "paymentMethod": "FAPSHI"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
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
      "paymentReference": "FAPSHI_REF_123456",
      "paymentUrl": "https://fapshi.com/pay/123456",
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
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "propertyId": "Property ID is required",
    "checkIn": "Check-in date must be in the future",
    "checkOut": "Check-out date must be after check-in date"
  }
}
```

**Response (Error - 409):**

```json
{
  "success": false,
  "message": "Property not available",
  "error": "Property is already booked for the selected dates"
}
```

#### 4.2 Get User Bookings

```http
GET /bookings/my-bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

#### 4.3 Get Booking by ID

```http
GET /bookings/:id
Authorization: Bearer <token>
```

#### 4.4 Cancel Booking

```http
PUT /bookings/:id/cancel
Authorization: Bearer <token>
```

#### 4.5 Check Availability

```http
GET /bookings/availability?propertyId=property-id&checkIn=2024-02-01&checkOut=2024-02-03
Authorization: Bearer <token>
```

#### 4.6 Get Booking Stats

```http
GET /bookings/stats
Authorization: Bearer <token>
```

#### 4.7 Get Host Bookings

```http
GET /bookings/host/bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

#### 4.8 Update Booking Status (Host/Admin)

```http
PUT /bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED" // PENDING, CONFIRMED, CANCELLED, COMPLETED, REFUNDED
}
```

#### 4.9 Payment Webhook (Public)

```http
POST /bookings/webhook/payment
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "status": "SUCCESS",
  "amount": 50000,
  "currency": "XAF",
  "reference": "REF123"
}
```

### 5. Reviews

#### 5.1 Get Property Reviews (Public)

**Request:**

```http
GET /reviews/property/cme6itqoo0001u9i4x6c38wmq?page=1&limit=10
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

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

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Property not found",
  "error": "Property does not exist"
}
```

#### 5.2 Get Property Review Stats (Public)

```http
GET /reviews/property/:propertyId/stats
```

#### 5.3 Create Review

**Request:**

```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "cme6itqoo0001u9i4x6c38wmq",
  "bookingId": "cme6itsi5000bu9i4canbgxat",
  "rating": 5,
  "comment": "Excellent stay! The villa was beautiful and the host was very accommodating."
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": "cme6itv8j0002u9i4x6c38wmq",
      "propertyId": "cme6itqoo0001u9i4x6c38wmq",
      "userId": "cme6iqlan0000u9vp9mlbrpb6",
      "bookingId": "cme6itsi5000bu9i4canbgxat",
      "rating": 5,
      "comment": "Excellent stay! The villa was beautiful and the host was very accommodating.",
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "rating": "Rating must be between 1 and 5",
    "comment": "Comment is required"
  }
}
```

**Response (Error - 409):**

```json
{
  "success": false,
  "message": "Review already exists",
  "error": "You have already reviewed this booking"
}
```

#### 5.4 Get User Reviews

```http
GET /reviews/my-reviews
Authorization: Bearer <token>
```

#### 5.5 Get Host Reviews

```http
GET /reviews/host/reviews
Authorization: Bearer <token>
```

#### 5.6 Get Host Review Stats

```http
GET /reviews/host/stats
Authorization: Bearer <token>
```

#### 5.7 Get Review by ID

```http
GET /reviews/:id
Authorization: Bearer <token>
```

#### 5.8 Update Review

```http
PUT /reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

#### 5.9 Delete Review

```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

### 6. Payments

#### 6.1 Create Payment

**Request:**

```http
POST /payments/booking/cme6itsi5000bu9i4canbgxat
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "FAPSHI",
  "phone": "+237612345678"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment": {
      "id": "cme6itv8j0005u9i4x6c38wmq",
      "bookingId": "cme6itsi5000bu9i4canbgxat",
      "amount": 150000,
      "currency": "XAF",
      "paymentMethod": "FAPSHI",
      "status": "PENDING",
      "reference": "FAPSHI_REF_123456",
      "paymentUrl": "https://fapshi.com/pay/123456",
      "phone": "+237612345678",
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Payment failed",
  "error": "Invalid payment method"
}
```

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Booking not found",
  "error": "Booking does not exist"
}
```

#### 6.2 Check Payment Status

```http
GET /payments/booking/:bookingId/status
Authorization: Bearer <token>
```

#### 6.3 Get Payment History

```http
GET /payments/history?page=1&limit=10
Authorization: Bearer <token>
```

#### 6.4 Get Balance (Admin Only)

```http
GET /payments/balance
Authorization: Bearer <token>
```

#### 6.5 Payment Webhook (Public)

```http
POST /payments/webhook
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "status": "SUCCESS",
  "amount": 50000,
  "currency": "XAF",
  "reference": "REF123"
}
```

## Revenue Model

The Room Finder platform implements a flexible revenue model with configurable service fees for hosts and guests. The system supports multiple revenue configurations that can be activated based on business needs.

### Revenue Model Overview

The platform generates revenue through:

1. **Host Service Fees**: Percentage-based fees charged to property owners
2. **Guest Service Fees**: Percentage-based fees charged to guests
3. **Withdrawal Fees**: Small fixed fees for wallet withdrawals

### Default Revenue Configurations

#### Standard Model (Default)

- **Host Service Fee**: 5% (minimum 500 XAF)
- **Guest Service Fee**: 3% (minimum 300 XAF)
- **Withdrawal Fee**: 100 XAF minimum

#### Premium Model

- **Host Service Fee**: 3% (minimum 300 XAF)
- **Guest Service Fee**: 5% (minimum 500 XAF)
- **Withdrawal Fee**: 100 XAF minimum

#### Host-Only Model

- **Host Service Fee**: 15% (minimum 1,000 XAF)
- **Guest Service Fee**: 0%
- **Withdrawal Fee**: 100 XAF minimum

### Get Fee Breakdown

**GET** `/api/v1/revenue/fee-breakdown`

Get a detailed breakdown of fees for a given amount.

**Query Parameters:**

- `amount` (required): The booking amount
- `currency` (optional): Currency code (default: XAF)

**Response:**

```json
{
  "success": true,
  "data": {
    "originalAmount": 50000,
    "fees": {
      "host": {
        "percentage": 5,
        "amount": 2500,
        "description": "Host service fee (5%)"
      },
      "guest": {
        "percentage": 3,
        "amount": 1500,
        "description": "Guest service fee (3%)"
      }
    },
    "totals": {
      "guestPays": 51500,
      "hostReceives": 47500,
      "platformRevenue": 4000
    },
    "currency": "XAF"
  }
}
```

### Calculate Fees

**POST** `/api/v1/revenue/calculate-fees`

Calculate fees for a booking amount (authenticated users).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 50000,
  "currency": "XAF"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "originalAmount": 50000,
    "hostServiceFee": 2500,
    "guestServiceFee": 1500,
    "totalGuestPays": 51500,
    "platformRevenue": 4000,
    "netAmountForHost": 47500,
    "currency": "XAF",
    "config": {
      "hostServiceFeePercent": 5,
      "guestServiceFeePercent": 3
    }
  }
}
```

### Get Current Revenue Configuration

**GET** `/api/v1/revenue/config`

Get the currently active revenue configuration.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cme6c0u0h0000u99ciwj73o1n",
    "name": "standard",
    "description": "Standard revenue model with 5% host fee and 3% guest fee",
    "hostServiceFeePercent": 5,
    "hostServiceFeeMin": 500,
    "hostServiceFeeMax": null,
    "guestServiceFeePercent": 3,
    "guestServiceFeeMin": 300,
    "guestServiceFeeMax": null,
    "isActive": true,
    "appliesToBooking": true,
    "appliesToWithdrawal": true
  }
}
```

### Admin: Get All Revenue Configurations

**GET** `/api/v1/revenue/configs`

Get all revenue configurations (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cme6c0u0h0000u99ciwj73o1n",
      "name": "standard",
      "description": "Standard revenue model with 5% host fee and 3% guest fee",
      "hostServiceFeePercent": 5,
      "hostServiceFeeMin": 500,
      "hostServiceFeeMax": null,
      "guestServiceFeePercent": 3,
      "guestServiceFeeMin": 300,
      "guestServiceFeeMax": null,
      "isActive": true,
      "appliesToBooking": true,
      "appliesToWithdrawal": true
    }
  ]
}
```

### Admin: Create Revenue Configuration

**POST** `/api/v1/revenue/configs`

Create a new revenue configuration (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "custom_model",
  "description": "Custom revenue model for special promotions",
  "hostServiceFeePercent": 4.5,
  "hostServiceFeeMin": 400,
  "hostServiceFeeMax": 5000,
  "guestServiceFeePercent": 2.5,
  "guestServiceFeeMin": 200,
  "guestServiceFeeMax": 3000,
  "isActive": false,
  "appliesToBooking": true,
  "appliesToWithdrawal": true
}
```

### Admin: Update Revenue Configuration

**PUT** `/api/v1/revenue/configs/:configId`

Update an existing revenue configuration (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "hostServiceFeePercent": 6.0,
  "hostServiceFeeMin": 600
}
```

### Admin: Activate Revenue Configuration

**PUT** `/api/v1/revenue/configs/:configId/activate`

Activate a revenue configuration (deactivates others) (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Revenue configuration activated successfully",
  "data": {
    "id": "cme6c0uee0002u99cwl0se5mn",
    "name": "host_only",
    "isActive": true
  }
}
```

### Admin: Get Revenue Statistics

**GET** `/api/v1/revenue/stats`

Get platform revenue statistics for a date range (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 150000,
    "hostFees": 100000,
    "guestFees": 45000,
    "withdrawalFees": 5000,
    "transactionCount": 45,
    "breakdown": {
      "HOST_FEE": 100000,
      "GUEST_FEE": 45000,
      "WITHDRAWAL_FEE": 5000
    }
  }
}
```

### Admin: Get Current Month Statistics

**GET** `/api/v1/revenue/stats/current-month`

Get current month revenue statistics (Admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 75000,
    "hostFees": 50000,
    "guestFees": 22500,
    "withdrawalFees": 2500,
    "transactionCount": 25,
    "breakdown": {
      "HOST_FEE": 50000,
      "GUEST_FEE": 22500,
      "WITHDRAWAL_FEE": 2500
    },
    "period": {
      "start": "2025-08-01T00:00:00.000Z",
      "end": "2025-08-31T23:59:59.999Z",
      "month": 8,
      "year": 2025
    }
  }
}
```

### Revenue Model Features

#### Flexible Configuration

- **Multiple Models**: Support for different revenue models
- **Percentage-Based**: Configurable percentage fees
- **Minimum/Maximum Limits**: Set fee limits to protect users
- **Easy Switching**: Admins can switch between models instantly

#### Fee Calculation

- **Real-Time Calculation**: Fees calculated instantly
- **Transparent Breakdown**: Clear fee breakdown for users
- **Currency Support**: Multi-currency support
- **Minimum Protection**: Ensures hosts receive reasonable amounts

#### Revenue Tracking

- **Detailed Records**: Every fee transaction is recorded
- **Analytics**: Comprehensive revenue statistics
- **Audit Trail**: Complete history of revenue changes
- **Reporting**: Monthly and custom date range reports

#### Business Rules

- **Host Protection**: Minimum fees ensure hosts receive fair amounts
- **Guest Transparency**: Clear fee disclosure before booking
- **Platform Sustainability**: Balanced fees for platform growth
- **Flexible Models**: Different models for different market conditions

### Integration with Booking System

When a booking is created:

1. **Fee Calculation**: System calculates host and guest fees
2. **Guest Payment**: Guest pays total amount including fees
3. **Host Receipt**: Host receives amount minus host fees
4. **Platform Revenue**: Platform keeps both host and guest fees
5. **Transaction Recording**: All fees are recorded for analytics

### Integration with Wallet System

When a withdrawal is processed:

1. **Fee Calculation**: System calculates withdrawal fee
2. **Net Amount**: User receives amount minus withdrawal fee
3. **Platform Revenue**: Platform keeps withdrawal fee
4. **Transaction Recording**: Fee is recorded for analytics

### Revenue Model Best Practices

#### For Hosts

- **Understand Fees**: Know your fee structure before listing
- **Price Accordingly**: Factor fees into your pricing strategy
- **Monitor Earnings**: Track your net earnings after fees
- **Optimize Listings**: Higher quality listings may justify higher fees

#### For Guests

- **Check Total Cost**: Always review total amount including fees
- **Compare Options**: Consider fees when comparing properties
- **Budget Accordingly**: Include fees in your travel budget
- **Ask Questions**: Contact support if fees seem unclear

#### For Platform

- **Balanced Approach**: Set fees that benefit all parties
- **Market Research**: Study competitor fee structures
- **Regular Review**: Periodically review and adjust fees
- **Transparency**: Always be clear about fee structures

This comprehensive revenue model ensures sustainable platform growth while providing fair compensation for all parties involved.

## Wallet System

### Get Wallet Balance

**Request:**

```http
GET /api/v1/wallet/balance
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

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Wallet not found",
  "error": "User wallet does not exist"
}
```

### Get Transaction History

**Request:**

```http
GET /api/v1/wallet/transactions?type=PAYMENT&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `type` (optional): Filter by transaction type (PAYMENT, REFUND, WITHDRAWAL, DEPOSIT, FEE, BONUS)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "transactions": [
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

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Invalid query parameters",
  "error": "Invalid transaction type"
}
```

### Process Refund

- **POST** `/api/v1/wallet/refund/:bookingId`
- **Description**: Process refund for a booking
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "reason": "Guest cancellation",
  "amount": 5000
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "transaction": {
      "id": "txn_456",
      "amount": 5000,
      "type": "REFUND",
      "status": "COMPLETED"
    }
  }
}
```

### Withdraw from Wallet

- **POST** `/api/v1/wallet/withdraw`
- **Description**: Withdraw funds from wallet
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "amount": 10000,
  "paymentMethod": "MOBILE_MONEY",
  "accountNumber": "237123456789"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "data": {
    "transaction": {
      "id": "txn_789",
      "amount": 10000,
      "type": "WITHDRAWAL",
      "status": "PENDING"
    }
  }
}
```

## Favorites System

### Add Property to Favorites

- **POST** `/api/v1/favorites`
- **Description**: Add a property to user's favorites
- **Headers**: `Authorization: Bearer <token>`
- **Body**:

```json
{
  "propertyId": "prop_123"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Property added to favorites successfully",
  "data": {
    "favorite": {
      "id": "fav_123",
      "userId": "user_456",
      "propertyId": "prop_123",
      "property": {
        "id": "prop_123",
        "title": "Cozy Beachfront Villa",
        "price": 100,
        "currency": "XAF",
        "city": "Limbe",
        "images": ["image1.jpg", "image2.jpg"]
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Remove Property from Favorites

- **DELETE** `/api/v1/favorites/:propertyId`
- **Description**: Remove a property from user's favorites
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "success": true,
  "message": "Property removed from favorites"
}
```

### Get User's Favorite Properties

- **GET** `/api/v1/favorites`
- **Description**: Get user's favorite properties
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response**:

```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "id": "prop_123",
        "title": "Cozy Beachfront Villa",
        "description": "Beautiful villa with ocean views",
        "type": "VILLA",
        "price": 100,
        "currency": "XAF",
        "city": "Limbe",
        "bedrooms": 3,
        "bathrooms": 2,
        "images": ["image1.jpg", "image2.jpg"],
        "host": {
          "id": "host_123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Check if Property is Favorited

- **GET** `/api/v1/favorites/check/:propertyId`
- **Description**: Check if a property is in user's favorites
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "success": true,
  "data": {
    "isFavorited": true
  }
}
```

### Get Property Favorite Count

- **GET** `/api/v1/favorites/count/:propertyId`
- **Description**: Get the number of users who favorited a property
- **Response**:

```json
{
  "success": true,
  "data": {
    "count": 15
  }
}
```

### Get User's Favorite Count

- **GET** `/api/v1/favorites/user/count`
- **Description**: Get the number of properties in user's favorites
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "success": true,
  "data": {
    "count": 8
  }
}
```

## Host Approval System

The Room Finder platform includes a comprehensive host approval system to ensure quality standards and maintain trust between guests and property owners. This system helps verify that hosts are legitimate property owners or managers who can provide quality accommodations.

### Host Approval Overview

The host approval system provides:

1. **Application Process**: Users can apply to become hosts
2. **Admin Review**: Administrators review and approve/reject applications
3. **Status Tracking**: Track approval status (PENDING, APPROVED, REJECTED, SUSPENDED)
4. **Property Verification**: Verify property ownership and quality
5. **Email Notifications**: Automatic notifications for application status changes

### Apply to Become a Host

**POST** `/api/v1/host/apply`

Submit a host application (authenticated users only).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyAddress": "123 Main Street, Douala, Cameroon",
  "propertyType": "APARTMENT",
  "propertyDescription": "Modern 2-bedroom apartment in city center",
  "experience": "I have been managing this property for 2 years",
  "reason": "I want to provide quality accommodation to travelers",
  "additionalNotes": "Property is fully furnished and includes parking"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Host application submitted successfully",
  "data": {
    "id": "app_123",
    "status": "PENDING",
    "submittedAt": "2025-08-11T10:30:00Z",
    "estimatedReviewTime": "2-3 business days"
  }
}
```

### Get Host Application Status

**GET** `/api/v1/host/application-status`

Get the current status of your host application.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "APPROVED",
    "submittedAt": "2025-08-11T10:30:00Z",
    "reviewedAt": "2025-08-13T14:20:00Z",
    "notes": "Application approved. Welcome to Room Finder!",
    "rejectionReason": null
  }
}
```

### Admin: Get All Host Applications

**GET** `/api/v1/admin/host-applications`

Get all host applications (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, SUSPENDED)

**Response:**

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_123",
        "userId": "user_456",
        "status": "PENDING",
        "propertyAddress": "123 Main Street, Douala, Cameroon",
        "propertyType": "APARTMENT",
        "propertyDescription": "Modern 2-bedroom apartment in city center",
        "experience": "I have been managing this property for 2 years",
        "reason": "I want to provide quality accommodation to travelers",
        "additionalNotes": "Property is fully furnished and includes parking",
        "submittedAt": "2025-08-11T10:30:00Z",
        "reviewedAt": null,
        "notes": null,
        "rejectionReason": null,
        "user": {
          "id": "user_456",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+237612345678",
          "isVerified": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Admin: Review Host Application

**PUT** `/api/v1/admin/host-applications/:applicationId/review`

Review and approve/reject a host application (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "APPROVED",
  "notes": "Application approved after property verification. Welcome to Room Finder!",
  "rejectionReason": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Host application reviewed successfully",
  "data": {
    "id": "app_123",
    "status": "APPROVED",
    "reviewedAt": "2025-08-13T14:20:00Z",
    "notes": "Application approved after property verification. Welcome to Room Finder!",
    "user": {
      "id": "user_456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "HOST"
    }
  }
}
```

### Admin: Suspend Host Account

**PUT** `/api/v1/admin/hosts/:userId/suspend`

Suspend a host account (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Multiple guest complaints about property condition",
  "duration": "30 days"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Host account suspended successfully",
  "data": {
    "userId": "user_456",
    "status": "SUSPENDED",
    "suspendedAt": "2025-08-13T14:20:00Z",
    "reason": "Multiple guest complaints about property condition",
    "duration": "30 days"
  }
}
```

### Admin: Reactivate Host Account

**PUT** `/api/v1/admin/hosts/:userId/reactivate`

Reactivate a suspended host account (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Host account reactivated successfully",
  "data": {
    "userId": "user_456",
    "status": "APPROVED",
    "reactivatedAt": "2025-08-13T14:20:00Z"
  }
}
```

### Get Host Approval Statistics

**GET** `/api/v1/admin/host-approval-stats`

Get host approval statistics (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "pending": 5,
    "approved": 15,
    "rejected": 3,
    "suspended": 2,
    "approvalRate": 60.0,
    "averageReviewTime": "2.5 days",
    "recentApplications": [
      {
        "id": "app_123",
        "status": "PENDING",
        "submittedAt": "2025-08-11T10:30:00Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

### Host Approval System Features

#### For Applicants

- **Easy Application**: Simple online application process
- **Status Tracking**: Real-time application status updates
- **Email Notifications**: Automatic notifications for status changes
- **Reapplication**: Ability to reapply if initially rejected
- **Support**: Dedicated support for application questions

#### For Admins

- **Comprehensive Review**: Full application details for review
- **Flexible Decisions**: Approve, reject, or request more information
- **Account Management**: Suspend or reactivate host accounts
- **Statistics**: Track approval rates and review times
- **Quality Control**: Maintain platform standards

#### For Platform

- **Quality Assurance**: Ensure only qualified hosts join
- **Trust Building**: Verified hosts increase guest confidence
- **Fraud Prevention**: Prevent fake property listings
- **Standards Maintenance**: Maintain consistent quality levels

### Host Approval Status Values

- **PENDING**: Application submitted, awaiting admin review
- **APPROVED**: Application approved, user can now create properties
- **REJECTED**: Application rejected, user cannot create properties
- **SUSPENDED**: Host account suspended, properties temporarily unavailable

### Business Rules

#### Application Requirements

- Users must be verified (email confirmed)
- Complete profile information required
- Valid property address and description
- Reasonable experience and motivation
- No previous rejections within 30 days

#### Review Process

- Applications reviewed within 2-3 business days
- Property verification may be required
- Additional documentation may be requested
- Clear feedback provided for rejections

#### Account Management

- Approved hosts can create unlimited properties
- Suspended hosts cannot create new properties
- Existing bookings honored during suspension
- Reactivation requires admin approval

#### Quality Standards

- Properties must meet safety standards
- Accurate property descriptions required
- Professional communication expected
- Guest satisfaction monitoring

### Integration with Property System

- Only approved hosts can create properties
- Property verification badge for approved hosts
- Quality metrics tracked for host performance
- Automatic suspension for policy violations

### Email Notifications

#### Application Submitted

- Confirmation email to applicant
- Notification to admin team
- Estimated review time provided

#### Application Reviewed

- Status update email to applicant
- Approval/rejection details included
- Next steps guidance provided

#### Account Suspension

- Suspension notification to host
- Reason and duration explained
- Appeal process information

This comprehensive host approval system ensures quality standards while providing a smooth onboarding experience for legitimate property owners.

### 8. Notifications

#### 8.1 Get User Notifications

**Request:**

```http
GET /notifications?page=1&limit=10&read=false
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `read` (optional): Filter by read status (true/false)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "cme6itv8j0004u9i4x6c38wmq",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "title": "Booking Confirmed",
        "body": "Your booking for Cozy Beachfront Villa has been confirmed.",
        "type": "BOOKING_CONFIRMED",
        "data": {
          "bookingId": "cme6itsi5000bu9i4canbgxat",
          "propertyId": "cme6itqoo0001u9i4x6c38wmq"
        },
        "status": "UNREAD",
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

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

#### 8.2 Get Notification Stats

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
    "total": 5,
    "unread": 3,
    "read": 2,
    "byType": {
      "BOOKING_CONFIRMED": 2,
      "PAYMENT_RECEIVED": 1,
      "REVIEW_RECEIVED": 1,
      "ENQUIRY_RECEIVED": 1
    }
  }
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

#### 8.3 Get Notification Preferences

```http
GET /notifications/preferences
Authorization: Bearer <token>
```

#### 8.4 Update Notification Preferences

```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": true,
  "push": true,
  "sms": false
}
```

#### 8.5 Mark Notification as Read

```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

#### 8.6 Mark All Notifications as Read

```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

#### 8.7 Delete Notification

```http
DELETE /notifications/:notificationId
Authorization: Bearer <token>
```

### 9. File Upload

#### 9.1 Upload Single Image

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
    "image": "uploads/avatar/image1.jpg",
    "url": "http://localhost:5000/uploads/avatar/image1.jpg"
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Upload failed",
  "error": "No image file provided"
}
```

**Response (Error - 413):**

```json
{
  "success": false,
  "message": "File too large",
  "error": "Image size exceeds 5MB limit"
}
```

#### 9.2 Upload Multiple Images

```http
POST /uploads/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [file1, file2, file3]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "images": [
      "uploads/property/image1.jpg",
      "uploads/property/image2.jpg",
      "uploads/property/image3.jpg"
    ]
  }
}
```

#### 9.3 Update Property Images (Host Only)

```http
PUT /uploads/property/:propertyId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [file1, file2, file3]
}
```

#### 9.4 Delete Image

```http
DELETE /uploads/:folder/:fileName
Authorization: Bearer <token>
```

#### 9.5 Get Image Info

```http
GET /uploads/:folder/:fileName
Authorization: Bearer <token>
```

### 10. Push Notifications

#### 10.1 Register Device Token

```http
POST /push-notifications/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceToken": "fcm-device-token",
  "platform": "android" // android, ios, web
}
```

#### 10.2 Unregister Device Token

```http
POST /push-notifications/unregister-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceToken": "fcm-device-token"
}
```

#### 10.3 Get User Device Tokens

```http
GET /push-notifications/device-tokens
Authorization: Bearer <token>
```

#### 10.4 Send Test Notification

```http
POST /push-notifications/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Notification",
  "message": "This is a test notification"
}
```

#### 10.5 Subscribe to Topic

```http
POST /push-notifications/subscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "general",
  "deviceToken": "fcm-device-token"
}
```

#### 10.6 Unsubscribe from Topic

```http
POST /push-notifications/unsubscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "general",
  "deviceToken": "fcm-device-token"
}
```

#### 10.7 Send Notification to Topic (Admin Only)

```http
POST /push-notifications/send-to-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "general",
  "title": "System Notification",
  "message": "System maintenance scheduled"
}
```

#### 10.8 Cleanup Inactive Tokens (Admin Only)

```http
POST /push-notifications/cleanup-tokens
Authorization: Bearer <token>
```

### 11. Admin Dashboard

#### 11.1 Get Dashboard Stats

```http
GET /admin/dashboard
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalProperties": 75,
    "totalBookings": 300,
    "totalRevenue": 15000000,
    "currency": "XAF",
    "monthlyRevenue": 2500000,
    "pendingBookings": 25,
    "pendingVerifications": 10,
    "recentBookings": [
      {
        "id": "booking-id",
        "propertyTitle": "Cozy Room",
        "guestName": "John Doe",
        "totalPrice": 50000,
        "status": "PENDING",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 11.2 Get All Users

```http
GET /admin/users?page=1&limit=10&role=GUEST&isVerified=true
Authorization: Bearer <token>
```

#### 11.3 Update User

```http
PUT /admin/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "HOST",
  "isVerified": true
}
```

#### 11.4 Delete User

```http
DELETE /admin/users/:userId
Authorization: Bearer <token>
```

#### 11.5 Get All Properties

```http
GET /admin/properties?page=1&limit=10&isVerified=true&isAvailable=true
Authorization: Bearer <token>
```

#### 11.6 Update Property

```http
PUT /admin/properties/:propertyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true,
  "isAvailable": true
}
```

#### 11.7 Get All Bookings

```http
GET /admin/bookings?page=1&limit=10&status=PENDING
Authorization: Bearer <token>
```

#### 11.8 Get System Notifications

```http
GET /admin/notifications
Authorization: Bearer <token>
```

#### 11.9 Send System Notification

```http
POST /admin/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "System Maintenance",
  "message": "System will be down for maintenance on Sunday",
  "type": "SYSTEM",
  "targetUsers": "ALL" // ALL, GUESTS, HOSTS, SPECIFIC
}
```

#### 11.10 Get System Analytics

```http
GET /admin/analytics?period=monthly&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 15000000,
      "monthly": 2500000,
      "weekly": 625000,
      "daily": 83333
    },
    "bookings": {
      "total": 300,
      "pending": 25,
      "confirmed": 200,
      "completed": 75
    },
    "properties": {
      "total": 75,
      "available": 60,
      "booked": 15
    },
    "users": {
      "total": 150,
      "guests": 100,
      "hosts": 50
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error types:

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Server error

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Pagination

Most list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## File Upload

For file uploads, use `multipart/form-data` content type. Supported file types:

- Images: JPG, JPEG, PNG, GIF (max 5MB each)
- Documents: PDF (max 10MB)

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute
- File uploads: 10 requests per minute

## Webhooks

### Payment Webhook

```http
POST /bookings/webhook/payment
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "status": "SUCCESS",
  "amount": 50000,
  "currency": "XAF",
  "reference": "REF123"
}
```

### Fapshi Webhook

```http
POST /payments/webhook
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "status": "SUCCESS",
  "amount": 50000,
  "currency": "XAF",
  "reference": "REF123"
}
```

## Property Enquiry System

The Room Finder platform includes a comprehensive enquiry system that allows guests to contact property owners with questions about properties before making a booking. This system facilitates communication between guests and hosts while maintaining proper tracking and notifications.

### Enquiry System Overview

The enquiry system provides:

1. **Guest Enquiries**: Guests can send questions to property owners
2. **Host Responses**: Property owners can respond to enquiries
3. **Status Tracking**: Track enquiry status (PENDING, RESPONDED, CLOSED, SPAM)
4. **Priority Levels**: Set enquiry priority (LOW, NORMAL, HIGH, URGENT)
5. **Email Notifications**: Automatic email notifications for new enquiries and responses
6. **Duplicate Prevention**: Prevents spam by limiting enquiries per property per 24 hours

### Create Property Enquiry

**POST** `/api/v1/enquiries`

Create a new enquiry for a property (guests only).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": "cme6cm04y0002u9w2mgsaoyhb",
  "subject": "Availability Question",
  "message": "Hi! I am interested in your property. Is it available for the weekend of December 15-17? Also, do you allow pets? Thank you!",
  "priority": "NORMAL"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Enquiry sent successfully",
  "data": {
    "id": "cme6cmyw80001u9bzjirc7qa5",
    "subject": "Availability Question",
    "message": "Hi! I am interested in your property...",
    "status": "PENDING",
    "priority": "NORMAL",
    "isRead": false,
    "response": null,
    "respondedAt": null,
    "createdAt": "2025-08-11T00:03:06.920Z",
    "updatedAt": "2025-08-11T00:03:06.920Z",
    "propertyId": "cme6cm04y0002u9w2mgsaoyhb",
    "guestId": "cme6cjif10000u9w2rtqk7up9",
    "hostId": "cme6bm7y20000u979h43eipjv",
    "property": {
      "id": "cme6cm04y0002u9w2mgsaoyhb",
      "title": "Test Property for Enquiries",
      "city": "Douala",
      "images": ["https://example.com/test.jpg"]
    },
    "guest": {
      "id": "cme6cjif10000u9w2rtqk7up9",
      "firstName": "Test",
      "lastName": "Guest",
      "email": "testguest@example.com",
      "avatar": null
    },
    "host": {
      "id": "cme6bm7y20000u979h43eipjv",
      "firstName": "Test",
      "lastName": "Host4",
      "email": "testhost4@example.com",
      "avatar": null
    }
  }
}
```

### Get User Enquiries

**GET** `/api/v1/enquiries`

Get enquiries for the authenticated user (as guest or host).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, RESPONDED, CLOSED, SPAM)
- `priority` (optional): Filter by priority (LOW, NORMAL, HIGH, URGENT)
- `propertyId` (optional): Filter by property ID

**Response:**

```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": "cme6cmyw80001u9bzjirc7qa5",
        "subject": "Availability Question",
        "message": "Hi! I am interested in your property...",
        "status": "RESPONDED",
        "priority": "NORMAL",
        "isRead": false,
        "response": "Hi Test! Thank you for your enquiry...",
        "respondedAt": "2025-08-11T00:07:14.768Z",
        "createdAt": "2025-08-11T00:03:06.920Z",
        "updatedAt": "2025-08-11T00:07:14.769Z",
        "property": {
          "id": "cme6cm04y0002u9w2mgsaoyhb",
          "title": "Test Property for Enquiries",
          "city": "Douala",
          "images": ["https://example.com/test.jpg"]
        },
        "guest": {
          "id": "cme6cjif10000u9w2rtqk7up9",
          "firstName": "Test",
          "lastName": "Guest",
          "email": "testguest@example.com",
          "avatar": null
        },
        "host": {
          "id": "cme6bm7y20000u979h43eipjv",
          "firstName": "Test",
          "lastName": "Host4",
          "email": "testhost4@example.com",
          "avatar": null
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Get Enquiry by ID

**GET** `/api/v1/enquiries/:enquiryId`

Get a specific enquiry by ID (accessible to guest, host, or admin).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cme6cmyw80001u9bzjirc7qa5",
    "subject": "Availability Question",
    "message": "Hi! I am interested in your property...",
    "status": "RESPONDED",
    "priority": "NORMAL",
    "isRead": false,
    "response": "Hi Test! Thank you for your enquiry...",
    "respondedAt": "2025-08-11T00:07:14.768Z",
    "createdAt": "2025-08-11T00:03:06.920Z",
    "updatedAt": "2025-08-11T00:07:14.769Z",
    "property": {
      "id": "cme6cm04y0002u9w2mgsaoyhb",
      "title": "Test Property for Enquiries",
      "city": "Douala",
      "images": ["https://example.com/test.jpg"],
      "host": {
        "id": "cme6bm7y20000u979h43eipjv",
        "firstName": "Test",
        "lastName": "Host4",
        "email": "testhost4@example.com",
        "phone": null
      }
    },
    "guest": {
      "id": "cme6cjif10000u9w2rtqk7up9",
      "firstName": "Test",
      "lastName": "Guest",
      "email": "testguest@example.com",
      "phone": "1234567890",
      "avatar": null
    },
    "host": {
      "id": "cme6bm7y20000u979h43eipjv",
      "firstName": "Test",
      "lastName": "Host4",
      "email": "testhost4@example.com",
      "phone": null,
      "avatar": null
    }
  }
}
```

### Respond to Enquiry

**POST** `/api/v1/enquiries/:enquiryId/respond`

Respond to an enquiry (host only).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "response": "Hi Test! Thank you for your enquiry. Yes, the property is available for December 15-17. Unfortunately, we do not allow pets at this property. The total cost for 2 nights would be 60,000 XAF. Please let me know if you would like to proceed with a booking!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response sent successfully",
  "data": {
    "id": "cme6cmyw80001u9bzjirc7qa5",
    "subject": "Availability Question",
    "message": "Hi! I am interested in your property...",
    "status": "RESPONDED",
    "priority": "NORMAL",
    "isRead": false,
    "response": "Hi Test! Thank you for your enquiry...",
    "respondedAt": "2025-08-11T00:07:14.768Z",
    "createdAt": "2025-08-11T00:03:06.920Z",
    "updatedAt": "2025-08-11T00:07:14.769Z",
    "property": {
      "id": "cme6cm04y0002u9w2mgsaoyhb",
      "title": "Test Property for Enquiries",
      "city": "Douala"
    },
    "guest": {
      "id": "cme6cjif10000u9w2rtqk7up9",
      "firstName": "Test",
      "lastName": "Guest",
      "email": "testguest@example.com"
    },
    "host": {
      "id": "cme6bm7y20000u979h43eipjv",
      "firstName": "Test",
      "lastName": "Host4",
      "email": "testhost4@example.com"
    }
  }
}
```

### Update Enquiry Status

**PUT** `/api/v1/enquiries/:enquiryId/status`

Update enquiry status (host or admin only).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "CLOSED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Enquiry status updated successfully",
  "data": {
    "id": "cme6cmyw80001u9bzjirc7qa5",
    "status": "CLOSED",
    "property": {
      "id": "cme6cm04y0002u9w2mgsaoyhb",
      "title": "Test Property for Enquiries"
    },
    "guest": {
      "id": "cme6cjif10000u9w2rtqk7up9",
      "firstName": "Test",
      "lastName": "Guest"
    },
    "host": {
      "id": "cme6bm7y20000u979h43eipjv",
      "firstName": "Test",
      "lastName": "Host4"
    }
  }
}
```

### Get Enquiry Statistics

**GET** `/api/v1/enquiries/stats`

Get enquiry statistics for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 1,
    "unread": 1,
    "pending": 0,
    "responded": 1,
    "closed": 0,
    "spam": 0
  }
}
```

### Get Property Enquiries

**GET** `/api/v1/enquiries/property/:propertyId`

Get all enquiries for a specific property (host only).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority

**Response:**

```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": "cme6cmyw80001u9bzjirc7qa5",
        "subject": "Availability Question",
        "message": "Hi! I am interested in your property...",
        "status": "RESPONDED",
        "priority": "NORMAL",
        "isRead": false,
        "response": "Hi Test! Thank you for your enquiry...",
        "respondedAt": "2025-08-11T00:07:14.768Z",
        "createdAt": "2025-08-11T00:03:06.920Z",
        "updatedAt": "2025-08-11T00:07:14.769Z",
        "guest": {
          "id": "cme6cjif10000u9w2rtqk7up9",
          "firstName": "Test",
          "lastName": "Guest",
          "email": "testguest@example.com",
          "avatar": null
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Admin: Get All Enquiries

**GET** `/api/v1/enquiries/admin/all`

Get all enquiries in the system (admin only).

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `propertyId` (optional): Filter by property ID
- `guestId` (optional): Filter by guest ID
- `hostId` (optional): Filter by host ID

### Enquiry System Features

#### For Guests

- **Ask Questions**: Send enquiries about properties before booking
- **Track Responses**: See when hosts respond to your enquiries
- **Multiple Properties**: Send enquiries to different properties
- **Priority Setting**: Set urgency level for your enquiries
- **Email Notifications**: Receive email notifications for responses

#### For Hosts

- **Receive Enquiries**: Get notified of new property enquiries
- **Respond Easily**: Reply to guest questions directly
- **Status Management**: Mark enquiries as pending, responded, closed, or spam
- **Property Overview**: View all enquiries for each property
- **Email Notifications**: Receive email notifications for new enquiries

#### For Platform

- **Communication Hub**: Centralized communication between guests and hosts
- **Spam Prevention**: 24-hour cooldown prevents enquiry spam
- **Analytics**: Track enquiry patterns and response times
- **Quality Control**: Monitor enquiry quality and host responsiveness

### Enquiry Status Values

- **PENDING**: Enquiry sent, waiting for host response
- **RESPONDED**: Host has responded to the enquiry
- **CLOSED**: Enquiry conversation is complete
- **SPAM**: Enquiry marked as spam by host or admin

### Enquiry Priority Levels

- **LOW**: General questions, not urgent
- **NORMAL**: Standard enquiry priority (default)
- **HIGH**: Important questions requiring prompt response
- **URGENT**: Critical questions requiring immediate attention

### Business Rules

#### Enquiry Creation

- Guests can only send enquiries for available properties
- Maximum one enquiry per property per 24 hours per guest
- Enquiries require a subject (5-100 characters) and message (10-1000 characters)
- Priority can be set to LOW, NORMAL, HIGH, or URGENT

#### Enquiry Responses

- Only the property host can respond to enquiries
- Responses must be between 10-1000 characters
- Once responded, enquiry status changes to RESPONDED
- Hosts cannot respond to already responded enquiries

#### Status Management

- Hosts and admins can update enquiry status
- Status can be changed to PENDING, RESPONDED, CLOSED, or SPAM
- Status changes are tracked with timestamps

#### Notifications

- Hosts receive email notifications for new enquiries
- Guests receive email notifications for responses
- In-app notifications are created for both parties
- Push notifications are sent if device tokens are available

#### Booking System

- Enquiries can lead to bookings
- Enquiry history is available for booking context
- Hosts can reference previous enquiries when managing bookings

This comprehensive enquiry system ensures effective communication between guests and hosts while maintaining proper tracking, notifications, and spam prevention.

## Property Owner Guide

This guide helps property owners understand how to use the Room Finder platform to list and manage their properties.

### Getting Started

#### 1. Account Registration

- Register as a regular user (GUEST role)
- Verify your email address
- Complete your profile with accurate information

#### 2. Host Application Process

- Submit a host application through the platform
- Provide detailed information about your property and experience
- Wait for admin review (typically 2-3 business days)
- Receive approval or rejection notification

**Host Application Requirements:**

- Valid email address
- Property ownership or management rights
- Compliance with local regulations
- Commitment to quality guest experience

#### 3. Property Verification

- Admins may conduct property verification
- Field agents may visit your property
- Additional documentation may be required
- Verification ensures quality standards

#### 4. Account Approval

- Once approved, your role changes to HOST
- You can now create and manage properties
- Access to host dashboard and tools
- Ability to receive bookings and payments

### Property Management

#### Creating Properties

- Only approved hosts can create properties
- Email verification required
- Provide accurate property information
- Upload high-quality photos
- Set competitive pricing

#### Property Requirements

- Valid property address
- Accurate room/bedroom counts
- Clear amenity descriptions
- Professional photos
- Honest property descriptions

#### Property Verification

- Properties start as unverified
- Admin review for quality assurance
- Verification badge for trusted properties
- Regular quality audits

### Booking Management

#### Receiving Bookings

- Real-time booking notifications
- Review guest information
- Accept or decline requests
- Set house rules and policies

#### Guest Communication

- Respond promptly to inquiries
- Provide check-in instructions
- Address guest concerns
- Maintain professional communication

#### Cancellation Policy

- Set clear cancellation terms
- Handle cancellations professionally
- Follow platform policies
- Maintain guest satisfaction

### Financial Management

#### Payment Processing

- Secure payment through Fapshi
- Automatic payment processing
- Transparent fee structure
- Regular payout schedules

#### Wallet System

- Track earnings in real-time
- View transaction history
- Request withdrawals
- Monitor payment status

#### Pricing Strategy

- Research market rates
- Set competitive pricing
- Adjust for peak seasons
- Consider local demand

### Quality Standards

#### Property Maintenance

- Regular property upkeep
- Clean and safe environment
- Functional amenities
- Professional presentation

#### Guest Experience

- Warm and welcoming atmosphere
- Clear communication
- Prompt issue resolution
- Positive guest reviews

#### Compliance

- Follow local regulations
- Maintain safety standards
- Respect guest privacy
- Adhere to platform policies

### Support and Resources

#### Customer Support

- 24/7 platform support
- Dedicated host assistance
- Technical troubleshooting
- Policy guidance

#### Host Resources

- Best practices guide
- Marketing tips
- Pricing strategies
- Guest management tools

#### Community

- Host forums and discussions
- Networking opportunities
- Experience sharing
- Platform feedback

### Success Tips

#### Property Presentation

- Professional photography
- Accurate descriptions
- Highlight unique features
- Competitive pricing

#### Guest Service

- Quick response times
- Clear communication
- Flexible check-in options
- Local recommendations

#### Marketing

- Complete property profiles
- Regular availability updates
- Positive guest reviews
- Competitive pricing

#### Growth

- Start with one property
- Gather guest feedback
- Expand based on demand
- Build positive reputation

### Troubleshooting

#### Common Issues

- **Booking Problems**: Check availability settings
- **Payment Issues**: Verify payment information
- **Guest Complaints**: Address concerns promptly
- **Technical Issues**: Contact platform support

#### Getting Help

- Platform help center
- Support ticket system
- Community forums
- Direct support contact

### Best Practices

#### Before Listing

- Research local market
- Prepare property thoroughly
- Set competitive pricing
- Create detailed descriptions

#### During Operations

- Maintain property quality
- Respond to guests quickly
- Update availability regularly
- Monitor guest feedback

#### Long-term Success

- Build positive reviews
- Maintain property standards
- Stay competitive on pricing
- Engage with the community

This comprehensive guide ensures property owners can successfully use the Room Finder platform to maximize their rental income while providing excellent guest experiences.

#### 4.5 Check if User Has Booked a Property

```http
GET /bookings/has-booked/:propertyId?status=CONFIRMED&includeHistory=true
Authorization: Bearer <token>
```

**Description:** Check if the authenticated user has booked a specific property.

**Path Parameters:**
- `propertyId` (required): The ID of the property to check

**Query Parameters:**
- `status` (optional): Filter by booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `includeHistory` (optional): Include all booking history for this property (true/false)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "hasBooked": true,
    "property": {
      "id": "prop123",
      "title": "Beautiful Apartment in Douala"
    },
    "latestBooking": {
      "id": "booking123",
      "status": "CONFIRMED",
      "checkIn": "2025-09-15T00:00:00.000Z",
      "checkOut": "2025-09-20T00:00:00.000Z",
      "totalPrice": 250000,
      "createdAt": "2025-08-08T16:15:01.213Z"
    }
  }
}
```

**Response (Not Booked - 200):**
```json
{
  "success": true,
  "data": {
    "hasBooked": false,
    "property": {
      "id": "prop123",
      "title": "Beautiful Apartment in Douala"
    },
    "latestBooking": null
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Use Cases:**
- Check if user can leave a review (only users who have booked can review)
- Display "Book Again" button for previously booked properties
- Validate user permissions for property-related actions
- Show booking history for a specific property

