# Booking System API Documentation

## Overview

The Booking System API provides comprehensive functionality for managing property bookings with integrated mobile money payments via Fapshi. It includes booking creation, management, availability checking, and payment processing.

## Base URL

```
http://localhost:5000/api/v1/bookings
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Booking Statuses

- `PENDING` - Booking created, awaiting payment confirmation
- `CONFIRMED` - Payment received, booking confirmed
- `CANCELLED` - Booking cancelled by guest or host
- `COMPLETED` - Stay completed

## Payment Methods

- `MOBILE_MONEY` - Mobile money payment (default)
- `CARD` - Card payment
- `CASH` - Cash payment

## Endpoints

### 1. Check Property Availability

**GET** `/api/v1/bookings/availability`

Check if a property is available for specific dates.

**Query Parameters:**

- `propertyId` (required): Property ID
- `checkIn` (required): Check-in date (YYYY-MM-DD)
- `checkOut` (required): Check-out date (YYYY-MM-DD)

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/availability?propertyId=prop1&checkIn=2025-09-15&checkOut=2025-09-20" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Availability checked successfully",
  "availability": {
    "propertyId": "prop1",
    "checkIn": "2025-09-15",
    "checkOut": "2025-09-20",
    "isAvailable": true,
    "conflictingBookings": 0,
    "propertyAvailable": true
  }
}
```

### 2. Create Booking

**POST** `/api/v1/bookings`

Create a new booking with payment initialization.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": "prop1",
  "checkIn": "2025-09-15",
  "checkOut": "2025-09-20",
  "guests": 2,
  "specialRequests": "Early check-in if possible",
  "paymentMethod": "MOBILE_MONEY"
}
```

**Validation Rules:**

- `propertyId`: Required string
- `checkIn`: Valid ISO date (must be in future)
- `checkOut`: Valid ISO date (must be after check-in)
- `guests`: Integer between 1-50
- `specialRequests`: Optional, max 500 characters
- `paymentMethod`: Optional, one of MOBILE_MONEY, ORANGE_MONEY

**Example Request:**

```bash
curl -X POST "http://localhost:5000/api/v1/bookings" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop1",
    "checkIn": "2025-09-15",
    "checkOut": "2025-09-20",
    "guests": 2,
    "specialRequests": "Early check-in if possible",
    "paymentMethod": "MOBILE_MONEY"
  }'
```

**Example Response:**

```json
{
  "message": "Booking created successfully. Please complete payment to confirm.",
  "booking": {
    "id": "cme311aho0001u9u3l1hs61tj",
    "checkIn": "2025-09-15T00:00:00.000Z",
    "checkOut": "2025-09-20T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 250000,
    "status": "PENDING",
    "specialRequests": "Early check-in if possible",
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": null,
    "paymentUrl": null,
    "paymentStatus": null,
    "transactionId": null,
    "statusReason": null,
    "createdAt": "2025-08-08T16:15:01.213Z",
    "updatedAt": "2025-08-08T16:15:01.213Z",
    "propertyId": "prop1",
    "guestId": "cme301igz0000u9z4axlvbq6e",
    "property": {
      "id": "prop1",
      "title": "Beautiful Apartment in Douala",
      "address": "123 Main Street",
      "city": "Douala",
      "price": 50000,
      "currency": "XAF",
      "host": {
        "id": "cme2xzg3m0000u97y2xeao2mk",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+237681101063"
      }
    },
    "guest": {
      "id": "cme301igz0000u9z4axlvbq6e",
      "firstName": "Host",
      "lastName": "User",
      "email": "host@example.com",
      "phone": "+237681101069"
    },
    "paymentData": {
      "paymentUrl": "https://pay.fapshi.com/booking_123",
      "reference": "BOOKING_cme311aho0001u9u3l1hs61tj",
      "status": "PENDING"
    }
  }
}
```

### 3. Get User Bookings

**GET** `/api/v1/bookings/my-bookings`

Retrieve all bookings for the authenticated user.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/my-bookings?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Bookings retrieved successfully",
  "bookings": [
    {
      "id": "cme311aho0001u9u3l1hs61tj",
      "checkIn": "2025-09-15T00:00:00.000Z",
      "checkOut": "2025-09-20T00:00:00.000Z",
      "guests": 2,
      "totalPrice": 250000,
      "status": "PENDING",
      "specialRequests": "Early check-in if possible",
      "paymentMethod": "MOBILE_MONEY",
      "createdAt": "2025-08-08T16:15:01.213Z",
      "property": {
        "id": "prop1",
        "title": "Beautiful Apartment in Douala",
        "address": "123 Main Street",
        "city": "Douala",
        "images": ["https://example.com/image1.jpg"],
        "host": {
          "id": "cme2xzg3m0000u97y2xeao2mk",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+237681101063"
        }
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
```

### 4. Get Host Bookings

**GET** `/api/v1/bookings/host/bookings`

Retrieve all bookings for properties owned by the authenticated host.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Required Role:** HOST or ADMIN

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/host/bookings?status=PENDING" \
  -H "Authorization: Bearer <host-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Host bookings retrieved successfully",
  "bookings": [
    {
      "id": "cme311aho0001u9u3l1hs61tj",
      "checkIn": "2025-09-15T00:00:00.000Z",
      "checkOut": "2025-09-20T00:00:00.000Z",
      "guests": 2,
      "totalPrice": 250000,
      "status": "PENDING",
      "specialRequests": "Early check-in if possible",
      "paymentMethod": "MOBILE_MONEY",
      "createdAt": "2025-08-08T16:15:01.213Z",
      "property": {
        "id": "prop1",
        "title": "Beautiful Apartment in Douala",
        "address": "123 Main Street",
        "city": "Douala"
      },
      "guest": {
        "id": "cme301igz0000u9z4axlvbq6e",
        "firstName": "Host",
        "lastName": "User",
        "email": "host@example.com",
        "phone": "+237681101069"
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
```

### 5. Get Booking by ID

**GET** `/api/v1/bookings/:id`

Retrieve detailed information about a specific booking.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/cme311aho0001u9u3l1hs61tj" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Booking retrieved successfully",
  "booking": {
    "id": "cme311aho0001u9u3l1hs61tj",
    "checkIn": "2025-09-15T00:00:00.000Z",
    "checkOut": "2025-09-20T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 250000,
    "status": "CONFIRMED",
    "specialRequests": "Early check-in if possible",
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": "BOOKING_cme311aho0001u9u3l1hs61tj",
    "paymentUrl": "https://pay.fapshi.com/booking_123",
    "paymentStatus": "SUCCESS",
    "transactionId": "TXN_123456789",
    "statusReason": "Payment received and confirmed",
    "createdAt": "2025-08-08T16:15:01.213Z",
    "updatedAt": "2025-08-08T16:15:49.190Z",
    "property": {
      "id": "prop1",
      "title": "Beautiful Apartment in Douala",
      "address": "123 Main Street",
      "city": "Douala",
      "host": {
        "id": "cme2xzg3m0000u97y2xeao2mk",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+237681101063"
      }
    },
    "guest": {
      "id": "cme301igz0000u9z4axlvbq6e",
      "firstName": "Host",
      "lastName": "User",
      "email": "host@example.com",
      "phone": "+237681101069"
    }
  }
}
```

### 6. Update Booking Status (Host/Admin Only)

**PUT** `/api/v1/bookings/:id/status`

Update booking status (host or admin only).

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "CONFIRMED",
  "reason": "Payment received and confirmed"
}
```

**Valid Statuses:** PENDING, CONFIRMED, CANCELLED, COMPLETED

**Example Request:**

```bash
curl -X PUT "http://localhost:5000/api/v1/bookings/cme311aho0001u9u3l1hs61tj/status" \
  -H "Authorization: Bearer <host-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "reason": "Payment received and confirmed"
  }'
```

### 7. Cancel Booking (Guest Only)

**PUT** `/api/v1/bookings/:id/cancel`

Cancel a booking (guest can only cancel their own bookings).

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:5000/api/v1/bookings/cme311aho0001u9u3l1hs61tj/cancel" \
  -H "Authorization: Bearer <guest-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change of plans"
  }'
```

### 8. Get Booking Statistics

**GET** `/api/v1/bookings/stats`

Get booking statistics for the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/bookings/stats" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response (Host):**

```json
{
  "message": "Booking statistics retrieved successfully",
  "stats": {
    "totalBookings": 3,
    "pendingBookings": 1,
    "confirmedBookings": 2,
    "completedBookings": 0,
    "totalEarnings": 450000,
    "averageRating": 4.5
  }
}
```

**Example Response (Guest):**

```json
{
  "message": "Booking statistics retrieved successfully",
  "stats": {
    "totalBookings": 2,
    "activeBookings": 1,
    "completedBookings": 1,
    "cancelledBookings": 0
  }
}
```

### 9. Fapshi Payment Webhook

**POST** `/api/v1/bookings/webhook/payment`

Webhook endpoint for Fapshi payment notifications (public endpoint).

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "reference": "BOOKING_cme311aho0001u9u3l1hs61tj",
  "status": "SUCCESS",
  "transaction_id": "TXN_123456789"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:5000/api/v1/bookings/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "BOOKING_cme311aho0001u9u3l1hs61tj",
    "status": "SUCCESS",
    "transaction_id": "TXN_123456789"
  }'
```

## Fapshi Payment Integration

### Configuration

Add the following environment variables to your `.env` file:

```env
# Fapshi Payment Configuration
FAPSHI_API_KEY=your-fapshi-api-key
FAPSHI_SECRET_KEY=your-fapshi-secret-key
FAPSHI_BASE_URL=https://api.fapshi.com
```

### Payment Flow

1. **Booking Creation**: When a booking is created, the system automatically initializes a Fapshi payment
2. **Payment URL**: The guest receives a payment URL to complete the transaction
3. **Webhook Notification**: Fapshi sends a webhook notification when payment is completed
4. **Status Update**: The booking status is automatically updated based on payment status

### Payment Statuses

- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed
- `PENDING` - Payment in progress

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid check-in date",
  "message": "Check-in date must be in the future"
}
```

### 401 Unauthorized

```json
{
  "error": "Access denied",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied",
  "message": "Only the property host or admin can update booking status"
}
```

### 404 Not Found

```json
{
  "error": "Booking not found",
  "message": "The requested booking does not exist"
}
```

### 500 Internal Server Error

```json
{
  "error": "Database error",
  "message": "An error occurred while processing your request"
}
```

## Features

### 1. Availability Management

- Real-time availability checking
- Conflict detection for overlapping bookings
- Date validation and restrictions

### 2. Payment Integration

- Fapshi mobile money integration
- Automatic payment initialization
- Webhook-based status updates
- Payment tracking and verification

### 3. Booking Management

- Complete CRUD operations
- Status management (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Guest and host-specific views
- Booking history and statistics

### 4. Security Features

- Role-based access control
- Booking ownership validation
- Payment verification
- Input validation and sanitization

### 5. Advanced Features

- Special requests handling
- Payment method selection
- Booking statistics and analytics
- Pagination and filtering

## Database Schema

The Booking System uses the following Prisma schema:

```prisma
model Booking {
  id        String        @id @default(cuid())
  checkIn   DateTime
  checkOut  DateTime
  guests    Int
  totalPrice Float
  status    BookingStatus @default(PENDING)
  specialRequests String?
  paymentMethod String    @default("MOBILE_MONEY")
  paymentReference String?
  paymentUrl String?
  paymentStatus String?
  transactionId String?
  statusReason String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  // Relations
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  guestId    String
  guest      User     @relation("GuestBookings", fields: [guestId], references: [id], onDelete: Cascade)

  @@map("bookings")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## Usage Examples

### Creating a Booking with Payment

```bash
# 1. Check availability
curl -X GET "http://localhost:5000/api/v1/bookings/availability?propertyId=prop1&checkIn=2025-09-15&checkOut=2025-09-20" \
  -H "Authorization: Bearer <guest-token>"

# 2. Create booking
curl -X POST "http://localhost:5000/api/v1/bookings" \
  -H "Authorization: Bearer <guest-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop1",
    "checkIn": "2025-09-15",
    "checkOut": "2025-09-20",
    "guests": 2,
    "specialRequests": "Early check-in if possible",
    "paymentMethod": "MOBILE_MONEY"
  }'

# 3. Complete payment using the payment URL from the response
# 4. Host confirms booking after payment verification
curl -X PUT "http://localhost:5000/api/v1/bookings/booking-id/status" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED", "reason": "Payment verified"}'
```

### Managing Host Bookings

```bash
# Get all bookings for host properties
curl -X GET "http://localhost:5000/api/v1/bookings/host/bookings" \
  -H "Authorization: Bearer <host-token>"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/bookings/host/bookings?status=PENDING" \
  -H "Authorization: Bearer <host-token>"

# Get host statistics
curl -X GET "http://localhost:5000/api/v1/bookings/stats" \
  -H "Authorization: Bearer <host-token>"
```

### Guest Booking Management

```bash
# Get user's bookings
curl -X GET "http://localhost:5000/api/v1/bookings/my-bookings" \
  -H "Authorization: Bearer <guest-token>"

# Cancel a booking
curl -X PUT "http://localhost:5000/api/v1/bookings/booking-id/cancel" \
  -H "Authorization: Bearer <guest-token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of plans"}'

# Get booking details
curl -X GET "http://localhost:5000/api/v1/bookings/booking-id" \
  -H "Authorization: Bearer <guest-token>"
```

## Deployment Considerations

1. **Environment Variables**: Ensure all Fapshi configuration is properly set
2. **Webhook Security**: Implement webhook signature verification
3. **Database Migration**: Run `npm run db:push` to sync schema changes
4. **Payment Testing**: Use Fapshi sandbox environment for testing
5. **Error Handling**: Implement comprehensive error handling for payment failures
6. **Monitoring**: Set up logging and monitoring for booking operations

## Next Steps

1. **Review System**: Add review and rating features
2. **Notification System**: Implement email/SMS notifications
3. **Advanced Analytics**: Add detailed booking analytics
4. **Refund System**: Implement booking cancellation and refund processing
5. **Calendar Integration**: Add calendar sync for availability
6. **Multi-language Support**: Add support for multiple languages

## Fapshi Integration Guide

### Getting Started with Fapshi

1. **Sign Up**: Create an account at [Fapshi](https://fapshi.com)
2. **API Keys**: Generate your API keys from the dashboard
3. **Webhook Setup**: Configure webhook URLs in your Fapshi dashboard
4. **Testing**: Use sandbox environment for testing payments

### Supported Mobile Money Providers

- MTN Mobile Money
- Orange Money
- Moov Money
- And other local providers

### Payment Flow

1. **Initialize Payment**: Create payment request with booking details
2. **Payment URL**: Redirect user to Fapshi payment page
3. **Payment Processing**: User completes payment via mobile money
4. **Webhook Notification**: Receive payment status update
5. **Booking Confirmation**: Update booking status based on payment result

### Security Best Practices

1. **Webhook Verification**: Always verify webhook signatures
2. **Environment Separation**: Use different API keys for development and production
3. **Error Handling**: Implement proper error handling for failed payments
4. **Logging**: Log all payment-related activities for debugging
5. **Testing**: Thoroughly test payment flows before going live

### Check if User Has Booked a Property

**GET** `/api/v1/bookings/has-booked/:propertyId`

Check if the authenticated user has booked a specific property.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `propertyId` (required): The ID of the property to check

**Query Parameters:**
- `status` (optional): Filter by booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `includeHistory` (optional): Include all booking history for this property (true/false)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/bookings/has-booked/prop123?status=CONFIRMED" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (User has booked - 200):**
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

**Response (User has not booked - 200):**
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

**Response (Property not found - 404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Response (Missing property ID - 400):**
```json
{
  "success": false,
  "message": "Property ID is required"
}
```

**Use Cases:**
- Check if a user can leave a review (only users who have booked can review)
- Display "Book Again" button for properties the user has previously booked
- Show booking history for a specific property
- Validate user permissions for property-related actions

