# 💰 Commission & Fees System - Complete Breakdown

## Overview

The Room Finder platform uses a **single-tier commission system**:

1. **Booking Commission** - Applied when guest pays (10% total: 5% guest + 5% host)
2. **NO Withdrawal Fees** - Hosts receive full amount when requesting payouts

**All platform fees are collected during booking. Payouts are fee-free!**

---

## 📊 Complete Money Flow

### **Scenario: Guest Books Property for 100,000 XAF**

#### **Step 1: Guest Payment** (When booking is paid)

```
Guest Pays:            100,000 XAF
  ↓
Guest Service Fee (5%):  -5,000 XAF
  ↓
Host Service Fee (5%):   -5,000 XAF
  ↓
Host Receives in Wallet:  90,000 XAF
  ↓
Platform Revenue:         10,000 XAF (both fees)
```

**Database Records:**

```javascript
// Transaction created
{
  amount: 100,000 XAF,
  type: "PAYMENT",
  guestServiceFee: 5,000,
  hostServiceFee: 5,000,
  platformRevenue: 10,000,
  netAmountForHost: 90,000
}

// Host wallet updated
wallet.balance += 90,000 XAF

// Platform revenue recorded
{
  revenueType: "BOOKING_FEE",
  amount: 10,000 XAF,
  breakdown: {
    guestFee: 5,000,
    hostFee: 5,000
  }
}
```

---

#### **Step 2: 3-Day Waiting Period**

```
Day 1-3: Funds LOCKED in wallet
  ↓
Host can see balance: 90,000 XAF
  ↓
But CANNOT withdraw yet (chargeback protection)
  ↓
Day 4: Funds become ELIGIBLE for payout
```

---

#### **Step 3: Host Requests Payout**

```
Host Requests:         50,000 XAF
  ↓
NO Withdrawal Fee! ✅
  ↓
Host Receives:         50,000 XAF (full amount)
  ↓
Platform Earns:        0 XAF (no withdrawal fee)
```

**API Call:**

```bash
POST /api/v1/payout-requests/request
{
  "amount": 50000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "payout-xxx",
    "amount": 50000,
    "status": "PENDING",
    "metadata": {
      "withdrawalFee": 100,
      "netAmount": 49900,
      "requestedBalance": 90000,
      "eligibleBalance": 90000
    }
  }
}
```

---

#### **Step 4: Admin Approves Payout**

```
Admin Approves Request
  ↓
Wallet Balance Deducted: -50,000 XAF
  ↓
New Wallet Balance:       40,000 XAF
  ↓
Fapshi Payout Initiated:  49,900 XAF (net amount)
  ↓
Platform Revenue Recorded: 100 XAF
```

**What Gets Recorded:**

```javascript
// Wallet updated
wallet.balance = 90,000 - 50,000 = 40,000 XAF

// Transaction created
{
  amount: 50,000 XAF,
  type: "WITHDRAWAL",
  platformRevenue: 100 XAF,
  netAmountForHost: 49,900 XAF,
  metadata: {
    withdrawalFee: 100,
    netAmount: 49,900
  }
}

// Platform revenue recorded
{
  revenueType: "WITHDRAWAL_FEE",
  amount: 100 XAF,
  transactionId: "txn-xxx",
  metadata: {
    originalAmount: 50,000,
    netAmount: 49,900
  }
}

// Fapshi payout (actual transfer)
{
  amount: 49,900 XAF,  // Net amount only
  phone: "+237612345678",
  medium: "mobile money"
}
```

---

#### **Step 5: Host Receives Money**

```
Fapshi sends:          49,900 XAF
  ↓
Host mobile money account credited
  ↓
Payout Status:         COMPLETED ✅
  ↓
Host Notification:     "You received 49,900 XAF"
```

---

## 💵 Fee Structure Summary

| Transaction Type | Guest Fee | Host Fee | Withdrawal Fee | Platform Total |
| ---------------- | --------- | -------- | -------------- | -------------- |
| **Booking**      | 5%        | 5%       | -              | 10% of booking |
| **Withdrawal**   | -         | -        | **NONE** ✅    | 0 XAF          |

### **Example Calculations:**

#### Booking: 100,000 XAF

```
Guest pays:           100,000 XAF
Guest service fee:     -5,000 XAF (platform revenue)
Host service fee:      -5,000 XAF (platform revenue)
Host wallet credited:  90,000 XAF

Platform earns:        10,000 XAF
```

#### Withdrawal: 50,000 XAF

```
Host requests:         50,000 XAF
Withdrawal fee:        NONE! ✅
Host receives:         50,000 XAF (full amount)

Platform earns:        0 XAF
```

#### Complete Transaction

```
Guest paid:           100,000 XAF
Host receives:         50,000 XAF (first payout)

Total platform revenue:
  - Booking fees:      10,000 XAF
  - Withdrawal fee:    0 XAF
  - TOTAL:             10,000 XAF (10% total commission)

Host still has:        40,000 XAF in wallet
```

---

## 🔍 Balance Tracking

### **Three Types of Balances:**

#### 1. **Total Balance**

- Everything in the wallet
- Includes locked and available funds

#### 2. **Locked Balance**

- Funds in pending payout requests
- Cannot be used for new payouts
- Released if payout is rejected or cancelled

#### 3. **Eligible Balance** (Available for Payout)

```
Eligible = Total Balance - Locked Balance
```

### **Example:**

```javascript
Wallet Balance:        100,000 XAF  (total)
Pending Payout Request: 30,000 XAF  (locked)
  ↓
Eligible for Payout:    70,000 XAF  (available)
```

**API Response:**

```json
GET /api/v1/payout-requests/eligible-amount

{
  "totalBalance": 100000,
  "eligibleAmount": 70000,
  "lockedAmount": 30000,
  "pendingPayouts": 1
}
```

---

## 🧮 Fee Calculation API

### **Preview Fees Before Requesting**

```bash
GET /api/v1/payout-requests/calculate-fees?amount=50000
Authorization: Bearer <token>
```

**Response:**

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

**Use this in frontend** to show hosts:

- "You're requesting: 50,000 XAF"
- "Withdrawal fee: NONE ✅"
- "**You'll receive: 50,000 XAF (full amount)**"

---

## 📈 Revenue Tracking

### **Platform Revenue Sources:**

#### 1. **Booking Fees**

```javascript
{
  revenueType: "BOOKING_FEE",
  amount: 10,000 XAF,
  breakdown: {
    guestServiceFee: 5,000,
    hostServiceFee: 5,000
  },
  transactionId: "txn-booking-xxx",
  bookingId: "booking-xxx"
}
```

#### 2. **Withdrawal Fees**

```javascript
{
  revenueType: "WITHDRAWAL_FEE",
  amount: 100 XAF,
  metadata: {
    payoutRequestId: "payout-xxx",
    originalAmount: 50,000,
    netAmount: 49,900
  },
  transactionId: "txn-withdrawal-xxx"
}
```

### **Query Platform Revenue:**

```bash
GET /api/v1/admin/revenue/summary
Authorization: Bearer <admin-token>
```

**Response includes:**

- Total booking fees
- Total withdrawal fees
- Revenue by type
- Revenue over time

---

## 💡 Why This System Is Better

### **Transparent to Hosts:**

✅ Can preview fees before requesting  
✅ See exact amount they'll receive  
✅ Understand all deductions  
✅ No hidden charges

### **Secure for Platform:**

✅ Withdrawal fees tracked  
✅ Revenue properly recorded  
✅ Audit trail complete  
✅ Financial reports accurate

### **Fair to Everyone:**

✅ Guests pay service fee upfront  
✅ Hosts pay small withdrawal fee  
✅ Platform earns sustainable revenue  
✅ All fees clearly communicated

---

## 🧪 Testing the Fee System

### **Test 1: Preview Withdrawal Fees**

```bash
# Calculate fees for 50,000 XAF
curl "http://localhost:5000/api/v1/payout-requests/calculate-fees?amount=50000" \
  -H "Authorization: Bearer <host-token>"

# Expected Response:
{
  "requestedAmount": 50000,
  "withdrawalFee": 100,
  "netAmount": 49900,
  "feePercentage": "0.20"
}
```

### **Test 2: Complete Payout with Fees**

```bash
# 1. Check eligible balance
curl "http://localhost:5000/api/v1/payout-requests/eligible-amount" \
  -H "Authorization: Bearer <host-token>"

# 2. Preview fees
curl "http://localhost:5000/api/v1/payout-requests/calculate-fees?amount=30000" \
  -H "Authorization: Bearer <host-token>"

# 3. Request payout
curl -X POST "http://localhost:5000/api/v1/payout-requests/request" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 30000}'

# 4. Admin approves
curl -X POST "http://localhost:5000/api/v1/payout-requests/REQUEST_ID/approve" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# 5. Verify revenue was recorded
curl "http://localhost:5000/api/v1/admin/revenue/summary" \
  -H "Authorization: Bearer <admin-token>"
```

---

## 📱 Frontend Implementation

### **Payout Request Screen**

```typescript
// Show fee breakdown BEFORE submitting
<PayoutRequestForm>
  <Input
    label="Amount to Request"
    value={amount}
    onChange={handleAmountChange}
  />

  {/* Fee Preview (auto-calculate as user types) */}
  {amount > 0 && (
    <FeeBreakdown>
      <Row>
        <Label>Requested Amount:</Label>
        <Value>{amount} XAF</Value>
      </Row>
      <Row>
        <Label>Withdrawal Fee:</Label>
        <Value negative>-{withdrawalFee} XAF</Value>
      </Row>
      <Divider />
      <Row highlighted>
        <Label>You'll Receive:</Label>
        <Value bold>{netAmount} XAF</Value>
      </Row>
    </FeeBreakdown>
  )}

  <Button onClick={submitRequest}>Request Payout of {amount} XAF</Button>
</PayoutRequestForm>
```

### **Auto-Calculate Fees:**

```typescript
const [amount, setAmount] = useState(0);
const [fees, setFees] = useState(null);

// Debounced fee calculation
useEffect(() => {
  const timer = setTimeout(async () => {
    if (amount > 0) {
      const response = await axios.get(
        `/api/v1/payout-requests/calculate-fees?amount=${amount}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFees(response.data.data);
    }
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timer);
}, [amount]);
```

---

## 🎯 Key Points

### **For Hosts:**

1. **Booking Earnings:**
   - You receive 95% of booking price
   - 5% host service fee deducted automatically
2. **Withdrawal Fees:**

   - Minimum 100 XAF per payout request
   - Deducted from requested amount
   - Preview fees before requesting

3. **Total Earnings:**
   - Booking: 100,000 XAF → Wallet: 90,000 XAF (after 10% total fees)
   - Withdraw: 50,000 XAF → Receive: 49,900 XAF (after 100 XAF fee)
   - **Net: 49,900 XAF from 100,000 booking (49.9% net revenue)**

### **For Platform:**

1. **Booking Revenue:**

   - Guest fee: 5% of booking
   - Host fee: 5% of booking
   - Total: 10% per booking

2. **Withdrawal Revenue:**

   - 100 XAF per payout request
   - Flat fee (not percentage)

3. **Total Platform Revenue:**
   - Booking: 10,000 XAF
   - Withdrawal: 100 XAF
   - **Total: 10,100 XAF per booking+payout cycle**

---

## 🔄 Revenue Flow Diagram

```
GUEST BOOKS PROPERTY (100,000 XAF)
  ↓
┌─────────────────────────────────┐
│  Guest Service Fee: 5,000 XAF   │ → Platform Revenue
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│  Host Service Fee:  5,000 XAF   │ → Platform Revenue
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│  Host Wallet:      90,000 XAF   │
│  Status: LOCKED (3 days)        │
└─────────────────────────────────┘
  ↓ (After 3 days)
┌─────────────────────────────────┐
│  Status: ELIGIBLE               │
│  Host can request payout        │
└─────────────────────────────────┘
  ↓
HOST REQUESTS PAYOUT (50,000 XAF)
  ↓
┌─────────────────────────────────┐
│  Withdrawal Fee:      100 XAF   │ → Platform Revenue
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│  Admin Approves                 │
│  Fapshi Sends:    49,900 XAF    │
└─────────────────────────────────┘
  ↓
HOST RECEIVES 49,900 XAF IN MOBILE MONEY
```

---

## 📊 Database Updates

### **When Booking is Paid:**

```sql
-- Host wallet updated
UPDATE wallets
SET balance = balance + 90000
WHERE userId = 'host-id';

-- Transaction created
INSERT INTO transactions (
  amount, type,
  guestServiceFee, hostServiceFee,
  platformRevenue, netAmountForHost
) VALUES (
  100000, 'PAYMENT',
  5000, 5000,
  10000, 90000
);

-- Platform revenue recorded
INSERT INTO platform_revenue (
  revenueType, amount, bookingId
) VALUES (
  'BOOKING_FEE', 10000, 'booking-id'
);
```

### **When Payout is Approved:**

```sql
-- Host wallet updated
UPDATE wallets
SET balance = balance - 50000
WHERE userId = 'host-id';

-- Transaction created
INSERT INTO transactions (
  amount, type,
  platformRevenue, netAmountForHost,
  metadata
) VALUES (
  50000, 'WITHDRAWAL',
  100, 49900,
  '{"withdrawalFee": 100, "netAmount": 49900}'
);

-- Platform revenue recorded
INSERT INTO platform_revenue (
  revenueType, amount, transactionId
) VALUES (
  'WITHDRAWAL_FEE', 100, 'txn-id'
);

-- Payout request updated
UPDATE payout_requests
SET status = 'PROCESSING',
    metadata = '{"withdrawalFee": 100, "netAmount": 49900}'
WHERE id = 'payout-id';
```

---

## 🎨 UI/UX Recommendations

### **Show Fees Clearly:**

#### In Wallet Dashboard:

```
┌───────────────────────────────────┐
│  💰 Wallet Balance                │
│  ────────────────────────────────  │
│  Total Balance:      90,000 XAF   │
│  Locked (Pending):    0 XAF       │
│  ────────────────────────────────  │
│  Available:          90,000 XAF   │
│                                    │
│  [Request Payout]                  │
└───────────────────────────────────┘
```

#### In Payout Form:

```
┌───────────────────────────────────┐
│  Request Payout                    │
│  ────────────────────────────────  │
│  Amount: [50,000] XAF              │
│                                    │
│  Fee Breakdown:                    │
│  Requested:         50,000 XAF     │
│  Withdrawal Fee:      -100 XAF     │
│  ═══════════════════════════       │
│  You'll Receive:    49,900 XAF ✓   │
│                                    │
│  [Submit Request]                  │
└───────────────────────────────────┘
```

#### In Transaction History:

```
┌───────────────────────────────────┐
│  Transaction History               │
│  ────────────────────────────────  │
│  ✅ Booking Payment                │
│     Amount: +90,000 XAF            │
│     Fee: -10,000 XAF (10%)         │
│     Guest: John Doe                │
│     Date: Oct 13, 2025             │
│  ────────────────────────────────  │
│  ⏳ Payout Requested               │
│     Amount: -50,000 XAF            │
│     Fee: -100 XAF                  │
│     Net: 49,900 XAF                │
│     Status: Pending Admin Approval │
│     Date: Oct 16, 2025             │
└───────────────────────────────────┘
```

---

## 🔧 Configuration

### **Withdrawal Fee Settings**

Configured in revenue settings (can be customized):

```javascript
{
  appliesToWithdrawal: true,  // Enable withdrawal fees
  hostServiceFeeMin: 100,     // Minimum withdrawal fee (100 XAF)
  // Can be changed to percentage-based if needed
}
```

### **Custom Commission Rates**

For special hosts (VIP, partnerships):

```javascript
// Set custom commission for specific host
PUT /api/v1/admin/users/:userId/commission
{
  "customCommissionRate": 3,  // 3% instead of 5%
  "useCustomCommission": true
}

// This host now pays:
// - Guest fee: 5% (stays same)
// - Host fee: 3% (reduced from 5%)
// - Host receives: 92,000 XAF from 100,000 booking
```

---

## ⚠️ Important Notes

### **Fees Are Transparent:**

- ✅ All fees shown before transaction
- ✅ Hosts see net amount they'll receive
- ✅ No hidden charges
- ✅ Platform revenue properly tracked

### **Fees Are Fair:**

- ✅ Competitive with industry (Airbnb: 15-20%)
- ✅ Room Finder: 10% + 100 XAF withdrawal
- ✅ Lower than competitors
- ✅ Sustainable for platform

### **Fees Support Platform:**

- ✅ Server costs
- ✅ Payment processing
- ✅ Customer support
- ✅ Platform development
- ✅ Marketing & growth

---

## 🚨 Edge Cases Handled

### **Case 1: Insufficient Balance for Fee**

```
Host requests: 200 XAF
Withdrawal fee: 100 XAF
Net amount: 100 XAF

✅ Allowed (min payout is 1,000 XAF validates this)
```

### **Case 2: Multiple Pending Payouts**

```
Balance: 100,000 XAF
Payout 1: 30,000 XAF (PENDING)
Payout 2: 30,000 XAF (PENDING)
  ↓
Locked: 60,000 XAF
Eligible: 40,000 XAF
  ↓
✅ Can request up to 40,000 XAF more
```

### **Case 3: Payout Fails After Approval**

```
Admin approves → Wallet deducted → Fapshi fails
  ↓
✅ Wallet automatically refunded
✅ Payout status: FAILED
✅ Fees NOT charged (refunded)
✅ Host can request again
```

### **Case 4: Custom Commission Host**

```
VIP Host with 3% commission:
Booking: 100,000 XAF
  ↓
Guest fee: 5,000 XAF
Host fee: 3,000 XAF (custom rate)
  ↓
Host receives: 92,000 XAF
  ↓
Withdrawal: 50,000 XAF
Fee: 100 XAF
Net: 49,900 XAF
```

---

## 📊 Complete Example Lifecycle

### **Booking to Payout (100,000 XAF Property)**

| Event              | Guest    | Platform       | Host Wallet        | Host Receives |
| ------------------ | -------- | -------------- | ------------------ | ------------- |
| **Initial**        | -100,000 | 0              | 0                  | 0             |
| **Guest Pays**     | 0        | +10,000 (fees) | +90,000            | 0             |
| **3 Days Wait**    | 0        | 0              | 90,000 (locked)    | 0             |
| **Funds Eligible** | 0        | 0              | 90,000 (available) | 0             |
| **Request Payout** | 0        | 0              | 90,000             | 0             |
| **Admin Approves** | 0        | +100 (fee)     | -50,000            | +49,900       |
| **Final State**    | -100,000 | +10,100        | 40,000             | +49,900       |

**Summary:**

- Guest paid: 100,000 XAF
- Host has left: 40,000 XAF (in wallet) + 49,900 XAF (received) = 89,900 XAF
- Platform earned: 10,100 XAF
- Total: 100,000 XAF ✅ (balanced)

---

## ✅ Checklist for Deployment

- [x] Withdrawal fees integrated ✅
- [x] Revenue tracking added ✅
- [x] Fee preview endpoint created ✅
- [x] Transaction metadata updated ✅
- [x] Platform revenue recorded ✅
- [x] Net amount sent via Fapshi ✅
- [ ] Test with real Fapshi payouts
- [ ] Update frontend to show fees
- [ ] Train admins on fee system

---

## 📚 Related Documentation

- **Main Guide:** `ENHANCED_HOST_ONBOARDING_AND_PAYOUT_SYSTEM.md`
- **Quick Reference:** `QUICK_API_REFERENCE_ONBOARDING_PAYOUTS.md`
- **Revenue System:** (check existing revenue documentation)

---

**Last Updated:** October 13, 2025  
**Status:** ✅ Commission & Fees Fully Integrated  
**Ready For:** Production Deployment
