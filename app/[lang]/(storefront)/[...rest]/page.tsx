import { notFound } from "next/navigation";

// Any address that matches no page ("/fr/abc") lands here, so it gets the
// shop's own 404 — in the visitor's language, with the header and footer —
// rather than Next's bare default (the root layout sits under /[lang]).
export default function UnknownPage() {
  notFound();
}
