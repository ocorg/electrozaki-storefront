import type { OfferCopy } from "./fr";

// Text of the iPhone 13 offer page — English.
export const en: OfferCopy = {
  meta: {
    title: (gifts: string | null) => `iPhone 13 128GB very good condition${gifts ? ` - free ${gifts}` : ""}`,
    description: (gifts: string | null) =>
      `iPhone 13 128GB in very good condition in Meknes: battery checked and shown, original parts, 3-month warranty. ${
        gifts ? `Free ${gifts}, delivery` : "Delivery"
      } anywhere in Morocco.`,
  },

  hero: {
    eyebrow: "Electro Zaki offer · In stock in Meknes",
    title: "iPhone 13",
    subtitle: "128GB · Very good condition",
    lead: "The ideal size, the A15 Bionic chip and a dual camera that still impresses. Every phone is checked, and its battery is measured and shown before you pick it.",
    priceLabel: "Offer price",
    instead: "instead of",
    giftBadge: "Free: {item}",
    cta: "Order now",
    trust: ["Battery {min}% and up", "Original parts", "3-month warranty", "Delivery anywhere in Morocco"],
  },

  form: {
    title: "Your iPhone 13",
    included: "Free with your iPhone",
    items: {
      "iphone-transparent": { title: "Clear case" },
      crystale: { title: "Tempered glass" },
      "apple-c-l-25w": { title: "Apple 25W fast charger", hint: "USB-C head + Lightning cable" },
      "apple-cable-c-l-1m": { title: "USB-C to Lightning cable", hint: "1 metre" },
      "apple-iphone-20w-originale": { title: "Apple 20W charger head", hint: "Original" },
      "mm-300df": { title: "Double-sided sticky pad", hint: "Sticks your phone to a mirror, a window…" },
    },
    free: "Free",
    addons: "Add if you like",
    addonsHint: "The iPhone doesn't come with a charger.",
    add: "Add",
    added: "Added",
    contact: "Your details",
    fullName: "Full name",
    phone: "Phone (e.g. 06XXXXXXXX)",
    summary: "Summary",
    phoneLine: "iPhone 13 128GB",
    delivery: "Delivery",
    deliveryPending: "choose your town",
    total: "Total",
    advanceTitle: "300 DH deposit to confirm",
    advanceText: "To reserve your phone, a 300 DH deposit is needed before shipping. The rest ({rest}) is paid on delivery.",
    callNote: "After you order, we call you to confirm the exact address and give you the details for the deposit.",
    submit: "Confirm my order",
    sending: "Sending…",
    failed: "Couldn't send. Check your connection and try again.",
    consent: "By confirming, you agree that Electro Zaki will call you to finalise the order.",
    needUnit: "Choose your iPhone above",
    needCity: "Choose your delivery town",
    successTitle: "Order received, thank you!",
    successRef: "Reference: {ref}",
    successText: "We'll call you very soon on {phone} to confirm the order, the address and the 300 DH deposit.",
    successSteps: ["Confirmation call", "300 DH deposit", "Shipping, rest paid on delivery"],
    whatsapp: "Continue on WhatsApp",
    soldOutTitle: "All the iPhone 13s in this offer are gone",
    soldOutText: "New ones come in regularly. Message us on WhatsApp and we'll let you know.",
  },

  stockOut: {
    title: "This offer has ended",
    text: "Every iPhone 13 in this offer has found a home. Other phones are waiting for you in the shop.",
    cta: "See the phones",
  },

  why: {
    eyebrow: "Why the iPhone 13",
    title: "The right iPhone, at the right price.",
    intro:
      "Powerful, compact and still up to date: the iPhone 13 keeps everything that matters day to day, for a fraction of the price of a recent model.",
    cards: [
      {
        title: "A15 Bionic chip",
        text: "6-core processor and 4-core GPU: apps, games, photos and social media run effortlessly, even today.",
      },
      {
        title: "Dual 12MP camera",
        text: "Wide camera with sensor-shift stabilisation, ultra wide, Night mode and Cinematic mode for video.",
      },
      {
        title: "Super Retina XDR display",
        text: "6.1-inch OLED, deep blacks and true colours, readable even in bright sun (up to 1,200 nits in HDR).",
      },
      {
        title: "All-day battery",
        text: "Up to 19 h of video playback when new, plus fast charging: 50% in 30 minutes with a 20W charger or higher.",
      },
      {
        title: "Tough and water-resistant",
        text: "Ceramic Shield front and IP68 rating: it handles water (6 m for 30 min) and dust.",
      },
      {
        title: "5G, MagSafe, Face ID",
        text: "5G network, eSIM, MagSafe charging and Face ID. Runs the latest versions of iOS.",
      },
    ],
  },

  battery: {
    eyebrow: "The battery, no surprises",
    title: "You see the battery health before you choose.",
    text: "Every iPhone in this offer shows its measured battery health (Settings > Battery > Battery Health). Above 80%, Apple considers a battery in good shape: at {min}% and up, you keep most of the original battery life.",
    points: ["Exact percentage shown for each phone", "Original batteries, never replaced", "Original parts: screen, cameras, Face ID"],
  },

  specs: {
    eyebrow: "Specifications",
    title: "Everything about the iPhone 13.",
    rows: [
      ["Display", "6.1-inch Super Retina XDR OLED, 2532 × 1170 px, 460 ppi, 800 nits (1,200 nits HDR)"],
      ["Chip", "A15 Bionic: 6-core CPU, 4-core GPU, 16-core Neural Engine"],
      ["Storage", "128GB"],
      ["Rear cameras", "Dual 12MP: ƒ/1.6 wide with sensor-shift stabilisation, ƒ/2.4 ultra wide (120°)"],
      ["Photo", "Night mode, Smart HDR 4, Photographic Styles, Deep Fusion"],
      ["Video", "4K up to 60 fps, Cinematic mode, Dolby Vision HDR"],
      ["Front camera", "12MP TrueDepth, Face ID"],
      ["Battery", "3,227 mAh, up to 19 h of video playback"],
      ["Charging", "Fast (50% in 30 min, 20W or higher), MagSafe up to 15W, Qi 7.5W, Lightning port"],
      ["Durability", "IP68 (6 m for 30 min), Ceramic Shield"],
      ["Connectivity", "5G, Wi-Fi 6, Bluetooth 5.0, NFC"],
      ["SIM", "Nano-SIM + eSIM"],
      ["Size", "146.7 × 71.5 × 7.65 mm, 173 g"],
    ],
  },

  box: {
    eyebrow: "In your parcel",
    title: "What you get.",
    phone: "iPhone 13 128GB, checked by our technicians",
    gift: (item: string) => `${item} (free)`,
    note: "No charger included: add one to your order if you need it.",
  },

  checks: {
    eyebrow: "Checked by our technicians",
    title: "Tested before it's sold.",
    items: ["Battery health", "Screen and touch", "Face ID", "Front and rear cameras", "Speakers and mics", "Network, Wi-Fi and Bluetooth"],
  },

  steps: {
    eyebrow: "How it works",
    title: "Order in 4 steps.",
    items: [
      { title: "You order", text: "Pick your iPhone and your town, and leave your name and number." },
      { title: "We call you", text: "We confirm the order and the exact delivery address." },
      { title: "300 DH deposit", text: "It reserves your phone before shipping." },
      { title: "Delivery", text: "You receive your iPhone and pay the rest on delivery." },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "You may be wondering…",
    items: [
      {
        q: "Why a 300 DH deposit?",
        a: "It reserves your phone and covers shipping costs. The rest is paid on delivery. How to pay it is explained during the confirmation call.",
      },
      {
        q: "When will I get my iPhone?",
        a: "After the confirmation call and the deposit, it ships with Ameex: usually 24 to 30 h after pickup. The estimated date shows as soon as you pick your town.",
      },
      {
        q: "Is the battery shown the real one?",
        a: "Yes. It's the health measured by the iPhone itself (Settings > Battery > Battery Health), read on each phone. You choose the exact phone you receive.",
      },
      {
        q: "Is a charger included?",
        a: "No, the iPhone doesn't come with a charger. You can add an Apple charger or a Lightning cable in the form.",
      },
      {
        q: "Is the phone under warranty?",
        a: "Yes, it comes with a 3-month warranty. Its terms are explained during the confirmation call.",
      },
      {
        q: "Can I see it in the shop?",
        a: "Of course. Visit our shop in Meknes, or message us on WhatsApp to hold a phone before you come.",
      },
    ],
  },

  card: {
    title: "iPhone 13 128GB",
    teaser: (gifts: string | null) => (gifts ? `Free ${gifts}` : "Very good condition, 3-month warranty"),
    bar: (price: string, gifts: string | null) => `iPhone 13 offer: ${price}${gifts ? `, free ${gifts}` : ""}`,
    banner: (price: string, gifts: string | null) =>
      `On offer at ${price}${gifts ? ` with free ${gifts}` : ""}, 3-month warranty.`,
    cta: "See the offer",
  },

  final: {
    title: "Your iPhone 13 is waiting.",
    text: (gifts: string | null) => `${gifts ? `Free ${gifts}, b` : "B"}attery shown, 3-month warranty.`,
    cta: "Order now",
  },
};
