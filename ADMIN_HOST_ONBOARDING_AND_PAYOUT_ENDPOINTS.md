# 🔧 Admin Endpoints: Host Onboarding & Payout Management

## Overview

Complete API reference for admin operations on host onboarding verification and payout request management.

---

## 🔐 Authentication

All endpoints require admin authentication:

```
Authorization: Bearer <admin_token>
```

---

## 📋 Host Onboarding Admin Endpoints

### 1. View Pending Host Verifications

```http
GET /api/v1/host-onboarding/pending-verifications?page=1&limit=10
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "verification_id",
        "userId": "cmgt2x8in001ymb0f05hd0ijv",
        "idVerificationStatus": "PENDING",
        "idFrontImage": "https://cdn.../front.jpg",
        "idBackImage": "https://cdn.../back.jpg",
        "selfieImage": "https://cdn.../selfie.jpg",
        "user": {
          "id": "cmgt2x8in001ymb0f05hd0ijv",
          "email": "host@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+237612345678",
          "hostApprovalStatus": "PENDING",
          "createdAt": "2025-10-16T09:30:00.000Z"
        },
        "profile": {
          "fullLegalName": "John Doe",
          "residentialAddress": "123 Main St",
          "city": "Douala",
          "region": "Littoral",
          "payoutPhoneNumber": "+237612345678"
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

---

### 2. Approve Host ID Verification

```http
POST /api/v1/host-onboarding/{userId}/verify-id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "decision": "VERIFIED",
  "notes": "Documents look good, approved!"
}
```

**Path Parameters:**

- `userId`: The host's user ID

**Request Body:**

- `decision` (required): "VERIFIED" or "REJECTED"
- `notes` (optional): Admin notes for the host

**Response:**

```json
{
  "success": true,
  "message": "Host ID verified successfully",
  "data": {
    "id": "verification_id",
    "idVerificationStatus": "VERIFIED",
    "idVerifiedAt": "2025-10-16T09:30:00.000Z",
    "idVerifiedBy": "admin_user_id",
    "adminNotes": "Documents look good, approved!"
  }
}
```

**Notifications Sent:**

- ✅ Email: Host approval email
- ✅ Push: "🎉 Host Application Approved!"
- ✅ In-App: Notification stored in database

---

### 3. Reject Host ID Verification

```http
POST /api/v1/host-onboarding/{userId}/verify-id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "decision": "REJECTED",
  "notes": "ID photo is blurry, please upload a clearer image"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Host ID rejected successfully",
  "data": {
    "id": "verification_id",
    "idVerificationStatus": "REJECTED",
    "idRejectionReason": "ID photo is blurry, please upload a clearer image"
  }
}
```

**Notifications Sent:**

- ✅ Email: Host rejection email with reason
- ✅ Push: "Host Application Update"
- ✅ In-App: Notification with rejection reason

---

### 4. Approve Ownership Documents (Optional)

```http
POST /api/v1/host-onboarding/{userId}/verify-ownership
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "decision": "VERIFIED",
  "notes": "Property ownership verified"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ownership documents verified successfully",
  "data": {
    "id": "verification_id",
    "ownershipVerificationStatus": "VERIFIED",
    "ownershipVerifiedAt": "2025-10-16T09:30:00.000Z"
  }
}
```

---

### 5. Reject Ownership Documents

```http
POST /api/v1/host-onboarding/{userId}/verify-ownership
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "decision": "REJECTED",
  "notes": "Property documents are unclear, please provide better quality images"
}
```

---

## 💰 Payout Request Admin Endpoints

### 1. View All Payout Requests

```http
GET /api/v1/payout-requests/all?status=PENDING&page=1&limit=10
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `status` (optional): Filter by status (PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "payout_request_id",
        "amount": 50000,
        "status": "PENDING",
        "phoneNumber": "+237612345678",
        "requestedAt": "2025-10-16T09:30:00.000Z",
        "user": {
          "id": "cmgt2x8in001ymb0f05hd0ijv",
          "email": "host@example.com",
          "firstName": "John",
          "lastName": "Doe"
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

---

### 2. Approve Payout Request

```http
POST /api/v1/payout-requests/{requestId}/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Payout approved by admin"
}
```

**Path Parameters:**

- `requestId`: The payout request ID

**Request Body:**

- `notes` (optional): Admin approval notes

**Response:**

```json
{
  "success": true,
  "message": "Payout request approved successfully",
  "data": {
    "id": "payout_request_id",
    "status": "APPROVED",
    "approvedAt": "2025-10-16T09:30:00.000Z",
    "approvedBy": "admin_user_id",
    "adminNotes": "Payout approved by admin"
  }
}
```

**What Happens:**

- ✅ Wallet balance deducted
- ✅ Fapshi payout initiated
- ✅ Host receives notifications (email + push + in-app)
- ✅ Transaction record created

---

### 3. Reject Payout Request

```http
POST /api/v1/payout-requests/{requestId}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Insufficient documentation provided"
}
```

**Request Body:**

- `reason` (required): Rejection reason for the host

**Response:**

```json
{
  "success": true,
  "message": "Payout request rejected successfully",
  "data": {
    "id": "payout_request_id",
    "status": "REJECTED",
    "rejectedAt": "2025-10-16T09:30:00.000Z",
    "rejectedBy": "admin_user_id",
    "rejectionReason": "Insufficient documentation provided"
  }
}
```

**Notifications Sent:**

- ✅ Email: Payout rejection email with reason
- ✅ Push: "Payout Request Rejected"
- ✅ In-App: Notification with rejection reason

---

### 4. Get Payout Statistics

```http
GET /api/v1/payout-requests/statistics
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pending": 5,
    "approved": 12,
    "processing": 3,
    "completed": 45,
    "rejected": 2,
    "totalPendingAmount": 250000
  }
}
```

---

## 📱 Admin Panel Integration Examples

### React/Next.js Admin Panel

```typescript
// Get pending host verifications
const getPendingVerifications = async () => {
  const response = await fetch(
    "/api/v1/host-onboarding/pending-verifications",
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    }
  );
  return response.json();
};

// Approve host verification
const approveHost = async (userId: string, notes?: string) => {
  const response = await fetch(`/api/v1/host-onboarding/${userId}/verify-id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decision: "VERIFIED",
      notes: notes || "Approved by admin",
    }),
  });
  return response.json();
};

// Reject host verification
const rejectHost = async (userId: string, reason: string) => {
  const response = await fetch(`/api/v1/host-onboarding/${userId}/verify-id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decision: "REJECTED",
      notes: reason,
    }),
  });
  return response.json();
};

// Get pending payout requests
const getPendingPayouts = async () => {
  const response = await fetch("/api/v1/payout-requests/all?status=PENDING", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  return response.json();
};

// Approve payout request
const approvePayout = async (requestId: string, notes?: string) => {
  const response = await fetch(`/api/v1/payout-requests/${requestId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notes: notes || "Approved by admin",
    }),
  });
  return response.json();
};

// Reject payout request
const rejectPayout = async (requestId: string, reason: string) => {
  const response = await fetch(`/api/v1/payout-requests/${requestId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  return response.json();
};
```

---

## 🔔 Notification System

### Host Onboarding Notifications

**When Approved:**

- Email: "Congratulations! Your Host Application Has Been Approved"
- Push: "🎉 Host Application Approved!"
- In-App: "Host Application Approved! 🎉"

**When Rejected:**

- Email: "Update on Your Host Application" (with reason)
- Push: "Host Application Update"
- In-App: "Host Application Requires Attention" (with reason)

### Payout Notifications

**When Approved:**

- Email: "Payout Approved" (with amount and processing info)
- Push: "Payout Approved ✅"
- In-App: "Payout Approved ✅"

**When Rejected:**

- Email: "Payout Request Rejected" (with reason)
- Push: "Payout Request Rejected"
- In-App: "Payout Request Rejected" (with reason)

---

## 🎯 Admin Workflow Summary

### Host Onboarding Process:

1. **GET** `/pending-verifications` → Review hosts awaiting verification
2. **POST** `/{userId}/verify-id` → Approve/Reject with reason
3. **POST** `/{userId}/verify-ownership` → Approve/Reject ownership docs (optional)

### Payout Management Process:

1. **GET** `/all?status=PENDING` → Review pending payout requests
2. **POST** `/{requestId}/approve` → Approve payout (triggers payment)
3. **POST** `/{requestId}/reject` → Reject payout with reason
4. **GET** `/statistics` → Monitor dashboard metrics

---

## ⚠️ Important Notes

- All admin actions require `ADMIN` role
- Rejection reasons are required for rejections
- All actions trigger automatic notifications
- Payout approvals initiate actual payments via Fapshi
- Host approvals enable property listing capabilities
- All endpoints return detailed success/error responses

---

**Status:** Production Ready ✅  
**Notifications:** Fully Implemented ✅  
**Admin Controls:** Complete ✅
