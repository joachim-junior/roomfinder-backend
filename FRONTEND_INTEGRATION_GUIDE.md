# 🔌 Frontend Integration Guide - Enhanced Host Onboarding & Payouts

## 📱 Complete Integration for Web, Mobile & Admin

This guide shows exactly how to connect your frontends to the new backend features.

---

## 🎯 Quick Start - What Changed

### **New Backend Features:**

1. ✅ Enhanced host onboarding (profile + ID verification)
2. ✅ Manual payout requests (replaces automatic withdrawals)
3. ✅ Admin verification workflow
4. ✅ Admin payout approval

### **Old Endpoints Replaced:**

- ❌ `POST /api/v1/wallet/withdraw` (now disabled)

### **New Endpoints to Use:**

- ✅ `/api/v1/host-onboarding/*` (7 endpoints)
- ✅ `/api/v1/payout-requests/*` (9 endpoints)

---

## 📱 1. MOBILE APP INTEGRATION (React Native / Expo)

### **Step 1: Update API Service**

```typescript
// services/api.ts
const API_BASE_URL = "https://your-backend.railway.app/api/v1";

export const hostOnboardingAPI = {
  // Complete host profile
  createProfile: async (profileData: HostProfileData, token: string) => {
    return axios.post(`${API_BASE_URL}/host-onboarding/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Upload ID verification (3 images)
  uploadIdVerification: async (
    idDocs: { idFrontImage: string; idBackImage: string; selfieImage: string },
    token: string
  ) => {
    return axios.post(
      `${API_BASE_URL}/host-onboarding/id-verification`,
      idDocs,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Upload property ownership docs (optional)
  uploadOwnershipDocs: async (documents: string[], token: string) => {
    return axios.post(
      `${API_BASE_URL}/host-onboarding/ownership-documents`,
      { documents },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Get onboarding status
  getOnboardingStatus: async (token: string) => {
    return axios.get(`${API_BASE_URL}/host-onboarding/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const payoutAPI = {
  // Get eligible amount
  getEligibleAmount: async (token: string) => {
    return axios.get(`${API_BASE_URL}/payout-requests/eligible-amount`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Calculate fees (will show 0 fees)
  calculateFees: async (amount: number, token: string) => {
    return axios.get(
      `${API_BASE_URL}/payout-requests/calculate-fees?amount=${amount}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Create payout request
  createPayoutRequest: async (
    data: { amount: number; phoneNumber?: string; paymentMethod?: string },
    token: string
  ) => {
    return axios.post(`${API_BASE_URL}/payout-requests/request`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get my payout requests
  getMyPayouts: async (page: number = 1, token: string) => {
    return axios.get(
      `${API_BASE_URL}/payout-requests/my-requests?page=${page}&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Cancel payout request
  cancelPayout: async (requestId: string, token: string) => {
    return axios.put(
      `${API_BASE_URL}/payout-requests/${requestId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
```

---

### **Step 2: Create Host Onboarding Screens**

#### **A. Personal Information Screen**

```typescript
// screens/host/onboarding/PersonalInfoStep.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { hostOnboardingAPI } from "../../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PersonalInfoStep = ({ navigation }) => {
  const [form, setForm] = useState({
    fullLegalName: "",
    dateOfBirth: "",
    nationality: "Cameroonian",
    residentialAddress: "",
    city: "",
    region: "",
    country: "Cameroon",
    postalCode: "",
    alternatePhone: "",
    emergencyContact: "",
    emergencyPhone: "",
    payoutPhoneNumber: "",
    payoutPhoneName: "",
    idType: "NATIONAL_ID",
    idNumber: "",
    bio: "",
    languages: ["English", "French"],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("userToken");
      const response = await hostOnboardingAPI.createProfile(form, token);

      if (response.data.success) {
        // Navigate to next step
        navigation.navigate("IdVerificationStep");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium">Complete Your Profile</Text>

      <TextInput
        label="Full Legal Name *"
        value={form.fullLegalName}
        onChangeText={(text) => setForm({ ...form, fullLegalName: text })}
        style={styles.input}
      />

      <TextInput
        label="Residential Address *"
        value={form.residentialAddress}
        onChangeText={(text) => setForm({ ...form, residentialAddress: text })}
        multiline
        numberOfLines={2}
        style={styles.input}
      />

      <TextInput
        label="City *"
        value={form.city}
        onChangeText={(text) => setForm({ ...form, city: text })}
        style={styles.input}
      />

      <TextInput
        label="Region *"
        value={form.region}
        onChangeText={(text) => setForm({ ...form, region: text })}
        style={styles.input}
      />

      <TextInput
        label="Payout Mobile Money Number *"
        value={form.payoutPhoneNumber}
        onChangeText={(text) => setForm({ ...form, payoutPhoneNumber: text })}
        placeholder="+237612345678"
        keyboardType="phone-pad"
        style={styles.input}
      />
      <HelperText type="info">
        This is where you'll receive your payouts. NO withdrawal fees!
      </HelperText>

      <TextInput
        label="Name on Mobile Money Account"
        value={form.payoutPhoneName}
        onChangeText={(text) => setForm({ ...form, payoutPhoneName: text })}
        style={styles.input}
      />

      {/* Add other fields as needed */}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Continue to ID Verification
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 24 },
});
```

---

#### **B. ID Verification Screen**

```typescript
// screens/host/onboarding/IdVerificationStep.tsx
import React, { useState } from "react";
import { View, Image, StyleSheet, Alert } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { hostOnboardingAPI } from "../../../services/api";

export const IdVerificationStep = ({ navigation }) => {
  const [images, setImages] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
  });
  const [loading, setLoading] = useState(false);

  // Pick image from camera or gallery
  const pickImage = async (type: "idFront" | "idBack" | "selfie") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Upload image first
      const uploadedUrl = await uploadImage(result.assets[0].uri);
      setImages({ ...images, [type]: uploadedUrl });
    }
  };

  // Take selfie with camera
  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required for selfie");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uploadedUrl = await uploadImage(result.assets[0].uri);
      setImages({ ...images, selfie: uploadedUrl });
    }
  };

  // Upload image to backend storage
  const uploadImage = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("files", {
        uri,
        type: "image/jpeg",
        name: `id-${Date.now()}.jpg`,
      } as any);

      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${API_BASE_URL}/uploads/multiple`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.files[0].url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!images.idFront || !images.idBack || !images.selfie) {
      Alert.alert("Missing Images", "Please upload all 3 required images");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      await hostOnboardingAPI.uploadIdVerification(
        {
          idFrontImage: images.idFront,
          idBackImage: images.idBack,
          selfieImage: images.selfie,
        },
        token
      );

      Alert.alert(
        "Success!",
        "ID documents uploaded. Awaiting admin verification.",
        [{ text: "OK", onPress: () => navigation.navigate("OnboardingStatus") }]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title>ID Verification</Title>
      <Paragraph>Upload your ID and take a selfie for verification</Paragraph>

      {/* ID Front */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>1. ID Front</Title>
          {images.idFront ? (
            <Image source={{ uri: images.idFront }} style={styles.preview} />
          ) : (
            <Button mode="outlined" onPress={() => pickImage("idFront")}>
              Upload ID Front
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* ID Back */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>2. ID Back</Title>
          {images.idBack ? (
            <Image source={{ uri: images.idBack }} style={styles.preview} />
          ) : (
            <Button mode="outlined" onPress={() => pickImage("idBack")}>
              Upload ID Back
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Selfie */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>3. Selfie with ID</Title>
          {images.selfie ? (
            <Image source={{ uri: images.selfie }} style={styles.preview} />
          ) : (
            <Button mode="outlined" onPress={takeSelfie} icon="camera">
              Take Selfie
            </Button>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={
          loading || !images.idFront || !images.idBack || !images.selfie
        }
        style={styles.submitButton}
      >
        Submit for Verification
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  preview: { width: "100%", height: 200, marginTop: 8, borderRadius: 8 },
  submitButton: { marginTop: 24 },
});
```

---

#### **C. Payout Request Screen**

```typescript
// screens/host/PayoutRequestScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  Divider,
} from "react-native-paper";
import { payoutAPI } from "../../../services/api";

export const PayoutRequestScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load eligible amount on mount
  useEffect(() => {
    loadEligibility();
  }, []);

  const loadEligibility = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await payoutAPI.getEligibleAmount(token);
      setEligibility(response.data.data);
    } catch (error) {
      console.error("Failed to load eligibility:", error);
    }
  };

  // Calculate fees as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount && parseFloat(amount) > 0) {
        try {
          const token = await AsyncStorage.getItem("userToken");
          const response = await payoutAPI.calculateFees(
            parseFloat(amount),
            token
          );
          setFees(response.data.data);
        } catch (error) {
          console.error("Failed to calculate fees:", error);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const response = await payoutAPI.createPayoutRequest(
        { amount: parseFloat(amount) },
        token
      );

      Alert.alert(
        "Payout Requested!",
        "Your payout request has been submitted. An admin will review it shortly.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title>Request Payout</Title>

      {/* Balance Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Wallet Balance</Text>
          <Text variant="displaySmall">
            {eligibility?.totalBalance || 0} XAF
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text>Locked (Pending Payouts):</Text>
            <Text>{eligibility?.lockedAmount || 0} XAF</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.bold}>Available for Payout:</Text>
            <Text style={styles.bold}>
              {eligibility?.eligibleAmount || 0} XAF
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Payout Form */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Request Amount</Text>

          <TextInput
            label="Amount (XAF)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Max: ${eligibility?.eligibleAmount || 0}`}
          />

          {/* Fee Breakdown (shows NO fees!) */}
          {fees && (
            <View style={styles.feeBreakdown}>
              <View style={styles.row}>
                <Text>Requested Amount:</Text>
                <Text>{fees.requestedAmount} XAF</Text>
              </View>

              <View style={styles.row}>
                <Text>Withdrawal Fee:</Text>
                <Text style={styles.success}>NONE ✅</Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.bold}>You'll Receive:</Text>
                <Text style={[styles.bold, styles.success]}>
                  {fees.netAmount} XAF
                </Text>
              </View>

              <HelperText type="info">💡 {fees.note}</HelperText>
            </View>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        style={styles.button}
      >
        Submit Payout Request
      </Button>

      <HelperText type="info" style={styles.helper}>
        ⏰ Payouts are processed within 1-2 business days after admin approval
      </HelperText>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  input: { marginTop: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  divider: { marginVertical: 12 },
  bold: { fontWeight: "bold" },
  success: { color: "#4CAF50" },
  feeBreakdown: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  button: { marginTop: 16 },
  helper: { textAlign: "center", marginTop: 8 },
});
```

---

#### **D. Payout History Screen**

```typescript
// screens/host/PayoutHistoryScreen.tsx
import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Title, Text, Chip, Button } from "react-native-paper";
import { payoutAPI } from "../../../services/api";

export const PayoutHistoryScreen = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await payoutAPI.getMyPayouts(1, token);
      setPayouts(response.data.data.requests);
    } catch (error) {
      console.error("Failed to load payouts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await payoutAPI.cancelPayout(requestId, token);
      Alert.alert("Success", "Payout request cancelled");
      loadPayouts();
    } catch (error) {
      Alert.alert("Error", "Failed to cancel payout");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50";
      case "APPROVED":
        return "#2196F3";
      case "PROCESSING":
        return "#FF9800";
      case "REJECTED":
        return "#F44336";
      case "PENDING":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  const renderPayout = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title>{item.amount} XAF</Title>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: "white" }}
          >
            {item.status}
          </Chip>
        </View>

        <Text>To: {item.phoneNumber}</Text>
        <Text>
          Requested: {new Date(item.requestedAt).toLocaleDateString()}
        </Text>

        {item.approvedAt && (
          <Text>
            Approved: {new Date(item.approvedAt).toLocaleDateString()}
          </Text>
        )}

        {item.rejectionReason && (
          <Text style={styles.error}>Reason: {item.rejectionReason}</Text>
        )}

        {item.status === "PENDING" && (
          <Button
            mode="outlined"
            onPress={() => handleCancel(item.id)}
            style={styles.cancelButton}
          >
            Cancel Request
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={payouts}
      renderItem={renderPayout}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadPayouts} />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No payout requests yet</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  error: { color: "#F44336", marginTop: 4 },
  cancelButton: { marginTop: 12 },
  empty: { textAlign: "center", marginTop: 32, color: "#9E9E9E" },
});
```

---

## 💻 2. WEB APP INTEGRATION (Next.js / React)

### **Step 1: API Client**

```typescript
// lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const hostOnboarding = {
  createProfile: (data) => apiClient.post("/host-onboarding/profile", data),
  uploadIdVerification: (data) =>
    apiClient.post("/host-onboarding/id-verification", data),
  uploadOwnershipDocs: (documents) =>
    apiClient.post("/host-onboarding/ownership-documents", { documents }),
  getStatus: () => apiClient.get("/host-onboarding/status"),
};

export const payouts = {
  getEligible: () => apiClient.get("/payout-requests/eligible-amount"),
  calculateFees: (amount) =>
    apiClient.get(`/payout-requests/calculate-fees?amount=${amount}`),
  request: (data) => apiClient.post("/payout-requests/request", data),
  getMyRequests: (page = 1) =>
    apiClient.get(`/payout-requests/my-requests?page=${page}`),
  cancel: (requestId) => apiClient.put(`/payout-requests/${requestId}/cancel`),
};

export default apiClient;
```

---

### **Step 2: Host Onboarding Page**

```typescript
// app/host/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hostOnboarding } from "@/lib/api-client";

export default function HostOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    fullLegalName: "",
    residentialAddress: "",
    city: "",
    region: "",
    payoutPhoneNumber: "",
    // ... other fields
  });

  const handleProfileSubmit = async () => {
    try {
      setLoading(true);
      await hostOnboarding.createProfile(profile);
      setStep(2); // Move to ID verification
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleIdUpload = async (idFront, idBack, selfie) => {
    try {
      setLoading(true);
      await hostOnboarding.uploadIdVerification({
        idFrontImage: idFront,
        idBackImage: idBack,
        selfieImage: selfie,
      });
      router.push("/host/dashboard?onboardingComplete=true");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Multi-step wizard UI */}
      {step === 1 && (
        <ProfileStep
          data={profile}
          onChange={setProfile}
          onSubmit={handleProfileSubmit}
        />
      )}
      {step === 2 && <IdVerificationStep onSubmit={handleIdUpload} />}
    </div>
  );
}
```

---

### **Step 3: Payout Request Page**

```typescript
// app/host/payouts/request/page.tsx
"use client";

import { useState, useEffect } from "react";
import { payouts } from "@/lib/api-client";

export default function PayoutRequestPage() {
  const [amount, setAmount] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEligibility();
  }, []);

  const loadEligibility = async () => {
    const response = await payouts.getEligible();
    setEligibility(response.data.data);
  };

  // Auto-calculate fees
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount && parseFloat(amount) > 0) {
        const response = await payouts.calculateFees(parseFloat(amount));
        setFees(response.data.data);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [amount]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await payouts.request({ amount: parseFloat(amount) });
      alert("Payout request submitted successfully!");
      window.location.href = "/host/payouts";
    } catch (error) {
      alert(error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Request Payout</h1>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {eligibility?.totalBalance || 0} XAF
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-4">
          <span>Locked: {eligibility?.lockedAmount || 0} XAF</span>
          <span className="font-semibold">
            Available: {eligibility?.eligibleAmount || 0} XAF
          </span>
        </div>
      </div>

      {/* Payout Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium mb-2">
          Amount to Request (XAF)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={eligibility?.eligibleAmount}
          className="w-full border rounded px-4 py-2 mb-4"
          placeholder={`Max: ${eligibility?.eligibleAmount || 0} XAF`}
        />

        {/* Fee Breakdown */}
        {fees && (
          <div className="bg-gray-50 rounded p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Requested Amount:</span>
              <span>{fees.requestedAmount} XAF</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Withdrawal Fee:</span>
              <span className="text-green-600 font-semibold">NONE ✅</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>You'll Receive:</span>
              <span className="text-green-600">{fees.netAmount} XAF</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 {fees.note}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : `Request Payout of ${amount} XAF`}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          ⏰ Estimated processing: 1-2 business days after admin approval
        </p>
      </div>
    </div>
  );
}
```

---

## 🔧 3. ADMIN PANEL INTEGRATION

### **Step 1: Admin API Client**

```typescript
// lib/admin-api.ts
import apiClient from "./api-client";

export const adminVerification = {
  getPending: (page = 1) =>
    apiClient.get(`/host-onboarding/pending-verifications?page=${page}`),

  verifyId: (userId, decision, notes) =>
    apiClient.post(`/host-onboarding/${userId}/verify-id`, { decision, notes }),

  verifyOwnership: (userId, decision, notes) =>
    apiClient.post(`/host-onboarding/${userId}/verify-ownership`, {
      decision,
      notes,
    }),
};

export const adminPayouts = {
  getAll: (status = "PENDING", page = 1) =>
    apiClient.get(`/payout-requests/all?status=${status}&page=${page}`),

  approve: (requestId, notes = "") =>
    apiClient.post(`/payout-requests/${requestId}/approve`, { notes }),

  reject: (requestId, reason) =>
    apiClient.post(`/payout-requests/${requestId}/reject`, { reason }),

  getStatistics: () => apiClient.get("/payout-requests/statistics"),
};
```

---

### **Step 2: Host Verification Queue**

```typescript
// app/admin/verifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { adminVerification } from "@/lib/admin-api";
import Image from "next/image";

export default function VerificationQueuePage() {
  const [verifications, setVerifications] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const response = await adminVerification.getPending();
      setVerifications(response.data.data.verifications);
    } catch (error) {
      console.error("Failed to load verifications:", error);
    }
  };

  const handleVerify = async (userId, decision, notes) => {
    try {
      setLoading(true);
      await adminVerification.verifyId(userId, decision, notes);
      alert(`Host ${decision} successfully!`);
      loadVerifications();
      setSelectedHost(null);
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Host Verification Queue</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List of pending hosts */}
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              onClick={() => setSelectedHost(verification)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
            >
              <h3 className="font-semibold">
                {verification.user.firstName} {verification.user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{verification.user.email}</p>
              <p className="text-sm text-gray-600">
                Applied: {new Date(verification.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {verification.idVerificationStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Document reviewer */}
        {selectedHost && (
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-2xl font-bold mb-4">
              Review: {selectedHost.user.firstName} {selectedHost.user.lastName}
            </h2>

            {/* Profile Info */}
            {selectedHost.profile && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Host Profile</h3>
                <p>
                  <strong>Full Name:</strong>{" "}
                  {selectedHost.profile.fullLegalName}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedHost.profile.residentialAddress}
                </p>
                <p>
                  <strong>City:</strong> {selectedHost.profile.city}
                </p>
                <p>
                  <strong>Payout Number:</strong>{" "}
                  {selectedHost.profile.payoutPhoneNumber}
                </p>
              </div>
            )}

            {/* ID Documents */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">ID Documents</h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedHost.idFrontImage && (
                  <div>
                    <p className="text-xs mb-1">Front</p>
                    <Image
                      src={selectedHost.idFrontImage}
                      alt="ID Front"
                      width={150}
                      height={100}
                      className="rounded cursor-pointer"
                      onClick={() => window.open(selectedHost.idFrontImage)}
                    />
                  </div>
                )}
                {selectedHost.idBackImage && (
                  <div>
                    <p className="text-xs mb-1">Back</p>
                    <Image
                      src={selectedHost.idBackImage}
                      alt="ID Back"
                      width={150}
                      height={100}
                      className="rounded cursor-pointer"
                      onClick={() => window.open(selectedHost.idBackImage)}
                    />
                  </div>
                )}
                {selectedHost.selfieImage && (
                  <div>
                    <p className="text-xs mb-1">Selfie</p>
                    <Image
                      src={selectedHost.selfieImage}
                      alt="Selfie"
                      width={150}
                      height={100}
                      className="rounded cursor-pointer"
                      onClick={() => window.open(selectedHost.selfieImage)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const notes = prompt("Approval notes (optional):");
                  handleVerify(selectedHost.userId, "VERIFIED", notes);
                }}
                disabled={loading}
                className="flex-1 bg-green-600 text-white rounded py-2 font-semibold hover:bg-green-700"
              >
                ✅ Approve
              </button>

              <button
                onClick={() => {
                  const notes = prompt("Rejection reason (required):");
                  if (notes) {
                    handleVerify(selectedHost.userId, "REJECTED", notes);
                  }
                }}
                disabled={loading}
                className="flex-1 bg-red-600 text-white rounded py-2 font-semibold hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### **Step 3: Payout Approval Dashboard**

```typescript
// app/admin/payouts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { adminPayouts } from "@/lib/admin-api";

export default function PayoutApprovalPage() {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayouts();
    loadStats();
  }, [filter]);

  const loadPayouts = async () => {
    const response = await adminPayouts.getAll(filter);
    setPayouts(response.data.data.requests);
  };

  const loadStats = async () => {
    const response = await adminPayouts.getStatistics();
    setStats(response.data.data);
  };

  const handleApprove = async (requestId, amount, hostName) => {
    if (!confirm(`Approve payout of ${amount} XAF to ${hostName}?`)) return;

    try {
      setLoading(true);
      const notes = prompt("Approval notes (optional):") || "";
      await adminPayouts.approve(requestId, notes);
      alert("Payout approved! Processing...");
      loadPayouts();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt("Rejection reason (required):");
    if (!reason) return;

    try {
      setLoading(true);
      await adminPayouts.reject(requestId, reason);
      alert("Payout rejected");
      loadPayouts();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payout Approval Dashboard</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">
              {stats.processing}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalPendingAmount.toLocaleString()} XAF
            </div>
            <div className="text-sm text-gray-600">Total Pending</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Payout Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Host
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">
                      {payout.user.firstName} {payout.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payout.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  {payout.amount.toLocaleString()} XAF
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payout.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(payout.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusClass(
                      payout.status
                    )}`}
                  >
                    {payout.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payout.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleApprove(
                            payout.id,
                            payout.amount,
                            `${payout.user.firstName} ${payout.user.lastName}`
                          )
                        }
                        className="text-green-600 hover:text-green-800"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(payout.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
```

---

## 🔄 4. MIGRATION GUIDE - Updating Existing Screens

### **Replace Old Withdrawal Screen:**

#### **Before:**

```typescript
// ❌ OLD - Don't use anymore
POST /api/v1/wallet/withdraw
{
  "amount": 50000,
  "withdrawalMethod": "MOBILE_MONEY",
  "phone": "+237612345678"
}
```

#### **After:**

```typescript
// ✅ NEW - Use this instead
POST /api/v1/payout-requests/request
{
  "amount": 50000
  // Phone number comes from host profile
  // No need to specify withdrawalMethod
}
```

---

### **Update Navigation:**

```typescript
// Replace withdrawal screen with payout request screen

// OLD
navigation.navigate("WithdrawFunds");

// NEW
navigation.navigate("RequestPayout");
```

---

### **Update Wallet Display:**

```typescript
// OLD - Simple balance
<Text>Balance: {wallet.balance} XAF</Text>
<Button onPress={goToWithdraw}>Withdraw</Button>

// NEW - Show eligible vs locked
<View>
  <Text>Total Balance: {eligibility.totalBalance} XAF</Text>
  <Text style={{color: '#999'}}>Locked: {eligibility.lockedAmount} XAF</Text>
  <Text style={{fontWeight: 'bold'}}>
    Available: {eligibility.eligibleAmount} XAF
  </Text>
  <Button onPress={goToPayoutRequest}>Request Payout</Button>
</View>
```

---

## 📋 5. COMPLETE INTEGRATION CHECKLIST

### **Mobile App (React Native/Expo):**

#### Host Screens:

- [ ] Personal Info Form (profile creation)
- [ ] ID Upload Screen (camera + image picker)
- [ ] Ownership Docs Upload (optional)
- [ ] Onboarding Status Dashboard (progress tracker)
- [ ] Payout Request Form (with fee preview)
- [ ] Payout History List
- [ ] Wallet Dashboard (updated to show eligible balance)

#### API Integration:

- [ ] Create `hostOnboardingAPI` service
- [ ] Create `payoutAPI` service
- [ ] Update wallet service (remove old withdraw calls)
- [ ] Add image upload handling
- [ ] Implement navigation flow

---

### **Web App (Next.js/React):**

#### Host Pages:

- [ ] `/host/onboarding` - Multi-step wizard
- [ ] `/host/onboarding/profile` - Personal info
- [ ] `/host/onboarding/verification` - ID upload
- [ ] `/host/onboarding/status` - Progress tracker
- [ ] `/host/payouts` - Payout dashboard
- [ ] `/host/payouts/request` - Request form
- [ ] `/host/payouts/history` - Payout history

#### UI Components:

- [ ] `<HostOnboardingWizard />` - Stepper component
- [ ] `<IdUploadWidget />` - Drag & drop or click to upload
- [ ] `<PayoutRequestForm />` - Amount input with preview
- [ ] `<EligibleBalanceCard />` - Shows locked vs available
- [ ] `<PayoutHistoryTable />` - List with status badges

---

### **Admin Panel:**

#### Verification Pages:

- [ ] `/admin/host-verifications` - Queue of pending hosts
- [ ] `/admin/host-verifications/[userId]` - Detail view with docs
- [ ] Document viewer with zoom
- [ ] Approve/Reject buttons with notes

#### Payout Pages:

- [ ] `/admin/payouts` - Dashboard with statistics
- [ ] `/admin/payouts/pending` - Pending approval queue
- [ ] `/admin/payouts/[requestId]` - Detail view
- [ ] Quick approve/reject actions
- [ ] Batch approval (future enhancement)

---

## 🎨 6. UI/UX BEST PRACTICES

### **For Mobile App:**

#### Onboarding Flow:

```typescript
// Use a stepper/progress indicator
<Stepper currentStep={2} totalSteps={4}>
  <Step 1: Application />
  <Step 2: Profile />    // ← Current
  <Step 3: ID Verification />
  <Step 4: Review />
</Stepper>

// Show completion percentage
<ProgressBar progress={0.5} />  // 50% complete
<Text>2 of 4 steps completed</Text>
```

#### ID Upload:

```typescript
// Provide helpful tips
<InfoCard>
  📸 Tips for good photos: - Use good lighting - Keep ID flat and readable -
  Ensure all text is visible - Take selfie holding your ID
</InfoCard>;

// Show image preview before upload
{
  image && (
    <View>
      <Image source={{ uri: image }} />
      <Button onPress={retake}>Retake</Button>
      <Button onPress={confirm}>Looks Good</Button>
    </View>
  );
}
```

#### Payout Request:

```typescript
// Show NO fees prominently
<Card>
  <Row>
    <Text>Amount:</Text>
    <Text bold>{amount} XAF</Text>
  </Row>
  <Row>
    <Text>Withdrawal Fee:</Text>
    <Text bold green>
      NONE ✅
    </Text>
  </Row>
  <Divider />
  <Row>
    <Text bold>You'll Receive:</Text>
    <Text bold large green>
      {amount} XAF
    </Text>
  </Row>
  <InfoText>💡 No withdrawal fees! You receive the full amount.</InfoText>
</Card>
```

---

### **For Admin Panel:**

#### Document Viewer:

```typescript
// Side-by-side comparison
<div className="grid grid-cols-2 gap-4">
  <div>
    <h4>ID Front</h4>
    <ImageZoom src={idFront} />
  </div>
  <div>
    <h4>Selfie</h4>
    <ImageZoom src={selfie} />
  </div>
</div>

// Quick action buttons
<div className="flex gap-2 mt-4">
  <button className="approve-btn">✅ Looks Good</button>
  <button className="reject-btn">❌ Reject</button>
  <button className="info-btn">ℹ️ Request More Info</button>
</div>
```

#### Payout Approval:

```typescript
// Show host verification status
<PayoutCard payout={payout}>
  <HostInfo>
    <Avatar src={host.avatar} />
    <Name>{host.name}</Name>
    <Badge color={host.verificationStatus === "VERIFIED" ? "green" : "yellow"}>
      {host.verificationStatus}
    </Badge>
  </HostInfo>

  <PayoutDetails>
    <Amount>{payout.amount} XAF</Amount>
    <Phone>{payout.phoneNumber}</Phone>
    <RequestDate>{payout.requestedAt}</RequestDate>
  </PayoutDetails>

  <Actions>
    <ApproveButton onClick={() => approve(payout.id)} />
    <RejectButton onClick={() => reject(payout.id)} />
  </Actions>
</PayoutCard>
```

---

## 🔗 7. STEP-BY-STEP INTEGRATION WORKFLOW

### **Week 1: Mobile App - Host Onboarding**

#### Day 1-2: Setup

```bash
1. Install dependencies (if needed)
   npm install axios @react-native-async-storage/async-storage

2. Create API service files
   - services/hostOnboardingAPI.ts
   - services/payoutAPI.ts

3. Update API base URL
   const API_URL = 'https://your-backend.railway.app/api/v1';
```

#### Day 3-4: Build Screens

```bash
1. Create onboarding wizard
   screens/host/onboarding/PersonalInfoStep.tsx
   screens/host/onboarding/IdVerificationStep.tsx
   screens/host/onboarding/OwnershipDocsStep.tsx
   screens/host/onboarding/StatusScreen.tsx

2. Add to navigation
   <Stack.Screen name="HostOnboarding" component={OnboardingWizard} />
```

#### Day 5: Testing

```bash
1. Test profile submission
2. Test ID upload (3 images)
3. Test status tracking
4. Test error handling
```

---

### **Week 2: Mobile App - Payouts**

#### Day 1-2: Payout Screens

```bash
1. Create payout screens
   screens/host/PayoutRequestScreen.tsx
   screens/host/PayoutHistoryScreen.tsx

2. Update wallet dashboard
   screens/host/WalletScreen.tsx (show eligible balance)
```

#### Day 3: Integration

```bash
1. Replace old withdraw button
   - Remove: navigation.navigate('Withdraw')
   - Add: navigation.navigate('RequestPayout')

2. Test payout request flow
3. Test cancellation
4. Test status tracking
```

---

### **Week 3: Admin Panel**

#### Day 1-3: Verification UI

```bash
1. Build verification queue
   pages/admin/verifications/index.tsx

2. Build document reviewer
   pages/admin/verifications/[userId].tsx

3. Test approve/reject workflow
```

#### Day 4-5: Payout Approval

```bash
1. Build payout dashboard
   pages/admin/payouts/index.tsx

2. Add statistics widgets
3. Test approval workflow
4. Test rejection with reasons
```

---

## 🧪 8. TESTING ENDPOINTS

### **Test Host Onboarding:**

```bash
# Step 1: Create profile
curl -X POST "http://localhost:5000/api/v1/host-onboarding/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullLegalName": "John Doe",
    "residentialAddress": "123 Main St",
    "city": "Douala",
    "region": "Littoral",
    "payoutPhoneNumber": "+237612345678"
  }'

# Step 2: Upload ID (after uploading images)
curl -X POST "http://localhost:5000/api/v1/host-onboarding/id-verification" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idFrontImage": "https://url-to-front.jpg",
    "idBackImage": "https://url-to-back.jpg",
    "selfieImage": "https://url-to-selfie.jpg"
  }'

# Step 3: Check status
curl "http://localhost:5000/api/v1/host-onboarding/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Test Payout Request:**

```bash
# Step 1: Check eligible amount
curl "http://localhost:5000/api/v1/payout-requests/eligible-amount" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 2: Preview fees (will show 0)
curl "http://localhost:5000/api/v1/payout-requests/calculate-fees?amount=50000" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 3: Create request
curl -X POST "http://localhost:5000/api/v1/payout-requests/request" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'

# Step 4: Check status
curl "http://localhost:5000/api/v1/payout-requests/my-requests" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 9. ENVIRONMENT VARIABLES

Update your frontend `.env` files:

```bash
# Mobile App (.env)
API_URL=https://your-backend.railway.app/api/v1
ENABLE_NEW_ONBOARDING=true
ENABLE_MANUAL_PAYOUTS=true

# Web App (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_ENABLE_NEW_ONBOARDING=true
NEXT_PUBLIC_ENABLE_MANUAL_PAYOUTS=true

# Admin Panel (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_ADMIN_MODE=true
```

---

## 🚨 10. MIGRATION STRATEGY

### **Option A: Feature Flag (Recommended)**

```typescript
// Enable new features gradually
const USE_NEW_ONBOARDING = process.env.ENABLE_NEW_ONBOARDING === "true";
const USE_MANUAL_PAYOUTS = process.env.ENABLE_MANUAL_PAYOUTS === "true";

// In your code
if (USE_NEW_ONBOARDING) {
  navigation.navigate("EnhancedOnboarding");
} else {
  navigation.navigate("OldOnboarding");
}

if (USE_MANUAL_PAYOUTS) {
  navigation.navigate("RequestPayout");
} else {
  navigation.navigate("DirectWithdraw"); // OLD
}
```

### **Option B: Hard Cutover**

```typescript
// Remove old screens completely
// Replace with new ones
// All users use new system immediately
```

---

## 💡 11. IMPORTANT NOTES

### **Image Upload Flow:**

1. **First upload images** using `/api/v1/uploads/multiple`
2. **Then submit URLs** to onboarding endpoint

```typescript
// Step 1: Upload image
const formData = new FormData();
formData.append("files", imageFile);

const uploadResponse = await axios.post("/uploads/multiple", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

const imageUrl = uploadResponse.data.files[0].url;

// Step 2: Submit URL to onboarding
await hostOnboardingAPI.uploadIdVerification({
  idFrontImage: imageUrl,
  // ...
});
```

### **Phone Number Format:**

```typescript
// Backend expects Cameroon format
const formatPhone = (phone: string) => {
  // Ensure starts with +237
  if (!phone.startsWith("+237")) {
    return `+237${phone}`;
  }
  return phone;
};

// Validate before submission
const isValidCameroonPhone = (phone: string) => {
  return /^(\+237)?6[0-9]{8}$/.test(phone);
};
```

### **Error Handling:**

```typescript
try {
  await api.call();
} catch (error) {
  const message = error.response?.data?.message || "Something went wrong";
  const errors = error.response?.data?.errors; // Validation errors

  if (errors) {
    // Show field-specific errors
    errors.forEach((err) => {
      showError(err.path, err.msg);
    });
  } else {
    // Show general error
    alert(message);
  }
}
```

---

## 📱 12. NOTIFICATIONS INTEGRATION

### **Listen for Notifications:**

```typescript
// In App.tsx or root component
useEffect(() => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = notification.request.content.data;

      // Handle different notification types
      switch (data.type) {
        case "HOST_APPROVED":
          // Navigate to dashboard
          navigation.navigate("HostDashboard");
          break;

        case "PAYOUT_APPROVED":
          // Navigate to payout history
          navigation.navigate("PayoutHistory");
          break;

        case "PAYOUT_COMPLETED":
          // Show success message
          showSuccessToast(`You've received ${data.amount} XAF!`);
          break;
      }
    }
  );

  return () => {
    notificationListener.remove();
  };
}, []);
```

---

## 🎯 13. QUICK WINS

### **Minimum Viable Integration (1 Week):**

#### Must-Have:

1. ✅ Host profile form (1 day)
2. ✅ ID upload screen (1 day)
3. ✅ Payout request form (1 day)
4. ✅ Admin verification UI (2 days)
5. ✅ Admin payout approval UI (2 days)

#### Can Wait:

- Ownership document upload (optional feature)
- Advanced analytics
- Batch operations
- Enhanced notifications

---

## 📚 14. DOCUMENTATION FOR YOUR TEAM

Share these with your frontend developers:

### **For Mobile Team:**

- This file (`FRONTEND_INTEGRATION_GUIDE.md`)
- `QUICK_API_REFERENCE_ONBOARDING_PAYOUTS.md` - API endpoints
- `EXPO_PUSH_NOTIFICATIONS_SETUP.md` - Push notifications

### **For Web Team:**

- This file
- `QUICK_API_REFERENCE_ONBOARDING_PAYOUTS.md`
- `FINAL_COMMISSION_SYSTEM.md` - How fees work

### **For Admin Panel Team:**

- This file
- `ENHANCED_HOST_ONBOARDING_AND_PAYOUT_SYSTEM.md` - Full system overview
- `ADMIN_API_DOCUMENTATION.md` - Admin endpoints

---

## ✅ 15. VALIDATION & ERROR MESSAGES

### **Common Errors & User-Friendly Messages:**

| Backend Error                                 | User-Friendly Message                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Missing required profile fields"             | "Please fill in all required fields (name, address, city, region, payout number)"               |
| "All three verification images are required"  | "Please upload ID front, ID back, and a selfie with your ID"                                    |
| "Insufficient eligible balance"               | "You don't have enough available balance. Some funds may be locked in pending payout requests." |
| "You already have a pending host application" | "Your host application is being reviewed. Please wait for admin approval."                      |
| "Invalid Cameroon phone number format"        | "Phone number must be a valid Cameroon number (e.g., +237612345678)"                            |

---

## 🚀 Ready to Integrate!

### **Summary:**

✅ All backend endpoints ready  
✅ Complete API documentation provided  
✅ Code examples for mobile, web, and admin  
✅ Integration checklist included  
✅ Testing procedures documented  
✅ Migration strategy outlined

### **Next Steps:**

1. Share this guide with frontend team
2. Set up API base URLs
3. Build screens one by one
4. Test end-to-end
5. Deploy!

---

**Questions? Check:**

- `QUICK_API_REFERENCE_ONBOARDING_PAYOUTS.md` - All endpoints
- `FINAL_COMMISSION_SYSTEM.md` - Fee structure
- `EXPO_PUSH_NOTIFICATIONS_SETUP.md` - Notifications

**Need help? The backend is fully tested and ready to connect!** 🎉
