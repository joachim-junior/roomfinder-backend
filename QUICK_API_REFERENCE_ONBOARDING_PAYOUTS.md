# 📚 Quick API Reference - Enhanced Host Onboarding & Manual Payouts

## 🏠 Host Onboarding API

### Base URL: `/api/v1/host-onboarding`

| Endpoint                    | Method   | Auth | Role        | Description                     |
| --------------------------- | -------- | ---- | ----------- | ------------------------------- |
| `/profile`                  | POST/PUT | ✅   | HOST, ADMIN | Create/update host profile      |
| `/id-verification`          | POST     | ✅   | HOST, ADMIN | Upload ID documents (3 images)  |
| `/ownership-documents`      | POST     | ✅   | HOST, ADMIN | Upload property docs (optional) |
| `/status`                   | GET      | ✅   | HOST, ADMIN | Get onboarding progress         |
| `/pending-verifications`    | GET      | ✅   | ADMIN       | Get all pending verifications   |
| `/:userId/verify-id`        | POST     | ✅   | ADMIN       | Approve/reject ID verification  |
| `/:userId/verify-ownership` | POST     | ✅   | ADMIN       | Approve/reject ownership docs   |

---

## 💰 Payout Request API

### Base URL: `/api/v1/payout-requests`

| Endpoint              | Method | Auth | Role        | Description                 |
| --------------------- | ------ | ---- | ----------- | --------------------------- |
| `/eligible-amount`    | GET    | ✅   | HOST, ADMIN | Get available payout amount |
| `/request`            | POST   | ✅   | HOST, ADMIN | Create payout request       |
| `/my-requests`        | GET    | ✅   | HOST, ADMIN | Get my payout requests      |
| `/:requestId/cancel`  | PUT    | ✅   | HOST, ADMIN | Cancel pending request      |
| `/all`                | GET    | ✅   | ADMIN       | Get all payout requests     |
| `/statistics`         | GET    | ✅   | ADMIN       | Get payout stats            |
| `/:requestId/approve` | POST   | ✅   | ADMIN       | Approve payout request      |
| `/:requestId/reject`  | POST   | ✅   | ADMIN       | Reject payout request       |

---

## 🔑 Required Fields

### **Host Profile (Required)**

```json
{
  "fullLegalName": "John Smith Doe",
  "residentialAddress": "123 Main Street",
  "city": "Douala",
  "region": "Littoral",
  "payoutPhoneNumber": "+237612345678"
}
```

### **ID Verification (All 3 Required)**

```json
{
  "idFrontImage": "https://url-to-front.jpg",
  "idBackImage": "https://url-to-back.jpg",
  "selfieImage": "https://url-to-selfie.jpg"
}
```

### **Payout Request (Required)**

```json
{
  "amount": 50000
}
```

---

## 📊 Status Values

### **VerificationStatus**

- `PENDING` - Awaiting admin review
- `VERIFIED` - Approved by admin
- `REJECTED` - Rejected by admin
- `NOT_REQUIRED` - Not needed (ownership docs)
- `EXPIRED` - Documents expired

### **PayoutRequestStatus**

- `PENDING` - Awaiting admin approval
- `APPROVED` - Admin approved, processing payment
- `PROCESSING` - Fapshi processing payout
- `COMPLETED` - Money sent successfully
- `REJECTED` - Admin rejected request
- `CANCELLED` - Host cancelled
- `FAILED` - Fapshi payout failed

---

## 🎯 Common Use Cases

### **Use Case 1: New Host Onboarding**

```bash
1. POST /auth/register
2. POST /host-applications/apply
3. POST /host-onboarding/profile
4. POST /host-onboarding/id-verification
5. POST /host-onboarding/ownership-documents (optional)
6. GET /host-onboarding/status (check progress)
7. [Admin] POST /host-onboarding/:userId/verify-id
8. Host is APPROVED → Can list properties
```

### **Use Case 2: Request Payout**

```bash
1. GET /payout-requests/eligible-amount
2. POST /payout-requests/request
3. GET /payout-requests/my-requests (track status)
4. [Admin] POST /payout-requests/:id/approve
5. Wait for webhook → Status: COMPLETED
6. Money received in mobile money account
```

### **Use Case 3: Admin Verification**

```bash
1. GET /host-onboarding/pending-verifications
2. Review documents
3. POST /host-onboarding/:userId/verify-id (approve/reject)
4. Host notified of decision
```

### **Use Case 4: Admin Payout Approval**

```bash
1. GET /payout-requests/all?status=PENDING
2. Review each request
3. POST /payout-requests/:id/approve (or reject)
4. System processes payout automatically
5. Monitor completion via /payout-requests/statistics
```

---

## ⚡ Quick Tips

### **For Mobile App Developers**

**Onboarding Flow:**

1. Create multi-step wizard (4 steps)
2. Save progress locally
3. Show completion percentage
4. Allow draft saving
5. Camera integration for selfie

**Payout Requests:**

1. Show eligible vs locked balance clearly
2. Disable request button if no eligible funds
3. Show estimated payout time (1-2 days)
4. Real-time status updates
5. Push notifications for approvals

**Document Upload:**

1. Use native camera for selfie
2. Image picker for ID photos
3. Compress images before upload
4. Show upload progress
5. Preview before submit

### **For Admin Panel Developers**

**Verification Dashboard:**

1. Priority queue (oldest first)
2. Side-by-side document viewer
3. Zoom/pan functionality
4. Quick approve/reject buttons
5. Batch operations

**Payout Dashboard:**

1. Filter by status
2. Show host verification status
3. Display wallet balance
4. One-click approval
5. Rejection reason templates

---

## 🧩 Integration with Existing Features

### **Works With:**

- ✅ Existing wallet system
- ✅ Current booking flow
- ✅ Fapshi payment integration
- ✅ Email notifications
- ✅ Push notifications
- ✅ Admin panel
- ✅ Transaction history

### **Replaces:**

- ❌ `POST /wallet/withdraw` (now disabled)
- ❌ Automatic payout processing
- ❌ Basic host application

### **Maintains:**

- ✅ Wallet balance tracking
- ✅ Transaction records
- ✅ Refund system
- ✅ Revenue calculations
- ✅ All guest features

---

## 🎨 Recommended Frontend Components

```typescript
// Components to build:
-(<HostOnboardingWizard />) -
  <ProfileStep /> -
  <IDVerificationStep /> -
  <OwnershipDocsStep /> -
  <OnboardingStatusCard /> -
  <PayoutRequestForm /> -
  <PayoutHistory /> -
  <EligibleBalanceWidget /> -
  <AdminVerificationQueue /> -
  <DocumentReviewer /> -
  <PayoutApprovalPanel />;
```

---

## 📝 Notes

- All endpoints require authentication
- File uploads use separate endpoint: `POST /api/v1/uploads/multiple`
- Phone numbers must be valid Cameroon format
- Admin can override any status
- Hosts can reapply if rejected
- Payout requests can be cancelled only if PENDING

---

## 🆘 Need Help?

**Documentation:**

- Full Guide: `ENHANCED_HOST_ONBOARDING_AND_PAYOUT_SYSTEM.md`
- Production Setup: `PRODUCTION_READY_SUMMARY.md`
- API Docs: `HOST_API_DOCUMENTATION.md`

**Testing Scripts:**

- Check: `test-host-application.sh`
- Create more test scripts as needed

---

**Last Updated:** October 10, 2025  
**API Version:** 2.0  
**Status:** ✅ Ready for Production
