import type { TermsCopy } from "./types";

export const en: TermsCopy = {
  metaTitle: "Terms of sale and returns (7 days)",
  metaDescription:
    "Electro Zaki's terms of sale: ordering, the 300 DH advance, Ameex delivery anywhere in Morocco, a 7-day return right, a 3-month warranty.",
  title: "Terms of sale",
  updated: (date) => `Updated: ${date}`,
  intro:
    "These terms apply to every order placed on electrozaki.ma. You accept them by ticking the box before confirming your order. They follow Moroccan law no. 31-08 on consumer protection. The French version is the reference.",
  summaryTitle: "In short",
  summary: [
    "You can return an item within 7 days of receiving it, without giving a reason.",
    "Refund within 15 days at most. Return shipping is paid by you, unless the phone is faulty or not as described.",
    "A 3-month shop warranty on every phone, plus the maker's 1-year warranty on new phones.",
    "You can check the phone on delivery and refuse the parcel if it isn't as described.",
  ],
  seller: {
    title: "1. The seller",
    tradeName: "Trade name",
    address: "Address",
    phone: "Phone and WhatsApp",
    website: "Website",
    rc: "Trade register (RC)",
    ice: "ICE",
    fiscalId: "Tax ID",
    email: "Email",
  },
  sections: [
    {
      id: "produits",
      title: "2. Products",
      paragraphs: [
        "We sell new and used phones, and accessories. Each used phone is described as it is: its condition (Very good, Good, Replaced parts), its battery health and any replaced parts. It passes the Electro Zaki check before it goes on sale.",
        "New phones are sold sealed in their original box.",
        "A model's photos may show another colour or another unit: what counts is the description of the unit you choose.",
      ],
    },
    {
      id: "prix",
      title: "3. Prices",
      paragraphs: [
        "Prices are in Moroccan dirhams, all taxes included. Delivery fees depend on your town: they are shown before you confirm the order and are added to the price.",
        "The price charged is the one shown when you order.",
      ],
    },
    {
      id: "commande",
      title: "4. Ordering",
      paragraphs: [
        "You choose your item, give your name, phone and town, accept these terms, then confirm. You get an order reference (8 characters) to follow it on the “Track my order” page.",
        "We then call you to confirm the order and the delivery address. The sale is made at this confirmation. If the item is no longer available, we tell you on that call and refund anything already paid.",
      ],
    },
    {
      id: "paiement",
      title: "5. Payment",
      paragraphs: [
        "For a phone, a 300 DH advance is asked before shipping, by bank transfer, CashPlus or Al Barid Bank. It reserves your phone during delivery. The rest is paid in cash to the courier on delivery.",
        "For accessories alone, everything is paid on delivery.",
        "The advance is part of the price: it is deducted from what you pay on delivery, and refunded in the cases set out in sections 4, 6 and 7.",
      ],
    },
    {
      id: "livraison",
      title: "6. Delivery",
      paragraphs: [
        "We deliver anywhere in Morocco with Ameex. The parcel leaves Meknès the same day or the next working day after confirmation (and the advance, for a phone), then usually takes 1 to 3 working days. An expected delivery date is given when you order.",
        "On delivery you can check the phone, in front of the courier or on a video call with us. If it isn't as described, refuse the parcel: the advance is refunded in full.",
        "If delivery is more than 7 days later than the expected date, except in case of force majeure, you can cancel the order and get back everything you paid.",
      ],
    },
    {
      id: "retours",
      title: "7. Your return right (7 days)",
      paragraphs: [
        "You have 7 days from receiving an item to change your mind and send it back, without giving a reason.",
        "To do so, tell us within that time on WhatsApp, by phone or at the shop, with your order reference. Then send the item back with Ameex, or bring it to the shop in Meknès.",
        "The item must come back complete and in the condition you received it:",
      ],
      list: [
        "with its box and accessories, if it had them;",
        "with no new breakage, scratch or mark of a knock;",
        "signed out of your iCloud or Google account, with no lock code.",
      ],
    },
    {
      id: "remboursement",
      title: "8. Refunds",
      paragraphs: [
        "We refund everything you paid no later than 15 days after your return request, once the item has been received and checked. Refunds are made by bank transfer or in cash at the shop.",
        "Return shipping is paid by you. We pay it if the item is faulty, damaged on delivery or not as described.",
        "An item returned incomplete or damaged may be refused, or refunded minus the cost of putting it right; we tell you before.",
      ],
    },
    {
      id: "garantie",
      title: "9. Warranties",
      paragraphs: [
        "Every phone has a 3-month shop warranty from delivery. It covers malfunctions. It doesn't cover damage from a fall, a knock, water or moisture, or a phone opened or repaired elsewhere. During the warranty we repair the phone or, if that isn't possible, exchange or refund it.",
        "New phones also have the maker's 1-year warranty.",
        "These warranties come on top of the legal warranty against hidden defects (articles 549 and following of the Dahir of obligations and contracts), which always applies.",
      ],
    },
    {
      id: "reclamations",
      title: "10. Questions and complaints",
      paragraphs: [
        "For any question or complaint, message us on WhatsApp, call us or come to the shop, with your order reference. We always look for an amicable solution first.",
      ],
    },
    {
      id: "donnees",
      title: "11. Your personal data",
      paragraphs: [
        "We use your name, phone, address and, where relevant, your advance receipt only to handle and deliver your order and provide the warranty. They are passed to the courier (Ameex) for delivery, and are never sold or given away.",
        "Under law no. 09-08, you can ask to see, correct or delete your data by contacting us.",
      ],
    },
    {
      id: "droit",
      title: "12. Applicable law",
      paragraphs: [
        "These terms are governed by Moroccan law. In a dispute, if no amicable agreement is found, the competent Moroccan courts may hear it.",
      ],
    },
  ],
  contactCta: "A question? Message us on WhatsApp",
};
