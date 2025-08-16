# React Native Mobile App Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Project Setup](#project-setup)
4. [Authentication System](#authentication-system)
5. [Guest Features](#guest-features)
6. [Host Features](#host-features)
7. [Admin Features](#admin-features)
8. [Payment Integration (Fapshi)](#payment-integration-fapshi)
9. [Booking Process Flow](#booking-process-flow)
10. [State Management](#state-management)
11. [Navigation Structure](#navigation-structure)
12. [UI/UX Guidelines](#uiux-guidelines)
13. [API Integration](#api-integration)
14. [Testing Strategy](#testing-strategy)
15. [Deployment](#deployment)

## 1. Project Overview

### Room Finder Mobile App

A comprehensive React Native mobile application for the Room Finder platform, supporting both guest and host functionalities with integrated mobile money payments via Fapshi.

### Key Features

- **Guest Features**: Property browsing, booking, payments, reviews, favorites
- **Host Features**: Property management, booking management, revenue tracking, payouts
- **Admin Features**: Platform management, user management, revenue monitoring
- **Payment Integration**: MTN Mobile Money and Orange Money via Fapshi
- **Real-time Updates**: Booking status, payment confirmations, notifications

## 2. Technical Stack

### Core Technologies

- **React Native**: 0.72+ (Latest stable)
- **TypeScript**: For type safety
- **React Navigation**: 6.x for navigation
- **Redux Toolkit + RTK Query**: State management and API calls
- **React Hook Form + Yup**: Form handling and validation

### UI Libraries

- **React Native Paper**: Material Design components
- **React Native Vector Icons**: Icon library
- **React Native Maps**: Map integration
- **React Native Image Picker**: Image selection
- **React Native Push Notification**: Push notifications

### Payment & Storage

- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence
- **Fapshi SDK**: Mobile money payment integration

### Development Tools

- **Metro**: React Native bundler
- **ESLint + Prettier**: Code formatting
- **Jest**: Testing framework
- **React Native Debugger**: Debugging tool

## 3. Project Setup

### Prerequisites

```bash
# Install Node.js (v18+)
# Install React Native CLI
npm install -g @react-native-community/cli

# Install Android Studio (for Android development)
# Install Xcode (for iOS development, macOS only)
```

### Project Initialization

```bash
# Create new React Native project
npx react-native@latest init RoomFinderApp --template react-native-template-typescript

# Navigate to project
cd RoomFinderApp

# Install dependencies
npm install
```

### Required Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management
npm install @reduxjs/toolkit react-redux
npm install @reduxjs/toolkit/query

# UI Components
npm install react-native-paper react-native-vector-icons
npm install react-native-maps react-native-image-picker
npm install react-native-push-notification

# Forms & Validation
npm install react-hook-form @hookform/resolvers yup

# HTTP Client
npm install axios

# Storage
npm install @react-native-async-storage/async-storage

# Utilities
npm install moment react-native-gesture-handler
npm install react-native-reanimated react-native-svg
```

### Platform-specific Setup

#### Android Setup

```bash
# Add to android/app/build.gradle
android {
    defaultConfig {
        applicationId "com.roomfinder.app"
        minSdkVersion 21
        targetSdkVersion 33
    }
}

# Add permissions to android/app/src/main/AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### iOS Setup

```bash
# Install pods
cd ios && pod install && cd ..

# Add to ios/RoomFinderApp/Info.plist
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to show nearby properties.</string>
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take property photos.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select property images.</string>
```

## 4. Authentication System

### Authentication Flow

```typescript
// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "GUEST" | "HOST" | "ADMIN";
  isVerified: boolean;
  phone?: string;
  avatar?: string;
  hostApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Authentication Screens

```typescript
// src/screens/auth/LoginScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginScreen = () => {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome Back</Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            error={!!errors.email}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={!!errors.password}
            style={styles.input}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
```

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { authApi } from "../services/authApi";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    const result = await dispatch(
      authApi.endpoints.login.initiate({ email, password })
    );
    if (result.data) {
      // Handle successful login
    }
  };

  const logout = () => {
    dispatch(authApi.util.resetApiState());
    // Clear local storage
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
```

## 5. Guest Features

### Property Browsing

```typescript
// src/screens/guest/PropertyListScreen.tsx
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Chip } from "react-native-paper";
import { useGetPropertiesQuery } from "../../services/propertyApi";

export const PropertyListScreen = () => {
  const { data: properties, isLoading } = useGetPropertiesQuery();

  const renderProperty = ({ item }: { item: Property }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.images[0] }} />
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.address}</Paragraph>
        <Chip icon="currency-xaf">{item.price} XAF</Chip>
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={properties}
      renderItem={renderProperty}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};
```

### Property Details

```typescript
// src/screens/guest/PropertyDetailScreen.tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Button, Chip } from "react-native-paper";
import { useGetPropertyQuery } from "../../services/propertyApi";

export const PropertyDetailScreen = ({ route }: { route: any }) => {
  const { propertyId } = route.params;
  const { data: property } = useGetPropertyQuery(propertyId);

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: property?.images[0] }} />
        <Card.Content>
          <Title>{property?.title}</Title>
          <Paragraph>{property?.description}</Paragraph>
          <Chip icon="currency-xaf">{property?.price} XAF</Chip>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => {
          /* Navigate to booking */
        }}
      >
        Book Now
      </Button>
    </ScrollView>
  );
};
```

### Booking Process

```typescript
// src/screens/guest/BookingScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, SegmentedButtons } from "react-native-paper";
import { useCreateBookingMutation } from "../../services/bookingApi";
import { useInitializePaymentMutation } from "../../services/paymentApi";

export const BookingScreen = ({ route }: { route: any }) => {
  const { propertyId } = route.params;
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");

  const [createBooking] = useCreateBookingMutation();
  const [initializePayment] = useInitializePaymentMutation();

  const handleBooking = async () => {
    try {
      // Create booking
      const booking = await createBooking({
        propertyId,
        checkIn: "2025-08-15",
        checkOut: "2025-08-17",
        guests: 2,
      }).unwrap();

      // Initialize payment
      const payment = await initializePayment({
        bookingId: booking.id,
        paymentMethod,
      }).unwrap();

      // Handle payment flow
      console.log("Payment initialized:", payment);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Complete Your Booking</Text>

      <SegmentedButtons
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        buttons={[
          { value: "MOBILE_MONEY", label: "MTN Money" },
          { value: "ORANGE_MONEY", label: "Orange Money" },
        ]}
      />

      <Button mode="contained" onPress={handleBooking}>
        Pay Now
      </Button>
    </View>
  );
};
```

## 6. Host Features

### Property Management

```typescript
// src/screens/host/PropertyManagementScreen.tsx
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Card, Title, Paragraph, FAB } from "react-native-paper";
import { useGetHostPropertiesQuery } from "../../services/propertyApi";

export const PropertyManagementScreen = () => {
  const { data: properties } = useGetHostPropertiesQuery();

  const renderProperty = ({ item }: { item: Property }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.address}</Paragraph>
        <Paragraph>
          Status: {item.isVerified ? "Verified" : "Pending"}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        onPress={() => {
          /* Navigate to add property */
        }}
        style={styles.fab}
      />
    </>
  );
};
```

### Revenue Dashboard

```typescript
// src/screens/host/RevenueScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useGetHostRevenueQuery } from "../../services/revenueApi";

export const RevenueScreen = () => {
  const { data: revenue } = useGetHostRevenueQuery();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Revenue</Title>
          <Paragraph>{revenue?.totalRevenue} XAF</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Platform Fees</Title>
          <Paragraph>{revenue?.platformFees} XAF</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Net Revenue</Title>
          <Paragraph>{revenue?.netRevenue} XAF</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};
```

## 7. Admin Features

### Dashboard Overview

```typescript
// src/screens/admin/DashboardScreen.tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useGetAdminStatsQuery } from "../../services/adminApi";

export const DashboardScreen = () => {
  const { data: stats } = useGetAdminStatsQuery();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Users</Title>
          <Paragraph>{stats?.totalUsers}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Properties</Title>
          <Paragraph>{stats?.totalProperties}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Revenue</Title>
          <Paragraph>{stats?.totalRevenue} XAF</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};
```

### Fapshi Configuration

```typescript
// src/screens/admin/FapshiConfigScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Switch, Button } from "react-native-paper";
import {
  useGetFapshiConfigQuery,
  useUpdateFapshiConfigMutation,
} from "../../services/fapshiApi";

export const FapshiConfigScreen = () => {
  const { data: configs } = useGetFapshiConfigQuery();
  const [updateConfig] = useUpdateFapshiConfigMutation();

  const toggleConfig = async (configId: string, isActive: boolean) => {
    await updateConfig({ configId, isActive });
  };

  return (
    <View style={styles.container}>
      {configs?.map((config) => (
        <Card key={config.id} style={styles.card}>
          <Card.Content>
            <Title>{config.serviceType}</Title>
            <Paragraph>Environment: {config.environment}</Paragraph>
            <Paragraph>
              Status: {config.isActive ? "Active" : "Inactive"}
            </Paragraph>
            <Switch
              value={config.isActive}
              onValueChange={(value) => toggleConfig(config.id, value)}
            />
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};
```

## 8. Payment Integration (Fapshi)

### Payment Service

```typescript
// src/services/paymentService.ts
import axios from "axios";
import { API_BASE_URL } from "../config";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PaymentInitiation {
  bookingId: string;
  paymentMethod: "MOBILE_MONEY" | "ORANGE_MONEY";
}

export interface PaymentResponse {
  transId: string;
  status: string;
  message: string;
  dateInitiated: string;
  bookingId: string;
}

class PaymentService {
  private baseURL = `${API_BASE_URL}/payments`;

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axios.get(`${this.baseURL}/methods`);
    return response.data.data;
  }

  async initializePayment(data: PaymentInitiation): Promise<PaymentResponse> {
    const response = await axios.post(
      `${this.baseURL}/booking/${data.bookingId}/initialize`,
      { paymentMethod: data.paymentMethod }
    );
    return response.data.data;
  }

  async verifyPayment(bookingId: string): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/booking/${bookingId}/verify`
    );
    return response.data.data;
  }

  async getPaymentHistory(): Promise<any[]> {
    const response = await axios.get(`${this.baseURL}/history`);
    return response.data.data.transactions;
  }
}

export const paymentService = new PaymentService();
```

### Payment Hook

```typescript
// src/hooks/usePayment.ts
import { useState } from "react";
import { paymentService, PaymentInitiation } from "../services/paymentService";

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async (data: PaymentInitiation) => {
    setIsLoading(true);
    try {
      const result = await paymentService.initializePayment(data);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const result = await paymentService.verifyPayment(bookingId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initializePayment,
    verifyPayment,
    isLoading,
  };
};
```

### Payment Screen

```typescript
// src/screens/payment/PaymentScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, Title, Paragraph } from "react-native-paper";
import { usePayment } from "../../hooks/usePayment";
import { paymentService } from "../../services/paymentService";

export const PaymentScreen = ({ route, navigation }: any) => {
  const { bookingId, amount, propertyTitle } = route.params;
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const { initializePayment, verifyPayment, isLoading } = usePayment();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      setSelectedMethod(methods[0]?.id);
    } catch (error) {
      Alert.alert("Error", "Failed to load payment methods");
    }
  };

  const handlePayment = async () => {
    try {
      const result = await initializePayment({
        bookingId,
        paymentMethod: selectedMethod,
      });

      Alert.alert(
        "Payment Initiated",
        `Please check your ${
          selectedMethod === "MOBILE_MONEY"
            ? "MTN Mobile Money"
            : "Orange Money"
        } app to complete the payment.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("PaymentStatus", { bookingId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Payment Error", "Failed to initialize payment");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Complete Payment</Title>
          <Paragraph>Property: {propertyTitle}</Paragraph>
          <Paragraph>Amount: {amount} XAF</Paragraph>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handlePayment}
        loading={isLoading}
        disabled={!selectedMethod}
        style={styles.button}
      >
        Pay with{" "}
        {selectedMethod === "MOBILE_MONEY" ? "MTN Money" : "Orange Money"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
```

## 9. Booking Process Flow

### Complete Booking Flow Implementation

#### Step 1: Property Selection

```typescript
// src/screens/guest/PropertyListScreen.tsx
const handlePropertySelect = (property: Property) => {
  navigation.navigate("PropertyDetail", { propertyId: property.id });
};
```

#### Step 2: Booking Creation

```typescript
// src/screens/guest/BookingScreen.tsx
const handleBookingCreation = async (bookingData: BookingData) => {
  try {
    const booking = await createBooking(bookingData).unwrap();
    navigation.navigate("Payment", {
      bookingId: booking.id,
      amount: booking.totalPrice,
      propertyTitle: booking.property.title,
    });
  } catch (error) {
    Alert.alert("Error", "Failed to create booking");
  }
};
```

#### Step 3: Payment Initialization

```typescript
// src/screens/payment/PaymentScreen.tsx
const handlePaymentInitiation = async () => {
  try {
    const payment = await initializePayment({
      bookingId,
      paymentMethod: selectedMethod,
    }).unwrap();

    // Show payment instructions
    showPaymentInstructions(payment);
  } catch (error) {
    Alert.alert("Payment Error", "Failed to initialize payment");
  }
};
```

#### Step 4: Payment Status Monitoring

```typescript
// src/screens/payment/PaymentStatusScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { useVerifyPayment } from "../../hooks/usePayment";

export const PaymentStatusScreen = ({ route }: { route: any }) => {
  const { bookingId } = route.params;
  const [status, setStatus] = useState("PENDING");
  const { verifyPayment } = useVerifyPayment();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const result = await verifyPayment(bookingId);
        setStatus(result.paymentStatus);

        if (result.paymentStatus === "COMPLETED") {
          // Navigate to success screen
          navigation.navigate("BookingSuccess", { bookingId });
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
      }
    };

    // Check status every 5 seconds
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Payment Status</Text>
          <ActivityIndicator style={styles.loader} />
          <Text>Status: {status}</Text>
          <Text>Please complete payment in your mobile money app</Text>
        </Card.Content>
      </Card>
    </View>
  );
};
```

#### Step 5: Booking Confirmation

```typescript
// src/screens/guest/BookingSuccessScreen.tsx
export const BookingSuccessScreen = ({ route }: { route: any }) => {
  const { bookingId } = route.params;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">Booking Confirmed!</Text>
          <Text>Your booking has been successfully confirmed.</Text>
          <Text>Booking ID: {bookingId}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("MyBookings")}
      >
        View My Bookings
      </Button>
    </View>
  );
};
```

## 10. State Management

### Redux Store Setup

```typescript
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { propertyApi } from "../services/propertyApi";
import { bookingApi } from "../services/bookingApi";
import { paymentApi } from "../services/paymentApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [propertyApi.reducerPath]: propertyApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      propertyApi.middleware,
      bookingApi.middleware,
      paymentApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### API Services

```typescript
// src/services/propertyApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const propertyApi = createApi({
  reducerPath: "propertyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProperties: builder.query<Property[], void>({
      query: () => "properties",
    }),
    getProperty: builder.query<Property, string>({
      query: (id) => `properties/${id}`,
    }),
    getHostProperties: builder.query<Property[], void>({
      query: () => "host/properties",
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetHostPropertiesQuery,
} = propertyApi;
```

## 11. Navigation Structure

### Navigation Setup

```typescript
// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Guest Tab Navigator
const GuestTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Properties" component={PropertyListScreen} />
    <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Host Tab Navigator
const HostTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Properties" component={PropertyManagementScreen} />
    <Tab.Screen name="Bookings" component={HostBookingsScreen} />
    <Tab.Screen name="Revenue" component={RevenueScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Users" component={UserManagementScreen} />
    <Tab.Screen name="Properties" component={AdminPropertyScreen} />
    <Tab.Screen name="Settings" component={AdminSettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      {user?.role === "GUEST" && (
        <Stack.Screen name="GuestTabs" component={GuestTabNavigator} />
      )}
      {user?.role === "HOST" && (
        <Stack.Screen name="HostTabs" component={HostTabNavigator} />
      )}
      {user?.role === "ADMIN" && (
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      )}

      {/* Common screens */}
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
    </Stack.Navigator>
  );
};
```

## 12. UI/UX Guidelines

### Design System

```typescript
// src/theme/index.ts
import { MD3LightTheme, configureFonts } from "react-native-paper";

const fontConfig = {
  displayLarge: {
    fontFamily: "System",
    fontSize: 57,
    fontWeight: "400",
  },
  // ... other font configurations
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1976D2",
    secondary: "#424242",
    error: "#D32F2F",
    background: "#FAFAFA",
  },
  fonts: configureFonts({ config: fontConfig }),
};
```

### Common Components

```typescript
// src/components/PropertyCard.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Title, Paragraph, Chip, IconButton } from "react-native-paper";

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const PropertyCard = ({
  property,
  onPress,
  onFavorite,
  isFavorited,
}: PropertyCardProps) => (
  <Card style={styles.card} onPress={onPress}>
    <Card.Cover source={{ uri: property.images[0] }} />
    <Card.Content>
      <Title>{property.title}</Title>
      <Paragraph>{property.address}</Paragraph>
      <Chip icon="currency-xaf" style={styles.price}>
        {property.price} XAF
      </Chip>
    </Card.Content>
    <Card.Actions>
      <IconButton
        icon={isFavorited ? "heart" : "heart-outline"}
        onPress={onFavorite}
        iconColor={isFavorited ? "#D32F2F" : undefined}
      />
    </Card.Actions>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
  },
  price: {
    marginTop: 8,
  },
});
```

## 13. API Integration

### API Configuration

```typescript
// src/config/index.ts
export const API_BASE_URL = __DEV__
  ? "http://localhost:5000/api/v1"
  : "https://your-production-domain.com/api/v1";

export const FAPSHI_CONFIG = {
  collectionApiKey: "your-collection-api-key",
  disbursementApiKey: "your-disbursement-api-key",
  webhookUrl: "https://your-domain.com/api/v1/payments/webhook",
};
```

### Error Handling

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Handle unauthorized
        break;
      case 403:
        // Handle forbidden
        break;
      case 404:
        // Handle not found
        break;
      case 500:
        // Handle server error
        break;
      default:
        // Handle other errors
        break;
    }

    return data.message || "An error occurred";
  }

  return "Network error. Please check your connection.";
};
```

## 14. Testing Strategy

### Unit Tests

```typescript
// src/__tests__/components/PropertyCard.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PropertyCard } from "../../components/PropertyCard";

const mockProperty = {
  id: "1",
  title: "Test Property",
  address: "Test Address",
  price: 100000,
  images: ["https://example.com/image.jpg"],
};

describe("PropertyCard", () => {
  it("renders property information correctly", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={() => {}}
        onFavorite={() => {}}
      />
    );

    expect(getByText("Test Property")).toBeTruthy();
    expect(getByText("Test Address")).toBeTruthy();
    expect(getByText("100000 XAF")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <PropertyCard
        property={mockProperty}
        onPress={onPressMock}
        onFavorite={() => {}}
      />
    );

    fireEvent.press(getByTestId("property-card"));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/BookingFlow.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { store } from "../../store";
import { BookingScreen } from "../../screens/guest/BookingScreen";

describe("Booking Flow", () => {
  it("completes booking process successfully", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <BookingScreen />
      </Provider>
    );

    // Fill booking form
    fireEvent.changeText(getByTestId("guests-input"), "2");

    // Submit booking
    fireEvent.press(getByText("Book Now"));

    await waitFor(() => {
      expect(getByText("Payment")).toBeTruthy();
    });
  });
});
```

## 15. Deployment

### Android Build

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

### iOS Build

```bash
# Archive for App Store
cd ios
xcodebuild -workspace RoomFinderApp.xcworkspace -scheme RoomFinderApp -configuration Release archive -archivePath RoomFinderApp.xcarchive
xcodebuild -exportArchive -archivePath RoomFinderApp.xcarchive -exportOptionsPlist exportOptions.plist -exportPath ./build
```

### Environment Configuration

```typescript
// src/config/environment.ts
export const ENVIRONMENT = {
  development: {
    apiUrl: "http://localhost:5000/api/v1",
    fapshiUrl: "https://sandbox.fapshi.com",
  },
  staging: {
    apiUrl: "https://staging.roomfinder.com/api/v1",
    fapshiUrl: "https://sandbox.fapshi.com",
  },
  production: {
    apiUrl: "https://roomfinder.com/api/v1",
    fapshiUrl: "https://live.fapshi.com",
  },
};
```

This comprehensive documentation provides a complete guide for building the Room Finder mobile app with all the implemented features, including the Fapshi payment integration, booking process flow, and role-based functionality for guests, hosts, and admins.
