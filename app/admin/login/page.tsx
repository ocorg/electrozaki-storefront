"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form action={formAction} className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-lg font-extrabold tracking-tight">
          ELECTRO <span className="text-gold">ZAKI</span>
        </p>
        <h1 className="mt-1 text-sm font-medium text-neutral-500">Espace administration</h1>

        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Mot de passe"
          className="mt-6 min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
        />

        {state && !state.ok && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={isPending} className="mt-4 w-full">
          {isPending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
