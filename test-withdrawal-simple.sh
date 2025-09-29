#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZobDljd2gwMDAwdTl0cGwxeDZucn
hpIiwiaWF0IjoxNzU3NzI2OTgyLCJleHAiOjE3NTgzMzE3ODJ9.UFM9n3R6FQbBxecQsjRxw5vSDCV84G26XoJcfhNxK80"

echo "Testing Host Withdrawal Endpoint"
echo "================================"

echo "Test 1: Valid withdrawal request"
curl -X POST "http://localhost:5000/api/v1/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "withdrawalMethod": "MOBILE_MONEY", "phone": "+237612345678"}'

echo -e "\n\nTest 2: Invalid amount (zero)"
curl -X POST "http://localhost:5000/api/v1/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 0, "withdrawalMethod": "MOBILE_MONEY", "phone": "+237612345678"}'

echo -e "\n\nTest 3: Missing withdrawal method"
curl -X POST "http://localhost:5000/api/v1/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "phone": "+237612345678"}'

echo -e "\n\nTest 4: Get wallet balance"
curl -X GET "http://localhost:5000/api/v1/wallet/balance" \
  -H "Authorization: Bearer $TOKEN"

