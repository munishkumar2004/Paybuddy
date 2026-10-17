"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Stats = {
  totalUsers: number;
  totalTransactions: number;
  totalVolumePaise: number;
  blockedUsers: number;
};

type User = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  _count: { sentTxs: number; receivedTxs: number };
};

type Tx = {
  id: string;
  amount: number;
  status: string;
  type: string;
  note?: string;
  refId: string;
  createdAt: string;
  sender?: { name: string; phone: string };
  receiver?: { name: string; phone: string };
};

type Log = {
  id: string;
  action: string;
  meta?: any;
  createdAt: string;
  user?: { name: string; phone: string };
};

type Tab = "overview" | "users" | "transactions" | "logs";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [txns, setTxns] = useState<Tx[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [txnSearch, setTxnSearch] = useState("");
  const [txnStatus, setTxnStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setMsg("❌ Admin access required");
      }
    }
  };

  const loadUsers = async (search = "") => {
    try {
      const { data } = await api.get("/admin/users", { params: { search } });
      setUsers(data);
    } catch {}
  };

  const loadTxns = async (search = "", status = "") => {
    try {
      const { data } = await api.get("/admin/transactions", {
        params: { search, status },
      });
      setTxns(data);
    } catch {}
  };

  const loadLogs = async () => {
    try {
      const { data } = await api.get("/admin/logs");
      setLogs(data);
    } catch {}
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadTxns();
    loadLogs();
  }, []);

  const doBlock = async (id: string, block: boolean) => {
    try {
      await api.post(`/admin/users/${id}/${block ? "block" : "unblock"}`);
      loadUsers(userSearch);
      setMsg(`✅ User ${block ? "blocked" : "unblocked"}`);
      setTimeout(() => setMsg(""), 2000);
    } catch (e: any) {
      setMsg("❌ " + (e.response?.data?.message || "Failed"));
    }
  };

  const doTopup = async (id: string) => {
    const input = prompt("Enter amount in ₹ (e.g. 500)");
    if (!input) return;
    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) {
      setMsg("❌ Invalid amount");
      return;
    }
    try {
      await api.post(`/admin/users/${id}/topup`, { amount });
      loadUsers(userSearch);
      loadStats();
      setMsg(`✅ Topped up ₹${amount}`);
      setTimeout(() => setMsg(""), 2000);
    } catch (e: any) {
      setMsg("❌ " + (e.response?.data?.message || "Failed"));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">PayBuddy Admin</h1>
          <span className="text-xs bg-red-600 px-2 py-1 rounded">ADMIN</span>
        </div>
        <button
          onClick={logout}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-6">
        {(["overview", "users", "transactions", "logs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 text-sm font-medium capitalize border-b-2 ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {msg && (
        <div className="max-w-6xl mx-auto mt-4 px-6">
          <p className="bg-white border rounded p-3 text-sm">{msg}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* ─── Overview ─── */}
        {tab === "overview" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers.toString()} />
            <StatCard
              label="Total Transactions"
              value={stats.totalTransactions.toString()}
            />
            <StatCard
              label="Volume"
              value={`₹${(stats.totalVolumePaise / 100).toFixed(2)}`}
            />
            <StatCard label="Blocked Users" value={stats.blockedUsers.toString()} />
          </div>
        )}

        {tab === "overview" && !stats && (
          <p className="text-gray-500">Loading stats...</p>
        )}

        {/* ─── Users ─── */}
        {tab === "users" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b">
              <input
                className="border border-gray-300 p-2 rounded-lg w-full text-black"
                placeholder="Search by name or phone"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  loadUsers(e.target.value);
                }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-right">Balance</th>
                    <th className="p-3 text-center">Sent</th>
                    <th className="p-3 text-center">Received</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t text-gray-800">
                      <td className="p-3 font-medium">
                        {u.name}
                        {u.isAdmin && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-3">{u.phone}</td>
                      <td className="p-3 text-right font-semibold">
                        ₹{(u.balance / 100).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">{u._count.sentTxs}</td>
                      <td className="p-3 text-center">{u._count.receivedTxs}</td>
                      <td className="p-3 text-center">
                        {u.isBlocked ? (
                          <span className="text-red-600 text-xs font-medium">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs font-medium">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => doTopup(u.id)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Topup
                        </button>
                        <button
                          onClick={() => doBlock(u.id, !u.isBlocked)}
                          className={`text-xs px-2 py-1 rounded text-white ${
                            u.isBlocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        No users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Transactions ─── */}
        {tab === "transactions" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b flex gap-3">
              <input
                className="border border-gray-300 p-2 rounded-lg flex-1 text-black"
                placeholder="Search by phone, name, refId, note"
                value={txnSearch}
                onChange={(e) => {
                  setTxnSearch(e.target.value);
                  loadTxns(e.target.value, txnStatus);
                }}
              />
              <select
                className="border border-gray-300 p-2 rounded-lg text-black"
                value={txnStatus}
                onChange={(e) => {
                  setTxnStatus(e.target.value);
                  loadTxns(txnSearch, e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">When</th>
                    <th className="p-3 text-left">From</th>
                    <th className="p-3 text-left">To</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.id} className="border-t text-gray-800">
                      <td className="p-3 text-xs">
                        {new Date(t.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        {t.sender ? `${t.sender.name} (${t.sender.phone})` : "—"}
                      </td>
                      <td className="p-3">
                        {t.receiver
                          ? `${t.receiver.name} (${t.receiver.phone})`
                          : "—"}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ₹{(t.amount / 100).toFixed(2)}
                      </td>
                      <td className="p-3 text-center text-xs">{t.type}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            t.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : t.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">{t.note || "—"}</td>
                    </tr>
                  ))}
                  {txns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        No transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Logs ─── */}
        {tab === "logs" && (
          <div className="bg-white rounded-xl shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">When</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t text-gray-800">
                      <td className="p-3 text-xs">
                        {new Date(l.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        {l.user ? `${l.user.name} (${l.user.phone})` : "—"}
                      </td>
                      <td className="p-3 font-medium">{l.action}</td>
                      <td className="p-3 text-xs text-gray-500">
                        {l.meta ? JSON.stringify(l.meta) : "—"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        No logs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}