#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

# Login
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

echo "Checking Host Application Status..."
echo ""

# Get status
STATUS_RESPONSE=$(curl -s -X GET "${API_URL}/host-applications/status" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$STATUS_RESPONSE"
echo ""

# Pretty print key fields
ROLE=$(echo "$STATUS_RESPONSE" | grep -o '"role":"[^"]*"' | sed 's/"role":"//;s/"$//')
STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"hostApprovalStatus":"[^"]*"' | sed 's/"hostApprovalStatus":"//;s/"$//')

echo "========================"
echo "Current Role: $ROLE"
echo "Application Status: $STATUS"
echo "========================"
