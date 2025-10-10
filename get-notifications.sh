#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser2@example.com"
PASSWORD="password1234"

echo "=========================================="
echo "Getting Notifications for $EMAIL"
echo "=========================================="
echo ""

# Login
echo "Step 1: Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed for $EMAIL"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"$//')
echo "User ID: $USER_ID"
echo ""

echo "Step 2: Fetching notifications..."
NOTIFICATIONS=$(curl -s -X GET "${API_URL}/notifications?page=1&limit=50" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$NOTIFICATIONS"
echo ""

# Parse and display nicely
echo "=========================================="
echo "Notification Summary:"
echo "=========================================="

# Count total notifications
TOTAL=$(echo "$NOTIFICATIONS" | grep -o '"total":[0-9]*' | sed 's/"total"://')
UNREAD=$(echo "$NOTIFICATIONS" | grep -o '"unread":[0-9]*' | sed 's/"unread"://')

echo "Total notifications: ${TOTAL:-0}"
echo "Unread notifications: ${UNREAD:-0}"
echo ""

# Extract notification titles if any exist
if echo "$NOTIFICATIONS" | grep -q '"notifications":\['; then
  echo "Recent notifications:"
  echo "$NOTIFICATIONS" | grep -o '"title":"[^"]*"' | sed 's/"title":"//;s/"$//' | nl
else
  echo "No notifications found."
fi

echo "=========================================="
