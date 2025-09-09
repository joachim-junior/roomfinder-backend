# Admin Wallet Management Documentation

## Overview

Admins can now comprehensively monitor and manage all user wallets on the Room Finder platform. This includes viewing wallet balances, transaction histories, and wallet statistics for all users.

## Table of Contents

1. [Wallet Balance Handling](#wallet-balance-handling)
2. [Admin Wallet Endpoints](#admin-wallet-endpoints)
3. [Host Balance Management](#host-balance-management)
4. [Wallet Statistics](#wallet-statistics)
5. [API Examples](#api-examples)

## Wallet Balance Handling

### ✅ **How Host Balances Are Handled:**

**1. Automatic Wallet Creation**

- Wallets are created automatically for all users
- Default balance starts at 0 XAF
- Each user gets one wallet per account

**2. Balance Updates When Booking is Confirmed**

```javascript
// When payment webhook confirms successful payment:
const hostAmount = totalAmount - platformFee; // 90% goes to host
await prisma.wallet.update({
  where: { userId: hostId },
  data: {
    balance: { increment: hostAmount },
  },
});
```

**3. Fee Calculation**

- Platform takes 10% fee from each booking
- Host receives 90% of the booking amount
- All transactions are logged for audit trail

**4. Transaction Recording**

- Every balance change creates a transaction record
- Transaction types: PAYMENT, REFUND, WITHDRAWAL, FEE, BONUS
- Full audit trail maintained

## Admin Wallet Endpoints

### 1. Get All User Wallets

**Endpoint:** `GET /api/v1/admin/wallets`

**Request:**

```http
GET /api/v1/admin/wallets?page=1&limit=20&minBalance=10000&maxBalance=500000
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `userId` (optional): Filter by specific user ID
- `minBalance` (optional): Minimum balance filter
- `maxBalance` (optional): Maximum balance filter

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "cme6iw0450012u9znmc2towge",
        "balance": 250000,
        "currency": "XAF",
        "isActive": true,
        "createdAt": "2025-08-11T02:53:53.616Z",
        "updatedAt": "2025-09-01T17:30:00.000Z",
        "user": {
          "id": "cme6fo5xz0000u9mo5li7lln7",
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com",
          "role": "HOST",
          "hostApprovalStatus": "APPROVED"
        },
        "_count": {
          "transactions": 15
        }
      }
    ],
    "statistics": {
      "totalWallets": 150,
      "totalBalance": 5750000,
      "currency": "XAF"
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 2. Get Specific User Wallet

**Endpoint:** `GET /api/v1/admin/wallets/user/:userId`

**Request:**

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
      "id": "cme6iw0450012u9znmc2towge",
      "balance": 250000,
      "currency": "XAF",
      "isActive": true,
      "createdAt": "2025-08-11T02:53:53.616Z",
      "updatedAt": "2025-09-01T17:30:00.000Z"
    },
    "user": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "role": "HOST",
      "hostApprovalStatus": "APPROVED",
      "createdAt": "2025-08-11T01:28:01.559Z"
    },
    "recentTransactions": [
      {
        "id": "cme6trans0001u9i4x6c38wmq",
        "amount": 75000,
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment received for booking cme6itsi5000bu9i4canbgxat",
        "createdAt": "2025-09-01T15:30:00.000Z"
      }
    ],
    "statistics": {
      "totalTransactions": 15,
      "transactionBreakdown": [
        {
          "type": "PAYMENT",
          "_sum": { "amount": 300000 },
          "_count": { "id": 8 }
        },
        {
          "type": "WITHDRAWAL",
          "_sum": { "amount": -50000 },
          "_count": { "id": 2 }
        }
      ]
    }
  }
}
```

### 3. Get Wallet Statistics

**Endpoint:** `GET /api/v1/admin/wallets/statistics`

**Request:**

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
      "totalWallets": 150,
      "totalBalance": 5750000,
      "activeWallets": 148,
      "currency": "XAF"
    },
    "topWallets": [
      {
        "id": "cme6iw0450012u9znmc2towge",
        "balance": 500000,
        "currency": "XAF",
        "user": {
          "firstName": "Top",
          "lastName": "Host",
          "email": "tophost@example.com",
          "role": "HOST"
        }
      }
    ],
    "recentTransactions": [
      {
        "id": "cme6trans0001u9i4x6c38wmq",
        "amount": 75000,
        "type": "PAYMENT",
        "status": "COMPLETED",
        "description": "Payment received for booking",
        "createdAt": "2025-09-01T17:30:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Host",
          "email": "host@example.com"
        }
      }
    ]
  }
}
```

## Host Balance Management

### How Host Balances Work

**1. Payment Flow:**

```
Guest Payment → Platform (100%)
├── Host Wallet (+90%)
└── Platform Revenue (+10%)
```

**2. Automatic Processing:**

- When booking payment is confirmed via Fapshi webhook
- Host wallet is automatically credited with 90% of payment
- Platform keeps 10% as service fee
- Transaction records are created for audit

**3. Balance Tracking:**

- Real-time balance updates
- Complete transaction history
- Automatic wallet creation
- Currency standardization (XAF)

### Host Earnings Calculation

**Example Booking:**

- Property Price: 100,000 XAF
- Platform Fee (10%): 10,000 XAF
- Host Receives: 90,000 XAF

**Transaction Records:**

```json
{
  "guestTransaction": {
    "amount": -100000,
    "type": "PAYMENT",
    "description": "Payment for booking"
  },
  "hostTransaction": {
    "amount": 90000,
    "type": "CREDIT",
    "description": "Payment received for booking"
  },
  "platformRevenue": {
    "amount": 10000,
    "type": "FEE",
    "description": "Platform service fee"
  }
}
```

## API Endpoints Summary

| Method | Endpoint                             | Description                | Admin Access        |
| ------ | ------------------------------------ | -------------------------- | ------------------- |
| `GET`  | `/api/v1/admin/wallets`              | Get all user wallets       | ✅ Full access      |
| `GET`  | `/api/v1/admin/wallets/user/:userId` | Get specific user wallet   | ✅ Any user         |
| `GET`  | `/api/v1/admin/wallets/statistics`   | Get wallet statistics      | ✅ Platform stats   |
| `GET`  | `/api/v1/payments/balance`           | Get Fapshi service balance | ✅ Platform balance |

## API Examples

### Complete Wallet Management Workflow

**1. View All Host Wallets**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**2. View High-Balance Wallets**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?minBalance=100000&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**3. Get Specific Host Wallet**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets/user/host-user-id" \
  -H "Authorization: Bearer <admin_token>"
```

**4. Get Platform Wallet Statistics**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

**5. Get Fapshi Service Balance**

```bash
curl -X GET "https://your-domain.com/api/v1/payments/balance?serviceType=COLLECTION" \
  -H "Authorization: Bearer <admin_token>"
```

### Advanced Filtering Examples

**Filter by Host Role:**

```bash
# This requires combining with user data - use the general endpoint and filter by role in the response
curl -X GET "https://your-domain.com/api/v1/admin/wallets?page=1&limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

**Find Specific User Wallet:**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?userId=specific-user-id" \
  -H "Authorization: Bearer <admin_token>"
```

**View Low Balance Wallets:**

```bash
curl -X GET "https://your-domain.com/api/v1/admin/wallets?maxBalance=10000&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

### Common Error Responses

**Wallet Not Found (404):**

```json
{
  "error": "Wallet not found",
  "message": "User wallet does not exist"
}
```

**Access Denied (403):**

```json
{
  "error": "Access denied",
  "message": "Admin privileges required"
}
```

**Invalid Parameters (400):**

```json
{
  "error": "Invalid parameters",
  "message": "Invalid balance range or pagination values"
}
```

## Admin Capabilities

### Wallet Monitoring

- ✅ **View all user wallets** with filtering options
- ✅ **Monitor host balances** and earnings
- ✅ **Track wallet statistics** and trends
- ✅ **View transaction histories** for any user
- ✅ **Access platform-wide wallet data**

### Balance Analysis

- ✅ **Filter by balance ranges** (min/max balance)
- ✅ **Sort by balance amounts** (highest to lowest)
- ✅ **View top earning hosts** by wallet balance
- ✅ **Monitor platform total balance**
- ✅ **Track wallet activity** and usage

### Transaction Oversight

- ✅ **View recent transactions** across all wallets
- ✅ **Monitor transaction types** and patterns
- ✅ **Track payment flows** and fee collection
- ✅ **Audit transaction records** for compliance
- ✅ **Analyze user spending** and earning patterns

## Security Considerations

### Admin Privileges

- Admins have **read-only access** to wallet data
- Admin actions are **logged** for audit purposes
- Wallet data is **protected** and encrypted
- Access is **restricted** to authorized admins only

### Data Protection

- All wallet data is **encrypted** and secure
- Balance information is **protected** according to privacy regulations
- Transaction details are **handled securely**
- User privacy is **maintained** while providing admin oversight

### Audit Trail

- All admin wallet views are **logged** for compliance
- Access patterns are **monitored** for security
- Data access is **traceable** for accountability
- Admin actions are **recorded** for audit purposes

## Best Practices

### Wallet Monitoring

1. **Regularly monitor** high-balance wallets for suspicious activity
2. **Track transaction patterns** to identify potential fraud
3. **Monitor platform balance** to ensure liquidity
4. **Review transaction histories** for compliance
5. **Analyze earning trends** to optimize platform fees

### Balance Management

1. **Verify host earnings** match booking confirmations
2. **Check platform fee** calculations are correct
3. **Monitor withdrawal patterns** for unusual activity
4. **Ensure balance accuracy** through regular audits
5. **Track currency consistency** across all wallets

### Platform Health

1. **Monitor total platform balance** for financial health
2. **Track wallet creation** trends for user growth
3. **Analyze transaction volumes** for platform usage
4. **Review fee collection** efficiency and accuracy
5. **Ensure system reliability** through regular monitoring

This comprehensive wallet management system provides admins with complete oversight of the platform's financial operations while maintaining security and user privacy.
