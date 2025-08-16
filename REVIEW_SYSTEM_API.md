# Review System API Documentation

## Overview

The Review System API provides comprehensive functionality for managing property reviews and ratings. It includes review creation, management, analytics, and host response features with proper validation and security.

## Base URL

```
http://localhost:5000/api/v1/reviews
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Review Rules

- Users can only review properties they have stayed at (completed bookings)
- One review per property per user
- Rating must be between 1-5 stars
- Comments are optional but must be 10-1000 characters if provided
- Users can only edit/delete their own reviews

## Endpoints

### 1. Create Review

**POST** `/api/v1/reviews`

Create a new review for a property.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": "prop1",
  "rating": 5,
  "comment": "Excellent stay! The apartment was clean, well-located, and the host was very responsive. Highly recommend!"
}
```

**Validation Rules:**

- `propertyId`: Required string
- `rating`: Integer between 1-5
- `comment`: Optional, 10-1000 characters if provided

**Requirements:**

- User must have a completed booking for the property
- User cannot have already reviewed this property

**Example Request:**

```bash
curl -X POST "http://localhost:5000/api/v1/reviews" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop1",
    "rating": 5,
    "comment": "Excellent stay! The apartment was clean, well-located, and the host was very responsive. Highly recommend!"
  }'
```

**Example Response:**

```json
{
  "message": "Review created successfully",
  "review": {
    "id": "cme321s3j0001u9exetwuotn2",
    "rating": 5,
    "comment": "Excellent stay! The apartment was clean, well-located, and the host was very responsive. Highly recommend!",
    "createdAt": "2025-08-08T16:43:23.647Z",
    "updatedAt": "2025-08-08T16:43:23.647Z",
    "propertyId": "prop1",
    "userId": "cme301igz0000u9z4axlvbq6e",
    "property": {
      "id": "prop1",
      "title": "Beautiful Apartment in Douala",
      "address": "123 Main Street",
      "city": "Douala",
      "host": {
        "id": "cme2xzg3m0000u97y2xeao2mk",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "user": {
      "id": "cme301igz0000u9z4axlvbq6e",
      "firstName": "Host",
      "lastName": "User",
      "email": "host@example.com",
      "avatar": null
    }
  }
}
```

### 2. Get Property Reviews

**GET** `/api/v1/reviews/property/:propertyId`

Get all reviews for a specific property.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rating` (optional): Filter by rating (1-5)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (default: desc)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/property/prop1?page=1&limit=10&rating=5"
```

**Example Response:**

```json
{
  "message": "Reviews retrieved successfully",
  "reviews": [
    {
      "id": "cme321s3j0001u9exetwuotn2",
      "rating": 5,
      "comment": "Excellent stay! The apartment was clean, well-located, and the host was very responsive. Highly recommend!",
      "createdAt": "2025-08-08T16:43:23.647Z",
      "updatedAt": "2025-08-08T16:43:23.647Z",
      "propertyId": "prop1",
      "userId": "cme301igz0000u9z4axlvbq6e",
      "user": {
        "id": "cme301igz0000u9z4axlvbq6e",
        "firstName": "Host",
        "lastName": "User",
        "avatar": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "ratingDistribution": {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 1
  },
  "averageRating": {
    "average": 5,
    "count": 1
  }
}
```

### 3. Get Property Review Statistics

**GET** `/api/v1/reviews/property/:propertyId/stats`

Get detailed review statistics for a property.

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/property/prop1/stats"
```

**Example Response:**

```json
{
  "message": "Property review statistics retrieved successfully",
  "stats": {
    "totalReviews": 2,
    "averageRating": 4.5,
    "ratingDistribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 1
    },
    "recentReviews": [
      {
        "id": "cme321s3j0001u9exetwuotn2",
        "rating": 4,
        "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements.",
        "createdAt": "2025-08-08T16:43:23.647Z",
        "updatedAt": "2025-08-08T16:45:31.558Z",
        "propertyId": "prop1",
        "userId": "cme301igz0000u9z4axlvbq6e",
        "user": {
          "id": "cme301igz0000u9z4axlvbq6e",
          "firstName": "Host",
          "lastName": "User",
          "avatar": null
        }
      }
    ]
  }
}
```

### 4. Get User Reviews

**GET** `/api/v1/reviews/my-reviews`

Get all reviews written by the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/my-reviews" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "User reviews retrieved successfully",
  "reviews": [
    {
      "id": "cme321s3j0001u9exetwuotn2",
      "rating": 4,
      "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements.",
      "createdAt": "2025-08-08T16:43:23.647Z",
      "updatedAt": "2025-08-08T16:45:31.558Z",
      "propertyId": "prop1",
      "userId": "cme301igz0000u9z4axlvbq6e",
      "property": {
        "id": "prop1",
        "title": "Beautiful Apartment in Douala",
        "address": "123 Main Street",
        "city": "Douala",
        "images": ["https://example.com/image1.jpg"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 5. Get Host Reviews

**GET** `/api/v1/reviews/host/reviews`

Get all reviews for properties owned by the authenticated host.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Required Role:** HOST or ADMIN

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rating` (optional): Filter by rating (1-5)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/host/reviews?rating=5" \
  -H "Authorization: Bearer <host-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Host reviews retrieved successfully",
  "reviews": [
    {
      "id": "cme321s3j0001u9exetwuotn2",
      "rating": 4,
      "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements.",
      "createdAt": "2025-08-08T16:43:23.647Z",
      "updatedAt": "2025-08-08T16:45:31.558Z",
      "propertyId": "prop1",
      "userId": "cme301igz0000u9z4axlvbq6e",
      "property": {
        "id": "prop1",
        "title": "Beautiful Apartment in Douala",
        "address": "123 Main Street",
        "city": "Douala"
      },
      "user": {
        "id": "cme301igz0000u9z4axlvbq6e",
        "firstName": "Host",
        "lastName": "User",
        "avatar": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 6. Get Host Review Statistics

**GET** `/api/v1/reviews/host/stats`

Get comprehensive review statistics for all properties owned by the host.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Required Role:** HOST or ADMIN

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/host/stats" \
  -H "Authorization: Bearer <host-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Host review statistics retrieved successfully",
  "stats": {
    "totalReviews": 2,
    "averageRating": 4.5,
    "ratingDistribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 1
    },
    "propertiesWithReviews": [
      {
        "propertyId": "prop1",
        "title": "Beautiful Apartment in Douala",
        "averageRating": 4.5,
        "totalReviews": 2
      }
    ]
  }
}
```

### 7. Get Review by ID

**GET** `/api/v1/reviews/:id`

Get detailed information about a specific review.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/cme321s3j0001u9exetwuotn2" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Review retrieved successfully",
  "review": {
    "id": "cme321s3j0001u9exetwuotn2",
    "rating": 4,
    "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements.",
    "createdAt": "2025-08-08T16:43:23.647Z",
    "updatedAt": "2025-08-08T16:45:31.558Z",
    "propertyId": "prop1",
    "userId": "cme301igz0000u9z4axlvbq6e",
    "property": {
      "id": "prop1",
      "title": "Beautiful Apartment in Douala",
      "address": "123 Main Street",
      "city": "Douala",
      "host": {
        "id": "cme2xzg3m0000u97y2xeao2mk",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "user": {
      "id": "cme301igz0000u9z4axlvbq6e",
      "firstName": "Host",
      "lastName": "User",
      "email": "host@example.com",
      "avatar": null
    }
  }
}
```

### 8. Update Review

**PUT** `/api/v1/reviews/:id`

Update a review (user can only update their own reviews).

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements."
}
```

**Validation Rules:**

- `rating`: Integer between 1-5
- `comment`: Optional, 10-1000 characters if provided

**Example Request:**

```bash
curl -X PUT "http://localhost:5000/api/v1/reviews/cme321s3j0001u9exetwuotn2" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Great stay overall! The apartment was clean and well-located. Would recommend with minor improvements."
  }'
```

### 9. Delete Review

**DELETE** `/api/v1/reviews/:id`

Delete a review (user can only delete their own reviews).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X DELETE "http://localhost:5000/api/v1/reviews/cme321s3j0001u9exetwuotn2" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Review deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Cannot review property",
  "message": "You can only review properties you have stayed at"
}
```

### 401 Unauthorized

```json
{
  "error": "Access denied",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied",
  "message": "You can only update your own reviews"
}
```

### 404 Not Found

```json
{
  "error": "Review not found",
  "message": "The requested review does not exist"
}
```

### 500 Internal Server Error

```json
{
  "error": "Database error",
  "message": "An error occurred while processing your request"
}
```

## Features

### 1. Review Management

- Create reviews with ratings and comments
- Update existing reviews
- Delete reviews
- One review per property per user
- User ownership validation

### 2. Rating System

- 1-5 star rating system
- Average rating calculations
- Rating distribution analytics
- Rating-based filtering

### 3. Review Analytics

- Property-specific review statistics
- Host-level review analytics
- Rating distribution charts
- Recent reviews tracking

### 4. Security Features

- Role-based access control
- Review ownership validation
- Input validation and sanitization
- Booking completion verification

### 5. Advanced Features

- Pagination and filtering
- Sorting options
- Rating-based filtering
- Comprehensive statistics

## Database Schema

The Review System uses the following Prisma schema:

```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      @db.SmallInt
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation("UserReviews", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([propertyId, userId])
  @@map("reviews")
}
```

## Usage Examples

### Creating a Review

```bash
# 1. Ensure you have a completed booking for the property
# 2. Create review
curl -X POST "http://localhost:5000/api/v1/reviews" \
  -H "Authorization: Bearer <guest-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop1",
    "rating": 5,
    "comment": "Excellent stay! Highly recommend!"
  }'
```

### Managing Reviews

```bash
# Get user's reviews
curl -X GET "http://localhost:5000/api/v1/reviews/my-reviews" \
  -H "Authorization: Bearer <guest-token>"

# Update a review
curl -X PUT "http://localhost:5000/api/v1/reviews/review-id" \
  -H "Authorization: Bearer <guest-token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "comment": "Good stay with minor issues"}'

# Delete a review
curl -X DELETE "http://localhost:5000/api/v1/reviews/review-id" \
  -H "Authorization: Bearer <guest-token>"
```

### Host Review Management

```bash
# Get all reviews for host properties
curl -X GET "http://localhost:5000/api/v1/reviews/host/reviews" \
  -H "Authorization: Bearer <host-token>"

# Get host review statistics
curl -X GET "http://localhost:5000/api/v1/reviews/host/stats" \
  -H "Authorization: Bearer <host-token>"

# Filter by rating
curl -X GET "http://localhost:5000/api/v1/reviews/host/reviews?rating=5" \
  -H "Authorization: Bearer <host-token>"
```

### Public Review Access

```bash
# Get property reviews (public)
curl -X GET "http://localhost:5000/api/v1/reviews/property/prop1"

# Get property review statistics (public)
curl -X GET "http://localhost:5000/api/v1/reviews/property/prop1/stats"

# Filter property reviews by rating
curl -X GET "http://localhost:5000/api/v1/reviews/property/prop1?rating=5"
```

## Business Rules

### Review Creation Rules

1. **Booking Requirement**: User must have a completed booking for the property
2. **One Review Per Property**: Users can only review each property once
3. **Rating Validation**: Rating must be between 1-5 stars
4. **Comment Validation**: Comments must be 10-1000 characters if provided

### Review Management Rules

1. **Ownership**: Users can only edit/delete their own reviews
2. **Timing**: Reviews can be created after booking completion
3. **Updates**: Users can update their reviews at any time
4. **Deletion**: Users can delete their reviews at any time

### Analytics Rules

1. **Average Rating**: Calculated as sum of all ratings divided by total reviews
2. **Rating Distribution**: Count of reviews for each rating (1-5)
3. **Property Statistics**: Aggregated statistics per property
4. **Host Statistics**: Aggregated statistics across all host properties

## Deployment Considerations

1. **Database Indexing**: Ensure proper indexing on propertyId and userId
2. **Caching**: Consider caching review statistics for performance
3. **Validation**: Implement comprehensive input validation
4. **Rate Limiting**: Consider rate limiting for review creation
5. **Monitoring**: Set up logging and monitoring for review operations

## Next Steps

1. **Review Moderation**: Add admin review moderation system
2. **Host Responses**: Allow hosts to respond to reviews
3. **Review Photos**: Add photo upload capability to reviews
4. **Review Helpfulness**: Add helpful/not helpful voting system
5. **Review Notifications**: Implement email notifications for new reviews
6. **Review Analytics**: Add advanced analytics and reporting
7. **Review Export**: Add review data export functionality
8. **Review API**: Create public API for third-party integrations

## Integration Examples

### Frontend Integration

```javascript
// Get property reviews
const getPropertyReviews = async (propertyId) => {
  const response = await fetch(`/api/v1/reviews/property/${propertyId}`);
  const data = await response.json();
  return data;
};

// Create review
const createReview = async (reviewData) => {
  const response = await fetch("/api/v1/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  return response.json();
};
```

### Mobile App Integration

```dart
// Flutter example
class ReviewService {
  Future<List<Review>> getPropertyReviews(String propertyId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/reviews/property/$propertyId'),
    );
    return Review.fromJsonList(jsonDecode(response.body));
  }
}
```

## Testing

### Unit Tests

- Review creation validation
- Rating range validation
- Comment length validation
- User ownership validation

### Integration Tests

- Complete review workflow
- Host review analytics
- Property review statistics
- Error handling scenarios

### Performance Tests

- Large review datasets
- Concurrent review creation
- Analytics calculation performance
- Database query optimization
