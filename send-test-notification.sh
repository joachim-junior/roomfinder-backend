#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser2@example.com"
PASSWORD="password1234"

echo "=========================================="
echo "Sending Test Push Notification"
echo "=========================================="
echo ""

# Login
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

echo "✅ Logged in as $EMAIL"
echo ""

echo "Sending test notification..."
TEST_RESPONSE=$(curl -s -X POST "${API_URL}/push-notifications/test" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification from Room Finder!"
  }')

echo "$TEST_RESPONSE"
echo ""

echo "Waiting 2 seconds..."
sleep 2

echo "Fetching notifications again..."
NOTIFICATIONS=$(curl -s -X GET "${API_URL}/notifications?page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$NOTIFICATIONS"
echo ""

TOTAL=$(echo "$NOTIFICATIONS" | grep -o '"total":[0-9]*' | sed 's/"total"://')
echo "=========================================="
echo "Total notifications: ${TOTAL:-0}"
echo "=========================================="
