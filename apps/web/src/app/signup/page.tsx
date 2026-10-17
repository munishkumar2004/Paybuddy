"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">PayBuddy</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="10-digit phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
          }
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="4-digit PIN"
          type="password"
          maxLength={4}
          value={form.pin}
          onChange={(e) =>
            setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })
          }
          required
        />

        {err && (
          <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{err}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already a user?{" "}
          <Link href="/login" className="text-indigo-600 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}