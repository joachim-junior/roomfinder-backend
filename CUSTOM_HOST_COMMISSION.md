# Custom Host Commission System

## Overview

Admins can now set individual commission rates for specific hosts, overriding the global platform commission. This allows for flexible pricing and special deals with premium hosts.

## How It Works

### Default Behavior

- **Global Commission**: 5% (configurable via RevenueConfig)
- All hosts use this rate by default
- `useCustomCommission = false` for all hosts initially

### Custom Commission

- Admin can set a specific commission rate for any host
- Custom rate overrides global rate when enabled
- Optional min/max constraints per host

## Database Schema

```prisma
model User {
  // ... existing fields ...
  customCommissionRate     Float?   // Custom % commission for this host
  customCommissionMin      Float?   // Minimum fee amount
  customCommissionMax      Float?   // Maximum fee amount
  useCustomCommission      Boolean  @default(false) // Enable custom rate
}
```

## API Endpoints

### 1. Set Custom Commission for Host

**Endpoint:** `PUT /api/v1/admin/hosts/:hostId/commission`

**Authentication:** Admin only

**Request Body:**

```json
{
  "commissionRate": 3.5,
  "commissionMin": 500,
  "commissionMax": 50000,
  "enabled": true
}
```

**Parameters:**

- `commissionRate` (optional): Percentage (0-100). Example: 3.5 = 3.5%
- `commissionMin` (optional): Minimum fee amount in XAF
- `commissionMax` (optional): Maximum fee amount in XAF
- `enabled` (optional): Boolean to enable/disable custom rate

**Example:**

```bash
curl -X PUT "https://your-api.com/api/v1/admin/hosts/host123/commission" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "commissionRate": 3.5,
    "commissionMin": 500,
    "enabled": true
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Host custom commission updated successfully",
  "data": {
    "id": "host123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "host@example.com",
    "customCommissionRate": 3.5,
    "customCommissionMin": 500,
    "customCommissionMax": null,
    "useCustomCommission": true
  }
}
```

---

### 2. Get Host Commission Settings

**Endpoint:** `GET /api/v1/admin/hosts/:hostId/commission`

**Authentication:** Admin only

**Example:**

```bash
curl -X GET "https://your-api.com/api/v1/admin/hosts/host123/commission" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "host": {
      "id": "host123",
      "name": "John Doe",
      "email": "host@example.com"
    },
    "customCommission": {
      "enabled": true,
      "rate": 3.5,
      "min": 500,
      "max": null
    },
    "globalCommission": {
      "rate": 5.0,
      "min": 0,
      "max": null
    },
    "activeRate": 3.5
  }
}
```

---

### 3. Reset Host to Global Commission

**Endpoint:** `DELETE /api/v1/admin/hosts/:hostId/commission`

**Authentication:** Admin only

**Example:**

```bash
curl -X DELETE "https://your-api.com/api/v1/admin/hosts/host123/commission" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Host commission reset to global rate",
  "data": {
    "id": "host123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "host@example.com"
  }
}
```

## Use Cases

### 1. Premium Host Discount

Give top-performing hosts a lower commission rate to incentivize quality.

```bash
# Set 3% commission for premium host (vs 5% global)
curl -X PUT "/api/v1/admin/hosts/premium-host-id/commission" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"commissionRate": 3.0, "enabled": true}'
```

### 2. New Host Promotion

Offer reduced rates for new hosts to attract listings.

```bash
# Set 2% commission for 90 days
curl -X PUT "/api/v1/admin/hosts/new-host-id/commission" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"commissionRate": 2.0, "enabled": true}'
```

### 3. High-Volume Host Deals

Reward hosts with many properties with better rates.

```bash
# Set tiered commission with min/max
curl -X PUT "/api/v1/admin/hosts/high-volume-host/commission" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "commissionRate": 4.0,
    "commissionMin": 1000,
    "commissionMax": 100000,
    "enabled": true
  }'
```

## How Fees Are Calculated

### Example: Booking with Custom Commission

**Scenario:**

- Property Price: 100,000 XAF per night
- Nights: 5
- Base Amount: 500,000 XAF
- Host has custom commission: 3% (vs 5% global)

**Calculation:**

```javascript
// With custom 3% commission:
hostServiceFee = 500,000 * 3% = 15,000 XAF
guestServiceFee = 500,000 * 3% = 15,000 XAF (global guest rate)
totalGuestPays = 500,000 + 15,000 = 515,000 XAF
netAmountForHost = 500,000 - 15,000 = 485,000 XAF
platformRevenue = 15,000 + 15,000 = 30,000 XAF

// With global 5% commission (default):
hostServiceFee = 500,000 * 5% = 25,000 XAF
netAmountForHost = 500,000 - 25,000 = 475,000 XAF

// Host saves: 10,000 XAF with custom rate
```

## Impact on Existing System

### ✅ Backward Compatible

- Existing hosts continue using global 5% rate
- No changes to existing bookings or transactions
- Custom commission is **opt-in only**
- All existing endpoints work unchanged

### ✅ Automatic Application

Custom commissions are automatically applied:

- During new booking creation
- During payment webhook processing
- In fee calculation endpoints
- In host dashboard earnings display

## Admin Workflow

### Setting Custom Commission

1. **View host's current commission:**

   ```bash
   GET /api/v1/admin/hosts/:hostId/commission
   ```

2. **Set custom commission:**

   ```bash
   PUT /api/v1/admin/hosts/:hostId/commission
   {
     "commissionRate": 3.5,
     "enabled": true
   }
   ```

3. **Verify it's working:**

   - Create a test booking for that host's property
   - Check fee breakdown shows 3.5% instead of 5%

4. **Reset to global rate (if needed):**
   ```bash
   DELETE /api/v1/admin/hosts/:hostId/commission
   ```

## Validation Rules

- `commissionRate`: 0-100 (percentage)
- `commissionMin`: >= 0 (in XAF)
- `commissionMax`: >= 0 (in XAF)
- User must have `role = HOST`
- Only admins can modify commission settings

## Error Responses

**Host Not Found (404):**

```json
{
  "success": false,
  "message": "Host not found"
}
```

**Not a Host (400):**

```json
{
  "success": false,
  "message": "User is not a host"
}
```

**Invalid Rate (400):**

```json
{
  "success": false,
  "message": "Commission rate must be between 0 and 100"
}
```

## Testing

### Test Custom Commission

1. Create a host user
2. Set custom commission via admin endpoint
3. Calculate fees for a test booking
4. Verify custom rate is applied

Example:

```bash
# 1. Set 3% commission for host
curl -X PUT "http://localhost:5000/api/v1/admin/hosts/HOST_ID/commission" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"commissionRate": 3.0, "enabled": true}'

# 2. Calculate fees for a booking
curl -X GET "http://localhost:5000/api/v1/bookings/calculate-fees?propertyId=PROP_ID&checkIn=2025-10-15&checkOut=2025-10-20&guests=2" \
  -H "Authorization: Bearer USER_TOKEN"

# 3. Check response shows 3% commission in fee breakdown
```

## Summary

✅ **Flexible Commission Rates**: Set custom rates per host  
✅ **Backward Compatible**: No impact on existing system  
✅ **Admin Controlled**: Only admins can modify rates  
✅ **Automatic Application**: Works across all booking flows  
✅ **Optional Constraints**: Min/max fee limits per host  
✅ **Easy Reset**: One-click return to global rate
