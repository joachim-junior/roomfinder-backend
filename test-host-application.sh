#!/bin/bash

echo "======================================"
echo "Testing Host Application Submission"
echo "======================================"
echo ""

# Configuration
API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

echo "Step 1: Login to get auth token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "Login Response:"
echo "$LOGIN_RESPONSE"
echo ""

# Extract token using grep and sed instead of jq
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to extract token. Login might have failed."
  exit 1
fi

echo "✅ Login successful! Token: ${TOKEN:0:30}..."
echo ""

echo "Step 2: Submit host application..."
APPLICATION_RESPONSE=$(curl -s -X POST "${API_URL}/host-applications/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "notes": "I have a beautiful property in Douala that I would like to list on your platform. I have experience hosting guests and look forward to joining your community."
  }')

echo "Application Response:"
echo "$APPLICATION_RESPONSE"
echo ""

# Check if successful
if echo "$APPLICATION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Host application submitted successfully!"
  echo ""
  echo "Step 3: Check application status..."
  STATUS_RESPONSE=$(curl -s -X GET "${API_URL}/host-applications/status" \
    -H "Authorization: Bearer ${TOKEN}")
  
  echo "Application Status:"
  echo "$STATUS_RESPONSE"
else
  echo "❌ Application submission failed"
  ERROR=$(echo "$APPLICATION_RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//')
  echo "Error: $ERROR"
fi

echo ""
echo "======================================"
echo "Test Complete"
echo "======================================"
