import type { OfferCopy } from "./fr";

// Text of the phone offer pages — English.
export const en: OfferCopy = {
  meta: {
    title: (name: string, from: string) => `${name} on promo from ${from}`,
    description: (name: string, from: string) =>
      `${name} checked by our technicians in Meknes, on promo from ${from}. You choose the exact phone you receive, warranty included, delivery anywhere in Morocco.`,
  },

  hero: {
    eyebrow: "Electro Zaki promo · In stock in Meknes",
    priceLabel: "Promo price",
    instead: "instead of",
    cta: "Order now",
    lead: (name: string, battery: boolean) =>
      `The ${name} at a promo price. Every phone is checked${battery ? ", its battery health measured and shown" : ""}, and you choose the exact one you receive.`,
    trustBattery: "Battery {min}% and up",
    trust: ["Checked before sale", "Warranty included", "Delivery anywhere in Morocco"],
  },

  form: (name: string) => ({
    title: `Your ${name}`,
    grade: "Condition",
    storage: "Storage",
    all: "All",
    addons: "Add if you like",
    addonsHint: "The phone doesn't come with a charger.",
    add: "Add",
    added: "Added",
    contact: "Your details",
    fullName: "Full name",
    phone: "Phone (e.g. 06XXXXXXXX)",
    summary: "Summary",
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
    needUnit: "Choose your phone above",
    needCity: "Choose your delivery town",
    successTitle: "Order received, thank you!",
    successRef: "Reference: {ref}",
    successText: "We'll call you very soon on {phone} to confirm the order, the address and the 300 DH deposit.",
    successSteps: ["Confirmation call", "300 DH deposit", "Shipping, rest paid on delivery"],
    whatsapp: "Continue on WhatsApp",
    soldOutTitle: `All the ${name}s on promo are gone`,
    soldOutText: "New ones come in regularly. Message us on WhatsApp and we'll let you know.",
  }),

  stockOut: {
    title: "This promo has ended",
    text: (name: string) => `Every ${name} on promo has found a home. Other phones are waiting for you in the shop.`,
    cta: "See the phones",
  },

  why: {
    eyebrow: (name: string) => `Why the ${name}`,
    title: "The right phone, at the right price.",
    intro: (name: string) => `The ${name} keeps everything that matters day to day, for a fraction of the price of a new model.`,
    chip: "Apps, games, photos and social media run effortlessly, even today.",
    display: "True colours and deep blacks, readable even in bright sun.",
    camera: "Sharp photos by day and by night, and stabilised video.",
    batteryTitle: (hours: number) => `Up to ${hours} h of video`,
    battery: "The original battery life announced by the maker, with fast charging.",
    durability: "It handles water and dust, with toughened glass.",
    extra: "The features that make a difference every day.",
  },

  battery: {
    eyebrow: "The battery, no surprises",
    title: "You see the battery health before you choose.",
    text: "Every iPhone on promo shows its measured battery health (Settings > Battery > Battery Health). At 80% and up a battery is in good shape: here, every phone is at {min}% or more.",
    textAny: "Every iPhone on promo shows its measured battery health (Settings > Battery > Battery Health). At 80% and up a battery is in good shape; below that, a replacement is advised.",
    points: ["Exact percentage shown for each phone", "Every replaced part is listed", "You choose the exact phone you receive"],
  },

  specs: {
    eyebrow: "Specifications",
    title: (name: string) => `Everything about the ${name}.`,
    labels: {
      display: "Display",
      chip: "Processor",
      storage: "Storage",
      ram: "Memory (RAM)",
      rearCameras: "Rear cameras",
      frontCamera: "Front camera",
      battery: "Battery",
      charging: "Charging",
      durability: "Durability",
      network: "Connectivity",
      sim: "SIM",
      size: "Size and weight",
    },
  },

  box: {
    eyebrow: "In your parcel",
    title: "What you get.",
    phone: (name: string) => `${name}, checked by our technicians`,
    note: "No charger included.",
  },

  checks: {
    eyebrow: "Checked by our technicians",
    title: "Tested before it's sold.",
    items: (iphone: boolean) => [
      "Battery health",
      "Screen and touch",
      iphone ? "Face ID" : "Fingerprint and unlock",
      "Front and rear cameras",
      "Speakers and mics",
      "Network, Wi-Fi and Bluetooth",
    ],
  },

  steps: {
    eyebrow: "How it works",
    title: "Order in 4 steps.",
    items: [
      { title: "You order", text: "Pick your phone and your town, and leave your name and number." },
      { title: "We call you", text: "We confirm the order and the exact delivery address." },
      { title: "300 DH deposit", text: "It reserves your phone before shipping." },
      { title: "Delivery", text: "You receive your phone and pay the rest on delivery." },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "You may be wondering…",
    advance: {
      q: "Why a 300 DH deposit?",
      a: "It reserves your phone and covers shipping costs. The rest is paid on delivery. How to pay it is explained during the confirmation call.",
    },
    when: {
      q: "When will I get my phone?",
      a: "After the confirmation call and the deposit, it ships with Ameex: usually 24 to 30 h after pickup. The estimated date shows as soon as you pick your town.",
    },
    battery: {
      q: "Is the battery shown the real one?",
      a: "Yes. It's the health measured by the iPhone itself (Settings > Battery > Battery Health), read on each phone. You choose the exact phone you receive.",
    },
    grades: { q: "What do the conditions mean?" },
    charger: {
      q: "Is a charger included?",
      a: "No, the phone comes without a charger. If you need one, tell us during the confirmation call.",
    },
    warranty: {
      q: "Is the phone under warranty?",
      a: "Yes, a warranty is included. Its terms are explained during the confirmation call.",
    },
    shop: {
      q: "Can I see it in the shop?",
      a: "Of course. Visit our shop in Meknes, or message us on WhatsApp to hold a phone before you come.",
    },
  },

  card: {
    title: (name: string) => `${name} on promo`,
    teaser: (saving: string) => `Up to ${saving} off, warranty included`,
    bar: (name: string, price: string) => `${name} promo: from ${price}`,
    banner: (name: string, price: string) => `${name} on promo from ${price}: every phone of the promo on one page.`,
    cta: "See the promo",
  },

  final: {
    title: (name: string) => `Your ${name} is waiting.`,
    text: "Checked by our technicians, warranty included, delivery anywhere in Morocco.",
    cta: "Order now",
  },
};
