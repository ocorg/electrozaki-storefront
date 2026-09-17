import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// v1 protection for /admin is deliberately simple: one shared password
// (set as ADMIN_PASSWORD in your env), not a multi-user staff login system —
// that matches "no customer accounts/login" being out of scope for v1, and
// keeps the internal queue from being a wide-open page holding customer
// names and phone numbers. Upgrade to per-staff accounts later if needed.
const ADMIN_COOKIE = "ez_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_COOKIE);
  if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
