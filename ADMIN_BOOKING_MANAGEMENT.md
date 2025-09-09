# Admin Booking Management Documentation

## Overview

Admins have comprehensive control over bookings on the Room Finder platform. This includes viewing, filtering, and updating booking statuses for any booking on the platform.

## Table of Contents

1. [Booking Status Options](#booking-status-options)
2. [View All Bookings](#view-all-bookings)
3. [Filter Bookings by Status](#filter-bookings-by-status)
4. [Update Booking Status](#update-booking-status)
5. [Booking Statistics](#booking-statistics)
6. [API Endpoints](#api-endpoints)
7. [Examples](#examples)

## Booking Status Options

The platform supports the following booking statuses:

| Status      | Description                                 | Use Case                   |
| ----------- | ------------------------------------------- | -------------------------- |
| `PENDING`   | Booking created, awaiting host confirmation | New booking requests       |
| `CONFIRMED` | Host has confirmed the booking              | Approved bookings          |
| `CANCELLED` | Booking has been cancelled                  | Cancelled by guest or host |
| `COMPLETED` | Stay has been completed                     | Finished bookings          |
| `REFUNDED`  | Payment has been refunded                   | Refunded bookings          |

## View All Bookings

Admins can view all bookings on the platform with comprehensive filtering options.

**Endpoint:** `GET /api/v1/admin/bookings`

**Request:**

```http
GET /api/v1/admin/bookings?page=1&limit=20&status=CONFIRMED&search=villa
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by booking status
- `search` (optional): Search in property title, guest name, or email

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cme6itsi5000bu9i4canbgxat",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-17T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 150000,
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "paymentMethod": "MOBILE_MONEY",
        "paymentReference": "ABC123XYZ",
        "transactionId": "FIN456789",
        "specialRequests": "Early check-in if possible",
        "statusReason": null,
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-08-11T02:53:53.616Z",
        "property": {
          "id": "cme6itqoo0001u9i4x6c38wmq",
          "title": "Luxury Beachfront Villa",
          "address": "123 Beach Road, Limbe",
          "host": {
            "firstName": "John",
            "lastName": "Host",
            "email": "host@example.com"
          }
        },
        "guest": {
          "id": "cme6iqlan0000u9vp9mlbrpb6",
          "firstName": "Jane",
          "lastName": "Guest",
          "email": "guest@example.com"
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

## Filter Bookings by Status

### Filter by Specific Status

**Request:**

```http
GET /api/v1/admin/bookings?status=PENDING&page=1&limit=10
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cme6itsi5000bu9i4canbgxat",
        "status": "PENDING",
        "checkIn": "2025-08-15T00:00:00.000Z",
        "checkOut": "2025-08-17T00:00:00.000Z",
        "totalPrice": 150000,
        "property": {
          "title": "Luxury Beachfront Villa",
          "host": {
            "firstName": "John",
            "lastName": "Host"
          }
        },
        "guest": {
          "firstName": "Jane",
          "lastName": "Guest"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Search with Status Filter

**Request:**

```http
GET /api/v1/admin/bookings?status=CONFIRMED&search=villa&page=1&limit=15
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cme6itsi5000bu9i4canbgxat",
        "status": "CONFIRMED",
        "property": {
          "title": "Luxury Beachfront Villa",
          "address": "123 Beach Road"
        },
        "guest": {
          "firstName": "Jane",
          "lastName": "Guest"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 15,
      "total": 8,
      "pages": 1
    }
  }
}
```

## Update Booking Status

Admins can update the status of any booking on the platform.

**Endpoint:** `PUT /api/v1/bookings/:id/status`

**Request:**

```http
PUT /api/v1/bookings/cme6itsi5000bu9i4canbgxat/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "reason": "Admin approved after review"
}
```

**Request Body Fields:**

- `status` (required): New booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `reason` (optional): Reason for status change

**Response (Success - 200):**

```json
{
  "message": "Booking status updated successfully",
  "booking": {
    "id": "cme6itsi5000bu9i4canbgxat",
    "checkIn": "2025-08-15T00:00:00.000Z",
    "checkOut": "2025-08-17T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 150000,
    "status": "CONFIRMED",
    "statusReason": "Admin approved after review",
    "paymentStatus": "COMPLETED",
    "paymentMethod": "MOBILE_MONEY",
    "updatedAt": "2025-09-01T17:30:00.000Z",
    "property": {
      "id": "cme6itqoo0001u9i4x6c38wmq",
      "title": "Luxury Beachfront Villa",
      "host": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Host",
        "email": "host@example.com"
      }
    },
    "guest": {
      "id": "cme6iqlan0000u9vp9mlbrpb6",
      "firstName": "Jane",
      "lastName": "Guest",
      "email": "guest@example.com"
    }
  }
}
```

### Status Update Examples

**Confirm a Pending Booking:**

```http
PUT /api/v1/bookings/booking-id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "reason": "Property available and guest verified"
}
```

**Cancel a Confirmed Booking:**

```http
PUT /api/v1/bookings/booking-id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CANCELLED",
  "reason": "Property maintenance required"
}
```

**Mark Booking as Completed:**

```http
PUT /api/v1/bookings/booking-id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "reason": "Stay completed successfully"
}
```

## Booking Statistics

### Get Booking Statistics by Status

**Request:**

```http
GET /api/v1/admin/bookings?limit=0
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [],
    "statistics": {
      "total": 150,
      "byStatus": {
        "PENDING": 25,
        "CONFIRMED": 80,
        "COMPLETED": 35,
        "CANCELLED": 8,
        "REFUNDED": 2
      },
      "byMonth": {
        "August 2025": 45,
        "July 2025": 38,
        "June 2025": 32
      }
    },
    "pagination": {
      "page": 1,
      "limit": 0,
      "total": 150,
      "pages": 0
    }
  }
}
```

## API Endpoints Summary

| Method | Endpoint                      | Description                   | Admin Access   |
| ------ | ----------------------------- | ----------------------------- | -------------- |
| `GET`  | `/api/v1/admin/bookings`      | Get all bookings with filters | ✅ Full access |
| `PUT`  | `/api/v1/bookings/:id/status` | Update booking status         | ✅ Any booking |

## Query Parameters for Filtering

### Status Filtering

- `status=PENDING` - Show only pending bookings
- `status=CONFIRMED` - Show only confirmed bookings
- `status=CANCELLED` - Show only cancelled bookings
- `status=COMPLETED` - Show only completed bookings
- `status=REFUNDED` - Show only refunded bookings

### Search Filtering

- `search=villa` - Search in property titles
- `search=jane` - Search in guest names
- `search=guest@example.com` - Search in guest emails

### Pagination

- `page=1` - Page number (default: 1)
- `limit=20` - Items per page (default: 20)

## Examples

### Complete Booking Management Workflow

**1. View Pending Bookings**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/bookings?status=PENDING&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**2. Update Booking Status**

```bash
curl -X PUT "https://your-domain.com/api/v1/bookings/booking-id/status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "reason": "Admin approved after verification"
  }'
```

**3. Search Bookings by Property**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/bookings?search=villa&status=CONFIRMED" \
  -H "Authorization: Bearer <admin_token>"
```

**4. Get Booking Statistics**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/bookings?limit=0" \
  -H "Authorization: Bearer <admin_token>"
```

### Advanced Filtering Examples

**Filter by Multiple Criteria:**

```bash
# Get confirmed bookings for villas in the last 30 days
curl -X GET "https://your-domain.com/api/v1/admin/bookings?status=CONFIRMED&search=villa&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Search by Guest Name:**

```bash
# Find bookings by guest name
curl -X GET "https://your-domain.com/api/v1/admin/bookings?search=john&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**Get Cancelled Bookings:**

```bash
# View all cancelled bookings
curl -X GET "https://your-domain.com/api/v1/admin/bookings?status=CANCELLED&page=1&limit=15" \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

### Common Error Responses

**Invalid Status (400):**

```json
{
  "error": "Invalid status",
  "message": "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED"
}
```

**Booking Not Found (404):**

```json
{
  "error": "Booking not found",
  "message": "The requested booking does not exist"
}
```

**Access Denied (403):**

```json
{
  "error": "Access denied",
  "message": "Only the property host or admin can update booking status"
}
```

**Invalid Query Parameters (400):**

```json
{
  "error": "Invalid parameters",
  "message": "Invalid page or limit values"
}
```

## Admin Capabilities

### Booking Management

- ✅ **View all bookings** on the platform
- ✅ **Filter by status** (PENDING, CONFIRMED, CANCELLED, COMPLETED, REFUNDED)
- ✅ **Search bookings** by property title, guest name, or email
- ✅ **Update booking status** for any booking
- ✅ **Add status reasons** for audit trail
- ✅ **Access booking statistics** and analytics

### Status Management

- ✅ **Confirm pending bookings** on behalf of hosts
- ✅ **Cancel confirmed bookings** when necessary
- ✅ **Mark bookings as completed** after stays
- ✅ **Override host decisions** when required
- ✅ **Maintain audit trail** with status reasons

### Data Access

- ✅ **Full booking details** including payment information
- ✅ **Property and host information** for each booking
- ✅ **Guest details** and contact information
- ✅ **Payment status** and transaction details
- ✅ **Booking history** and status changes

## Best Practices

### Booking Management

1. **Review pending bookings** regularly and promptly
2. **Verify guest information** before confirming bookings
3. **Check property availability** before status changes
4. **Document status changes** with clear reasons
5. **Monitor booking patterns** for platform optimization

### Status Updates

1. **Use appropriate statuses** for each situation
2. **Provide clear reasons** for status changes
3. **Notify affected parties** when status changes
4. **Maintain consistency** in status management
5. **Follow platform policies** for booking handling

### Data Analysis

1. **Monitor booking trends** by status
2. **Track cancellation rates** and reasons
3. **Analyze guest behavior** patterns
4. **Identify popular properties** and locations
5. **Optimize platform policies** based on data

## Security Considerations

### Admin Privileges

- Admins have **full access** to all bookings
- Admin actions are **logged** for audit purposes
- Status changes are **tracked** with timestamps
- Admin can **override** host decisions when necessary

### Data Protection

- All booking data is **encrypted** and secure
- Guest information is **protected** according to privacy regulations
- Payment details are **handled securely**
- Access is **restricted** to authorized admins only

### Audit Trail

- All status changes are **logged** with admin details
- Status reasons are **stored** for compliance
- Change history is **maintained** for each booking
- Admin actions are **traceable** for accountability

This comprehensive documentation provides admins with all the tools and information needed to effectively manage bookings and their statuses on the Room Finder platform.
