# Admin Property and Image Management Documentation

## Overview

Admins have comprehensive control over properties and images on the Room Finder platform. This includes creating, editing, deleting properties, and managing their associated images.

## Table of Contents

1. [Property Management](#property-management)
2. [Image Management](#image-management)
3. [Admin Capabilities](#admin-capabilities)
4. [API Endpoints](#api-endpoints)
5. [Field Validation](#field-validation)
6. [Examples](#examples)

## Property Management

### Admin Property Creation

Admins can create properties on behalf of approved hosts using the same endpoint as regular property creation.

**Endpoint:** `POST /api/v1/properties`

**Request:**

```http
POST /api/v1/properties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Luxury Beachfront Villa",
  "description": "Stunning 4-bedroom villa with panoramic ocean views",
  "type": "VILLA",
  "address": "456 Ocean Drive",
  "city": "Limbe",
  "state": "Southwest",
  "country": "Cameroon",
  "zipCode": "54321",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "price": 120000,
  "currency": "XAF",
  "bedrooms": 4,
  "bathrooms": 3,
  "maxGuests": 8,
  "amenities": [
    "WiFi",
    "Air Conditioning",
    "Swimming Pool",
    "Kitchen",
    "Free Parking",
    "Ocean View"
  ],
  "images": [
    "villa-exterior.jpg",
    "villa-living-room.jpg",
    "villa-bedroom.jpg"
  ],
  "hostId": "cme6fo5xz0000u9mo5li7lln7"
}
```

**Response (Success - 201):**

```json
{
  "message": "Property created successfully on behalf of John Host",
  "property": {
    "id": "cme93hkcn0001u95gg0z35tq1",
    "title": "Luxury Beachfront Villa",
    "description": "Stunning 4-bedroom villa with panoramic ocean views",
    "type": "VILLA",
    "address": "456 Ocean Drive",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "zipCode": "54321",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "price": 120000,
    "currency": "XAF",
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": [
      "WiFi",
      "Air Conditioning",
      "Swimming Pool",
      "Kitchen",
      "Free Parking",
      "Ocean View"
    ],
    "images": [
      "villa-exterior.jpg",
      "villa-living-room.jpg",
      "villa-bedroom.jpg"
    ],
    "isAvailable": true,
    "isVerified": true,
    "createdAt": "2025-08-12T22:10:16.775Z",
    "updatedAt": "2025-08-12T22:10:16.775Z",
    "hostId": "cme6fo5xz0000u9mo5li7lln7",
    "host": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com",
      "phone": "+237612345678",
      "avatar": null,
      "isVerified": true,
      "hostApprovalStatus": "APPROVED"
    }
  },
  "createdBy": "ADMIN"
}
```

### Admin Property Editing

Admins can edit any property on the platform, regardless of ownership.

**Endpoint:** `PUT /api/v1/properties/:id`

**Request:**

```http
PUT /api/v1/properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Luxury Beachfront Villa",
  "description": "Updated description with more details",
  "price": 135000,
  "bedrooms": 5,
  "bathrooms": 4,
  "maxGuests": 10,
  "amenities": [
    "WiFi",
    "Air Conditioning",
    "Swimming Pool",
    "Kitchen",
    "Free Parking",
    "Ocean View",
    "Private Beach Access",
    "Security System"
  ],
  "isAvailable": true,
  "isVerified": true
}
```

**Response (Success - 200):**

```json
{
  "message": "Property updated successfully",
  "property": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "title": "Updated Luxury Beachfront Villa",
    "description": "Updated description with more details",
    "type": "VILLA",
    "address": "456 Ocean Drive",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "price": 135000,
    "currency": "XAF",
    "bedrooms": 5,
    "bathrooms": 4,
    "maxGuests": 10,
    "amenities": [
      "WiFi",
      "Air Conditioning",
      "Swimming Pool",
      "Kitchen",
      "Free Parking",
      "Ocean View",
      "Private Beach Access",
      "Security System"
    ],
    "isAvailable": true,
    "isVerified": true,
    "updatedAt": "2025-09-01T17:30:00.000Z",
    "host": {
      "id": "cme6fo5xz0000u9mo5li7lln7",
      "firstName": "John",
      "lastName": "Host",
      "email": "host@example.com"
    }
  }
}
```

### Admin Property Deletion

Admins can delete any property on the platform, with safety checks for active bookings.

**Endpoint:** `DELETE /api/v1/properties/:id`

**Request:**

```http
DELETE /api/v1/properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "message": "Property deleted successfully"
}
```

**Error Response (400 - Active Bookings):**

```json
{
  "error": "Cannot delete property",
  "message": "Property has active bookings and cannot be deleted"
}
```

## Image Management

### Upload Images

Admins can upload images for properties using the upload endpoints.

**Endpoint:** `POST /api/v1/uploads/multiple`

**Request:**

```http
POST /api/v1/uploads/multiple
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

# Form data:
images: [file1.jpg, file2.jpg, file3.jpg]
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "urls": [
      "https://your-domain.com/uploads/images/image-1234567890-0.jpg",
      "https://your-domain.com/uploads/images/image-1234567890-1.jpg",
      "https://your-domain.com/uploads/images/image-1234567890-2.jpg"
    ],
    "count": 3,
    "propertyId": null
  }
}
```

### Update Property Images

Admins can edit property images by keeping existing ones, adding new ones, and removing unwanted ones.

**Endpoint:** `PUT /api/v1/uploads/property/:propertyId`

**Request:**

```http
PUT /api/v1/uploads/property/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

# Form data:
images: ["existing-image-1.jpg", "existing-image-3.jpg"]  # Keep these existing images
files: [new-image-1.jpg, new-image-2.jpg]                 # Upload these new images
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Property images updated successfully",
  "data": {
    "id": "cme6itqoo0001u9i4x6c38wmq",
    "title": "Luxury Beachfront Villa",
    "images": [
      "existing-image-1.jpg",
      "existing-image-3.jpg",
      "new-image-1.jpg",
      "new-image-2.jpg"
    ],
    "updatedAt": "2025-09-01T17:30:00.000Z"
  }
}
```

### Delete Individual Images

Admins can delete individual images from storage.

**Endpoint:** `DELETE /api/v1/uploads/:folder/:fileName`

**Request:**

```http
DELETE /api/v1/uploads/properties/cme6itqoo0001u9i4x6c38wmq/image-123.jpg
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### Get Image Information

Admins can view image metadata and information.

**Endpoint:** `GET /api/v1/uploads/:folder/:fileName`

**Request:**

```http
GET /api/v1/uploads/properties/cme6itqoo0001u9i4x6c38wmq/image-123.jpg
Authorization: Bearer <admin_token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "fileName": "image-123.jpg",
    "size": 245760,
    "created": "2025-09-01T17:00:00.000Z",
    "modified": "2025-09-01T17:00:00.000Z",
    "url": "https://your-domain.com/uploads/properties/cme6itqoo0001u9i4x6c38wmq/image-123.jpg"
  }
}
```

## Admin Capabilities

### Property Management

- ✅ **Create properties** on behalf of approved hosts
- ✅ **Edit any property** on the platform
- ✅ **Delete any property** (with booking safety checks)
- ✅ **Auto-verify properties** created by admins
- ✅ **Manage property availability** and verification status

### Image Management

- ✅ **Upload images** for any property
- ✅ **Edit property images** (add, remove, reorder)
- ✅ **Delete individual images** from storage
- ✅ **View image metadata** and information
- ✅ **Manage image galleries** for properties

### Access Control

- ✅ **Full access** to all properties on the platform
- ✅ **Override host permissions** for property management
- ✅ **Bypass ownership restrictions** for editing and deletion
- ✅ **Admin-only operations** for platform management

## API Endpoints Summary

| Method   | Endpoint                            | Description            | Admin Access    |
| -------- | ----------------------------------- | ---------------------- | --------------- |
| `POST`   | `/api/v1/properties`                | Create property        | ✅ Full access  |
| `PUT`    | `/api/v1/properties/:id`            | Update property        | ✅ Any property |
| `DELETE` | `/api/v1/properties/:id`            | Delete property        | ✅ Any property |
| `POST`   | `/api/v1/uploads/multiple`          | Upload images          | ✅ Full access  |
| `PUT`    | `/api/v1/uploads/property/:id`      | Update property images | ✅ Any property |
| `DELETE` | `/api/v1/uploads/:folder/:fileName` | Delete image           | ✅ Any image    |
| `GET`    | `/api/v1/uploads/:folder/:fileName` | Get image info         | ✅ Any image    |

## Field Validation

### Valid Property Fields

When updating properties, only the following fields are allowed:

**Basic Information:**

- `title` - Property title
- `description` - Property description
- `type` - Property type (ROOM, STUDIO, APARTMENT, VILLA, SUITE, DORMITORY, COTTAGE, PENTHOUSE)

**Location:**

- `address` - Street address
- `city` - City name
- `state` - State/province
- `country` - Country name
- `zipCode` - Postal/ZIP code
- `latitude` - GPS latitude coordinate
- `longitude` - GPS longitude coordinate

**Pricing:**

- `price` - Nightly price
- `currency` - Currency code (default: XAF)

**Accommodation:**

- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `maxGuests` - Maximum number of guests

**Features:**

- `amenities` - Array of amenity strings
- `images` - Array of image URLs

**Status:**

- `isAvailable` - Property availability status
- `isVerified` - Property verification status

### Invalid Fields Error

If you provide fields that don't exist in the Property model, you'll receive an error:

**Request with Invalid Fields:**

```http
PUT /api/v1/properties/cme6itqoo0001u9i4x6c38wmq
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Villa",
  "notes": "This is an invalid field",
  "customField": "Another invalid field"
}
```

**Error Response (400):**

```json
{
  "error": "No valid fields to update",
  "message": "All provided fields are invalid or not allowed for property updates",
  "invalidFields": ["notes", "customField"],
  "validFields": [
    "title",
    "description",
    "type",
    "address",
    "city",
    "state",
    "country",
    "zipCode",
    "latitude",
    "longitude",
    "price",
    "currency",
    "bedrooms",
    "bathrooms",
    "maxGuests",
    "amenities",
    "images",
    "isAvailable",
    "isVerified"
  ]
}
```

### Field Validation Benefits

✅ **Prevents database errors** from invalid field names
✅ **Provides clear feedback** about which fields are invalid
✅ **Lists all valid fields** for reference
✅ **Maintains data integrity** by filtering out invalid data
✅ **Improves API reliability** and error handling

## Examples

### Complete Property Management Workflow

**1. Create Property with Images**

```bash
# Step 1: Upload images
curl -X POST "https://your-domain.com/api/v1/uploads/multiple" \
  -H "Authorization: Bearer <admin_token>" \
  -F "images=@villa1.jpg" \
  -F "images=@villa2.jpg" \
  -F "images=@villa3.jpg"

# Step 2: Create property with image URLs
curl -X POST "https://your-domain.com/api/v1/properties" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa",
    "description": "Beautiful villa",
    "type": "VILLA",
    "address": "123 Beach Road",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "price": 100000,
    "bedrooms": 3,
    "bathrooms": 2,
    "maxGuests": 6,
    "amenities": ["WiFi", "Pool"],
    "images": ["villa1.jpg", "villa2.jpg", "villa3.jpg"],
    "hostId": "host-id-here"
  }'
```

**2. Update Property and Images**

```bash
# Step 1: Update property details
curl -X PUT "https://your-domain.com/api/v1/properties/property-id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Luxury Villa",
    "price": 120000,
    "amenities": ["WiFi", "Pool", "Kitchen"]
  }'

# Step 2: Update property images
curl -X PUT "https://your-domain.com/api/v1/uploads/property/property-id" \
  -H "Authorization: Bearer <admin_token>" \
  -F "images=villa1.jpg" \
  -F "images=villa3.jpg" \
  -F "images=@new-villa4.jpg"
```

**3. Delete Property**

```bash
curl -X DELETE "https://your-domain.com/api/v1/properties/property-id" \
  -H "Authorization: Bearer <admin_token>"
```

### Image Management Examples

**Upload Single Image**

```bash
curl -X POST "https://your-domain.com/api/v1/uploads/single" \
  -H "Authorization: Bearer <admin_token>" \
  -F "image=@avatar.jpg" \
  -F "type=avatar"
```

**Delete Image**

```bash
curl -X DELETE "https://your-domain.com/api/v1/uploads/properties/property-id/image.jpg" \
  -H "Authorization: Bearer <admin_token>"
```

**Get Image Info**

```bash
curl -X GET "https://your-domain.com/api/v1/uploads/properties/property-id/image.jpg" \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

### Common Error Responses

**Property Not Found (404):**

```json
{
  "error": "Property not found",
  "message": "The requested property does not exist"
}
```

**Access Denied (403):**

```json
{
  "error": "Access denied",
  "message": "You do not have permission to perform this action"
}
```

**Active Bookings (400):**

```json
{
  "error": "Cannot delete property",
  "message": "Property has active bookings and cannot be deleted"
}
```

**Invalid Host (400):**

```json
{
  "error": "Invalid host",
  "message": "The specified user is not a host"
}
```

**Host Not Approved (400):**

```json
{
  "error": "Host not approved",
  "message": "The specified host is not approved to create properties"
}
```

**Invalid Fields (400):**

```json
{
  "error": "No valid fields to update",
  "message": "All provided fields are invalid or not allowed for property updates",
  "invalidFields": ["notes", "customField"],
  "validFields": [
    "title",
    "description",
    "type",
    "address",
    "city",
    "state",
    "country",
    "zipCode",
    "latitude",
    "longitude",
    "price",
    "currency",
    "bedrooms",
    "bathrooms",
    "maxGuests",
    "amenities",
    "images",
    "isAvailable",
    "isVerified"
  ]
}
```

## Security Considerations

### Admin Privileges

- Admins have **full access** to all properties and images
- Admin actions are **logged** for audit purposes
- Property creation by admins is **auto-verified**
- Admin can **override** host permissions

### Data Validation

- All input data is **validated** before processing
- Image files are **processed and optimized** using Sharp
- File types and sizes are **restricted** for security
- Database operations use **parameterized queries**
- **Field filtering** prevents invalid database operations

### Error Handling

- Comprehensive **error handling** for all operations
- **Graceful degradation** when operations fail
- **Detailed error messages** for debugging
- **Transaction rollback** on database errors
- **Field validation** with clear feedback

## Best Practices

### Property Management

1. **Always verify host status** before creating properties
2. **Check for active bookings** before deleting properties
3. **Use descriptive titles** and detailed descriptions
4. **Include high-quality images** for better user experience
5. **Set appropriate pricing** based on market rates
6. **Only use valid fields** when updating properties

### Image Management

1. **Optimize images** before upload for better performance
2. **Use consistent naming** conventions for files
3. **Maintain image order** in property galleries
4. **Regularly clean up** unused images
5. **Backup important images** regularly

### Admin Operations

1. **Document all changes** made to properties
2. **Communicate with hosts** about property modifications
3. **Monitor property performance** after changes
4. **Maintain audit trails** for compliance
5. **Test changes** in development before production
6. **Validate field names** before sending requests

This comprehensive documentation provides admins with all the tools and information needed to effectively manage properties and images on the Room Finder platform.
