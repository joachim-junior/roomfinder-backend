# Property Image Handling During Property Creation

## Overview

Property images in Room Finder are handled through a **two-step process**:

1. **Image Upload** - Images are uploaded separately using the upload endpoints
2. **Property Creation** - Property is created with references to the uploaded images

This approach provides better performance, flexibility, and user experience compared to uploading images during property creation.

## Image Upload Process

### Step 1: Upload Images

Before creating a property, hosts must first upload their images using the dedicated upload endpoints.

#### Single Image Upload

```http
POST /api/v1/uploads/single
Authorization: Bearer <host_token>
Content-Type: multipart/form-data

Form Data:
- image: [file] (image file)
- type: "property" (optional, defaults to "general")
```

#### Multiple Images Upload (Recommended for Properties)

```http
POST /api/v1/uploads/multiple
Authorization: Bearer <host_token>
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, file3...] (up to 10 images)
- propertyId: "temp-id" (optional, for organization)
```

### Step 2: Get Image URLs

After successful upload, the system returns public URLs for the images:

```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "urls": [
      "http://localhost:5000/uploads/properties/temp-123/image1-1735729943123-123456789.jpg",
      "http://localhost:5000/uploads/properties/temp-123/image2-1735729943123-987654321.jpg",
      "http://localhost:5000/uploads/properties/temp-123/image3-1735729943123-456789123.jpg"
    ],
    "count": 3,
    "propertyId": "temp-123"
  }
}
```

## Property Creation with Images

### Property Creation Endpoint

```http
POST /api/v1/properties
Authorization: Bearer <host_token>
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
    "http://localhost:5000/uploads/properties/temp-123/image1-1735729943123-123456789.jpg",
    "http://localhost:5000/uploads/properties/temp-123/image2-1735729943123-987654321.jpg",
    "http://localhost:5000/uploads/properties/temp-123/image3-1735729943123-456789123.jpg"
  ]
}
```

### Image Field Details

| Field     | Type  | Required | Description                                                 |
| --------- | ----- | -------- | ----------------------------------------------------------- |
| `images`  | array | ❌       | Array of image URLs (strings)                               |
| **Note:** |       |          | Images must be uploaded separately before property creation |

## Complete Workflow Example

### 1. Upload Property Images

```bash
# Upload multiple images for a property
curl -X POST "http://localhost:5000/api/v1/uploads/multiple" \
  -H "Authorization: Bearer <host_token>" \
  -F "images=@villa-exterior.jpg" \
  -F "images=@villa-living-room.jpg" \
  -F "images=@villa-bedroom.jpg" \
  -F "images=@villa-pool.jpg" \
  -F "propertyId=temp-villa-123"
```

**Response:**

```json
{
  "success": true,
  "message": "4 images uploaded successfully",
  "data": {
    "urls": [
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-exterior-1735729943123-123456789.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-living-room-1735729943123-987654321.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-bedroom-1735729943123-456789123.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-pool-1735729943123-789123456.jpg"
    ],
    "count": 4,
    "propertyId": "temp-villa-123"
  }
}
```

### 2. Create Property with Image URLs

```bash
# Create property using the uploaded image URLs
curl -X POST "http://localhost:5000/api/v1/properties" \
  -H "Authorization: Bearer <host_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Beachfront Villa",
    "description": "Stunning 4-bedroom villa with panoramic ocean views",
    "type": "VILLA",
    "address": "456 Ocean Drive",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "price": 120000,
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": ["WiFi", "Pool", "Kitchen", "Ocean View"],
    "images": [
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-exterior-1735729943123-123456789.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-living-room-1735729943123-987654321.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-bedroom-1735729943123-456789123.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-pool-1735729943123-789123456.jpg"
    ]
  }'
```

**Response:**

```json
{
  "message": "Property created successfully",
  "property": {
    "id": "cme93hkcn0001u95gg0z35tq1",
    "title": "Luxury Beachfront Villa",
    "description": "Stunning 4-bedroom villa with panoramic ocean views",
    "type": "VILLA",
    "address": "456 Ocean Drive",
    "city": "Limbe",
    "state": "Southwest",
    "country": "Cameroon",
    "price": 120000,
    "currency": "XAF",
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": ["WiFi", "Pool", "Kitchen", "Ocean View"],
    "images": [
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-exterior-1735729943123-123456789.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-living-room-1735729943123-987654321.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-bedroom-1735729943123-456789123.jpg",
      "http://localhost:5000/uploads/properties/temp-villa-123/villa-pool-1735729943123-789123456.jpg"
    ],
    "isAvailable": true,
    "isVerified": false,
    "createdAt": "2025-08-12T22:10:16.775Z",
    "updatedAt": "2025-08-12T22:10:16.775Z",
    "hostId": "cme6fo5xz0000u9mo5li7lln7"
  },
  "createdBy": "HOST"
}
```

## Image Processing & Storage

### Image Optimization

All uploaded images are automatically processed using **Sharp.js**:

- **Resizing:** Maintains aspect ratio, fits within dimensions
- **Compression:** Reduces file size while maintaining quality
- **Format:** Converts to optimized JPEG format
- **Quality:** Configurable quality settings (default: 85%)

### Storage Structure

```
uploads/
├── properties/           # Property images
│   └── temp-villa-123/  # Property-specific folder
│       ├── villa-exterior-1735729943123-123456789.jpg
│       ├── villa-living-room-1735729943123-987654321.jpg
│       ├── villa-bedroom-1735729943123-456789123.jpg
│       └── villa-pool-1735729943123-789123456.jpg
├── avatar/              # User profile pictures
└── general/             # Miscellaneous images
```

### File Naming Convention

```
{original-name}-{timestamp}-{random}.{extension}

Example: villa-exterior-1735729943123-123456789.jpg
```

## Image Validation & Requirements

### File Requirements

| Requirement    | Specification                   |
| -------------- | ------------------------------- |
| **File Types** | JPG, JPEG, PNG, GIF             |
| **File Size**  | Maximum 5MB per image           |
| **File Count** | Maximum 10 images per property  |
| **Dimensions** | Minimum 300x300px (recommended) |
| **Format**     | Optimized JPEG output           |

### Validation Rules

```javascript
// File type validation
if (file.mimetype.startsWith("image/")) {
  cb(null, true); // Accept image
} else {
  cb(new Error("Only image files are allowed!"), false);
}

// File size validation
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 10, // Maximum 10 files
}
```

## Error Handling

### Common Upload Errors

#### File Too Large

```json
{
  "error": "File too large",
  "message": "File size must be less than 5MB"
}
```

#### Invalid File Type

```json
{
  "error": "Invalid file type",
  "message": "Only image files (jpg, jpeg, png, gif) are allowed"
}
```

#### Too Many Files

```json
{
  "error": "Too many files",
  "message": "Maximum 10 files allowed per request"
}
```

### Property Creation Errors

#### Missing Images

```json
{
  "error": "Validation failed",
  "message": "Please provide at least one property image"
}
```

#### Invalid Image URLs

```json
{
  "error": "Invalid image URLs",
  "message": "One or more image URLs are invalid"
}
```

## Best Practices

### 1. Image Preparation

- **Resolution:** Use high-quality images (minimum 800x600px)
- **Format:** Upload in JPG or PNG format
- **Size:** Keep individual files under 5MB
- **Aspect Ratio:** Use consistent aspect ratios for better presentation

### 2. Upload Strategy

- **Batch Upload:** Upload all images at once using `/uploads/multiple`
- **Organization:** Use descriptive filenames for easier management
- **Property ID:** Include a temporary property ID for organization

### 3. Property Creation

- **Image Order:** Arrange images in logical order (exterior first, then interior)
- **Validation:** Verify all image URLs are accessible before property creation
- **Backup:** Keep original image files as backup

## Admin Property Creation

When admins create properties on behalf of hosts, the same image handling process applies:

```http
POST /api/v1/properties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  // ... property details
  "images": [
    "http://localhost:5000/uploads/properties/admin-villa/image1.jpg",
    "http://localhost:5000/uploads/properties/admin-villa/image2.jpg"
  ],
  "hostId": "host-user-id" // Required for admin creation
}
```

## Image Management After Creation

### Update Property Images

```http
PUT /api/v1/uploads/property/:propertyId
Authorization: Bearer <host_token>
Content-Type: multipart/form-data

Form Data:
- images: [existing-image-urls] (array of URLs to keep)
- newImages: [file1, file2...] (new images to add)
```

### Delete Images

```http
DELETE /api/v1/uploads/:folder/:fileName
Authorization: Bearer <token>
```

## Security Considerations

### Access Control

- **Authentication Required:** All upload endpoints require valid JWT tokens
- **Role-Based Access:** Property image updates require HOST or ADMIN role
- **Ownership Validation:** Users can only modify their own property images

### File Security

- **File Type Validation:** Only image files are accepted
- **Size Limits:** Prevents abuse and storage issues
- **Unique Filenames:** Prevents filename conflicts and security issues

### URL Security

- **Public Access:** Image URLs are publicly accessible for display
- **No Authentication:** Images can be viewed without authentication
- **Direct Access:** Images are served directly from the uploads directory

## Performance Optimization

### Upload Optimization

- **Batch Processing:** Multiple images uploaded simultaneously
- **Async Processing:** Image optimization happens asynchronously
- **Efficient Storage:** Optimized JPEG format reduces storage and bandwidth

### Delivery Optimization

- **Static Serving:** Images served directly from file system
- **No Database Queries:** Image URLs stored as strings, not binary data
- **CDN Ready:** Structure supports easy migration to CDN services

## Troubleshooting

### Common Issues

#### Images Not Displaying

- Check if image URLs are accessible
- Verify file permissions on uploads directory
- Ensure images were uploaded successfully

#### Upload Failures

- Check file size limits (5MB maximum)
- Verify file type (images only)
- Ensure authentication token is valid

#### Property Creation Errors

- Verify all image URLs are valid
- Check if images exist in the specified paths
- Ensure proper authentication and permissions

### Debug Information

Enable debug logging to troubleshoot upload issues:

```javascript
// In upload middleware
console.log("Upload request:", {
  files: req.files,
  body: req.body,
  user: req.user,
});
```

## Summary

Property image handling in Room Finder follows a **separation of concerns** approach:

1. **Images are uploaded separately** using dedicated upload endpoints
2. **Property creation references** the uploaded image URLs
3. **Image processing happens automatically** during upload
4. **Storage is organized** by property and type
5. **Security is maintained** through authentication and validation

This approach provides:

- ✅ **Better performance** (no large payloads during property creation)
- ✅ **Flexibility** (images can be uploaded in batches)
- ✅ **User experience** (immediate feedback on uploads)
- ✅ **Maintainability** (clear separation of concerns)
- ✅ **Scalability** (easy to migrate to CDN services)
