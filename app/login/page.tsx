"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

interface Field {
  name: string;
  label: string;
  type: string;
  value: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const fields: Field[] = [
    { name: "email", label: "Email", type: "email", value: email },
    { name: "password", label: "Password", type: show ? "text" : "password", value: password },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Unable to sign in.");
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

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your spatial intelligence workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {fields.map((f) => (
          <FieldRow
            key={f.name}
            field={f}
            onValue={(v) => (f.name === "email" ? setEmail(v) : setPassword(v))}
            showable={f.name === "password"}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
          />
        ))}

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-[12px]">
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-line accent-brand-600" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="focusable w-full rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:-translate-y-px hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

function FieldRow({
  field,
  onValue,
  showable,
  show,
  onToggleShow,
}: {
  field: Field;
  onValue: (v: string) => void;
  showable?: boolean;
  show?: boolean;
  onToggleShow?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-600">{field.label}</span>
      <div className="relative">
        <input
          type={field.type}
          value={field.value}
          autoComplete={field.name === "email" ? "email" : "current-password"}
          onChange={(e) => onValue(e.target.value)}
          className="focusable w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
          placeholder={field.name === "email" ? "you@company.com" : "••••••••"}
        />
        {showable && onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-400 hover:text-brand-700"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </label>
  );
}