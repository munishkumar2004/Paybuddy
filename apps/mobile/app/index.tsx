import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router } from "expo-router";
import { storage } from "../lib/storage";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem("token");
        if (token) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (e) {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eef2ff",
      }}
    >
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading...</Text>
    </View>
  );
}