import { after } from "next/server";

// Tells the shop's back office that something new is waiting (an order or a
// repair request) so the staff get their notification at once. It carries no
// customer data — the back office reads the request itself — and it runs
// after the customer's response: a slow or failed call never affects them.
// Off until ERP_NOTIFY_URL is set; signed with the secret both apps share.
export function notifyErp() {
  const url = process.env.ERP_NOTIFY_URL;
  const secret = process.env.REVALIDATE_SECRET;
  // The secret only ever travels over HTTPS, and never follows a redirect
  // to another address.
  if (!url || !secret || !url.startsWith("https://")) return;
  after(async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "x-site-secret": secret },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
        redirect: "error",
      });
      if (!res.ok) console.error("[erp-notify] refused:", res.status);
    } catch (err) {
      console.error("[erp-notify] failed:", err);
    }
  });
}
