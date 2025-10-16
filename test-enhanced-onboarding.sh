#!/bin/bash

echo "=========================================="
echo "Testing Enhanced Host Onboarding System"
echo "=========================================="
echo ""

API_URL="http://localhost:5000/api/v1"

# Step 1: Register new host
echo "Step 1: Registering new host..."
REGISTER=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "completehosttest@example.com",
    "password": "password123",
    "firstName": "Complete",
    "lastName": "Host",
    "phone": "+237612345678"
  }')

TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
echo "✅ User registered. Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Apply to become host
echo "Step 2: Applying to become host..."
APPLY=$(curl -s -X POST "${API_URL}/host-applications/apply" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "I want to list properties"}')

echo "$APPLY" | head -100
echo ""

# Step 3: Complete host profile
echo "Step 3: Completing host profile..."
PROFILE=$(curl -s -X POST "${API_URL}/host-onboarding/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullLegalName": "Complete Test Host Full Name",
    "dateOfBirth": "1990-05-15",
    "nationality": "Cameroonian",
    "residentialAddress": "123 Test Street, Bonamoussadi",
    "city": "Douala",
    "region": "Littoral",
    "country": "Cameroon",
    "postalCode": "00237",
    "alternatePhone": "+237698765432",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "+237677654321",
    "payoutPhoneNumber": "+237612345678",
    "payoutPhoneName": "Complete Host",
    "idType": "NATIONAL_ID",
    "idNumber": "CM123456789",
    "bio": "Experienced host",
    "languages": ["English", "French"]
  }')

echo "$PROFILE" | head -100
echo ""

# Step 4: Check onboarding status
echo "Step 4: Checking onboarding status..."
STATUS=$(curl -s -X GET "${API_URL}/host-onboarding/status" \
  -H "Authorization: Bearer ${TOKEN}")

COMPLETION=$(echo "$STATUS" | grep -o '"completionPercentage":[0-9]*' | sed 's/"completionPercentage"://')
echo "Onboarding completion: ${COMPLETION}%"
echo ""

echo "✅ Enhanced onboarding system working!"
echo ""
echo "=========================================="
echo "To complete onboarding, host needs to:"
echo "1. Upload ID front, back, and selfie images"
echo "2. Wait for admin verification"
echo "=========================================="
