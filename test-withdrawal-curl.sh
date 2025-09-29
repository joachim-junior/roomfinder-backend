#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000/api/v1"
TEST_EMAIL="testhost@example.com"
TEST_PASSWORD="password123"

echo "🚀 Testing Host Withdrawal Endpoint"
echo "=================================="

# Step 1: Login and get token
echo "�� Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract token (assuming jq is available)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to get authentication token"
  echo "Please check if the server is running and credentials are correct"
  exit 1
fi

echo "✅ Login successful, token: ${TOKEN:0:20}..."

# Step 2: Get wallet balance
echo -e "\n💰 Step 2: Getting wallet balance..."
BALANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

echo "Balance response: $BALANCE_RESPONSE"

# Step 3: Test valid withdrawal
echo -e "\n🧪 Step 3: Testing valid withdrawal..."
WITHDRAWAL_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "withdrawalMethod": "MOBILE_MONEY",
    "phone": "+237612345678"
  }')

echo "Withdrawal response: $WITHDRAWAL_RESPONSE"

# Step 4: Test invalid withdrawal (zero amount)
echo -e "\n🧪 Step 4: Testing invalid withdrawal (zero amount)..."
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0,
    "withdrawalMethod": "MOBILE_MONEY",
    "phone": "+237612345678"
  }')

echo "Invalid withdrawal response: $INVALID_RESPONSE"

# Step 5: Get withdrawal history
echo -e "\n📜 Step 5: Getting withdrawal history..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/wallet/withdrawals" \
  -H "Authorization: Bearer $TOKEN")

echo "Withdrawal history: $HISTORY_RESPONSE"

echo -e "\n✅ Testing completed!"
