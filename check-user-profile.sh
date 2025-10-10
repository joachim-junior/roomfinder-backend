#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser2@example.com"
PASSWORD="password1234"

# Login
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

echo "=========================================="
echo "User Profile: testuser2@example.com"
echo "=========================================="
echo ""

# Extract user info
ROLE=$(echo "$LOGIN_RESPONSE" | grep -o '"role":"[^"]*"' | sed 's/"role":"//;s/"$//')
IS_VERIFIED=$(echo "$LOGIN_RESPONSE" | grep -o '"isVerified":[^,]*' | sed 's/"isVerified"://')

echo "Role: $ROLE"
echo "Email Verified: $IS_VERIFIED"
echo ""

echo "Full User Data:"
echo "$LOGIN_RESPONSE"
echo ""

echo "=========================================="
echo "Actions that create notifications:"
echo "=========================================="
echo ""

if [ "$ROLE" = "GUEST" ]; then
  echo "As a GUEST, you'll get notifications for:"
  echo "  - Booking confirmations"
  echo "  - Payment status updates"
  echo "  - Booking status changes"
  echo "  - Review reminders"
  echo ""
  echo "To get notifications:"
  echo "  1. Make a booking"
  echo "  2. Complete payment"
elif [ "$ROLE" = "HOST" ]; then
  echo "As a HOST, you'll get notifications for:"
  echo "  - New booking requests"
  echo "  - Booking cancellations"
  echo "  - New reviews on your properties"
  echo "  - Host application status updates"
  echo "  - Payout confirmations"
  echo ""
  echo "To get notifications:"
  echo "  1. Wait for guests to book your properties"
  echo "  2. Create properties first if you haven't"
elif [ "$ROLE" = "ADMIN" ]; then
  echo "As an ADMIN, you'll get notifications for:"
  echo "  - New host applications"
  echo "  - New bookings"
  echo "  - System alerts"
fi

echo ""
echo "=========================================="
