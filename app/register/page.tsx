"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }
      try {
        localStorage.setItem("placedesk-token", data.token);
      } catch {
        /* ignore */
      }
      router.push("/dashboard");
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const text =
    "focusable w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400";

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start exploring geographic data in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input className={text} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sarah" />
          </Field>
          <Field label="Last name">
            <input className={text} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Johnson" />
          </Field>
        </div>
        <Field label="Email">
          <input type="email" className={text} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <input type="password" className={text} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </Field>
        <Field label="Confirm password">
          <input type="password" className={text} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </Field>

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
          {busy ? "Creating account…" : "Create Account"}
        </button>
        <p className="text-[11px] text-ink-400">
          By continuing you agree to PlaceDesk&apos;s Terms &amp; Privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}