# Admin Wallet & User Balance Management API Documentation

## Overview

This documentation covers all admin endpoints for managing user wallets, monitoring balances, and overseeing financial transactions on the Room Finder platform. Admins have comprehensive read-only access to all wallet data for monitoring and support purposes.

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Wallet Management Endpoints](#admin-wallet-management-endpoints)
3. [User Balance Endpoints](#user-balance-endpoints)
4. [Response Structures](#response-structures)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)
7. [Security & Best Practices](#security--best-practices)

## Authentication

All admin wallet endpoints require:

- **JWT Authentication**: Valid JWT token in Authorization header
- **Admin Role**: User must have `ADMIN` role

```http
Authorization: Bearer <admin_jwt_token>
```

## Admin Wallet Management Endpoints

### 1. Get All User Wallets

**Endpoint:** `GET /api/v1/admin/wallets`

**Description:** Retrieve all user wallets with filtering and pagination options.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `userId` (optional): Filter by specific user ID
- `minBalance` (optional): Minimum balance filter (number)
- `maxBalance` (optional): Maximum balance filter (number)

**Request Example:**

```http
GET /api/v1/admin/wallets?page=1&limit=20&minBalance=10000&maxBalance=500000
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "cme6gra8n0001u9v6himxvk86",
        "balance": 571040,
        "currency": "XAF",
        "isActive": true,
        "createdAt": "2025-08-11T01:58:26.711Z",
        "updatedAt": "2025-08-29T13:18:36.359Z",
        "user": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "Real",
          "lastName": "Host",
          "email": "host@example.com",
          "role": "HOST",
          "hostApprovalStatus": "APPROVED"
        },
        "_count": {
          "transactions": 6
        }
      }
    ],
    "statistics": {
      "totalWallets": 1,
      "totalBalance": 571040,
      "currency": "XAF"
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Get Specific User Wallet

**Endpoint:** `GET /api/v1/admin/wallets/user/:userId`

**Description:** Get detailed wallet information for a specific user including recent transactions and statistics.

**Path Parameters:**

- `userId` (required): The ID of the user whose wallet to retrieve

**Request Example:**

```http
GET /api/v1/admin/wallets/user/cme6fo5xz0000u9mo5li7lln7
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "cme6gra8n0001u9v6himxvk86",
      "balance": 571040,
      "currency": "XAF",
      "isActive": true,
      "createdAt": "2025-08-11T01:58:26.711Z",
      "updatedAt": "2025-08-29T13:18:36.359Z"
    },
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "Real",
      "lastName": "Host",
      "email": "host@example.com",
      "role": "HOST",
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T01:28:01.559Z"
    },
    "recentTransactions": [
      {
        "id": "cmed2v7u10005u9c342g5tdwy",
        "amount": 100,
        "type": "WITHDRAWAL",
        "status": "PENDING",
        "description": "Withdrawal to MOBILE_MONEY",
        "createdAt": "2025-08-15T17:03:58.825Z"
      },
      {
        "id": "cmebrazy90001u9vv7a7jjxfe",
        "amount": 150000,
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment for booking cme7md4iw0001u90n81c0jqlj",
        "createdAt": "2025-08-14T18:52:33.537Z"
      }
    ],
    "statistics": {
      "totalTransactions": 6,
      "transactionBreakdown": [
        {
          "type": "PAYMENT",
          "_sum": { "amount": 600000 },
          "_count": { "id": 4 }
        },
        {
          "type": "WITHDRAWAL",
          "_sum": { "amount": 300 },
          "_count": { "id": 2 }
        }
      ]
    }
  }
}
```

### 3. Get Platform Wallet Statistics

**Endpoint:** `GET /api/v1/admin/wallets/statistics`

**Description:** Get comprehensive platform-wide wallet statistics including top wallets and recent activity.

**Request Example:**

```http
GET /api/v1/admin/wallets/statistics
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalWallets": 1,
      "totalBalance": 571040,
      "activeWallets": 1,
      "currency": "XAF"
    },
    "topWallets": [
      {
        "id": "cme6gra8n0001u9v6himxvk86",
        "balance": 571040,
        "currency": "XAF",
        "user": {
          "firstName": "Real",
          "lastName": "Host",
          "email": "host@example.com",
          "role": "HOST"
        }
      }
    ],
    "recentTransactions": [
      {
        "id": "cmed2v7u10005u9c342g5tdwy",
        "amount": 100,
        "type": "WITHDRAWAL",
        "status": "PENDING",
        "description": "Withdrawal to MOBILE_MONEY",
        "createdAt": "2025-08-15T17:03:58.825Z",
        "user": {
          "firstName": "Real",
          "lastName": "Host",
          "email": "host@example.com"
        }
      }
    ]
  }
}
```

## User Balance Endpoints

### Individual User Balance Endpoints (For Reference)

These are the endpoints that regular users (hosts/guests) use to check their own balances:

#### 1. Get Own Wallet Balance

**Endpoint:** `GET /api/v1/wallet/balance`

**Authentication:** Host/Guest token required

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "balance": 571040,
    "currency": "XAF",
    "totalTransactions": 6,
    "totalPayments": 600000,
    "totalRefunds": 0,
    "totalWithdrawals": 300
  }
}
```

#### 2. Get Own Wallet Details

**Endpoint:** `GET /api/v1/wallet/details`

**Authentication:** Host/Guest token required

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "cme6gra8n0001u9v6himxvk86",
      "balance": 571040,
      "currency": "XAF",
      "isActive": true,
      "createdAt": "2025-08-11T01:58:26.711Z",
      "updatedAt": "2025-08-29T13:18:36.359Z",
      "userId": "cme6fo5xz0000u9mo5li7lln7"
    },
    "recentTransactions": [
      {
        "id": "cmed2v7u10005u9c342g5tdwy",
        "amount": 100,
        "currency": "XAF",
        "type": "WITHDRAWAL",
        "status": "PENDING",
        "description": "Withdrawal to MOBILE_MONEY",
        "reference": "WD-1755277438824",
        "createdAt": "2025-08-15T17:03:58.825Z",
        "updatedAt": "2025-08-15T17:03:58.825Z",
        "bookingId": null,
        "booking": null
      }
    ]
  }
}
```

## Response Structures

### Wallet Object Structure

```json
{
  "id": "string", // Wallet unique identifier
  "balance": 571040, // Current balance (integer, in XAF)
  "currency": "XAF", // Currency code
  "isActive": true, // Whether wallet is active
  "createdAt": "2025-08-11T01:58:26.711Z", // Wallet creation date
  "updatedAt": "2025-08-29T13:18:36.359Z", // Last update date
  "userId": "string" // Owner user ID
}
```

### User Object Structure (in wallet responses)

```json
{
  "id": "string", // User unique identifier
  "firstName": "string", // User first name
  "lastName": "string", // User last name
  "email": "string", // User email
  "role": "HOST|GUEST|ADMIN", // User role
  "hostApprovalStatus": "APPROVED", // Host approval status (for hosts)
  "createdAt": "2025-08-11T01:28:01.559Z" // User creation date
}
```

### Transaction Object Structure

```json
{
  "id": "string", // Transaction unique identifier
  "amount": 150000, // Transaction amount (integer)
  "currency": "XAF", // Currency code
  "type": "PAYMENT|WITHDRAWAL|REFUND|DEPOSIT|FEE|BONUS", // Transaction type
  "status": "PENDING|COMPLETED|FAILED|CANCELLED|PROCESSING", // Transaction status
  "description": "string", // Human-readable description
  "reference": "string", // External reference ID
  "metadata": "string", // JSON string with additional data
  "createdAt": "2025-08-14T18:52:33.537Z", // Transaction creation date
  "updatedAt": "2025-08-14T18:52:33.537Z", // Last update date
  "bookingId": "string|null", // Associated booking ID (if applicable)
  "walletId": "string", // Associated wallet ID
  "userId": "string" // Transaction owner ID
}
```

### Transaction Types

| Type         | Description                             | Direction  |
| ------------ | --------------------------------------- | ---------- |
| `PAYMENT`    | Payment received from bookings          | Credit (+) |
| `WITHDRAWAL` | Money withdrawn from wallet             | Debit (-)  |
| `REFUND`     | Refund received from cancelled bookings | Credit (+) |
| `DEPOSIT`    | Manual deposit or bonus                 | Credit (+) |
| `FEE`        | Platform or service fees                | Debit (-)  |
| `BONUS`      | Platform bonuses or rewards             | Credit (+) |

### Transaction Statuses

| Status       | Description                             |
| ------------ | --------------------------------------- |
| `PENDING`    | Transaction initiated but not completed |
| `COMPLETED`  | Transaction successfully completed      |
| `FAILED`     | Transaction failed to process           |
| `CANCELLED`  | Transaction was cancelled               |
| `PROCESSING` | Transaction is being processed          |

## Error Handling

### Common Error Responses

#### Wallet Not Found (404)

```json
{
  "error": "Wallet not found",
  "message": "User wallet does not exist"
}
```

#### Access Denied (403)

```json
{
  "error": "Access denied",
  "message": "Admin privileges required"
}
```

#### Invalid Parameters (400)

```json
{
  "error": "Invalid parameters",
  "message": "Invalid balance range or pagination values"
}
```

#### Authentication Required (401)

```json
{
  "error": "Access denied",
  "message": "Invalid token"
}
```

## Usage Examples

### 1. Monitor High-Balance Wallets

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?minBalance=100000&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

### 2. View Specific Host Wallet

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets/user/cme6fo5xz0000u9mo5li7lln7" \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Get Platform Wallet Overview

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

### 4. Search for Specific User Wallet

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?userId=specific-user-id" \
  -H "Authorization: Bearer <admin_token>"
```

### 5. View Low Balance Wallets

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?maxBalance=10000&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

## Advanced Filtering Examples

### Filter by Balance Range

```bash
# Wallets with balance between 50,000 and 1,000,000 XAF
GET /api/v1/admin/wallets?minBalance=50000&maxBalance=1000000
```

### Pagination for Large Datasets

```bash
# Get page 3 with 50 items per page
GET /api/v1/admin/wallets?page=3&limit=50
```

### Search Specific User

```bash
# Find wallet for specific user
GET /api/v1/admin/wallets?userId=cme6fo5xz0000u9mo5li7lln7
```

## How Host Balances Work

### Payment Flow Diagram

```
Guest Payment (100,000 XAF)
├── Platform Fee (10,000 XAF) → Platform Revenue
└── Host Earnings (90,000 XAF) → Host Wallet
```

### Automatic Balance Updates

**When booking is confirmed:**

1. **Guest pays** total amount via Fapshi
2. **Webhook triggers** payment confirmation
3. **Platform calculates** fees (typically 10%)
4. **Host wallet credited** with net amount (90%)
5. **Transaction recorded** for audit trail

### Balance Calculation Example

**Booking Details:**

- Property Price: 100,000 XAF
- Platform Fee (10%): 10,000 XAF
- Host Receives: 90,000 XAF

**Transaction Records Created:**

```json
{
  "hostTransaction": {
    "amount": 90000,
    "type": "PAYMENT",
    "status": "COMPLETED",
    "description": "Payment received for booking abc123"
  },
  "platformRevenue": {
    "amount": 10000,
    "type": "FEE",
    "description": "Platform service fee"
  }
}
```

## Admin Capabilities Summary

### Wallet Monitoring

- ✅ **View all user wallets** with comprehensive filtering
- ✅ **Monitor host balances** and earnings in real-time
- ✅ **Track wallet statistics** and platform trends
- ✅ **View transaction histories** for any user
- ✅ **Access platform-wide financial data**

### Balance Analysis

- ✅ **Filter by balance ranges** (min/max balance filters)
- ✅ **Sort by balance amounts** (highest to lowest)
- ✅ **View top earning hosts** by wallet balance
- ✅ **Monitor platform total balance** across all users
- ✅ **Track wallet activity** and usage patterns

### Transaction Oversight

- ✅ **View recent transactions** across all wallets
- ✅ **Monitor transaction types** and patterns
- ✅ **Track payment flows** and fee collection
- ✅ **Audit transaction records** for compliance
- ✅ **Analyze user spending** and earning patterns

### Financial Health Monitoring

- ✅ **Platform total balance** tracking
- ✅ **Active wallet monitoring**
- ✅ **Top earner identification**
- ✅ **Transaction volume analysis**
- ✅ **Revenue flow oversight**

## Security & Best Practices

### Admin Access Control

- **Read-only access**: Admins can view but not modify wallet balances
- **Audit logging**: All admin wallet views are logged
- **Role-based access**: Only users with ADMIN role can access
- **Token validation**: JWT tokens are validated on every request

### Data Protection

- **Encrypted data**: All wallet data is encrypted in transit and at rest
- **Privacy compliance**: User privacy is maintained while providing oversight
- **Secure endpoints**: All endpoints use HTTPS in production
- **Access monitoring**: Admin access patterns are monitored

### Monitoring Best Practices

#### Daily Monitoring

1. **Check platform total balance** for unusual changes
2. **Monitor high-balance wallets** for suspicious activity
3. **Review recent transactions** for fraud patterns
4. **Verify fee calculations** are working correctly

#### Weekly Analysis

1. **Analyze transaction trends** and patterns
2. **Review withdrawal patterns** for compliance
3. **Monitor platform revenue** collection
4. **Check wallet creation** trends for user growth

#### Monthly Audits

1. **Reconcile platform balances** with external systems
2. **Review transaction histories** for accuracy
3. **Analyze earning patterns** by user segments
4. **Verify compliance** with financial regulations

## Troubleshooting

### Common Issues

#### Balance Discrepancies

- **Check transaction history** for missing or duplicate transactions
- **Verify webhook processing** for payment confirmations
- **Review fee calculations** for accuracy
- **Confirm booking statuses** match payment statuses

#### Zero Balance Issues

- **Verify payment webhooks** are being received and processed
- **Check booking confirmation** flow is working
- **Ensure wallet creation** is happening automatically
- **Review transaction types** and statuses

#### Performance Issues

- **Use pagination** for large wallet datasets
- **Apply filters** to reduce response size
- **Monitor query performance** in production
- **Implement caching** for frequently accessed data

## API Endpoint Summary

| Method | Endpoint                             | Description                         | Access Level |
| ------ | ------------------------------------ | ----------------------------------- | ------------ |
| `GET`  | `/api/v1/admin/wallets`              | Get all user wallets with filtering | Admin Only   |
| `GET`  | `/api/v1/admin/wallets/user/:userId` | Get specific user wallet details    | Admin Only   |
| `GET`  | `/api/v1/admin/wallets/statistics`   | Get platform wallet statistics      | Admin Only   |
| `GET`  | `/api/v1/wallet/balance`             | Get own wallet balance              | User (Self)  |
| `GET`  | `/api/v1/wallet/details`             | Get own wallet details              | User (Self)  |
| `GET`  | `/api/v1/payments/balance`           | Get Fapshi service balance          | Admin Only   |

## Integration Notes

### With Booking System

- Wallet balances are **automatically updated** when bookings are confirmed
- **Platform fees** are calculated and deducted automatically
- **Transaction records** are created for every balance change
- **Booking status** and **payment status** are synchronized

### With Payment Gateway (Fapshi)

- **Webhook integration** handles payment confirmations
- **Real-time balance updates** when payments succeed
- **Automatic fee calculation** and distribution
- **Transaction reference** tracking for reconciliation

### With Revenue System

- **Platform revenue** is tracked separately from user wallets
- **Fee collection** is automated and recorded
- **Revenue analytics** are available through admin endpoints
- **Financial reporting** integrates with wallet data

This comprehensive wallet management system provides admins with complete oversight of the platform's financial operations while maintaining security, user privacy, and regulatory compliance.
