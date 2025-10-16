# 🚀 Enhanced Host Onboarding & Manual Payout Approval System

## 📋 Overview

This document outlines the **new and improved host onboarding process** and **manual payout approval system** implemented based on project sponsor requirements and industry best practices (Airbnb standards).

**Date Implemented:** October 10, 2025  
**Status:** ✅ Production Ready

---

## 🎯 Why These Changes?

### **Problems with Old System:**

- ❌ Limited host verification (email only)
- ❌ Automatic payouts (fraud risk)
- ❌ No identity verification
- ❌ No ownership proof
- ❌ Immediate withdrawals (chargeback risk)

### **Benefits of New System:**

- ✅ **Fraud Prevention** - ID and selfie verification
- ✅ **Legal Compliance** - KYC requirements
- ✅ **Admin Control** - Manual approval prevents abuse
- ✅ **Dispute Protection** - 3-day buffer period
- ✅ **Trust & Safety** - Verified hosts only
- ✅ **Better for Africa** - Matches local business practices

---

## 🔄 New Host Onboarding Flow

### **Step 1: User Registration**

```
POST /api/v1/auth/register
{
  "email": "host@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+237612345678"
}

Result: User created with GUEST role
```

### **Step 2: Apply to Become Host**

```
POST /api/v1/host-applications/apply
Authorization: Bearer <token>
{
  "notes": "I want to list my property in Douala"
}

Result: Role changed to HOST, status = PENDING
```

### **Step 3: Complete Host Profile** ⭐ NEW

```
POST /api/v1/host-onboarding/profile
Authorization: Bearer <token>
{
  "fullLegalName": "John Smith Doe",
  "dateOfBirth": "1990-05-15",
  "nationality": "Cameroonian",
  "residentialAddress": "123 Main Street, Bonaberi",
  "city": "Douala",
  "region": "Littoral",
  "country": "Cameroon",
  "postalCode": "00237",
  "alternatePhone": "+237698765432",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+237677654321",
  "payoutPhoneNumber": "+237612345678",
  "payoutPhoneName": "John Doe",
  "idType": "NATIONAL_ID",
  "idNumber": "CM123456789",
  "idExpiryDate": "2028-12-31",
  "bio": "Experienced host with 3 properties",
  "languages": ["English", "French"]
}

Result: Profile created, 25% onboarding complete
```

### **Step 4: Upload ID Verification** ⭐ NEW

```
POST /api/v1/host-onboarding/id-verification
Authorization: Bearer <token>
{
  "idFrontImage": "https://storage.railway.app/id-front.jpg",
  "idBackImage": "https://storage.railway.app/id-back.jpg",
  "selfieImage": "https://storage.railway.app/selfie-with-id.jpg"
}

Result: Documents uploaded, awaiting admin review
```

### **Step 5: Upload Property Documents** ⭐ NEW (Optional)

```
POST /api/v1/host-onboarding/ownership-documents
Authorization: Bearer <token>
{
  "documents": [
    "https://storage.railway.app/property-deed.pdf",
    "https://storage.railway.app/rental-agreement.pdf"
  ]
}

Result: Ownership docs uploaded (optional verification)
```

### **Step 6: Admin Reviews & Approves**

```
POST /api/v1/host-onboarding/:userId/verify-id
Authorization: Bearer <admin-token>
{
  "decision": "VERIFIED",
  "notes": "ID verified successfully. Welcome to the platform!"
}

Result: Host APPROVED, can now list properties
```

---

## 📊 Onboarding Status Tracking

### **Check Onboarding Progress**

```
GET /api/v1/host-onboarding/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "xxx",
      "role": "HOST",
      "hostApprovalStatus": "PENDING"
    },
    "profile": {
      "completed": true,
      "data": { /* profile details */ }
    },
    "verification": {
      "idVerification": "PENDING",
      "ownershipVerification": "NOT_REQUIRED",
      "overall": "PENDING"
    },
    "completionPercentage": 75,
    "nextSteps": [
      {
        "step": 3,
        "title": "Wait for ID Verification",
        "description": "Admin is reviewing your ID documents",
        "required": true,
        "completed": false
      }
    ]
  }
}
```

---

## 💰 New Manual Payout System

### **How It Works:**

#### **1. Host Earns Money**

```
Guest books property → Pays 100,000 XAF
  ↓
Payment successful (via Fapshi)
  ↓
Host wallet credited: 95,000 XAF (after fees)
  ↓
Funds LOCKED for 3 days (dispute protection)
  ↓
After 3 days → Funds become eligible for payout
```

#### **2. Host Requests Payout**

```
POST /api/v1/payout-requests/request
Authorization: Bearer <host-token>
{
  "amount": 50000,
  "phoneNumber": "+237612345678",
  "paymentMethod": "MOBILE_MONEY"
}

Result: Payout request created, status = PENDING
```

#### **3. Admin Reviews Request**

```
GET /api/v1/payout-requests/all?status=PENDING
Authorization: Bearer <admin-token>

# Admin sees all pending requests and reviews
```

#### **4. Admin Approves**

```
POST /api/v1/payout-requests/:requestId/approve
Authorization: Bearer <admin-token>
{
  "notes": "Payout approved. Host has good track record."
}

Result:
  ↓
Wallet balance deducted
  ↓
Fapshi payout initiated
  ↓
Status = PROCESSING
  ↓
Webhook updates to COMPLETED
  ↓
Host receives money in mobile money account
```

---

## 🔐 Security Features

### **3-Day Waiting Period**

- Bookings must be completed 3+ days before payout eligible
- Protects against chargebacks
- Allows time for dispute resolution
- Industry standard practice

### **Admin Approval Required**

- Every payout manually reviewed
- Prevents fraudulent requests
- Verifies host legitimacy
- Controls cash flow

### **Balance Tracking**

- Total balance
- Locked balance (pending payouts)
- Eligible balance (can request)
- Clear separation

---

## 📡 API Endpoints Reference

### **Host Onboarding Endpoints**

#### 1. Create/Update Host Profile

```http
POST /api/v1/host-onboarding/profile
PUT /api/v1/host-onboarding/profile
Authorization: Bearer <token>
Role: HOST or ADMIN

Body: {
  "fullLegalName": "string (required)",
  "dateOfBirth": "ISO date (optional)",
  "nationality": "string (optional)",
  "residentialAddress": "string (required)",
  "city": "string (required)",
  "region": "string (required)",
  "country": "string (default: Cameroon)",
  "postalCode": "string (optional)",
  "alternatePhone": "string (optional)",
  "emergencyContact": "string (optional)",
  "emergencyPhone": "string (optional)",
  "payoutPhoneNumber": "string (required, format: +237XXXXXXXXX)",
  "payoutPhoneName": "string (optional)",
  "idType": "string (optional)",
  "idNumber": "string (optional)",
  "idExpiryDate": "ISO date (optional)",
  "bio": "string (optional)",
  "languages": ["array of strings (optional)"]
}

Response (200):
{
  "success": true,
  "message": "Host profile saved successfully",
  "data": { /* profile object */ }
}
```

#### 2. Upload ID Verification

```http
POST /api/v1/host-onboarding/id-verification
Authorization: Bearer <token>
Role: HOST or ADMIN

Body: {
  "idFrontImage": "https://url-to-id-front.jpg",
  "idBackImage": "https://url-to-id-back.jpg",
  "selfieImage": "https://url-to-selfie.jpg"
}

Response (200):
{
  "success": true,
  "message": "ID verification documents uploaded successfully. Awaiting admin review.",
  "data": { /* verification object */ }
}
```

#### 3. Upload Ownership Documents (Optional)

```http
POST /api/v1/host-onboarding/ownership-documents
Authorization: Bearer <token>
Role: HOST or ADMIN

Body: {
  "documents": [
    "https://url-to-doc1.pdf",
    "https://url-to-doc2.pdf"
  ]
}

Response (200):
{
  "success": true,
  "message": "Property ownership documents uploaded successfully",
  "data": { /* verification object */ }
}
```

#### 4. Get Onboarding Status

```http
GET /api/v1/host-onboarding/status
Authorization: Bearer <token>
Role: HOST or ADMIN

Response (200):
{
  "success": true,
  "data": {
    "completionPercentage": 75,
    "nextSteps": [ /* array of next steps */ ]
  }
}
```

---

### **Admin Verification Endpoints**

#### 5. Get Pending Verifications

```http
GET /api/v1/host-onboarding/pending-verifications?page=1&limit=10
Authorization: Bearer <token>
Role: ADMIN

Response (200):
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "xxx",
        "userId": "xxx",
        "idVerificationStatus": "PENDING",
        "idFrontImage": "url",
        "idBackImage": "url",
        "selfieImage": "url",
        "user": { /* user details */ },
        "profile": { /* host profile */ }
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

#### 6. Verify Host ID

```http
POST /api/v1/host-onboarding/:userId/verify-id
Authorization: Bearer <token>
Role: ADMIN

Body: {
  "decision": "VERIFIED" | "REJECTED",
  "notes": "ID verified successfully"
}

Response (200):
{
  "success": true,
  "message": "Host ID verified successfully",
  "data": { /* updated verification */ }
}

Side Effects:
- If VERIFIED: hostApprovalStatus → APPROVED
- If REJECTED: hostApprovalStatus → REJECTED
```

#### 7. Verify Ownership Documents

```http
POST /api/v1/host-onboarding/:userId/verify-ownership
Authorization: Bearer <token>
Role: ADMIN

Body: {
  "decision": "VERIFIED" | "REJECTED",
  "notes": "Documents look authentic"
}

Response (200):
{
  "success": true,
  "message": "Ownership documents verified successfully"
}
```

---

### **Payout Request Endpoints**

#### 8. Get Eligible Payout Amount

```http
GET /api/v1/payout-requests/eligible-amount
Authorization: Bearer <token>
Role: HOST or ADMIN

Response (200):
{
  "success": true,
  "data": {
    "totalBalance": 95000,
    "eligibleAmount": 80000,
    "lockedAmount": 15000,
    "pendingPayouts": 1
  }
}

Explanation:
- totalBalance: Total in wallet
- eligibleAmount: Available for payout (balance - locked)
- lockedAmount: Amount in pending payout requests
- pendingPayouts: Number of pending requests
```

#### 9. Create Payout Request

```http
POST /api/v1/payout-requests/request
Authorization: Bearer <token>
Role: HOST or ADMIN

Body: {
  "amount": 50000,
  "phoneNumber": "+237612345678",  // Optional, uses profile phone if not provided
  "paymentMethod": "MOBILE_MONEY"  // or "ORANGE_MONEY"
}

Response (201):
{
  "success": true,
  "message": "Payout request submitted successfully. Awaiting admin approval.",
  "data": {
    "id": "payout-request-id",
    "amount": 50000,
    "phoneNumber": "+237612345678",
    "status": "PENDING",
    "requestedAt": "2025-10-10T10:00:00Z",
    "eligibleAt": "2025-10-13T10:00:00Z"
  }
}

Validations:
- Amount > 0
- Amount ≤ eligible balance
- Host profile must exist with payout phone
- Phone number format must be valid Cameroon number
```

#### 10. Get Host's Payout Requests

```http
GET /api/v1/payout-requests/my-requests?page=1&limit=10
Authorization: Bearer <token>
Role: HOST or ADMIN

Response (200):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "xxx",
        "amount": 50000,
        "phoneNumber": "+237612345678",
        "status": "PENDING",
        "requestedAt": "2025-10-10T10:00:00Z",
        "approvedAt": null,
        "processedAt": null
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1 }
  }
}
```

#### 11. Cancel Payout Request

```http
PUT /api/v1/payout-requests/:requestId/cancel
Authorization: Bearer <token>
Role: HOST or ADMIN

Response (200):
{
  "success": true,
  "message": "Payout request cancelled successfully",
  "data": { /* updated request */ }
}

Conditions:
- Only works if status = PENDING
- Cannot cancel if APPROVED, PROCESSING, or COMPLETED
```

---

### **Admin Payout Management Endpoints**

#### 12. Get All Payout Requests

```http
GET /api/v1/payout-requests/all?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
Role: ADMIN

Query Parameters:
- status: PENDING | APPROVED | PROCESSING | COMPLETED | REJECTED | CANCELLED
- userId: Filter by specific host
- page: Page number
- limit: Items per page

Response (200):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "xxx",
        "userId": "xxx",
        "amount": 50000,
        "phoneNumber": "+237612345678",
        "status": "PENDING",
        "requestedAt": "2025-10-10T10:00:00Z",
        "user": {
          "email": "host@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": { /* pagination */ }
  }
}
```

#### 13. Approve Payout Request

```http
POST /api/v1/payout-requests/:requestId/approve
Authorization: Bearer <token>
Role: ADMIN

Body: {
  "notes": "Payout approved. Host has good track record."
}

Response (200):
{
  "success": true,
  "message": "Payout request approved and processing",
  "data": { /* updated request */ }
}

What Happens:
1. ✅ Wallet balance deducted
2. ✅ Transaction record created
3. ✅ Fapshi payout initiated
4. ✅ Status updated to PROCESSING
5. ✅ Host notified
6. ⏳ Webhook updates to COMPLETED when money sent
```

#### 14. Reject Payout Request

```http
POST /api/v1/payout-requests/:requestId/reject
Authorization: Bearer <token>
Role: ADMIN

Body: {
  "reason": "Insufficient verification or suspicious activity detected"
}

Response (200):
{
  "success": true,
  "message": "Payout request rejected",
  "data": { /* updated request */ }
}

What Happens:
1. ✅ Status changed to REJECTED
2. ✅ Funds remain in host wallet
3. ✅ Host notified with reason
4. ✅ Host can request again
```

#### 15. Get Payout Statistics

```http
GET /api/v1/payout-requests/statistics
Authorization: Bearer <token>
Role: ADMIN

Response (200):
{
  "success": true,
  "data": {
    "pending": 5,
    "approved": 2,
    "processing": 1,
    "completed": 127,
    "rejected": 3,
    "totalPendingAmount": 250000
  }
}
```

---

## 🗄️ Database Schema

### **HostProfile Model**

```prisma
model HostProfile {
  id                 String   @id @default(cuid())
  userId             String   @unique
  fullLegalName      String
  dateOfBirth        DateTime?
  nationality        String?
  residentialAddress String
  city               String
  region             String
  country            String   @default("Cameroon")
  postalCode         String?
  alternatePhone     String?
  emergencyContact   String?
  emergencyPhone     String?
  payoutPhoneNumber  String   // Mobile money number
  payoutPhoneName    String?
  idType             String?
  idNumber           String?
  idExpiryDate       DateTime?
  bio                String?
  languages          String[]
  hostingSince       DateTime?
  propertyCount      Int      @default(0)
  completedAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

### **HostVerification Model**

```prisma
model HostVerification {
  id                          String             @id @default(cuid())
  userId                      String             @unique
  // ID Verification
  idFrontImage                String?
  idBackImage                 String?
  selfieImage                 String?
  idVerificationStatus        VerificationStatus @default(PENDING)
  idVerifiedAt                DateTime?
  idVerifiedBy                String?
  idRejectionReason           String?
  // Property Ownership (Optional)
  ownershipDocuments          String[]
  ownershipVerificationStatus VerificationStatus @default(NOT_REQUIRED)
  ownershipVerifiedAt         DateTime?
  ownershipVerifiedBy         String?
  ownershipRejectionReason    String?
  // Overall
  overallVerificationStatus   VerificationStatus @default(PENDING)
  verificationCompletedAt     DateTime?
  adminNotes                  String?
  createdAt                   DateTime           @default(now())
  updatedAt                   DateTime           @updatedAt
}
```

### **PayoutRequest Model**

```prisma
model PayoutRequest {
  id             String              @id @default(cuid())
  userId         String
  amount         Float
  currency       String              @default("XAF")
  phoneNumber    String
  paymentMethod  String              @default("MOBILE_MONEY")
  status         PayoutRequestStatus @default(PENDING)
  requestedAt    DateTime            @default(now())
  eligibleAt     DateTime            // 3 days from booking payment
  approvedAt     DateTime?
  approvedBy     String?             // Admin user ID
  rejectedAt     DateTime?
  rejectedBy     String?
  rejectionReason String?
  processedAt    DateTime?
  transactionId  String?
  fapshiTransId  String?
  adminNotes     String?
  metadata       String?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}
```

---

## 🔄 Complete Host Journey

### **Day 1: Registration**

```
9:00 AM  - User registers as GUEST
9:01 AM  - Receives email verification
9:05 AM  - Verifies email
9:10 AM  - Applies to become HOST
9:11 AM  - Role changed to HOST (status: PENDING)
```

### **Day 1: Onboarding**

```
9:15 AM  - Completes host profile (25% done)
9:30 AM  - Uploads ID front (50% done)
9:32 AM  - Uploads ID back (75% done)
9:35 AM  - Uploads selfie with ID (100% done)
9:40 AM  - Optionally uploads property documents
Status: Awaiting admin review
```

### **Day 2: Verification**

```
10:00 AM - Admin reviews documents
10:15 AM - Admin approves ID verification
10:16 AM - Host status: APPROVED ✅
10:17 AM - Host receives approval email
10:20 AM - Host can now create properties
```

### **Day 3: Listing Property**

```
11:00 AM - Host creates first property
11:30 AM - Admin verifies property
12:00 PM - Property goes live
```

### **Day 7: First Booking**

```
2:00 PM  - Guest books property (3 nights, 150,000 XAF)
2:05 PM  - Guest pays via mobile money
2:10 PM  - Booking confirmed
2:10 PM  - Host wallet credited: 142,500 XAF
2:10 PM  - Funds locked for 3 days
```

### **Day 10: Payout Request**

```
3:00 PM  - Host checks eligible balance: 142,500 XAF
3:05 PM  - Host requests payout: 100,000 XAF
3:05 PM  - Payout request created (PENDING)
3:06 PM  - Admin receives notification
```

### **Day 10: Payout Approval**

```
4:00 PM  - Admin reviews payout request
4:05 PM  - Admin approves payout
4:06 PM  - Wallet balance deducted: 42,500 XAF remaining
4:07 PM  - Fapshi payout initiated
4:10 PM  - Host receives 100,000 XAF in mobile money
4:10 PM  - Payout status: COMPLETED ✅
```

---

## 🎨 Frontend Implementation Guide

### **1. Onboarding Flow UI**

Create a multi-step form:

```typescript
// Step 1: Personal Information
<HostProfileForm>
  - Full Legal Name
  - Date of Birth
  - Nationality
  - Residential Address (Street, City, Region)
  - Phone Numbers (Primary, Alternate, Emergency)
  - Payout Details (Mobile Money Number, Name)
  - Bio
  - Languages
</HostProfileForm>

// Step 2: ID Verification
<IdVerificationUpload>
  - Upload ID Front (with preview)
  - Upload ID Back (with preview)
  - Take Selfie with ID (camera integration)
  - Guidelines for good photos
</IdVerificationUpload>

// Step 3: Property Documents (Optional)
<OwnershipDocsUpload>
  - Upload property deed/title
  - Upload rental agreement
  - Upload business license
  - Mark as "Not Applicable" option
</OwnershipDocsUpload>

// Step 4: Review & Submit
<OnboardingReview>
  - Show all submitted information
  - Completion percentage
  - Submit for admin review
  - Status tracking
</OnboardingReview>
```

### **2. Payout Request UI**

```typescript
// Wallet Dashboard
<WalletOverview>
  - Total Balance: 95,000 XAF
  - Available for Payout: 80,000 XAF
  - Locked in Pending Requests: 15,000 XAF
  - Button: "Request Payout"
</WalletOverview>

// Payout Request Form
<PayoutRequestForm>
  - Amount (max: eligible amount)
  - Phone Number (pre-filled from profile)
  - Payment Method (Mobile Money / Orange Money)
  - Estimated processing: 1-2 business days
  - Button: "Submit Request"
</PayoutRequestForm>

// Payout History
<PayoutHistory>
  - List of all payout requests
  - Status badges (Pending, Approved, Completed, Rejected)
  - Details for each request
  - Cancel button (if pending)
</PayoutHistory>
```

### **3. Admin Verification UI**

```typescript
// Verification Queue
<VerificationQueue>
  - List of pending hosts
  - Filter by verification status
  - View documents inline
  - Quick approve/reject actions
</VerificationQueue>

// Document Viewer
<DocumentViewer>
  - ID Front (zoomable)
  - ID Back (zoomable)
  - Selfie (zoomable)
  - Side-by-side comparison
  - Ownership docs viewer
  - Approve/Reject buttons with notes
</DocumentViewer>

// Payout Approval Dashboard
<PayoutApprovalDashboard>
  - Pending payout requests
  - Host verification status check
  - Wallet balance verification
  - Transaction history review
  - One-click approve/reject
  - Batch approval option
</PayoutApprovalDashboard>
```

---

## 🧪 Testing Guide

### **Test Scenario 1: Complete Host Onboarding**

```bash
# 1. Register as new user
curl -X POST "http://localhost:5000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newhost@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Host",
    "phone": "+237612345678"
  }'

# 2. Apply to become host
curl -X POST "http://localhost:5000/api/v1/host-applications/apply" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "I want to list my property"}'

# 3. Complete host profile
curl -X POST "http://localhost:5000/api/v1/host-onboarding/profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullLegalName": "Test Host Full Name",
    "residentialAddress": "123 Main St, Bonamoussadi",
    "city": "Douala",
    "region": "Littoral",
    "payoutPhoneNumber": "+237612345678",
    "payoutPhoneName": "Test Host"
  }'

# 4. Upload ID verification
# (First upload images, then submit URLs)
curl -X POST "http://localhost:5000/api/v1/host-onboarding/id-verification" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idFrontImage": "https://example.com/id-front.jpg",
    "idBackImage": "https://example.com/id-back.jpg",
    "selfieImage": "https://example.com/selfie.jpg"
  }'

# 5. Check onboarding status
curl -X GET "http://localhost:5000/api/v1/host-onboarding/status" \
  -H "Authorization: Bearer <token>"

# 6. Admin approves
curl -X POST "http://localhost:5000/api/v1/host-onboarding/USER_ID/verify-id" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "VERIFIED",
    "notes": "ID verified successfully"
  }'
```

### **Test Scenario 2: Payout Request Flow**

```bash
# 1. Check eligible amount
curl -X GET "http://localhost:5000/api/v1/payout-requests/eligible-amount" \
  -H "Authorization: Bearer <host-token>"

# 2. Create payout request
curl -X POST "http://localhost:5000/api/v1/payout-requests/request" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "phoneNumber": "+237612345678",
    "paymentMethod": "MOBILE_MONEY"
  }'

# 3. Admin views pending requests
curl -X GET "http://localhost:5000/api/v1/payout-requests/all?status=PENDING" \
  -H "Authorization: Bearer <admin-token>"

# 4. Admin approves
curl -X POST "http://localhost:5000/api/v1/payout-requests/REQUEST_ID/approve" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# 5. Host checks payout status
curl -X GET "http://localhost:5000/api/v1/payout-requests/my-requests" \
  -H "Authorization: Bearer <host-token>"
```

---

## 🔒 Security & Validation

### **Host Profile Validation**

- ✅ Full legal name (3-100 characters)
- ✅ Valid Cameroon phone format (+237XXXXXXXXX)
- ✅ Required: address, city, region, payout phone
- ✅ Date validation for DOB and ID expiry

### **ID Verification Requirements**

- ✅ All 3 images required (front, back, selfie)
- ✅ Must be valid URLs (after upload)
- ✅ Images should be clear and readable
- ✅ Selfie must match ID photo

### **Payout Request Validation**

- ✅ Minimum amount: 1,000 XAF
- ✅ Amount ≤ eligible balance
- ✅ Valid phone number format
- ✅ Host profile must exist
- ✅ Cannot exceed available balance

### **Admin Actions**

- ✅ Only admins can approve/reject
- ✅ Rejection requires reason
- ✅ All actions logged
- ✅ Audit trail maintained

---

## 📊 Workflow Diagrams

### **Onboarding Workflow**

```
User Registration
    ↓
Apply to Become Host
    ↓
Complete Host Profile (Personal Info + Payout Details)
    ↓
Upload ID Verification (Front + Back + Selfie)
    ↓
Upload Ownership Docs (Optional)
    ↓
Admin Reviews Documents
    ↓
[APPROVED] → Host can list properties ✅
[REJECTED] → Host notified, can reapply ❌
```

### **Payout Workflow**

```
Booking Payment Received
    ↓
Host Wallet Credited
    ↓
Funds Locked for 3 Days
    ↓
After 3 Days → Funds Eligible
    ↓
Host Requests Payout
    ↓
Payout Request (Status: PENDING)
    ↓
Admin Receives Notification
    ↓
Admin Reviews Request
    ↓
[APPROVE]                    [REJECT]
    ↓                            ↓
Wallet Deducted            Funds Stay in Wallet
    ↓                            ↓
Fapshi Payout Sent         Host Notified of Reason
    ↓                            ↓
Status: PROCESSING         Can Request Again
    ↓
Webhook: SUCCESSFUL
    ↓
Status: COMPLETED ✅
Host Receives Money 💰
```

---

## 🆚 Comparison: Old vs New System

| Feature                | Old System           | New System                                 |
| ---------------------- | -------------------- | ------------------------------------------ |
| **Host Verification**  | Email only           | Full ID + Selfie + Documents               |
| **Personal Info**      | Basic (name, email)  | Complete (address, DOB, emergency contact) |
| **Payout Method**      | Automatic withdrawal | Manual approval by admin                   |
| **Payout Speed**       | Instant              | 3-day hold + admin review                  |
| **Fraud Protection**   | Low                  | High (multi-layer verification)            |
| **Dispute Protection** | None                 | 3-day buffer period                        |
| **Admin Control**      | Limited              | Full control over payouts                  |
| **KYC Compliance**     | Minimal              | Full KYC/AML compliance                    |
| **Trust Level**        | Medium               | High (verified hosts)                      |
| **Chargeback Risk**    | High                 | Low (3-day waiting)                        |

---

## 💡 Best Practices

### **For Hosts:**

1. **Complete onboarding fully** - Higher approval chance
2. **Use clear, well-lit photos** for ID verification
3. **Provide optional documents** - Shows legitimacy
4. **Request realistic payout amounts** - Don't drain entire balance
5. **Be patient** - Admin review takes 1-2 business days

### **For Admins:**

1. **Review documents carefully** - Check for tampering
2. **Verify name matches** across all documents
3. **Check ID expiry dates** - Don't approve expired IDs
4. **Review payout patterns** - Flag suspicious behavior
5. **Communicate clearly** - Provide reasons for rejections

---

## 🚨 Common Issues & Solutions

### Issue: Host can't request payout

**Possible Causes:**

- Host profile not completed
- Insufficient eligible balance
- Pending payout already exists
- Verification not approved

**Solution:**

```bash
# Check onboarding status
GET /api/v1/host-onboarding/status

# Check eligible amount
GET /api/v1/payout-requests/eligible-amount
```

### Issue: Payout request rejected

**Host Actions:**

- Read rejection reason
- Address concerns
- Submit new request
- Contact admin if unclear

### Issue: Payout stuck in PROCESSING

**Admin Actions:**

- Check Fapshi dashboard
- Verify transaction status
- Check webhook logs
- Manual Fapshi verification

---

## 📞 Support

### For Hosts

- Check onboarding status regularly
- Upload clear document photos
- Respond to admin queries promptly
- Contact support if verification delayed

### For Admins

- Review verification queue daily
- Approve/reject within 24-48 hours
- Provide clear rejection reasons
- Monitor payout completion rates

---

## ✅ Implementation Complete!

**All Features Implemented:**

- ✅ Enhanced host profile
- ✅ ID verification (3 images)
- ✅ Property ownership docs (optional)
- ✅ Manual payout requests
- ✅ Admin approval workflow
- ✅ 3-day waiting period
- ✅ Webhook integration
- ✅ Notification system
- ✅ Complete API endpoints

**Ready for:**

- ✅ Production deployment
- ✅ Mobile app integration
- ✅ Admin panel implementation
- ✅ Real-world usage

---

**Last Updated:** October 10, 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready
