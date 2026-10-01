"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocalePath } from "@/components/i18n/I18nProvider";

// next/link that keeps the visitor in their language: an internal href like
// "/collections/x" becomes "/ar/collections/x". External, anchor and
// already-prefixed hrefs pass through unchanged. Use this instead of
// next/link everywhere in the storefront.
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const withLocale = useLocalePath();
  return <NextLink href={typeof href === "string" ? withLocale(href) : href} {...props} />;
}
