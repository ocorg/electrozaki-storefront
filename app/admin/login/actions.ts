"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

type LoginState = { ok: false; error: string } | null;

// v1 auth is deliberately a single shared password, matching the design
// proxy.ts already commits to (see its top comment) — not a per-staff
// login system. The cookie's value is the secret itself, checked byte-for-
// byte in proxy.ts and assertAdmin().
//
// Signature is (prevState, formData) for useActionState — required so the
// page can bind this directly via <form action={...}>. That's not just
// stylistic here: redirect() throws a signal Next's client runtime only
// reliably turns into a navigation when the action is invoked through the
// form-action/useActionState path, not via a plain awaited function call
// from a manual onSubmit handler (confirmed by testing — the latter set
// the session cookie but never navigated away from the login page).
export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return { ok: false, error: "ADMIN_SESSION_SECRET n'est pas configuré." };
  }
  if (typeof password !== "string" || password !== secret) {
    return { ok: false, error: "Mot de passe incorrect." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
