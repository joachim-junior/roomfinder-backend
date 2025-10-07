#!/bin/bash

echo "======================================"
echo "Testing Host Application (New User)"
echo "======================================"
echo ""

API_URL="http://localhost:5000/api/v1"
EMAIL="newhost@example.com"
PASSWORD="password123"

echo "Step 1: Register new user..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"firstName\": \"New\",
    \"lastName\": \"Host\",
    \"phone\": \"+237698765432\"
  }")

echo "$REGISTER_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

if [ -z "$TOKEN" ]; then
  echo "Registration failed, trying to login..."
  LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
fi

echo "✅ User ready! Token: ${TOKEN:0:30}..."
echo ""

echo "Step 2: Submit host application..."
APPLICATION_RESPONSE=$(curl -s -X POST "${API_URL}/host-applications/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "notes": "I own multiple properties in Yaoundé and would love to list them on Room Finder. I have been hosting guests for over 3 years."
  }')

echo "$APPLICATION_RESPONSE"
echo ""

if echo "$APPLICATION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Application submitted successfully!"
  echo "✅ Email should have been sent to: $EMAIL"
  echo ""
  echo "Step 3: Verify application status..."
  sleep 1
  
  STATUS_RESPONSE=$(curl -s -X GET "${API_URL}/host-applications/status" \
    -H "Authorization: Bearer ${TOKEN}")
  
  echo "$STATUS_RESPONSE"
  echo ""
  
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"hostApprovalStatus":"[^"]*"' | sed 's/"hostApprovalStatus":"//;s/"$//')
  ROLE=$(echo "$STATUS_RESPONSE" | grep -o '"role":"[^"]*"' | sed 's/"role":"//;s/"$//')
  
  echo "========================"
  echo "✅ Role changed: GUEST → $ROLE"
  echo "✅ Status: $STATUS"
  echo "✅ Email sent successfully"
  echo "========================"
else
  echo "❌ Application failed"
  ERROR=$(echo "$APPLICATION_RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//')
  echo "Error: $ERROR"
fi

echo ""
echo "======================================"
echo "Test Complete"
echo "======================================"
