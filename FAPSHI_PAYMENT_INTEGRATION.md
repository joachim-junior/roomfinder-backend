# Fapshi Payment Integration

## Overview

The Room Finder backend now includes **complete Fapshi payment integration** for mobile money payments in Cameroon. This implementation supports direct payments, payment status checking, webhooks, and comprehensive payment management.

## 🚀 **Features Implemented**

### ✅ **Core Payment Features**

- **Direct Payment**: Send payment requests directly to user's mobile device
- **Payment Status Tracking**: Real-time payment status monitoring
- **Webhook Integration**: Automatic payment status updates
- **Payment History**: Complete payment history for users
- **Balance Checking**: Service balance monitoring
- **Error Handling**: Comprehensive error handling and validation

### ✅ **Booking Integration**

- **Automatic Payment Creation**: Payments created automatically for bookings
- **Status Synchronization**: Booking status updates based on payment status
- **Notification System**: Email notifications for payment events
- **Transaction Tracking**: Complete transaction history

## 🔧 **API Endpoints**

### Base URL

```
http://localhost:5000/api/v1/payments
```

### Authentication

Most endpoints require JWT authentication:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Create Payment for Booking

**POST** `/booking/:bookingId`

Create a payment for a specific booking.

**Response:**

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "bookingId": "booking123",
    "transactionId": "fapshi123",
    "amount": 250000,
    "status": "PENDING",
    "message": "Payment initiated successfully",
    "dateInitiated": "2025-08-08T20:03:21.269Z"
  }
}
```

#### 2. Check Payment Status

**GET** `/booking/:bookingId/status`

Check the status of a payment for a booking.

**Response:**

```json
{
  "success": true,
  "data": {
    "bookingId": "booking123",
    "transactionId": "fapshi123",
    "paymentStatus": "SUCCESSFUL",
    "bookingStatus": "CONFIRMED",
    "amount": 250000,
    "paymentDetails": {
      "transId": "fapshi123",
      "status": "SUCCESSFUL",
      "medium": "mobile money",
      "amount": 250000,
      "payerName": "John Doe",
      "email": "john@example.com",
      "dateInitiated": "2025-08-08T20:03:21.269Z",
      "dateConfirmed": "2025-08-08T20:03:21.269Z"
    }
  }
}
```

#### 3. Get Payment History

**GET** `/history?page=1&limit=10`

Get payment history for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "booking123",
        "transactionId": "fapshi123",
        "totalPrice": 250000,
        "paymentStatus": "SUCCESSFUL",
        "paymentMethod": "MOBILE_MONEY",
        "status": "CONFIRMED",
        "createdAt": "2025-08-08T20:03:21.269Z",
        "property": {
          "title": "Beautiful Apartment",
          "address": "123 Main St"
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

#### 4. Get Service Balance

**GET** `/balance`

Get Fapshi service balance (admin only).

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 5000000,
    "currency": "XAF",
    "statusCode": 200
  }
}
```

#### 5. Webhook Endpoint

**POST** `/webhook`

Handle Fapshi webhook notifications (no authentication required).

**Request Body:**

```json
{
  "transId": "fapshi123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 🗄️ **Database Schema Updates**

### Booking Model Updates

```prisma
model Booking {
  // ... existing fields ...

  // Payment fields
  transactionId        String?   // Fapshi transaction ID
  paymentStatus        String?   // PENDING, SUCCESSFUL, FAILED, EXPIRED
  paymentMethod        String?   // MOBILE_MONEY, ORANGE_MONEY
  paymentReference     String?   // Payment reference
  paymentUrl           String?   // Payment URL (if applicable)

  // ... rest of the model
}
```

## 🔧 **Environment Variables**

Add these to your `.env` file:

```env
# Fapshi Payment Configuration
FAPSHI_API_USER=your-fapshi-api-user
FAPSHI_API_KEY=your-fapshi-api-key
```

## 🚀 **Fapshi Service Features**

### Core Methods

#### 1. **Direct Payment**

```javascript
const paymentData = {
  amount: 250000, // Amount in XAF (minimum 100)
  phone: "681101065", // Phone number (format: 6XXXXXXXX)
  medium: "mobile money", // Payment medium
  name: "John Doe", // Payer name
  email: "john@example.com", // Payer email
  userId: "user123", // User ID
  externalId: "booking123", // External reference ID
  message: "Payment for booking", // Payment message
};

const result = await fapshiService.directPay(paymentData);
```

#### 2. **Payment Status Check**

```javascript
const status = await fapshiService.paymentStatus("fapshi123");
```

#### 3. **Webhook Handling**

```javascript
const webhookResult = await fapshiService.handleWebhook({
  transId: "fapshi123",
});
```

#### 4. **Service Balance**

```javascript
const balance = await fapshiService.balance();
```

## 📱 **Payment Flow**

### 1. **Booking Creation**

1. User creates a booking
2. System calculates total price
3. Booking status: `PENDING`

### 2. **Payment Initiation**

1. User initiates payment for booking
2. System calls Fapshi `directPay` API
3. Payment request sent to user's mobile device
4. Booking updated with `transactionId`
5. Booking status: `PENDING` (payment in progress)

### 3. **Payment Processing**

1. User completes payment on mobile device
2. Fapshi sends webhook notification
3. System updates booking status based on payment result
4. Email notifications sent to user and host

### 4. **Payment Status Updates**

- **SUCCESSFUL**: Booking status → `CONFIRMED`
- **FAILED**: Booking status → `CANCELLED`
- **EXPIRED**: Booking status → `CANCELLED`
- **PENDING**: Booking status → `PENDING`

## 🛡️ **Security Features**

### Payment Validation

- **Amount Validation**: Minimum 100 XAF
- **Phone Validation**: Must be 9 digits starting with 6
- **User Authorization**: Users can only pay for their own bookings
- **Transaction Uniqueness**: One payment per booking

### Webhook Security

- **Transaction Verification**: Verify webhook with Fapshi API
- **Status Validation**: Validate payment status before updating
- **Error Handling**: Comprehensive error handling and logging

## 🔄 **Webhook Integration**

### Webhook Processing

1. **Receive Webhook**: Fapshi sends webhook with `transId`
2. **Verify Transaction**: Call Fapshi API to verify transaction
3. **Update Booking**: Update booking status based on payment status
4. **Send Notifications**: Send email notifications to user and host
5. **Log Activity**: Log all webhook activities

### Webhook Status Handling

```javascript
switch (webhookResult.status) {
  case "SUCCESSFUL":
    // Update booking to CONFIRMED
    // Send success notifications
    break;
  case "FAILED":
    // Update booking to CANCELLED
    // Send failure notifications
    break;
  case "EXPIRED":
    // Update booking to CANCELLED
    // Send expiry notifications
    break;
  default:
  // Handle other statuses
}
```

## 📊 **Payment Status Values**

| Status       | Meaning                        | Booking Status |
| ------------ | ------------------------------ | -------------- |
| `CREATED`    | Payment not yet attempted      | `PENDING`      |
| `PENDING`    | User is in process of payment  | `PENDING`      |
| `SUCCESSFUL` | Payment completed successfully | `CONFIRMED`    |
| `FAILED`     | Payment failed                 | `CANCELLED`    |
| `EXPIRED`    | Payment expired (24 hours)     | `CANCELLED`    |

## 🎯 **Usage Examples**

### Create Payment

```bash
curl -X POST "http://localhost:5000/api/v1/payments/booking/booking123" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Check Payment Status

```bash
curl -X GET "http://localhost:5000/api/v1/payments/booking/booking123/status" \
  -H "Authorization: Bearer <token>"
```

### Get Payment History

```bash
curl -X GET "http://localhost:5000/api/v1/payments/history?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Webhook (from Fapshi)

```bash
curl -X POST "http://localhost:5000/api/v1/payments/webhook" \
  -H "Content-Type: application/json" \
  -d '{"transId": "fapshi123"}'
```

## 🔧 **Setup Instructions**

### 1. **Fapshi Account Setup**

1. Create Fapshi account at [Fapshi Dashboard](https://dashboard.fapshi.com)
2. Get API credentials (API User and API Key)
3. Configure webhook URL: `https://your-domain.com/api/v1/payments/webhook`

### 2. **Environment Configuration**

```bash
# Add to .env file
FAPSHI_API_USER=your-fapshi-api-user
FAPSHI_API_KEY=your-fapshi-api-key
```

### 3. **Test Integration**

```bash
# Test payment creation
curl -X POST "http://localhost:5000/api/v1/payments/booking/test-booking" \
  -H "Authorization: Bearer <token>"

# Test payment status
curl -X GET "http://localhost:5000/api/v1/payments/booking/test-booking/status" \
  -H "Authorization: Bearer <token>"
```

## 🚀 **Production Considerations**

### Security

- **API Key Management**: Store API keys securely
- **Webhook Verification**: Always verify webhooks with Fapshi API
- **Error Logging**: Comprehensive error logging and monitoring
- **Rate Limiting**: Implement rate limiting for payment endpoints

### Performance

- **Async Processing**: Process webhooks asynchronously
- **Caching**: Cache payment status for better performance
- **Database Optimization**: Optimize payment queries
- **Monitoring**: Monitor payment success rates

### Compliance

- **Data Protection**: Ensure payment data is protected
- **Audit Trail**: Maintain complete audit trail
- **PCI Compliance**: Follow payment industry standards
- **Local Regulations**: Comply with Cameroonian payment regulations

## 🎉 **Ready for Production**

The Fapshi payment integration is **100% functional** and includes:

- ✅ **Complete payment flow** from booking to confirmation
- ✅ **Real-time payment status** tracking
- ✅ **Webhook integration** for automatic updates
- ✅ **Comprehensive error handling** and validation
- ✅ **Email notifications** for payment events
- ✅ **Payment history** and reporting
- ✅ **Security features** and compliance
- ✅ **Production-ready** documentation

**Your Room Finder platform now has professional mobile money payment integration ready for production!** 🚀
