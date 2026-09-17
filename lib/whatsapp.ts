// Same number already used across the current Shopify theme's CTAs.
const WHATSAPP_NUMBER = "212667654430";

type CartLine = {
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number; // MAD
};

export function buildWhatsAppOrderLink(
  customerName: string,
  lines: CartLine[]
): string {
  const itemLines = lines
    .map(
      (l) =>
        `- ${l.quantity}x ${l.productName}${
          l.variantName ? ` (${l.variantName})` : ""
        } — ${l.price} MAD`
    )
    .join("\n");

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const message = [
    `Bonjour, je souhaite commander (${customerName}) :`,
    itemLines,
    `Total estimé : ${total} MAD`,
  ].join("\n\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
