# Admin Property Creation on Behalf of Hosts - Quick Reference

## Overview

Admins can create properties on behalf of approved hosts using the standard property creation endpoint with additional validation and automatic verification.

## Endpoint

```
POST /api/v1/properties
```

## Authentication

- **Required:** JWT token with ADMIN role
- **Header:** `Authorization: Bearer <admin_token>`

## Key Features

✅ **Automatic Verification** - Properties are immediately verified  
✅ **Host Validation** - Ensures host exists and is approved  
✅ **Quality Control** - Standardized property creation  
✅ **Audit Trail** - All admin actions are tracked

## Required Fields

| Field         | Type   | Description                                          |
| ------------- | ------ | ---------------------------------------------------- |
| `title`       | string | Property title (5-100 chars)                         |
| `description` | string | Property description (10-1000 chars)                 |
| `type`        | string | Property type (ROOM, STUDIO, APARTMENT, VILLA, etc.) |
| `address`     | string | Street address (5-200 chars)                         |
| `city`        | string | City name (2-50 chars)                               |
| `state`       | string | State/province (2-50 chars)                          |
| `country`     | string | Country name (2-50 chars)                            |
| `price`       | number | Nightly price (> 0)                                  |
| `bedrooms`    | number | Number of bedrooms (1-20)                            |
| `bathrooms`   | number | Number of bathrooms (1-10)                           |
| `maxGuests`   | number | Maximum guests (1-50)                                |
| `hostId`      | string | **REQUIRED** - ID of the host                        |

## Optional Fields

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `zipCode`   | string | Postal/ZIP code          |
| `latitude`  | number | GPS latitude             |
| `longitude` | number | GPS longitude            |
| `currency`  | string | Currency (default: XAF)  |
| `amenities` | array  | Array of amenity strings |
| `images`    | array  | Array of image URLs      |

## Property Types

- `ROOM` - Single room
- `STUDIO` - Open-plan space
- `APARTMENT` - Self-contained unit
- `VILLA` - Standalone house
- `SUITE` - Luxury suite
- `DORMITORY` - Shared accommodation
- `COTTAGE` - Small rural house
- `PENTHOUSE` - Top-floor luxury

## Example Request

```json
{
  "title": "Luxury Beachfront Villa",
  "description": "Stunning 4-bedroom villa with ocean views",
  "type": "VILLA",
  "address": "456 Ocean Drive",
  "city": "Limbe",
  "state": "Southwest",
  "country": "Cameroon",
  "price": 120000,
  "bedrooms": 4,
  "bathrooms": 3,
  "maxGuests": 8,
  "amenities": ["WiFi", "Pool", "Kitchen"],
  "hostId": "cme6fo5xz0000u9mo5li7lln7"
}
```

## Success Response

```json
{
  "message": "Property created successfully on behalf of John Host",
  "property": {
    "id": "property-id",
    "title": "Luxury Beachfront Villa",
    "isVerified": true,
    "hostId": "host-id",
    "createdAt": "2025-08-12T22:10:16.775Z"
  },
  "createdBy": "ADMIN"
}
```

## Error Responses

### Host Not Found (404)

```json
{
  "error": "Host not found",
  "message": "The specified host does not exist"
}
```

### Invalid Host (400)

```json
{
  "error": "Invalid host",
  "message": "The specified user is not a host"
}
```

### Host Not Approved (400)

```json
{
  "error": "Host not approved",
  "message": "The specified host is not approved to create properties"
}
```

### Missing Fields (400)

```json
{
  "error": "Missing required fields",
  "message": "Title, description, address, city, state, and country are required"
}
```

## Validation Rules

- **Title:** 5-100 characters
- **Description:** 10-1000 characters
- **Address:** 5-200 characters
- **City/State/Country:** 2-50 characters each
- **Price:** Must be > 0
- **Bedrooms:** 1-20
- **Bathrooms:** 1-10
- **Max Guests:** 1-50

## Security Features

- **Admin-Only Access** - Requires ADMIN role
- **Host Validation** - Verifies host exists and is approved
- **Data Validation** - Ensures data quality and consistency
- **Audit Trail** - Tracks all admin actions

## Workflow

1. **Verify Host Status** - Check host exists and is APPROVED
2. **Create Property** - Use endpoint with `hostId`
3. **Auto-Verification** - Property is immediately verified
4. **Host Notification** - Host can manage the property

## Use Cases

- **New Host Onboarding** - Create sample properties
- **Quality Assurance** - Ensure consistent property standards
- **Host Assistance** - Help hosts who need support
- **Premium Properties** - Create high-end listings

## Notes

- Properties created by admins are automatically verified
- No additional verification process required
- Hosts can edit and manage admin-created properties
- Full audit trail maintained for compliance
