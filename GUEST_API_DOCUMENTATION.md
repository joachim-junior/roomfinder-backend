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

#### 3.1 Create Booking

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
      "createdAt": "2025-08-11T02:53:53.616Z"
    }
  }
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

- `FAPSHI` - Fapshi mobile money
- `CARD` - Credit/Debit card
- `BANK_TRANSFER` - Bank transfer
- `CASH` - Cash payment

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

#### 9.2 Booking Creation

**Step 4: Create Booking**

```http
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyId": "cme6itqoo0001u9i4x6c38wmq",
  "checkIn": "2025-08-15",
  "checkOut": "2025-08-17",
  "guests": 2,
  "specialRequests": "Early check-in if possible"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "cme7md4iw0001u90n81c0jqlj",
    "propertyId": "cme6itqoo0001u9i4x6c38wmq",
    "guestId": "cme6fo5xz0000u9mo5li7lln7",
    "checkIn": "2025-08-15T00:00:00.000Z",
    "checkOut": "2025-08-17T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 150000,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "specialRequests": "Early check-in if possible",
    "createdAt": "2025-08-14T19:30:00.000Z"
  }
}
```

**Booking Status After Creation:**

- `status`: `PENDING` (awaiting payment)
- `paymentStatus`: `PENDING` (payment not initiated)

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
