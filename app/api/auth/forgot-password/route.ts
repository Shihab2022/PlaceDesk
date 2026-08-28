import { NextResponse } from "next/server";
import { emailExists } from "../store";

/**
 * Forgot password — returns a password-reset token for an existing account.
 * In production, email the token to the user via a provider; here we echo it
 * back so the reset flow is testable end-to-end.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const exists = emailExists(email);
  // Always return ok:true to avoid leaking which emails exist.
  return NextResponse.json({
    ok: true,
    sent: true,
    message: exists
      ? "If an account exists, a reset link has been generated."
      : "If an account exists, a reset link has been generated.",
    demoResetToken: exists ? email : undefined,
  });
}