# Customer Support API Documentation

## Base URL

```
http://localhost:5000/api/v1/support
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get Support Options (Public)

Get available categories, priorities, and statuses for creating support tickets.

**Request:**

```http
GET /api/v1/support/options
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "value": "BOOKING_ISSUES",
        "label": "Booking Issues"
      },
      {
        "value": "PAYMENTS_BILLING",
        "label": "Payments & Billing"
      },
      {
        "value": "ACCOUNT_MANAGEMENT",
        "label": "Account Management"
      },
      {
        "value": "TECHNICAL_SUPPORT",
        "label": "Technical Support"
      },
      {
        "value": "SAFETY_SECURITY",
        "label": "Safety & Security"
      }
    ],
    "priorities": [
      {
        "value": "LOW",
        "label": "Low - General inquiry"
      },
      {
        "value": "MEDIUM",
        "label": "Medium - Standard issue"
      },
      {
        "value": "HIGH",
        "label": "High - Urgent issues"
      },
      {
        "value": "URGENT",
        "label": "Urgent - Critical issues"
      }
    ],
    "statuses": [
      {
        "value": "OPEN",
        "label": "Open"
      },
      {
        "value": "IN_PROGRESS",
        "label": "In Progress"
      },
      {
        "value": "WAITING_FOR_USER",
        "label": "Waiting for User"
      },
      {
        "value": "RESOLVED",
        "label": "Resolved"
      },
      {
        "value": "CLOSED",
        "label": "Closed"
      },
      {
        "value": "ESCALATED",
        "label": "Escalated"
      }
    ]
  }
}
```

---

## 2. Create Support Ticket (User)

Create a new customer support ticket.

**Request:**

```http
POST /api/v1/support/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Cannot complete booking payment",
  "description": "I'm trying to book a property but the payment keeps failing. I've tried multiple times with different payment methods but none work.",
  "category": "PAYMENTS_BILLING",
  "priority": "HIGH",
  "attachments": ["uploads/support/screenshot1.jpg", "uploads/support/error-log.txt"]
}
```

**Request Body Fields:**

- `subject` (required): Ticket subject (5-200 characters)
- `description` (required): Detailed description (10-2000 characters)
- `category` (required): One of the available categories
- `priority` (optional): Ticket priority (default: MEDIUM)
- `attachments` (optional): Array of file URLs

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "ticket": {
      "id": "cme7support001u9kbzspc5gip",
      "ticketId": "cme7ticket001u9kbzspc5gip",
      "subject": "Cannot complete booking payment",
      "description": "I'm trying to book a property but the payment keeps failing. I've tried multiple times with different payment methods but none work.",
      "category": "PAYMENTS_BILLING",
      "priority": "HIGH",
      "status": "OPEN",
      "userId": "cme6fo5xz0000u9mo5li7lln7",
      "userEmail": "user@example.com",
      "userPhone": "+237612345678",
      "attachments": [
        "uploads/support/screenshot1.jpg",
        "uploads/support/error-log.txt"
      ],
      "assignedToId": null,
      "resolution": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "createdAt": "2025-08-29T20:30:00.000Z",
      "updatedAt": "2025-08-29T20:30:00.000Z",
      "user": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com",
        "phone": "+237612345678",
        "avatar": null
      }
    }
  }
}
```

---

## 3. Get User's Support Tickets

Get all support tickets created by the authenticated user.

**Request:**

```http
GET /api/v1/support/tickets?page=1&limit=10&status=OPEN&category=PAYMENTS_BILLING
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by ticket status
- `category` (optional): Filter by ticket category

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "cme7support001u9kbzspc5gip",
        "ticketId": "cme7ticket001u9kbzspc5gip",
        "subject": "Cannot complete booking payment",
        "description": "I'm trying to book a property but the payment keeps failing...",
        "category": "PAYMENTS_BILLING",
        "priority": "HIGH",
        "status": "OPEN",
        "userEmail": "user@example.com",
        "userPhone": "+237612345678",
        "attachments": ["uploads/support/screenshot1.jpg"],
        "resolution": null,
        "resolvedAt": null,
        "createdAt": "2025-08-29T20:30:00.000Z",
        "updatedAt": "2025-08-29T20:30:00.000Z",
        "assignedTo": null,
        "messages": [
          {
            "id": "cme7msg001u9kbzspc5gip",
            "message": "I've reviewed your issue and am looking into it.",
            "isInternal": false,
            "attachments": [],
            "createdAt": "2025-08-29T20:35:00.000Z",
            "sender": {
              "id": "cme7admin001u9kbzspc5gip",
              "firstName": "Support",
              "lastName": "Agent",
              "role": "ADMIN"
            }
          }
        ]
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

---

## 4. Get Specific Ticket

Get details of a specific support ticket.

**Request:**

```http
GET /api/v1/support/tickets/cme7support001u9kbzspc5gip
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "cme7support001u9kbzspc5gip",
      "ticketId": "cme7ticket001u9kbzspc5gip",
      "subject": "Cannot complete booking payment",
      "description": "I'm trying to book a property but the payment keeps failing...",
      "category": "PAYMENTS_BILLING",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "userEmail": "user@example.com",
      "userPhone": "+237612345678",
      "attachments": ["uploads/support/screenshot1.jpg"],
      "resolution": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "createdAt": "2025-08-29T20:30:00.000Z",
      "updatedAt": "2025-08-29T20:35:00.000Z",
      "user": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com",
        "phone": "+237612345678",
        "avatar": null
      },
      "assignedTo": {
        "id": "cme7admin001u9kbzspc5gip",
        "firstName": "Support",
        "lastName": "Agent",
        "role": "ADMIN"
      },
      "messages": [
        {
          "id": "cme7msg001u9kbzspc5gip",
          "message": "I'm having trouble with payment processing.",
          "isInternal": false,
          "attachments": ["uploads/support/screenshot1.jpg"],
          "createdAt": "2025-08-29T20:30:00.000Z",
          "sender": {
            "id": "cme6fo5xz0000u9mo5li7lln7",
            "firstName": "John",
            "lastName": "Doe",
            "role": "GUEST",
            "avatar": null
          }
        },
        {
          "id": "cme7msg002u9kbzspc5gip",
          "message": "I've reviewed your issue and am looking into the payment gateway logs.",
          "isInternal": false,
          "attachments": [],
          "createdAt": "2025-08-29T20:35:00.000Z",
          "sender": {
            "id": "cme7admin001u9kbzspc5gip",
            "firstName": "Support",
            "lastName": "Agent",
            "role": "ADMIN",
            "avatar": null
          }
        }
      ]
    }
  }
}
```

---

## 5. Add Message to Ticket (User)

Add a message/response to an existing support ticket.

**Request:**

```http
POST /api/v1/support/tickets/cme7support001u9kbzspc5gip/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Thank you for looking into this. I also tried using a different phone number but still getting the same error.",
  "attachments": ["uploads/support/new-screenshot.jpg"]
}
```

**Request Body Fields:**

- `message` (required): Message content (1-2000 characters)
- `attachments` (optional): Array of file URLs

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "message": {
      "id": "cme7msg003u9kbzspc5gip",
      "message": "Thank you for looking into this. I also tried using a different phone number but still getting the same error.",
      "isInternal": false,
      "attachments": ["uploads/support/new-screenshot.jpg"],
      "createdAt": "2025-08-29T20:45:00.000Z",
      "updatedAt": "2025-08-29T20:45:00.000Z",
      "sender": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Doe",
        "role": "GUEST",
        "avatar": null
      }
    }
  }
}
```

---

## 6. Get All Support Tickets (Admin)

Admin endpoint to get all support tickets with filtering options.

**Request:**

```http
GET /api/v1/support/admin/tickets?page=1&limit=20&status=OPEN&priority=HIGH&category=PAYMENTS_BILLING&search=payment
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by ticket status
- `category` (optional): Filter by ticket category
- `priority` (optional): Filter by priority level
- `assignedToId` (optional): Filter by assigned admin
- `search` (optional): Search in subject, description, email, or ticket ID

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "cme7support001u9kbzspc5gip",
        "ticketId": "cme7ticket001u9kbzspc5gip",
        "subject": "Cannot complete booking payment",
        "description": "I'm trying to book a property but the payment keeps failing...",
        "category": "PAYMENTS_BILLING",
        "priority": "HIGH",
        "status": "OPEN",
        "userEmail": "user@example.com",
        "userPhone": "+237612345678",
        "attachments": ["uploads/support/screenshot1.jpg"],
        "resolution": null,
        "resolvedAt": null,
        "resolvedBy": null,
        "createdAt": "2025-08-29T20:30:00.000Z",
        "updatedAt": "2025-08-29T20:30:00.000Z",
        "user": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com",
          "phone": "+237612345678",
          "avatar": null,
          "role": "GUEST"
        },
        "assignedTo": null,
        "messages": [
          {
            "id": "cme7msg001u9kbzspc5gip",
            "message": "I've reviewed your issue and am looking into it.",
            "isInternal": false,
            "attachments": [],
            "createdAt": "2025-08-29T20:35:00.000Z",
            "sender": {
              "id": "cme7admin001u9kbzspc5gip",
              "firstName": "Support",
              "lastName": "Agent",
              "role": "ADMIN"
            }
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## 7. Update Support Ticket (Admin)

Admin endpoint to update ticket status, assignment, and resolution.

**Request:**

```http
PUT /api/v1/support/admin/tickets/cme7support001u9kbzspc5gip
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "RESOLVED",
  "assignedToId": "cme7admin001u9kbzspc5gip",
  "priority": "MEDIUM",
  "resolution": "Issue resolved by updating payment gateway configuration. User should now be able to complete payments successfully."
}
```

**Request Body Fields:**

- `status` (optional): New ticket status
- `assignedToId` (optional): ID of admin to assign ticket to
- `priority` (optional): New priority level
- `resolution` (optional): Resolution description (required when status is RESOLVED/CLOSED)

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Support ticket updated successfully",
  "data": {
    "ticket": {
      "id": "cme7support001u9kbzspc5gip",
      "ticketId": "cme7ticket001u9kbzspc5gip",
      "subject": "Cannot complete booking payment",
      "category": "PAYMENTS_BILLING",
      "priority": "MEDIUM",
      "status": "RESOLVED",
      "resolution": "Issue resolved by updating payment gateway configuration. User should now be able to complete payments successfully.",
      "resolvedAt": "2025-08-29T21:00:00.000Z",
      "resolvedBy": "cme7admin001u9kbzspc5gip",
      "updatedAt": "2025-08-29T21:00:00.000Z",
      "user": {
        "id": "cme6fo5xz0000u9mo5li7lln7",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com"
      },
      "assignedTo": {
        "id": "cme7admin001u9kbzspc5gip",
        "firstName": "Support",
        "lastName": "Agent"
      }
    }
  }
}
```

---

## 8. Add Admin Message to Ticket

Admin endpoint to add responses or internal notes to a support ticket.

**Request:**

```http
POST /api/v1/support/admin/tickets/cme7support001u9kbzspc5gip/messages
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "message": "I've identified the issue with your payment. The Fapshi gateway was experiencing temporary issues. Please try again now.",
  "isInternal": false,
  "attachments": ["uploads/support/solution-guide.pdf"]
}
```

**Request Body Fields:**

- `message` (required): Message content (1-2000 characters)
- `isInternal` (optional): Whether this is an internal admin note (default: false)
- `attachments` (optional): Array of file URLs

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "message": {
      "id": "cme7msg004u9kbzspc5gip",
      "message": "I've identified the issue with your payment. The Fapshi gateway was experiencing temporary issues. Please try again now.",
      "isInternal": false,
      "attachments": ["uploads/support/solution-guide.pdf"],
      "createdAt": "2025-08-29T20:55:00.000Z",
      "updatedAt": "2025-08-29T20:55:00.000Z",
      "sender": {
        "id": "cme7admin001u9kbzspc5gip",
        "firstName": "Support",
        "lastName": "Agent",
        "role": "ADMIN",
        "avatar": null
      }
    }
  }
}
```

**Internal Note Example:**

```http
POST /api/v1/support/admin/tickets/cme7support001u9kbzspc5gip/messages
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "message": "Checked payment logs - issue was with Fapshi API timeout. Escalated to technical team.",
  "isInternal": true
}
```

---

## 9. Get Support Statistics (Admin)

Admin endpoint to get comprehensive support system statistics.

**Request:**

```http
GET /api/v1/support/admin/stats
Authorization: Bearer <admin-token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTickets": 45,
      "openTickets": 8,
      "inProgressTickets": 12,
      "resolvedTickets": 20,
      "closedTickets": 5
    },
    "categoryBreakdown": [
      {
        "category": "PAYMENTS_BILLING",
        "count": 15
      },
      {
        "category": "BOOKING_ISSUES",
        "count": 12
      },
      {
        "category": "TECHNICAL_SUPPORT",
        "count": 8
      },
      {
        "category": "ACCOUNT_MANAGEMENT",
        "count": 7
      },
      {
        "category": "SAFETY_SECURITY",
        "count": 3
      }
    ],
    "priorityBreakdown": [
      {
        "priority": "LOW",
        "count": 10
      },
      {
        "priority": "MEDIUM",
        "count": 20
      },
      {
        "priority": "HIGH",
        "count": 12
      },
      {
        "priority": "URGENT",
        "count": 3
      }
    ],
    "recentTickets": [
      {
        "id": "cme7support001u9kbzspc5gip",
        "ticketId": "cme7ticket001u9kbzspc5gip",
        "subject": "Cannot complete booking payment",
        "category": "PAYMENTS_BILLING",
        "priority": "HIGH",
        "status": "OPEN",
        "createdAt": "2025-08-29T20:30:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com"
        }
      }
    ]
  }
}
```

---

## Error Responses

### 400 - Bad Request (Validation Error)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Subject is required",
      "path": "subject",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Invalid category",
      "path": "category",
      "location": "body"
    }
  ]
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

### 403 - Forbidden (Admin Required)

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 - Ticket Not Found

```json
{
  "success": false,
  "message": "Support ticket not found"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Failed to create support ticket"
}
```

---

## Support Categories

| Value                | Label              |
| -------------------- | ------------------ |
| `BOOKING_ISSUES`     | Booking Issues     |
| `PAYMENTS_BILLING`   | Payments & Billing |
| `ACCOUNT_MANAGEMENT` | Account Management |
| `TECHNICAL_SUPPORT`  | Technical Support  |
| `SAFETY_SECURITY`    | Safety & Security  |

## Support Priorities

| Value    | Label                    | Description                                     |
| -------- | ------------------------ | ----------------------------------------------- |
| `LOW`    | Low - General inquiry    | General questions and non-urgent matters        |
| `MEDIUM` | Medium - Standard issue  | Standard problems requiring attention           |
| `HIGH`   | High - Urgent issues     | Issues affecting user experience                |
| `URGENT` | Urgent - Critical issues | Critical problems requiring immediate attention |

## Support Statuses

| Value              | Label            | Description                              |
| ------------------ | ---------------- | ---------------------------------------- |
| `OPEN`             | Open             | New ticket awaiting attention            |
| `IN_PROGRESS`      | In Progress      | Ticket being actively worked on          |
| `WAITING_FOR_USER` | Waiting for User | Awaiting user response                   |
| `RESOLVED`         | Resolved         | Issue has been resolved                  |
| `CLOSED`           | Closed           | Ticket is closed                         |
| `ESCALATED`        | Escalated        | Ticket escalated to higher level support |

---

## Usage Examples

### Creating a Booking Issue Ticket

```bash
curl -X POST http://localhost:5000/api/v1/support/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Unable to cancel my booking",
    "description": "I need to cancel my booking for tomorrow but the cancel button is not working",
    "category": "BOOKING_ISSUES",
    "priority": "HIGH"
  }'
```

### Creating a Payment Issue Ticket

```bash
curl -X POST http://localhost:5000/api/v1/support/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Payment failed but money was deducted",
    "description": "My payment failed but the money was still deducted from my mobile money account",
    "category": "PAYMENTS_BILLING",
    "priority": "URGENT"
  }'
```

### Admin Resolving a Ticket

```bash
curl -X PUT http://localhost:5000/api/v1/support/admin/tickets/TICKET_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "resolution": "Refund processed successfully. Amount will reflect in your account within 24 hours."
  }'
```
