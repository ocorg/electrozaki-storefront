import { cookies } from "next/headers";

// Matches proxy.ts exactly — that's what actually gates page navigation to
// /admin/*. This file exists for the Server Actions proxy.ts can't see
// (defense in depth, not the primary gate) and for reading the session in
// Server Components (e.g. to show/hide a "logged in" state).
export const ADMIN_COOKIE = "ez_admin_session";

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const session = jar.get(ADMIN_COOKIE);
  return Boolean(session && session.value === process.env.ADMIN_SESSION_SECRET);
}

// Call at the top of every admin Server Action that mutates data. Throwing
// (rather than redirecting) is deliberate — Server Actions surface a thrown
// error to the caller instead of silently no-op'ing, which matters here
// since these actions are otherwise assumed trusted once past proxy.ts.
export async function assertAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    throw new Error("Non autorisé.");
  }
}
