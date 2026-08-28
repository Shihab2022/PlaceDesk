import { NextResponse } from "next/server";
import { setPassword, emailExists } from "../store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and new password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!emailExists(email)) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  setPassword(email, password);
  return NextResponse.json({ ok: true, message: "Password updated." });
}