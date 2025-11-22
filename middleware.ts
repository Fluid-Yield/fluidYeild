import { NextRequest, NextResponse } from "next/server";
import { ANON_USER_COOKIE } from "./lib/constants";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const existing = request.cookies.get(ANON_USER_COOKIE);

  if (!existing) {
    const id = crypto.randomUUID();

    response.cookies.set(ANON_USER_COOKIE, id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
