import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { storage } from "../lib/storage";
import { api } from "../lib/api";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (phone.length !== 10 || pin.length !== 4) {
      if (Platform.OS === "web") {
        alert("Enter valid phone (10 digits) and PIN (4 digits)");
      } else {
        Alert.alert("Error", "Enter valid phone (10 digits) and PIN (4 digits)");
      }
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { phone, pin });
      await storage.setItem("token", data.token);
      router.replace("/dashboard");
    } catch (e: any) {
      const msg = e.response?.data?.message || "Try again";
      if (Platform.OS === "web") {
        alert("Login failed: " + msg);
      } else {
        Alert.alert("Login failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>PayBuddy</Text>
        <Text style={styles.subtitle}>Welcome back</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#6b7280"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
        />

        <TextInput
          style={styles.input}
          placeholder="PIN"
          placeholderTextColor="#6b7280"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, ""))}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#4f46e5",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});