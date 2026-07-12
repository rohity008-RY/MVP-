import { NextResponse } from "next/server";
import { accessCookie, refreshCookie } from "../../../lib/session";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { accessToken?: string; refreshToken?: string };
  if (!body.accessToken || !body.refreshToken) {
    return NextResponse.json({ ok: false, error: "Missing access or refresh token." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(accessCookie, body.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  response.cookies.set(refreshCookie, body.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 });
  return response;
}
