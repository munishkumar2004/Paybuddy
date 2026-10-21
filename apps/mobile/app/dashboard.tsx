import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { storage } from "../lib/storage";
import { api } from "../lib/api";

type User = { id: string; name: string; phone: string; balance: number };
type Tx = {
  id: string;
  amount: number;
  createdAt: string;
  sender?: { name: string; phone: string };
  receiver?: { name: string; phone: string };
};

export default function Dashboard() {
  const [me, setMe] = useState<User | null>(null);
  const [txns, setTxns] = useState<Tx[]>([]);
  const [toPhone, setToPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get("/wallet/me"),
        api.get("/wallet/history"),
      ]);
      setMe(a.data);
      setTxns(b.data);
    } catch {
      await storage.deleteItem("token");
      router.replace("/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (toPhone.length !== 10 || !amount || pin.length !== 4) {
      if (Platform.OS === "web") {
        alert("Fill all fields properly");
      } else {
        Alert.alert("Error", "Fill all fields properly");
      }
      return;
    }
    setSending(true);
    setMsg("");
    try {
      await api.post("/wallet/send", { toPhone, amount: Number(amount), pin, note });
      setMsg("✅ Money sent successfully!");
      setToPhone(""); setAmount(""); setPin(""); setNote("");
      load();
    } catch (e: any) {
      const err = e.response?.data?.message || "Failed";
      setMsg("❌ " + err);
    } finally {
      setSending(false);
    }
  };

  const logout = async () => {
    await storage.deleteItem("token");
    router.replace("/login");
  };

  if (!me) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={styles.greeting}>Hello, {me.name}</Text>
            <Text style={styles.balance}>₹{(me.balance / 100).toFixed(2)}</Text>
            <Text style={styles.phone}>{me.phone}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={{ color: "#ffffff" }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Send Money Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Send Money</Text>
        <TextInput style={styles.input} placeholder="Receiver phone" placeholderTextColor="#6b7280" keyboardType="number-pad" maxLength={10} value={toPhone} onChangeText={(t) => setToPhone(t.replace(/\D/g, ""))} />
        <TextInput style={styles.input} placeholder="Amount (₹)" placeholderTextColor="#6b7280" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        <TextInput style={styles.input} placeholder="PIN" placeholderTextColor="#6b7280" keyboardType="number-pad" maxLength={4} secureTextEntry value={pin} onChangeText={(t) => setPin(t.replace(/\D/g, ""))} />
        <TextInput style={styles.input} placeholder="Note (optional)" placeholderTextColor="#6b7280" value={note} onChangeText={setNote} />
        
        <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.6 }]} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>{sending ? "Sending..." : "Send Money"}</Text>
        </TouchableOpacity>
        {msg ? <Text style={{ marginTop: 10, textAlign: "center", color: msg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{msg}</Text> : null}
      </View>

      {/* History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>History</Text>
        {txns.length === 0 && <Text style={{ color: "#9ca3af", textAlign: "center", padding: 12 }}>No transactions yet</Text>}
        {txns.map((t) => {
          const isSent = t.sender?.phone === me.phone;
          return (
            <View key={t.id} style={styles.txRow}>
              <View>
                <Text style={styles.txName}>{isSent ? `→ ${t.receiver?.name}` : `← ${t.sender?.name}`}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 11 }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</Text>
              </View>
              <Text style={{ color: isSent ? "#dc2626" : "#16a34a", fontWeight: "600" }}>
                {isSent ? "-" : "+"}₹{(t.amount / 100).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#4f46e5", padding: 20, borderRadius: 16, marginBottom: 16 },
  greeting: { color: "#c7d2fe", fontSize: 14 },
  balance: { color: "#ffffff", fontSize: 34, fontWeight: "bold", marginTop: 4 },
  phone: { color: "#c7d2fe", fontSize: 12, marginTop: 4 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, height: 30 },
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, fontSize: 15, color: "#111827", marginBottom: 10 },
  sendBtn: { backgroundColor: "#16a34a", padding: 14, borderRadius: 10, alignItems: "center" },
  sendText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  txName: { color: "#111827", fontSize: 14, fontWeight: "500" },
});