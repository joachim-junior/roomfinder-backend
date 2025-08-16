# Frontend Implementation Guide

## Project Structure Overview

This guide covers **two separate frontend projects**:

1. **Property Website** (`property-website/`) - Airbnb-like guest house booking platform
2. **Admin Dashboard** (`admin-dashboard/`) - Administrative interface for managing the platform

## Project 1: Property Website (`property-website/`)

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Zustand
- **Authentication**: NextAuth.js
- **Maps**: Mapbox or Google Maps
- **Payment**: Fapshi integration
- **Deployment**: Vercel

### Project Structure

```
property-website/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (property)/
│   │   │   ├── properties/
│   │   │   ├── property/[id]/
│   │   │   └── search/
│   │   ├── (user)/
│   │   │   ├── profile/
│   │   │   ├── bookings/
│   │   │   ├── wallet/
│   │   │   └── notifications/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── property/
│   │   ├── booking/
│   │   └── common/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── store/
├── public/
├── package.json
└── tailwind.config.js
```

### Key Features

- **Homepage**: Hero section, featured properties, search functionality
- **Property Listings**: Grid/list view, filters, sorting, pagination
- **Property Details**: Image gallery, amenities, reviews, booking calendar
- **Search & Filters**: Location, dates, price, property type, amenities
- **User Authentication**: Login, register, profile management
- **Booking System**: Calendar selection, payment integration, confirmation
- **User Dashboard**: Bookings history, wallet, notifications
- **Reviews & Ratings**: Property reviews, user ratings
- **Responsive Design**: Mobile-first approach

## Property Website Features

### Core Features

- **Property Search & Filtering**: Advanced search with filters for location, price, amenities, etc.
- **Property Listings**: Grid/list view of properties with images, details, and pricing
- **Property Details**: Detailed property pages with images, amenities, host info, reviews
- **Booking System**: Calendar-based booking with availability checking
- **User Authentication**: Login/register with JWT tokens
- **User Dashboard**: Profile management, booking history, reviews
- **Reviews & Ratings**: Property reviews and rating system
- **Responsive Design**: Mobile-first responsive design
- **Real-time Notifications**: Push notifications for booking updates
- **Payment Integration**: Fapshi payment gateway integration
- **Wallet System**: User wallet for payments and refunds
- **Favorites System**: Save and manage favorite properties

### Favorites System Implementation

#### 1. Favorites Context

Create a favorites context for state management:

```typescript
// src/contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Property } from "@/types";
import { apiClient } from "@/lib/api";

interface FavoritesContextType {
  favorites: Property[];
  addToFavorites: (propertyId: string) => Promise<void>;
  removeFromFavorites: (propertyId: string) => Promise<void>;
  isFavorited: (propertyId: string) => boolean;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (propertyId: string) => {
    try {
      const response = await apiClient.addToFavorites(propertyId);
      if (response.success) {
        await refreshFavorites();
      }
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      throw error;
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    try {
      const response = await apiClient.removeFromFavorites(propertyId);
      if (response.success) {
        await refreshFavorites();
      }
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      throw error;
    }
  };

  const isFavorited = (propertyId: string) => {
    return favorites.some((fav) => fav.id === propertyId);
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorited,
        loading,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
```

#### 2. Favorite Button Component

Create a reusable favorite button component:

```typescript
// src/components/ui/FavoriteButton.tsx
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "@/components/ui/Button";

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  className = "",
  size = "md",
}) => {
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      if (isFavorited(propertyId)) {
        await removeFromFavorites(propertyId);
      } else {
        await addToFavorites(propertyId);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${sizeClasses[size]} ${className} transition-all duration-200 hover:scale-105`}
      onClick={handleToggleFavorite}
      disabled={loading}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavorited(propertyId)
            ? "fill-red-500 text-red-500"
            : "text-gray-600 hover:text-red-500"
        }`}
      />
    </Button>
  );
};
```

#### 3. Favorites Page

Create a dedicated favorites page:

```typescript
// src/app/favorites/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Property } from "@/types";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/Button";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, loading, refreshFavorites } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-1">
                {favorites.length}{" "}
                {favorites.length === 1 ? "property" : "properties"} saved
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showFavoriteButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring properties and save your favorites to see them
              here.
            </p>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium">
                Explore Properties
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 4. Update Property Card

Update the property card to include the favorite button:

```typescript
// src/components/PropertyCard.tsx
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface PropertyCardProps {
  property: Property;
  showFavoriteButton?: boolean;
  // ... other props
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showFavoriteButton = false,
  // ... other props
}) => {
  return (
    <div className="relative group">
      {/* Favorite Button */}
      {showFavoriteButton && (
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton propertyId={property.id} size="sm" />
        </div>
      )}

      {/* Property Content */}
      {/* ... existing property card content */}
    </div>
  );
};
```

#### 5. Navigation Integration

Add favorites to the navigation:

```typescript
// src/components/Navigation.tsx
import { Heart } from "lucide-react";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "My Bookings", href: "/bookings" },
  { name: "Profile", href: "/profile" },
];
```

### Implementation Steps

1. **Set up Favorites Context**: Add the FavoritesProvider to your app layout
2. **Create Favorite Button**: Implement the reusable favorite button component
3. **Update Property Cards**: Add favorite functionality to property cards
4. **Create Favorites Page**: Build the dedicated favorites page
5. **Add Navigation**: Include favorites in the main navigation
6. **Test Integration**: Test the full favorites workflow

### Key Features

- **Real-time Updates**: Favorites sync across all components
- **Optimistic Updates**: UI updates immediately for better UX
- **Error Handling**: Graceful error handling with user feedback
- **Loading States**: Proper loading indicators
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## Project 2: Admin Dashboard (`admin-dashboard/`)

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Zustand
- **Authentication**: NextAuth.js
- **Charts**: Recharts or Chart.js
- **Tables**: TanStack Table
- **Deployment**: Vercel

### Project Structure

```
admin-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── properties/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── tables/
│   │   └── charts/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── store/
├── public/
├── package.json
└── tailwind.config.js
```

### Key Features

- **Dashboard Overview**: Key metrics, charts, recent activity
- **User Management**: User list, details, verification, role management
- **Property Management**: Property listings, verification, approval workflow
- **Booking Management**: Booking overview, status updates, refunds
- **Payment Management**: Transaction history, payment status, refunds
- **Analytics**: Revenue charts, booking trends, user growth
- **System Settings**: Platform configuration, notifications, fees
- **Content Management**: Property types, amenities, locations
- **Reports**: Financial reports, user reports, property reports

## Implementation Phases

### Phase 1: Project Setup

1. Create both projects using `create-next-app`
2. Set up shadcn/ui in both projects
3. Configure TypeScript and ESLint
4. Set up project structure and routing

### Phase 2: Authentication & Core Setup

1. Implement authentication system
2. Set up API integration layer
3. Create basic layouts and navigation
4. Implement protected routes

### Phase 3: Property Website Development

1. Homepage and property listings
2. Property detail pages
3. Search and filtering
4. Booking system
5. User dashboard

### Phase 4: Admin Dashboard Development

1. Dashboard overview
2. User management
3. Property management
4. Booking management
5. Analytics and reports

### Phase 5: Integration & Testing

1. API integration testing
2. Payment system integration
3. Notification system
4. Performance optimization
5. Deployment preparation

## API Integration

Both projects will use the same backend API endpoints documented in `API_DOCUMENTATION.md`. The main differences are:

- **Property Website**: Focuses on user-facing features (browsing, booking, user profile)
- **Admin Dashboard**: Focuses on administrative features (management, analytics, system settings)

## Development Workflow

1. **Start with Property Website**: Build the main user-facing application first
2. **Then Admin Dashboard**: Build the administrative interface
3. **Parallel Development**: Both projects can be developed simultaneously once core structure is in place
4. **Shared Components**: Consider creating a shared component library if there's overlap

## Deployment Strategy

- **Property Website**: Deploy to Vercel for optimal performance and SEO
- **Admin Dashboard**: Deploy to Vercel with restricted access
- **Environment Variables**: Separate environment configurations for each project
- **Domain Strategy**:
  - Property Website: `roomfinder.com` (main domain)
  - Admin Dashboard: `admin.roomfinder.com` (subdomain)

## Next Steps

1. Create the Property Website project first
2. Set up the basic structure and authentication
3. Implement core property browsing features
4. Then create the Admin Dashboard project
5. Implement administrative features
6. Integrate both with the backend API

This approach ensures a clean separation of concerns and allows for independent development and deployment of each application.
