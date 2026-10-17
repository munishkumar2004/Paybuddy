"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import MyQRModal from "@/components/MyQRModal";
import ScanQRModal from "@/components/ScanQRModal";

type User = { id: string; name: string; phone: string; balance: number; isAdmin: boolean };
type Tx = {
  id: string; amount: number; status: string; type: string; note?: string;
  createdAt: string;
  sender?: { name: string; phone: string };
  receiver?: { name: string; phone: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [txns, setTxns] = useState<Tx[]>([]);
  const [form, setForm] = useState({ toPhone: "", amount: "", pin: "", note: "" });
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [showScan, setShowScan] = useState(false);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get("/wallet/me"), api.get("/wallet/history")]);
      setMe(a.data);
      setTxns(b.data);
    } catch {
      router.replace("/login");
    }
  };

  useEffect(() => { load(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setSending(true);
    try {
      await api.post("/wallet/send", {
        toPhone: form.toPhone,
        amount: Number(form.amount),
        pin: form.pin,
        note: form.note,
      });
      setMsg("✅ Money sent successfully!");
      setForm({ toPhone: "", amount: "", pin: "", note: "" });
      load();
    } catch (e: any) {
      setMsg("❌ " + (e.response?.data?.message || "Failed"));
    } finally {
      setSending(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!me) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Hello, {me.name}</p>
              <p className="text-4xl font-bold mt-1">₹{(me.balance / 100).toFixed(2)}</p>
              <p className="text-xs opacity-70 mt-1">{me.phone}</p>
            </div>
            <div className="flex gap-2">
              {me.isAdmin && (
                <button onClick={() => router.push("/admin")} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-medium">
                  Admin
                </button>
              )}
              <button onClick={logout} className="text-white/90 hover:text-white text-sm bg-white/10 px-3 py-1 rounded-lg">
                Logout
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setShowMyQR(true)} className="bg-white/15 hover:bg-white/25 text-white py-2.5 rounded-lg text-sm font-medium">
              📱 Show My QR
            </button>
            <button onClick={() => setShowScan(true)} className="bg-white/15 hover:bg-white/25 text-white py-2.5 rounded-lg text-sm font-medium">
              📷 Scan QR
            </button>
          </div>
        </div>

        <form onSubmit={send} className="bg-white p-6 rounded-2xl shadow space-y-3">
          <h2 className="font-bold text-lg text-gray-800">Send Money</h2>
          <input className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Receiver phone" value={form.toPhone} onChange={(e) => setForm({ ...form, toPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required />
          <input className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount (₹)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="PIN" type="password" maxLength={4} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} required />
          <input className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button disabled={sending} className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {sending ? "Sending..." : "Send Money"}
          </button>
          {msg && <p className="text-sm p-2 bg-gray-50 rounded">{msg}</p>}
        </form>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-bold text-lg mb-3 text-gray-800">Transaction History</h2>
          {txns.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>}
          <div className="space-y-2">
            {txns.map((t) => {
              const isSent = t.sender?.phone === me.phone;
              return (
                <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {isSent ? `→ ${t.receiver?.name || "Unknown"}` : `← ${t.sender?.name || "Unknown"}`}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString("en-IN")}</p>
                    {t.note && <p className="text-xs text-gray-500 italic">{t.note}</p>}
                  </div>
                  <p className={`font-semibold ${isSent ? "text-red-600" : "text-green-600"}`}>
                    {isSent ? "-" : "+"}₹{(t.amount / 100).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showMyQR && <MyQRModal name={me.name} phone={me.phone} onClose={() => setShowMyQR(false)} />}
      {showScan && (
        <ScanQRModal
          onScan={(phone) => {
            setShowScan(false);
            setForm({ ...form, toPhone: phone });
            setMsg(`📷 QR scanned: ${phone}`);
          }}
          onClose={() => setShowScan(false)}
        />
      )}
    </div>
  );
}