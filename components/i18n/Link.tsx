"use client";

import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { useLocalePath } from "@/components/i18n/I18nProvider";
import { useNavPending } from "@/components/ui/NavProgress";

// next/link that keeps the visitor in their language: an internal href like
// "/collections/x" becomes "/ar/collections/x". External, anchor and
// already-prefixed hrefs pass through unchanged. Use this instead of
// next/link everywhere in the storefront. While the page it opens is on its
// way, the bar at the top of the screen runs (NavProgress).
export default function Link({ href, children, ...props }: ComponentProps<typeof NextLink>) {
  const withLocale = useLocalePath();
  return (
    <NextLink href={typeof href === "string" ? withLocale(href) : href} {...props}>
      {children}
      <ReportPending />
    </NextLink>
  );
}

function ReportPending() {
  const { pending } = useLinkStatus();
  useNavPending(pending);
  return null;
}
