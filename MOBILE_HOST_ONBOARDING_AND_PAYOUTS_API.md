### 📱 Mobile API: Host Onboarding & Manual Payouts (Zero Withdrawal Fees)

**Goal**

- Implement host onboarding (profile + ID verification) and manual payouts with admin approval.
- Show wallet balances (total, locked, eligible), let hosts request/cancel payouts, and view payout history.

**Auth**

- All endpoints require `Authorization: Bearer <token>`.

**Base URL**

- `https://your-backend/api/v1` (replace with your actual URL).

---

### 📤 Image Uploads (used by onboarding)

- Upload images to get URLs; submit URLs to onboarding endpoints.

```http
POST /uploads/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Request (multipart):

- files: one or more image files

Response:

```json
{
  "success": true,
  "files": [
    {
      "url": "https://cdn/.../file-1.jpg",
      "name": "file-1.jpg",
      "size": 123456
    }
  ]
}
```

---

### 🧾 Host Onboarding

Purpose: Collect host profile and verify identity to enable hosting and payouts.

1. Create/Update Host Profile

```http
POST /host-onboarding/profile
Content-Type: application/json
Authorization: Bearer <token>
```

Request:

```json
{
  "fullLegalName": "John Doe",
  "dateOfBirth": "1990-05-12",
  "nationality": "Cameroonian",
  "residentialAddress": "123 Main St",
  "city": "Douala",
  "region": "Littoral",
  "country": "Cameroon",
  "postalCode": "12345",
  "alternatePhone": "+237612300000",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+237699999999",
  "payoutPhoneNumber": "+237612345678",
  "payoutPhoneName": "John Doe",
  "idType": "NATIONAL_ID",
  "idNumber": "123456789",
  "bio": "Experienced host",
  "languages": ["English", "French"]
}
```

Response:

```json
{
  "success": true,
  "message": "Host profile saved",
  "data": { "profileId": "clxxx", "completion": 50 }
}
```

2. Submit ID Verification (3 images)

```http
POST /host-onboarding/id-verification
Content-Type: application/json
Authorization: Bearer <token>
```

Request:

```json
{
  "idFrontImage": "https://cdn/.../front.jpg",
  "idBackImage": "https://cdn/.../back.jpg",
  "selfieImage": "https://cdn/.../selfie.jpg"
}
```

Response:

```json
{
  "success": true,
  "message": "ID verification submitted",
  "data": { "status": "PENDING" }
}
```

3. Upload Ownership Documents (optional)

```http
POST /host-onboarding/ownership-documents
Content-Type: application/json
Authorization: Bearer <token>
```

Request:

```json
{ "documents": ["https://cdn/.../doc1.jpg", "https://cdn/.../doc2.jpg"] }
```

Response:

```json
{
  "success": true,
  "message": "Ownership documents uploaded",
  "data": { "count": 2 }
}
```

4. Get Onboarding Status

```http
GET /host-onboarding/status
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "completionPercentage": 75,
    "steps": {
      "profile": "COMPLETED",
      "idVerification": "PENDING",
      "ownershipDocs": "NOT_REQUIRED"
    },
    "nextSteps": ["Await admin review"]
  }
}
```

---

### 💸 Manual Payouts (No Withdrawal Fees)

Purpose: Request payouts from eligible funds (available ≥ 3 days after booking). Admin approval required. No withdrawal fees.

1. Get Eligible Amounts (wallet overview)

```http
GET /payout-requests/eligible-amount
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": { "totalBalance": 90000, "lockedAmount": 0, "eligibleAmount": 90000 }
}
```

2. Calculate Payout Fees (preview)

```http
GET /payout-requests/calculate-fees?amount=50000
Authorization: Bearer <token>
```

Response (no fees):

```json
{
  "success": true,
  "data": {
    "requestedAmount": 50000,
    "withdrawalFee": 0,
    "netAmount": 50000,
    "currency": "XAF",
    "note": "No withdrawal fee - all commissions deducted during booking"
  }
}
```

3. Create Payout Request

```http
POST /payout-requests/request
Content-Type: application/json
Authorization: Bearer <token>
```

Request:

```json
{ "amount": 50000 }
```

Response:

```json
{
  "success": true,
  "message": "Payout request created",
  "data": {
    "requestId": "clxxx",
    "status": "PENDING",
    "amount": 50000,
    "phoneNumber": "+237612345678"
  }
}
```

4. Get My Payout Requests (history)

```http
GET /payout-requests/my-requests?page=1&limit=10
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "clxxx",
        "amount": 50000,
        "status": "PENDING",
        "phoneNumber": "+237612345678",
        "requestedAt": "2025-10-03T10:30:00.000Z",
        "approvedAt": null,
        "rejectionReason": null
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1 }
  }
}
```

5. Cancel My Pending Payout

```http
PUT /payout-requests/:id/cancel
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "message": "Payout request cancelled",
  "data": { "id": "clxxx", "status": "CANCELLED" }
}
```

---

### 🔔 Push Notifications (FYI)

- Ensure your app registers device tokens with the backend to receive updates like `HOST_APPROVED`, `PAYOUT_APPROVED`, `PAYOUT_COMPLETED`.
