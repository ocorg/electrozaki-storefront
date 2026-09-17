import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// v1 protection for /admin is deliberately simple: one shared password
// (set as ADMIN_SESSION_SECRET in your env), not a multi-user staff login
// system — that matches "no customer accounts/login" being out of scope
// for v1, and keeps the internal queue from being a wide-open page holding
// customer names and phone numbers. Upgrade to per-staff accounts later.
//
// Renamed from middleware.ts/middleware() to proxy.ts/proxy() — Next.js 16
// deprecated the "middleware" naming in favor of "proxy" to make clear this
// file sits between the request and your routes. It also now always runs
// on the Node.js runtime (no Edge option), which doesn't affect us since
// nothing here needs Edge.
const ADMIN_COOKIE = "ez_admin_session";

export function proxy(request: NextRequest) {
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
