import { SOCIAL } from "@/lib/site";

// The shop's pages on Facebook, Instagram and TikTok (footer, contact page).
// The icons are drawn here: the icon set has no brand logos.

const ICONS: Record<keyof typeof SOCIAL, { label: string; path: string; stroke?: boolean }> = {
  facebook: {
    label: "Facebook",
    path: "M13.5 21v-7.2h2.4l.4-2.9h-2.8V9.1c0-.8.3-1.4 1.4-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.1v2.9h2.4V21",
    stroke: false,
  },
  instagram: {
    label: "Instagram",
    path: "M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.3-1.8h.01",
    stroke: true,
  },
  tiktok: {
    label: "TikTok",
    path: "M16.6 5.8A4.3 4.3 0 0 1 15.6 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 0 0-.8-.1 5.7 5.7 0 1 0 5.7 5.7V9a7.3 7.3 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.3-1.5Z",
    stroke: false,
  },
};

export function SocialLinks({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const box =
    tone === "dark"
      ? "bg-white/8 text-white hover:bg-gold hover:text-ink"
      : "bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-white";
  return (
    <ul className={`flex gap-2 ${className}`}>
      {(Object.keys(SOCIAL) as (keyof typeof SOCIAL)[]).map((key) => {
        const icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={SOCIAL[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={icon.label}
              title={icon.label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${box}`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden
                fill={icon.stroke ? "none" : "currentColor"}
                stroke={icon.stroke ? "currentColor" : "none"}
                strokeWidth={icon.stroke ? 2 : 0}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={icon.path} />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
