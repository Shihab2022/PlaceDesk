import { NextResponse } from "next/server";
import { createUser, openSession, publicUser } from "../store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const firstName =
      typeof body?.firstName === "string" ? body.firstName : undefined;
    const lastName =
      typeof body?.lastName === "string" ? body.lastName : undefined;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const created = createUser({ email, password, firstName, lastName });
    if ("error" in created) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const session = openSession(created.user.id);
    return NextResponse.json(
      {
        ok: true,
        token: session.token,
        user: publicUser(created.user),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process request." },
      { status: 500 },
    );
  }
}