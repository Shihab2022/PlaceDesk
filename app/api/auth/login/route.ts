import { NextResponse } from "next/server";
import { verifyLogin, openSession, publicUser } from "../store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    const result = verifyLogin(email, password);
    if ("error" in result) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const session = openSession(result.user.id);
    return NextResponse.json({
      ok: true,
      token: session.token,
      user: publicUser(result.user),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process request." },
      { status: 500 },
    );
  }
}