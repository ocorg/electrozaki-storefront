import { SOCIAL } from "@/lib/site";

// The shop's pages on Facebook, Instagram and TikTok (footer, contact page),
// as the brands' own coloured logos, drawn here (no image files to load).

const TIKTOK_NOTE =
  "M16.6 5.8A4.3 4.3 0 0 1 15.6 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 0 0-.8-.1 5.7 5.7 0 1 0 5.7 5.7V9a7.3 7.3 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.3-1.5Z";

function Logo({ name }: { name: keyof typeof SOCIAL }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden>
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          fill="#fff"
          d="M13.4 24v-8.6h2.9l.45-3.4H13.4V9.9c0-1 .3-1.6 1.7-1.6h1.75V5.25c-.3 0-1.35-.13-2.55-.13-2.55 0-4.25 1.55-4.25 4.4V12H7.2v3.4h2.85V24"
        />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden>
        <defs>
          <radialGradient id="ig-grad" cx="0.3" cy="1.07" r="1.2">
            <stop offset="0" stopColor="#FFDD55" />
            <stop offset="0.12" stopColor="#FFC20E" />
            <stop offset="0.45" stopColor="#FF543E" />
            <stop offset="0.7" stopColor="#FF0E89" />
            <stop offset="1" stopColor="#8A2BFF" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="6.5" fill="url(#ig-grad)" />
        <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.7" />
        <circle cx="16.4" cy="7.6" r="1.05" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden>
      <rect width="24" height="24" rx="6.5" fill="#000" />
      <g transform="translate(2.4 2.4) scale(0.8)">
        <path d={TIKTOK_NOTE} fill="#25F4EE" transform="translate(-0.7 -0.6)" />
        <path d={TIKTOK_NOTE} fill="#FE2C55" transform="translate(0.7 0.6)" />
        <path d={TIKTOK_NOTE} fill="#fff" />
      </g>
    </svg>
  );
}

const LABELS: Record<keyof typeof SOCIAL, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok" };

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex gap-2.5 ${className}`}>
      {(Object.keys(SOCIAL) as (keyof typeof SOCIAL)[]).map((key) => (
        <li key={key}>
          <a
            href={SOCIAL[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[key]}
            title={LABELS[key]}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:-translate-y-0.5"
          >
            <Logo name={key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
