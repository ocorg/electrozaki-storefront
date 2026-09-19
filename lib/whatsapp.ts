// Same number already used across the current Shopify theme's CTAs.
const WHATSAPP_NUMBER = "212667654430";

type CartLine = {
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number; // MAD
};

type OrderContext = {
  deliveryAddress?: string;
  requiresAdvance: boolean;
  receiptUploaded: boolean;
};

export function buildWhatsAppOrderLink(
  customerName: string,
  lines: CartLine[],
  context?: OrderContext
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

  const messageParts = [
    `Bonjour, je souhaite commander (${customerName}) :`,
    itemLines,
    `Total estimé : ${total} MAD`,
  ];

  if (context?.deliveryAddress) {
    messageParts.push(`Adresse de livraison : ${context.deliveryAddress}`);
  }

  if (context?.requiresAdvance) {
    messageParts.push(
      context.receiptUploaded
        ? "Avance de 300 DH : reçu envoyé, en attente de vérification."
        : "Avance de 300 DH : reçu non encore envoyé."
    );
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageParts.join("\n\n"))}`;
}
