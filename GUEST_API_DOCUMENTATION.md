# Room Finder Guest API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Property Search & Discovery](#property-search--discovery)
3. [Booking Management](#booking-management)
4. [Guest Dashboard](#guest-dashboard)
5. [Reviews & Ratings](#reviews--ratings)
6. [Enquiries](#enquiries)
7. [Favorites](#favorites)
8. [Wallet & Payments](#wallet--payments)
9. [Notifications](#notifications)
10. [Profile Management](#profile-management)
11. [Host Application](#host-application)
12. [Blog & Content](#blog--content)
13. [Help Center](#help-center)
14. [File Upload](#file-upload)
15. [Co-Host Invitations](#co-host-invitations)
16. [Enhanced Profile Management](#enhanced-profile-management)
17. [Enhanced Notifications](#enhanced-notifications)
18. [Push Notifications](#push-notifications)

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

#### 1.1 Guest Registration

**Request:**

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Guest",
  "email": "guest@example.com",
  "password": "password123",
  "phone": "+237612345679",
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
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Guest",
      "email": "guest@example.com",
      "phone": "+237612345679",
      "role": "GUEST",
      "isVerified": false,
      "avatar": null,
      "createdAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

#### 1.2 Guest Login

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "guest@example.com",
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
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Guest",
      "email": "guest@example.com",
      "phone": "+237612345679",
      "role": "GUEST",
      "isVerified": true,
      "avatar": null,
      "createdAt": "2025-08-11T01:28:01.559Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Property Search & Discovery

#### 2.1 Search Properties

**Request:**

```http
GET /properties?page=1&limit=10&isAvailable=true&type=VILLA&city=Limbe&minPrice=50000&maxPrice=100000
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isAvailable` (optional): Filter by availability (true/false)
- `type` (optional): Property type (ROOM, STUDIO, APARTMENT, VILLA, SUITE, DORMITORY, COTTAGE, PENTHOUSE)
- `city` (optional): Filter by city
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `bedrooms` (optional): Number of bedrooms
- `bathrooms` (optional): Number of bathrooms
- `maxGuests` (optional): Maximum guests

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

#### 2.2 Get Property Details

**Request:**

```http
GET /properties/cme6itqoo0001u9i4x6c38wmq
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
      "createdAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 2.3 Get Property Reviews

**Request:**

```http
GET /reviews/property/cme6itqoo0001u9i4x6c38wmq?page=1&limit=10
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

### 3. Booking Management

#### 3.1 Calculate Booking Fees

**Request:**

```http
GET /bookings/calculate-fees?propertyId=cme6itqoo0001u9i4x6c38wmq&checkIn=2025-08-15&checkOut=2025-08-17&guests=2
Authorization: Bearer <token>
```

**Query Parameters:**

- `propertyId` (required): ID of the property to book
- `checkIn` (required): Check-in date (YYYY-MM-DD format)
- `checkOut` (required): Check-out date (YYYY-MM-DD format)
- `guests` (required): Number of guests

**Response (Success - 200):**

```json
{
  "message": "Fee calculation successful",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "price": 75000,
      "currency": "XAF"
    },
    "booking": {
      "checkIn": "2025-08-15T00:00:00.000Z",
      "checkOut": "2025-08-17T00:00:00.000Z",
      "nights": 2,
      "guests": 2,
      "baseAmount": 150000
    },
    "fees": {
      "hostServiceFee": 7500,
      "hostServiceFeePercent": 5.0,
      "guestServiceFee": 4500,
      "guestServiceFeePercent": 3.0
    },
    "totals": {
      "baseAmount": 150000,
      "guestServiceFee": 4500,
      "totalGuestPays": 154500,
      "hostServiceFee": 7500,
      "netAmountForHost": 142500,
      "platformRevenue": 12000
    },
    "currency": "XAF"
  }
}
```

**Error Responses:**

**Missing Parameters (400):**

```json
{
  "error": "Missing required parameters",
  "message": "propertyId, checkIn, checkOut, and guests are required"
}
```

**Property Not Available (400):**

```json
{
  "error": "Property not available",
  "message": "The property is not available for the selected dates"
}
```

**Too Many Guests (400):**

```json
{
  "error": "Too many guests",
  "message": "This property can only accommodate up to 6 guests"
}
```

#### 3.2 Create Booking with Direct Payment

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
  "paymentMethod": "MOBILE_MONEY",
  "phone": "612345678"
}
```

**Request Body Fields:**

- `propertyId` (required): ID of the property to book
- `checkIn` (required): Check-in date (YYYY-MM-DD format)
- `checkOut` (required): Check-out date (YYYY-MM-DD format)
- `guests` (required): Number of guests
- `specialRequests` (optional): Any special requests for the host
- `paymentMethod` (required): Payment method - "MOBILE_MONEY" or "ORANGE_MONEY"
- `phone` (required): Guest's phone number in Cameroon format (6XXXXXXXX)

**Response (Success - 201):**

```json
{
  "message": "Booking created and payment initiated successfully",
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
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": "ABC123XYZ",
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
    "createdAt": "2025-08-11T02:53:53.616Z"
  },
  "payment": {
    "transId": "ABC123XYZ",
    "status": "PENDING",
    "message": "Payment request sent to your phone",
    "dateInitiated": "2025-08-11T02:53:53.616Z"
  }
}
```

**What happens next:**

1. **Payment Request Sent**: A payment request is immediately sent to the guest's phone number
2. **Guest Receives Notification**: Guest receives MTN/Orange Money notification on their phone
3. **Guest Enters PIN**: Guest enters their mobile money PIN to confirm payment
4. **Payment Processed**: Payment is processed immediately through Fapshi
5. **Fees Applied**:
   - Guest pays: Base amount + Guest service fee (e.g., 3%)
   - Host receives: Base amount - Host service fee (e.g., 5%)
   - Platform revenue: Host fee + Guest fee
6. **Booking Confirmed**: Booking status automatically changes to "CONFIRMED" when payment succeeds
7. **Host Notified**: Host receives notification of successful payment and booking confirmation

**Error Responses:**

**Phone Number Required (400):**

```json
{
  "error": "Phone number required",
  "message": "Phone number is required for payment processing"
}
```

**Invalid Phone Number (400):**

```json
{
  "error": "Invalid phone number",
  "message": "Phone number must be in format: 6XXXXXXXX (Cameroon mobile number)"
}
```

**Payment Initialization Failed (500):**

```json
{
  "error": "Payment initialization failed",
  "message": "Failed to initialize payment. Please try again.",
  "details": "Payment service temporarily unavailable"
}
```

#### 3.2 Get Guest Bookings

**Request:**

```http
GET /bookings/my-bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

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

#### 3.3 Cancel Booking

**Request:**

```http
PUT /bookings/cme6itsi5000bu9i4canbgxat/cancel
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": "cme6itsi5000bu9i4canbgxat",
      "status": "CANCELLED",
      "updatedAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 3.4 Check Availability

**Request:**

```http
GET /bookings/availability?propertyId=cme6itqoo0001u9i4x6c38wmq&checkIn=2025-08-15&checkOut=2025-08-17
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "available": true,
    "totalPrice": 150000,
    "nights": 2,
    "pricePerNight": 75000
  }
}
```

### 4. Guest Dashboard

#### 4.1 Get Guest Dashboard Statistics

**Request:**

```http
GET /users/dashboard-stats
Authorization: Bearer <token>
```

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
    }
  }
}
```

### 5. Reviews & Ratings

#### 5.1 Create Review

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
      "createdAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 5.2 Get Guest Reviews

**Request:**

```http
GET /reviews/my-reviews?page=1&limit=10
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

### 6. Enquiries

#### 6.1 Create Property Enquiry

**Request:**

```http
POST /enquiries
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "cme6itqoo0001u9i4x6c38wmq",
  "subject": "Availability for next weekend",
  "message": "Hi, I'm interested in booking your villa for next weekend. Is it available?"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Enquiry created successfully",
  "data": {
    "enquiry": {
      "id": "cme6itv8j0003u9i4x6c38wmq",
      "propertyId": "cme6itqoo0001u9i4x6c38wmq",
      "guestId": "cme6iqlan0000u9vp9mlbrpb6",
      "subject": "Availability for next weekend",
      "message": "Hi, I'm interested in booking your villa for next weekend. Is it available?",
      "status": "PENDING",
      "createdAt": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 6.2 Get Guest Enquiries

**Request:**

```http
GET /enquiries/my-enquiries?page=1&limit=10
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
        "status": "RESPONDED",
        "hostResponse": "Yes, the villa is available for next weekend. The rate is 75,000 XAF per night.",
        "createdAt": "2025-08-11T02:53:53.616Z",
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

### 7. Favorites

#### 7.1 Add to Favorites

**Request:**

```http
POST /favorites/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Property added to favorites"
}
```

#### 7.2 Get Favorites

**Request:**

```http
GET /favorites?page=1&limit=10
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "cme6itv8j0007u9i4x6c38wmq",
        "propertyId": "cme6itqoo0001u9i4x6c38wmq",
        "userId": "cme6iqlan0000u9vp9mlbrpb6",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "price": 75000,
          "currency": "XAF",
          "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"],
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

#### 7.3 Remove from Favorites

**Request:**

```http
DELETE /favorites/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property removed from favorites"
}
```

### 8. Wallet & Payments

#### 8.1 Get Wallet Balance

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

#### 8.2 Get Available Payment Methods

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

#### 8.3 Initialize Payment for Booking

**Request:**

```http
POST /payments/booking/{bookingId}/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "MOBILE_MONEY"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentUrl": "https://fapshi.com/pay/BOOKING_123456",
    "reference": "BOOKING_123456",
    "status": "PENDING",
    "bookingId": "cme6itsi5000bu9i4canbgxat"
  }
}
```

#### 8.4 Verify Payment Status

**Request:**

```http
POST /payments/booking/{bookingId}/verify
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Payment verification completed",
  "data": {
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "COMPLETED",
    "verificationResult": {
      "status": "COMPLETED",
      "amount": 225000,
      "currency": "XAF",
      "reference": "BOOKING_123456",
      "transactionId": "TXN789",
      "paymentMethod": "MOBILE_MONEY",
      "customerInfo": {
        "name": "Jane Guest",
        "phone": "+237612345679",
        "email": "guest@example.com"
      },
      "timestamp": "2025-08-11T02:53:53.616Z"
    }
  }
}
```

#### 8.5 Get Payment History

**Request:**

```http
GET /payments/history?page=1&limit=10&type=PAYMENT
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
        "amount": 225000,
        "currency": "XAF",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for Cozy Beachfront Villa booking",
        "reference": "BOOKING_123456",
        "metadata": {
          "paymentMethod": "MOBILE_MONEY",
          "customerInfo": {
            "name": "Jane Guest",
            "phone": "+237612345679",
            "email": "guest@example.com"
          },
          "transactionId": "TXN789"
        },
        "booking": {
          "id": "cme6itsi5000bu9i4canbgxat",
          "title": "Cozy Beachfront Villa",
          "address": "123 Beach Road, Limbe"
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

#### 8.6 Get Transaction History

**Request:**

```http
GET /wallet/transactions?type=PAYMENT&page=1&limit=10
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

### 9. Notifications

#### 9.1 Get Notifications

**Request:**

```http
GET /notifications?page=1&limit=10&read=false
Authorization: Bearer <token>
```

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

#### 9.2 Mark Notification as Read

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

### 10. Profile Management

#### 10.1 Get Profile

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
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Guest",
      "email": "guest@example.com",
      "phone": "+237612345679",
      "role": "GUEST",
      "isVerified": true,
      "avatar": null,
      "createdAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

#### 10.2 Update Profile

**Request:**

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Guest",
  "phone": "+237612345679",
  "avatar": "uploads/avatar/guest-avatar.jpg"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Guest",
      "email": "guest@example.com",
      "phone": "+237612345679",
      "role": "GUEST",
      "isVerified": true,
      "avatar": "uploads/avatar/guest-avatar.jpg",
      "createdAt": "2025-08-11T01:28:01.559Z"
    }
  }
}
```

### 11. Host Application

#### 11.1 Submit Host Application

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
    "userId": "cme6iqlan0000u9vp9mlbrpb6",
    "status": "PENDING",
    "notes": "I have experience managing vacation rentals and would like to list my properties on your platform.",
    "applicationDate": "2025-08-11T01:28:01.559Z",
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z"
  }
}
```

#### 11.2 Get Application Status

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
    "userId": "cme6iqlan0000u9vp9mlbrpb6",
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

### 12. Blog & Content

#### 12.1 Get All Blog Posts

**Request:**

```http
GET /blog?page=1&limit=10&status=PUBLISHED
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
        "featuredImage": "https://example.com/image.jpg",
        "status": "PUBLISHED",
        "publishedAt": "2025-08-12T21:15:01.058Z",
        "viewCount": 150,
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
          "comments": 5
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

#### 12.2 Get Blog Post by Slug

**Request:**

```http
GET /blog/top-10-travel-destinations-cameroon
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "cme91ihxg0001u9ce9l7qsd6l",
    "title": "Top 10 Travel Destinations in Cameroon",
    "slug": "top-10-travel-destinations-cameroon",
    "excerpt": "Discover the most beautiful and exciting places to visit in Cameroon",
    "content": "Cameroon is a beautiful country with diverse landscapes and cultures. Here are the top 10 destinations you must visit...",
    "featuredImage": "https://example.com/image.jpg",
    "status": "PUBLISHED",
    "publishedAt": "2025-08-12T21:15:01.058Z",
    "viewCount": 150,
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
    "comments": [
      {
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
    ]
  }
}
```

#### 12.3 Get All Blog Tags

**Request:**

```http
GET /blog/tags
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

#### 12.4 Add Comment to Blog Post

**Request:**

```http
POST /blog/cme91ihxg0001u9ce9l7qsd6l/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great article! Very helpful for planning my trip to Cameroon."
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "cme91comment0001u9ce9l7qsd6l",
    "content": "Great article! Very helpful for planning my trip to Cameroon.",
    "isApproved": false,
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

### 13. Help Center

#### 13.1 Get All Help Articles

**Request:**

```http
GET /help-center?page=1&limit=10&category=GETTING_STARTED&isPublished=true
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
        "viewCount": 250,
        "helpfulCount": 45,
        "notHelpfulCount": 2,
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

#### 13.2 Get Help Article by Slug

**Request:**

```http
GET /help-center/how-to-book-first-property
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "cme91iv7c0003u9cewtn6b4ys",
    "title": "How to Book Your First Property",
    "slug": "how-to-book-first-property",
    "content": "Booking your first property on Room Finder is easy! Follow these simple steps...",
    "category": "GETTING_STARTED",
    "priority": "HIGH",
    "isPublished": true,
    "viewCount": 250,
    "helpfulCount": 45,
    "notHelpfulCount": 2,
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

#### 13.3 Search Help Articles

**Request:**

```http
GET /help-center/search?q=booking&page=1&limit=10
```

**Query Parameters:**

- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

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
        "excerpt": "Booking your first property on Room Finder is easy! Follow these simple steps...",
        "category": "GETTING_STARTED",
        "priority": "HIGH",
        "viewCount": 250,
        "helpfulCount": 45
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

#### 13.4 Get Articles by Category

**Request:**

```http
GET /help-center/category/GETTING_STARTED?page=1&limit=10
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "category": "GETTING_STARTED",
    "articles": [
      {
        "id": "cme91iv7c0003u9cewtn6b4ys",
        "title": "How to Book Your First Property",
        "slug": "how-to-book-first-property",
        "excerpt": "Booking your first property on Room Finder is easy! Follow these simple steps...",
        "priority": "HIGH",
        "viewCount": 250,
        "helpfulCount": 45
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

#### 13.5 Rate Help Article

**Request:**

```http
POST /help-center/cme91iv7c0003u9cewtn6b4ys/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "isHelpful": true
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Article rated successfully",
  "data": {
    "articleId": "cme91iv7c0003u9cewtn6b4ys",
    "isHelpful": true,
    "updatedCounts": {
      "helpfulCount": 46,
      "notHelpfulCount": 2
    }
  }
}
```

### 14. File Upload

#### 14.1 Upload Single Image

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
    "image": "uploads/avatar/guest-avatar.jpg",
    "url": "http://localhost:5000/uploads/avatar/guest-avatar.jpg"
  }
}
```

#### 14.2 Upload Multiple Images

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
      "uploads/properties/image1.jpg",
      "uploads/properties/image2.jpg",
      "uploads/properties/image3.jpg"
    ],
    "urls": [
      "http://localhost:5000/uploads/properties/image1.jpg",
      "http://localhost:5000/uploads/properties/image2.jpg",
      "http://localhost:5000/uploads/properties/image3.jpg"
    ]
  }
}
```

### 15. Co-Host Invitations

#### 15.1 Get My Co-Host Invitations

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

#### 15.2 Accept Co-Host Invitation

**Request:**

```http
PUT /co-hosts/invitations/cme6itqoo0001u9i4x6c38wmq/accept
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

#### 15.3 Decline Co-Host Invitation

**Request:**

```http
PUT /co-hosts/invitations/cme6itqoo0001u9i4x6c38wmq/decline
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Co-host invitation declined successfully"
}
```

#### 15.4 Leave Co-Host Position

**Request:**

```http
PUT /co-hosts/cme6itqoo0001u9i4x6c38wmq/leave
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "You have successfully left the co-host position"
}
```

### 16. Enhanced Profile Management

#### 16.1 Get Enhanced User Profile

**Request:**

```http
GET /users/profile
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "cme6iqlan0000u9vp9mlbrpb6",
    "email": "guest@example.com",
    "firstName": "Jane",
    "lastName": "Guest",
    "role": "GUEST",
    "isVerified": true,
    "phone": "+237612345679",
    "avatar": "uploads/avatar/guest-avatar.jpg",
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z",
    "properties": [],
    "bookings": [
      {
        "id": "cme6itsi5000bu9i4canbgxat",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-17T00:00:00.000Z",
        "status": "CONFIRMED",
        "totalPrice": 150000,
        "createdAt": "2025-08-11T02:53:53.616Z",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "city": "Limbe",
          "images": ["villa1.jpg", "villa2.jpg"]
        }
      }
    ],
    "reviews": [
      {
        "id": "cme6itv8j0002u9i4x6c38wmq",
        "rating": 5,
        "comment": "Excellent stay! The villa was beautiful.",
        "createdAt": "2025-08-11T02:53:53.616Z",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Cozy Beachfront Villa",
          "city": "Limbe"
        }
      }
    ]
  }
}
```

#### 16.2 Get User Statistics

**Request:**

```http
GET /users/stats
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "totalBookings": 3,
    "totalReviews": 2,
    "totalSpent": 225000,
    "averageRating": 4.5,
    "favoriteProperties": 1,
    "memberSince": "2025-08-11T01:28:01.559Z"
  }
}
```

#### 16.3 Get User Activity

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
        "type": "BOOKING_CREATED",
        "description": "Created booking for Cozy Beachfront Villa",
        "timestamp": "2025-08-11T02:53:53.616Z",
        "data": {
          "bookingId": "cme6itsi5000bu9i4canbgxat",
          "propertyTitle": "Cozy Beachfront Villa"
        }
      },
      {
        "type": "REVIEW_CREATED",
        "description": "Left a 5-star review for Cozy Beachfront Villa",
        "timestamp": "2025-08-11T02:55:00.000Z",
        "data": {
          "reviewId": "cme6itv8j0002u9i4x6c38wmq",
          "propertyTitle": "Cozy Beachfront Villa",
          "rating": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

#### 16.4 Delete User Account

**Request:**

```http
DELETE /users/account
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### 17. Enhanced Notifications

#### 17.1 Get Notification Statistics

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
    "breakdown": [
      {
        "status": "UNREAD",
        "_count": {
          "status": 3
        }
      },
      {
        "status": "READ",
        "_count": {
          "status": 2
        }
      }
    ]
  }
}
```

#### 17.2 Mark All Notifications as Read

**Request:**

```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "3 notifications marked as read",
  "data": {
    "updatedCount": 3
  }
}
```

#### 17.3 Delete Notification

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

#### 17.4 Get Notification Preferences

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
    "userId": "cme6iqlan0000u9vp9mlbrpb6",
    "emailNotifications": true,
    "pushNotifications": true,
    "bookingNotifications": true,
    "reviewNotifications": true,
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T01:28:01.559Z"
  }
}
```

#### 17.5 Update Notification Preferences

**Request:**

```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": false,
  "bookingNotifications": true,
  "reviewNotifications": false
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "userId": "cme6iqlan0000u9vp9mlbrpb6",
    "emailNotifications": true,
    "pushNotifications": false,
    "bookingNotifications": true,
    "reviewNotifications": false,
    "createdAt": "2025-08-11T01:28:01.559Z",
    "updatedAt": "2025-08-11T02:55:00.000Z"
  }
}
```

### 18. Push Notifications

#### 18.1 Register Device Token

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

#### 18.2 Unregister Device Token

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

#### 18.3 Get User's Device Tokens

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

#### 18.4 Send Test Push Notification

**Request:**

```http
POST /push-notifications/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test push notification for guests"
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

#### 18.5 Subscribe to Topic

**Request:**

```http
POST /push-notifications/subscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "property_updates"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Successfully subscribed to property_updates topic",
  "data": {
    "topic": "property_updates",
    "subscribedDevices": 2
  }
}
```

#### 18.6 Unsubscribe from Topic

**Request:**

```http
POST /push-notifications/unsubscribe-topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "property_updates"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Successfully unsubscribed from property_updates topic",
  "data": {
    "topic": "property_updates",
    "unsubscribedDevices": 2
  }
}
```

### Push Notification Features

#### Cross-Platform Support

- **Android**: Uses Firebase Cloud Messaging (FCM)
- **iOS**: Uses Apple Push Notification Service (APNs) through Firebase
- **Web**: Supports web push notifications
- **Flutter/React Native**: Works with mobile apps

#### Automatic Notifications

The system automatically sends push notifications for:

- **Booking Events**: Confirmations, updates, cancellations
- **Review Events**: New reviews, rating updates
- **System Events**: Welcome messages, account verification
- **Payment Events**: Payment confirmations, refunds

#### Topic Subscriptions

Guests can subscribe to topics for specific notifications:

- `property_updates` - New properties, price changes
- `booking_updates` - Booking status changes
- `promotions` - Special offers and deals
- `system_announcements` - Platform updates

#### Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only manage their own device tokens
- **Token Validation**: Automatic cleanup of invalid tokens
- **Secure Storage**: Tokens stored securely in database

#### Mobile App Integration

**Flutter Example:**

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

**React Native Example:**

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

## Error Responses

### Common Error Codes

**400 - Bad Request:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "propertyId": "Property ID is required",
    "checkIn": "Check-in date must be in the future"
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

**404 - Not Found:**

```json
{
  "success": false,
  "message": "Property not found",
  "error": "Property does not exist"
}
```

**409 - Conflict:**

```json
{
  "success": false,
  "message": "Property not available",
  "error": "Property is already booked for the selected dates"
}
```

## Property Types

Available property types:

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

- `MOBILE_MONEY` - MTN Mobile Money
- `ORANGE_MONEY` - Orange Money

## 9. Booking Process Flow

### Complete Booking Process Overview

The booking process in Room Finder follows a comprehensive flow from property selection to payment completion. This section details each step of the process.

#### 9.1 Property Discovery & Selection

**Step 1: Browse Properties**

```http
GET /api/v1/properties?page=1&limit=10&city=Bamenda&isAvailable=true
```

**Step 2: View Property Details**

```http
GET /api/v1/properties/{propertyId}
```

**Step 3: Check Property Availability**

```http
GET /api/v1/properties/{propertyId}/availability?checkIn=2025-08-15&checkOut=2025-08-17
```

#### 9.2 Fee Calculation

**Step 4: Calculate Booking Fees**

```http
GET /api/v1/bookings/calculate-fees?propertyId=cme6itqoo0001u9i4x6c38wmq&checkIn=2025-08-15&checkOut=2025-08-17&guests=2
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Fee calculation successful",
  "data": {
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Cozy Beachfront Villa",
      "price": 75000,
      "currency": "XAF"
    },
    "booking": {
      "checkIn": "2025-08-15T00:00:00.000Z",
      "checkOut": "2025-08-17T00:00:00.000Z",
      "nights": 2,
      "guests": 2,
      "baseAmount": 150000
    },
    "fees": {
      "hostServiceFee": 7500,
      "hostServiceFeePercent": 5.0,
      "guestServiceFee": 4500,
      "guestServiceFeePercent": 3.0
    },
    "totals": {
      "baseAmount": 150000,
      "guestServiceFee": 4500,
      "totalGuestPays": 154500,
      "hostServiceFee": 7500,
      "netAmountForHost": 142500,
      "platformRevenue": 12000
    },
    "currency": "XAF"
  }
}
```

**What this provides:**

- **Base Amount**: Original property price × nights
- **Guest Service Fee**: 3% of base amount (added to guest's payment)
- **Total Guest Pays**: Base amount + Guest service fee
- **Host Service Fee**: 5% of base amount (deducted from host's earnings)
- **Net Amount for Host**: Base amount - Host service fee
- **Platform Revenue**: Host fee + Guest fee

#### 9.3 Booking Creation with Direct Payment

**Step 5: Create Booking with Payment**

```http
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyId": "cme6itqoo0001u9i4x6c38wmq",
  "checkIn": "2025-08-15",
  "checkOut": "2025-08-17",
  "guests": 2,
  "specialRequests": "Early check-in if possible",
  "paymentMethod": "MOBILE_MONEY",
  "phone": "612345678"
}
```

**Response:**

```json
{
  "message": "Booking created and payment initiated successfully",
  "booking": {
    "id": "cme7md4iw0001u90n81c0jqlj",
    "propertyId": "cme6itqoo0001u9i4x6c38wmq",
    "guestId": "cme6fo5xz0000u9mo5li7lln7",
    "checkIn": "2025-08-15T00:00:00.000Z",
    "checkOut": "2025-08-17T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 150000,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": "ABC123XYZ",
    "specialRequests": "Early check-in if possible",
    "createdAt": "2025-08-14T19:30:00.000Z"
  },
  "payment": {
    "transId": "ABC123XYZ",
    "status": "PENDING",
    "message": "Payment request sent to your phone",
    "dateInitiated": "2025-08-14T19:30:00.000Z"
  }
}
```

**What happens immediately:**

1. **Booking Created**: Booking is created with `PENDING` status
2. **Payment Request Sent**: Fapshi direct-pay sends payment request to guest's phone
3. **Guest Receives Notification**: MTN/Orange Money notification appears on guest's phone
4. **Guest Enters PIN**: Guest enters mobile money PIN to confirm payment
5. **Payment Processed**: Payment is processed immediately through Fapshi
6. **Fees Calculated**: System calculates both host and guest service fees
7. **Host Wallet Credited**: Host receives base amount minus host service fee
8. **Platform Revenue Recorded**: Both host and guest fees are recorded as platform revenue
9. **Webhook Received**: Fapshi sends webhook to confirm payment status
10. **Booking Confirmed**: Booking automatically changes to `CONFIRMED` status

**Booking Status After Creation:**

- `status`: `PENDING` (awaiting payment confirmation)
- `paymentStatus`: `PENDING` (payment request sent)
- `paymentReference`: Transaction ID from Fapshi

#### 9.3 Payment Initialization

**Step 5: Get Available Payment Methods**

```http
GET /api/v1/payments/methods
```

**Response:**

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

**Step 6: Initialize Payment**

```http
POST /api/v1/payments/booking/{bookingId}/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "MOBILE_MONEY"
}
```

**Process:**

1. System validates booking ownership
2. Calls Fapshi's `direct-pay` endpoint with:
   ```json
   {
     "amount": 150000,
     "phone": "612345678",
     "medium": "mobile money",
     "name": "John Doe",
     "email": "john@example.com",
     "userId": "guest-id",
     "externalId": "booking-id",
     "message": "Payment for Beach Villa booking"
   }
   ```

**Response:**

```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "transId": "ABC123XYZ",
    "status": "PENDING",
    "message": "Payment initiated",
    "dateInitiated": "2023-12-25",
    "bookingId": "cme7md4iw0001u90n81c0jqlj"
  }
}
```

**Booking Status After Payment Initiation:**

- `status`: `PENDING` (awaiting payment confirmation)
- `paymentStatus`: `PENDING` (payment in progress)
- `paymentMethod`: `MOBILE_MONEY`
- `paymentReference`: `ABC123XYZ` (Fapshi transaction ID)

#### 9.4 Payment Processing (Fapshi Side)

**Step 7: User Payment Confirmation**

- Fapshi sends payment request to user's mobile device
- User receives MTN/Orange Money notification
- User enters PIN to confirm payment
- Fapshi processes the payment

#### 9.5 Webhook Processing (Automatic)

**Step 8: Payment Confirmation via Webhook**

- Fapshi sends webhook to: `https://your-domain.com/api/v1/payments/webhook`
- Webhook data structure:
  ```json
  {
    "transId": "ABC123XYZ",
    "status": "SUCCESSFUL",
    "medium": "mobile money",
    "serviceName": "collection",
    "amount": 150000,
    "revenue": 7500,
    "payerName": "John Doe",
    "email": "john@example.com",
    "redirectUrl": "https://example.com",
    "externalId": "cme7md4iw0001u90n81c0jqlj",
    "userId": "guest-id",
    "webhook": "https://your-domain.com/webhook",
    "financialTransId": "FIN456789",
    "dateInitiated": "2023-12-25",
    "dateConfirmed": "2023-12-25"
  }
  ```

**System Processing (Automatic):**

1. **Verification**: Calls Fapshi's `payment-status` endpoint
2. **Booking Update**:
   - `paymentStatus`: `COMPLETED`
   - `status`: `CONFIRMED`
   - `transactionId`: `FIN456789`
3. **Transaction Record**: Creates payment transaction
4. **Host Wallet**: Adds money to host's wallet (after platform fees)
5. **Platform Revenue**: Records 5% platform fee

**Booking Status After Successful Payment:**

- `status`: `CONFIRMED` (booking is confirmed)
- `paymentStatus`: `COMPLETED` (payment successful)
- `transactionId`: `FIN456789` (Fapshi financial transaction ID)

#### 9.6 Payment Verification (Optional)

**Step 9: Manual Payment Verification**

```http
POST /api/v1/payments/booking/{bookingId}/verify
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verification completed",
  "data": {
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "SUCCESSFUL",
    "verificationResult": {
      "transId": "ABC123XYZ",
      "status": "SUCCESSFUL",
      "amount": 150000,
      "medium": "mobile money",
      "dateConfirmed": "2023-12-25"
    }
  }
}
```

#### 9.7 Booking Confirmation

**Step 10: Final Booking Status**

- Booking is now confirmed and active
- Host receives notification of confirmed booking
- Guest receives booking confirmation

### Payment Status Flow

| Status       | Description                                      | Booking Status | Action Required                  |
| ------------ | ------------------------------------------------ | -------------- | -------------------------------- |
| `PENDING`    | Payment initiated, waiting for user confirmation | `PENDING`      | User confirms payment on mobile  |
| `PROCESSING` | Payment being processed by Fapshi                | `PENDING`      | Wait for processing              |
| `COMPLETED`  | Payment successful, booking confirmed            | `CONFIRMED`    | None - booking active            |
| `FAILED`     | Payment failed, booking cancelled                | `CANCELLED`    | Retry payment or contact support |
| `EXPIRED`    | Payment expired, booking cancelled               | `CANCELLED`    | Create new booking               |

### Error Handling

**Common Payment Errors:**

- **Insufficient Balance**: User's mobile money account has insufficient funds
- **Invalid PIN**: User entered incorrect mobile money PIN
- **Network Issues**: Temporary network connectivity problems
- **Transaction Timeout**: Payment request expired

**Error Response Example:**

```json
{
  "success": false,
  "message": "Payment failed",
  "error": "Insufficient balance in mobile money account"
}
```

### Platform Revenue Model

**Fee Structure:**

- **Platform Fee**: 5% of total booking amount
- **Host Receives**: 95% of total booking amount
- **Automatic Calculation**: Fees calculated and deducted automatically

**Example:**

- Booking Amount: 150,000 XAF
- Platform Fee: 7,500 XAF (5%)
- Host Receives: 142,500 XAF (95%)

### Security Features

- **Ownership Validation**: Guests can only pay for their own bookings
- **Payment Verification**: All payments verified with Fapshi API
- **Webhook Security**: Webhook signature validation (configurable)
- **Test Mode**: Development testing with test transaction IDs

### Mobile Money Integration

**Supported Payment Methods:**

- **MTN Mobile Money**: Primary payment method for Cameroon
- **Orange Money**: Alternative payment method
- **Real-time Processing**: Instant payment confirmation
- **Local Market Focus**: Optimized for Cameroonian users

This booking process ensures a seamless experience for guests while providing secure payment processing and automatic revenue management for the platform.
