import { NextResponse } from "next/server";
import { readUserForToken, publicUser } from "../store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  const user = readUserForToken(token);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: publicUser(user) });
}