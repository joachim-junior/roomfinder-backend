# Property Management API Documentation

## Overview

The Property Management API provides comprehensive functionality for managing properties in the Room Finder platform. It includes CRUD operations, search and filtering, host-specific features, and detailed property information.

## Base URL

```
http://localhost:5000/api/v1/properties
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Property Types

- `APARTMENT` - Apartment units
- `HOUSE` - Standalone houses
- `VILLA` - Luxury villas
- `STUDIO` - Studio apartments
- `GUESTHOUSE` - Guesthouses
- `ROOM` - Individual rooms
- `OTHER` - Other property types

## Endpoints

### 1. Get All Properties

**GET** `/api/v1/properties`

Retrieve all properties with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `city` (optional): Filter by city
- `type` (optional): Filter by property type
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `minBedrooms` (optional): Minimum bedrooms
- `maxBedrooms` (optional): Maximum bedrooms
- `guests` (optional): Minimum guest capacity
- `amenities` (optional): Comma-separated amenities
- `isAvailable` (optional): Filter by availability
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/properties?city=Douala&minPrice=50000&maxPrice=200000&guests=4"
```

**Example Response:**

```json
{
  "message": "Properties retrieved successfully",
  "properties": [
    {
      "id": "cme301rkc0002u9z4lpkrfzni",
      "title": "Luxury Villa in Douala",
      "description": "Beautiful 3-bedroom villa with pool and garden",
      "type": "VILLA",
      "address": "123 Luxury Street",
      "city": "Douala",
      "state": "Littoral",
      "country": "Cameroon",
      "zipCode": "00237",
      "latitude": 4.0511,
      "longitude": 9.7679,
      "price": 150000,
      "currency": "XAF",
      "bedrooms": 3,
      "bathrooms": 2,
      "maxGuests": 6,
      "amenities": [
        "WiFi",
        "Pool",
        "Garden",
        "Kitchen",
        "Parking",
        "Air Conditioning"
      ],
      "images": [
        "https://example.com/villa1.jpg",
        "https://example.com/villa2.jpg"
      ],
      "isAvailable": true,
      "isVerified": false,
      "createdAt": "2025-08-08T15:47:23.724Z",
      "updatedAt": "2025-08-08T15:47:23.724Z",
      "host": {
        "id": "cme301igz0000u9z4axlvbq6e",
        "firstName": "Host",
        "lastName": "User",
        "email": "host@example.com",
        "phone": "+237681101069",
        "avatar": null
      },
      "_count": {
        "reviews": 0,
        "bookings": 0
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

### 2. Search Properties

**GET** `/api/v1/properties/search`

Search properties with advanced filtering including date availability.

**Query Parameters:**

- `query` (optional): Search term for title, description, city, address
- `city` (optional): Filter by city
- `checkIn` (optional): Check-in date (YYYY-MM-DD)
- `checkOut` (optional): Check-out date (YYYY-MM-DD)
- `guests` (optional): Number of guests
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/properties/search?city=Douala&guests=4&checkIn=2025-08-15&checkOut=2025-08-20"
```

### 3. Get Property by ID

**GET** `/api/v1/properties/:id`

Retrieve detailed information about a specific property including reviews and host information.

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/properties/cme301rkc0002u9z4lpkrfzni"
```

**Example Response:**

```json
{
  "message": "Property retrieved successfully",
  "property": {
    "id": "cme301rkc0002u9z4lpkrfzni",
    "title": "Luxury Villa in Douala",
    "description": "Beautiful 3-bedroom villa with pool and garden",
    "type": "VILLA",
    "address": "123 Luxury Street",
    "city": "Douala",
    "state": "Littoral",
    "country": "Cameroon",
    "zipCode": "00237",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "price": 150000,
    "currency": "XAF",
    "bedrooms": 3,
    "bathrooms": 2,
    "maxGuests": 6,
    "amenities": [
      "WiFi",
      "Pool",
      "Garden",
      "Kitchen",
      "Parking",
      "Air Conditioning"
    ],
    "images": [
      "https://example.com/villa1.jpg",
      "https://example.com/villa2.jpg"
    ],
    "isAvailable": true,
    "isVerified": false,
    "createdAt": "2025-08-08T15:47:23.724Z",
    "updatedAt": "2025-08-08T15:47:23.724Z",
    "host": {
      "id": "cme301igz0000u9z4axlvbq6e",
      "firstName": "Host",
      "lastName": "User",
      "email": "host@example.com",
      "phone": "+237681101069",
      "avatar": null,
      "isVerified": false
    },
    "reviews": [
      {
        "id": "cme2xzk1h0003u97ygvk3l6t6",
        "rating": 5,
        "comment": "Excellent stay! Highly recommended.",
        "createdAt": "2025-08-08T14:49:41.429Z",
        "user": {
          "id": "cme2xzh2p0001u97ye4gvfcqa",
          "firstName": "Jane",
          "lastName": "Smith",
          "avatar": null
        }
      }
    ],
    "_count": {
      "reviews": 1,
      "bookings": 1
    },
    "averageRating": 5
  }
}
```

### 4. Create Property

**POST** `/api/v1/properties`

Create a new property. Requires HOST or ADMIN role.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Luxury Villa in Douala",
  "description": "Beautiful 3-bedroom villa with pool and garden",
  "type": "VILLA",
  "address": "123 Luxury Street",
  "city": "Douala",
  "state": "Littoral",
  "country": "Cameroon",
  "zipCode": "00237",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "price": 150000,
  "currency": "XAF",
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": [
    "WiFi",
    "Pool",
    "Garden",
    "Kitchen",
    "Parking",
    "Air Conditioning"
  ],
  "images": ["https://example.com/villa1.jpg", "https://example.com/villa2.jpg"]
}
```

**Validation Rules:**

- `title`: 5-100 characters
- `description`: 10-1000 characters
- `type`: Must be one of the valid property types
- `address`: 5-200 characters
- `city`: 2-50 characters
- `state`: 2-50 characters
- `country`: 2-50 characters
- `price`: Positive number
- `bedrooms`: 0-20
- `bathrooms`: 0-10
- `maxGuests`: 1-50

**Example Request:**

```bash
curl -X POST "http://localhost:5000/api/v1/properties" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa in Douala",
    "description": "Beautiful 3-bedroom villa with pool and garden",
    "type": "VILLA",
    "address": "123 Luxury Street",
    "city": "Douala",
    "state": "Littoral",
    "country": "Cameroon",
    "zipCode": "00237",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "price": 150000,
    "currency": "XAF",
    "bedrooms": 3,
    "bathrooms": 2,
    "maxGuests": 6,
    "amenities": ["WiFi", "Pool", "Garden", "Kitchen", "Parking", "Air Conditioning"],
    "images": ["https://example.com/villa1.jpg", "https://example.com/villa2.jpg"]
  }'
```

### 5. Update Property

**PUT** `/api/v1/properties/:id`

Update an existing property. Only the property owner or admin can update.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:** (All fields are optional)

```json
{
  "title": "Updated Luxury Villa in Douala",
  "price": 180000,
  "description": "Beautiful 3-bedroom villa with pool and garden - Updated"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:5000/api/v1/properties/cme301rkc0002u9z4lpkrfzni" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Luxury Villa in Douala",
    "price": 180000,
    "description": "Beautiful 3-bedroom villa with pool and garden - Updated"
  }'
```

### 6. Delete Property

**DELETE** `/api/v1/properties/:id`

Delete a property. Only the property owner or admin can delete. Cannot delete if property has active bookings.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X DELETE "http://localhost:5000/api/v1/properties/cme301rkc0002u9z4lpkrfzni" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 7. Get Host Properties

**GET** `/api/v1/properties/host/my-properties`

Retrieve all properties owned by the authenticated host.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/properties/host/my-properties" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 8. Get Host Property Statistics

**GET** `/api/v1/properties/host/stats`

Get comprehensive statistics for the authenticated host's properties.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/v1/properties/host/stats" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Example Response:**

```json
{
  "message": "Property statistics retrieved successfully",
  "stats": {
    "totalProperties": 1,
    "availableProperties": 1,
    "totalBookings": 0,
    "totalEarnings": 0,
    "averageRating": 0
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "message": "Please check your input",
  "details": [
    {
      "type": "field",
      "msg": "Title must be between 5 and 100 characters",
      "path": "title",
      "location": "body"
    }
  ]
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
  "message": "Only hosts can create properties"
}
```

### 404 Not Found

```json
{
  "error": "Property not found",
  "message": "The requested property does not exist"
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

### 1. Advanced Filtering

- Filter by city, property type, price range
- Filter by number of bedrooms and bathrooms
- Filter by guest capacity
- Filter by amenities
- Filter by availability

### 2. Search Functionality

- Full-text search across title, description, city, address
- Date-based availability search
- Guest capacity filtering
- City-specific search

### 3. Pagination

- Configurable page size
- Page navigation metadata
- Total count and page information

### 4. Host Management

- Host-specific property listing
- Property statistics and analytics
- Earnings tracking
- Rating aggregation

### 5. Security Features

- Role-based access control
- Property ownership validation
- Active booking protection for deletion
- Input validation and sanitization

### 6. Rich Property Information

- Detailed property attributes
- Host information with verification status
- Review aggregation and average ratings
- Booking and review counts

## Usage Examples

### Creating Multiple Properties

```bash
# Create a villa
curl -X POST "http://localhost:5000/api/v1/properties" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beachfront Villa",
    "description": "Luxurious beachfront villa with ocean views",
    "type": "VILLA",
    "address": "456 Beach Road",
    "city": "Kribi",
    "state": "South",
    "country": "Cameroon",
    "price": 200000,
    "bedrooms": 4,
    "bathrooms": 3,
    "maxGuests": 8,
    "amenities": ["WiFi", "Pool", "Beach Access", "Kitchen"]
  }'

# Create an apartment
curl -X POST "http://localhost:5000/api/v1/properties" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern City Apartment",
    "description": "Contemporary apartment in the heart of the city",
    "type": "APARTMENT",
    "address": "789 City Center",
    "city": "Yaoundé",
    "state": "Centre",
    "country": "Cameroon",
    "price": 75000,
    "bedrooms": 2,
    "bathrooms": 1,
    "maxGuests": 4,
    "amenities": ["WiFi", "Air Conditioning", "Kitchen"]
  }'
```

### Searching for Available Properties

```bash
# Search for properties in Douala with specific criteria
curl -X GET "http://localhost:5000/api/v1/properties/search?city=Douala&guests=4&minPrice=50000&maxPrice=150000"

# Search for properties available on specific dates
curl -X GET "http://localhost:5000/api/v1/properties/search?checkIn=2025-08-15&checkOut=2025-08-20&guests=2"

# Search for properties with specific amenities
curl -X GET "http://localhost:5000/api/v1/properties?amenities=WiFi,Pool&type=VILLA"
```

### Managing Host Properties

```bash
# Get all properties owned by the host
curl -X GET "http://localhost:5000/api/v1/properties/host/my-properties" \
  -H "Authorization: Bearer <host-token>"

# Get host statistics
curl -X GET "http://localhost:5000/api/v1/properties/host/stats" \
  -H "Authorization: Bearer <host-token>"

# Update property availability
curl -X PUT "http://localhost:5000/api/v1/properties/property-id" \
  -H "Authorization: Bearer <host-token>" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

## Database Schema

The Property Management API uses the following Prisma schema:

```prisma
model Property {
  id          String      @id @default(cuid())
  title       String
  description String
  type        PropertyType
  address     String
  city        String
  state       String
  country     String
  zipCode     String?
  latitude    Float?
  longitude   Float?
  price       Float
  currency    String      @default("XAF")
  bedrooms    Int
  bathrooms   Int
  maxGuests   Int
  amenities   String[]
  images      String[]
  isAvailable Boolean     @default(true)
  isVerified  Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  hostId      String
  host        User        @relation("HostProperties", fields: [hostId], references: [id])
  bookings    Booking[]
  reviews     Review[]

  @@map("properties")
}
```

## Deployment Considerations

1. **Environment Variables**: Ensure all database and email configuration is properly set
2. **Database Migration**: Run `npm run db:push` to sync schema changes
3. **File Upload**: Consider implementing file upload for property images
4. **Caching**: Implement Redis caching for frequently accessed properties
5. **Rate Limiting**: Add rate limiting for search and listing endpoints
6. **Monitoring**: Set up logging and monitoring for property operations

## Next Steps

1. **Booking System**: Implement booking functionality
2. **Review System**: Add review and rating features
3. **Image Upload**: Implement file upload for property images
4. **Geolocation**: Add location-based search and mapping
5. **Notifications**: Implement property-related notifications
6. **Analytics**: Add detailed analytics and reporting features
