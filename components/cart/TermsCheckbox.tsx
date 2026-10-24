"use client";

import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";
import { TERMS_PATH } from "@/lib/site";

// "J'ai lu et j'accepte les conditions générales de vente" — never ticked in
// advance: law 31-08 (art. 30) wants the terms accepted before the order is
// confirmed. The link opens the terms in a new tab, so the form isn't lost.
export function TermsCheckbox({
  id,
  checked,
  onChange,
  invalid,
  className = "",
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
  className?: string;
}) {
  const c = useT().cartPage;
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2.5 rounded-xl p-2 text-sm text-neutral-700 ${invalid ? "ring-2 ring-red-500" : ""} ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid}
        className="mt-0.5 h-5 w-5 flex-none accent-gold-deep"
      />
      <span>
        {c.termsBefore}
        <Link
          href={TERMS_PATH}
          target="_blank"
          rel="noopener"
          className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-2"
        >
          {c.termsLink}
        </Link>
        {c.termsAfter}
      </span>
    </label>
  );
}
