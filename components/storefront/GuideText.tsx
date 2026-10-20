import { Fragment } from "react";

// Renders a guide's inline marks: [[Réglages › Batterie]] as a settings-path
// chip (kept left-to-right only when it's Latin text), **text** in bold.
export function GuideText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("[[")) {
          const path = part.slice(2, -2);
          return (
            <span
              key={i}
              dir={/[؀-ۿ]/.test(path) ? undefined : "ltr"}
              className="mx-0.5 inline-block rounded-md bg-paper-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink ring-1 ring-ink/10"
            >
              {path}
            </span>
          );
        }
        if (part.startsWith("**")) return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
