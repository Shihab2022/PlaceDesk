"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

export default function ResetPasswordPage({ searchParams }: { searchParams?: { email?: string } }) {
  const router = useRouter();
  const initialEmail = searchParams?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Unable to reset password.");
        return;
      }
      setDone(true);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your password has been reset."
        footer={
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in with your new password
          </Link>
        }
      >
        <p className="text-[13px] text-ink-500">
          You can now sign in using the updated password.
        </p>
      </AuthShell>
    );
  }

  const text =
    "focusable w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400";

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a fresh password for your account."
      footer={
        <>
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink-600">Email</span>
          <input type="email" className={text} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink-600">New password</span>
          <input type="password" className={text} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink-600">Confirm password</span>
          <input type="password" className={text} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </label>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="focusable w-full rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:-translate-y-px hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
}