import { NextResponse } from "next/server";
import { destroySession } from "../store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (typeof token === "string") destroySession(token);
  return NextResponse.json({ ok: true });
}