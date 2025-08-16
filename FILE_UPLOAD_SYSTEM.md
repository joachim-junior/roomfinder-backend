# File Upload System Documentation

## Overview

The File Upload System provides secure and efficient image upload capabilities for the Room Finder platform, using Railway Storage for file management and Sharp for image processing.

## Features

- **Image Upload**: Single and multiple image uploads
- **Image Processing**: Automatic resizing, compression, and format conversion
- **File Validation**: Type and size validation
- **Secure Storage**: Railway Storage integration
- **Property Galleries**: Support for property image galleries
- **Avatar Uploads**: User profile picture uploads

## Base URL

```
http://localhost:5000/api/v1/uploads
```

## Authentication

All upload endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Single Image

**POST** `/single`

Upload a single image (avatar, property main image, etc.)

**Headers:**

```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**

- `image` (required): Image file (jpg, jpeg, png, gif)
- `type` (optional): Type of image (`avatar`, `property`, `general`)

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileName": "avatar-1734679345000-123456789.jpg",
    "url": "http://localhost:5000/uploads/avatar/avatar-1734679345000-123456789.jpg",
    "type": "avatar",
    "size": 1024
  }
}
```

### 2. Upload Multiple Images

**POST** `/multiple`

Upload multiple images for property galleries.

**Headers:**

```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**

- `images` (required): Array of image files
- `propertyId` (optional): Property ID for organizing images

**Response:**

```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "urls": [
      "http://localhost:5000/uploads/images/image-1734679345000-0.jpg",
      "http://localhost:5000/uploads/images/image-1734679345000-1.jpg",
      "http://localhost:5000/uploads/images/image-1734679345000-2.jpg"
    ],
    "count": 3,
    "propertyId": "prop1"
  }
}
```

### 3. Update Property Images

**PUT** `/property/:propertyId`

Update property images (host only).

**Headers:**

```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**

- `images` (optional): New image files
- `images` (in body): Array of existing image URLs to keep

**Response:**

```json
{
  "success": true,
  "message": "Property images updated successfully",
  "data": {
    "id": "prop1",
    "title": "Beautiful Apartment",
    "images": [
      "http://localhost:5000/uploads/properties/prop1/image-1734679345000-0.jpg",
      "http://localhost:5000/uploads/properties/prop1/image-1734679345000-1.jpg"
    ],
    "updatedAt": "2025-08-08T18:55:57.591Z"
  }
}
```

### 4. Delete Image

**DELETE** `/:folder/:fileName`

Delete an image from storage.

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 5. Get Image Info

**GET** `/:folder/:fileName`

Get information about an uploaded image.

**Response:**

```json
{
  "success": true,
  "data": {
    "fileName": "avatar-1734679345000-123456789.jpg",
    "size": 1024,
    "created": "2025-08-08T18:55:57.591Z",
    "modified": "2025-08-08T18:55:57.591Z",
    "url": "http://localhost:5000/uploads/avatar/avatar-1734679345000-123456789.jpg"
  }
}
```

## File Validation

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### File Size Limits

- Maximum file size: 5MB
- Maximum files per request: 10

### Image Processing

Images are automatically processed with the following settings:

**Avatar Images:**

- Width: 300px
- Height: 300px
- Quality: 85%
- Format: JPEG

**Property Images:**

- Width: 800px
- Height: 600px
- Quality: 85%
- Format: JPEG

## Error Responses

### File Too Large

```json
{
  "error": "File too large",
  "message": "File size must be less than 5MB"
}
```

### Invalid File Type

```json
{
  "error": "Invalid file type",
  "message": "Only image files (jpg, jpeg, png, gif) are allowed"
}
```

### Too Many Files

```json
{
  "error": "Too many files",
  "message": "Maximum 10 files allowed per request"
}
```

### No File Uploaded

```json
{
  "error": "No file uploaded",
  "message": "Please upload an image file"
}
```

## Usage Examples

### Upload User Avatar

```bash
curl -X POST "http://localhost:5000/api/v1/uploads/single" \
  -H "Authorization: Bearer <token>" \
  -F "image=@avatar.jpg" \
  -F "type=avatar"
```

### Upload Property Images

```bash
curl -X POST "http://localhost:5000/api/v1/uploads/multiple" \
  -H "Authorization: Bearer <token>" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "propertyId=prop1"
```

### Update Property Gallery

```bash
curl -X PUT "http://localhost:5000/api/v1/uploads/property/prop1" \
  -H "Authorization: Bearer <token>" \
  -F "images=@new-image.jpg" \
  -d '{"images": ["http://localhost:5000/uploads/properties/prop1/old-image.jpg"]}'
```

## Environment Variables

Add these to your `.env` file:

```env
# Railway Storage Configuration
RAILWAY_STORAGE_URL=https://storage.railway.app
RAILWAY_STORAGE_API_KEY=your-railway-storage-api-key
BASE_URL=http://localhost:5000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Database Schema

The file upload system integrates with the existing Property model:

```prisma
model Property {
  // ... other fields
  images      String[] // Array of image URLs
  // ... other fields
}
```

## Security Features

- **Authentication Required**: All upload endpoints require valid JWT tokens
- **File Type Validation**: Only image files are allowed
- **Size Limits**: Prevents abuse with file size restrictions
- **Secure Filenames**: Unique filenames prevent conflicts
- **Owner Verification**: Property image updates require ownership verification

## Deployment Considerations

### Railway Storage Setup

1. **Create Railway Storage Service**:

   - Go to Railway dashboard
   - Create new service
   - Select "Storage" template
   - Configure storage settings

2. **Update Environment Variables**:

   ```env
   RAILWAY_STORAGE_URL=https://your-storage-url.railway.app
   RAILWAY_STORAGE_API_KEY=your-api-key
   BASE_URL=https://your-app-url.railway.app
   ```

3. **Static File Serving**:
   - The system serves uploaded files via `/uploads` endpoint
   - Configure Railway to serve static files from the uploads directory

### Production Considerations

- **CDN Integration**: Consider using a CDN for better performance
- **Image Optimization**: Implement lazy loading and progressive images
- **Backup Strategy**: Implement regular backups of uploaded files
- **Monitoring**: Set up monitoring for storage usage and performance

## Troubleshooting

### Common Issues

1. **File Upload Fails**:

   - Check file size and type
   - Verify authentication token
   - Ensure uploads directory exists

2. **Images Not Displaying**:

   - Check file permissions
   - Verify static file serving configuration
   - Check file paths in database

3. **Storage Quota Exceeded**:
   - Monitor storage usage
   - Implement file cleanup strategies
   - Consider upgrading storage plan

### Debug Commands

```bash
# Check uploads directory
ls -la uploads/

# Check file permissions
chmod 755 uploads/

# Test file upload
curl -X POST "http://localhost:5000/api/v1/uploads/single" \
  -H "Authorization: Bearer <token>" \
  -F "image=@test.jpg" \
  -F "type=avatar"
```

## Future Enhancements

- **Video Upload Support**: Add support for property video tours
- **Image Cropping**: Client-side image cropping before upload
- **Watermarking**: Automatic watermark addition for property images
- **Bulk Operations**: Batch upload and delete operations
- **Image Analytics**: Track image views and engagement
