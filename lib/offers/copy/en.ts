import type { OfferCopy } from "./fr";
import { DESC_MAX, TITLE_MAX, fit } from "@/lib/seo-fit";

// Text of the phone offer pages — English.
export const en: OfferCopy = {
  meta: {
    title: (name: string, from: string) => `${name} on promo from ${from}`,
    description: (name: string, from: string) =>
      fit(
        DESC_MAX,
        `${name} checked by our technicians in Meknes, on promo from ${from}. You choose the exact phone you receive, 3-month warranty, delivery anywhere in Morocco.`,
        `${name} checked in Meknes, on promo from ${from}. You choose the exact phone, 3-month warranty, delivery across Morocco.`
      ),
  },

  hero: {
    eyebrow: "Electro Zaki promo · In stock in Meknes",
    priceLabel: "Promo price",
    instead: "instead of",
    cta: "Order now",
    lead: (name: string, battery: boolean) =>
      `The ${name} at a promo price. Every phone is checked${battery ? ", its battery health measured and shown" : ""}, and you choose the exact one you receive.`,
    trustBattery: "Battery {min}% and up",
    trust: ["Checked before sale", "3-month warranty", "Delivery anywhere in Morocco"],
  },

  form: (name: string) => ({
    model: "Model",
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
    needName: "Enter your full name",
    needPhone: "Enter your phone number",
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
      unlock: "Unlock",
      sound: "Sound",
    },
    unlocks: {
      faceid: "Face ID (3D face recognition)",
      ultrasonic: "In-display fingerprint (ultrasonic)",
      optical: "In-display fingerprint",
      side: "Fingerprint on the side button",
      face: "Face recognition",
    },
    stereo: "Stereo speakers",
    video: (hours: number) => `up to ${hours} h of video`,
  },

  box: {
    eyebrow: "In your parcel",
    title: "What you get.",
    phone: (name: string) => `${name}, checked by our technicians`,
    note: "No charger included.",
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
      a: "Yes: 3 months for a used phone, 12 months for a new one. It covers faults in normal use (not breakage or water). If you live outside Meknès, shipping for a covered fault is on us. Everything is in our terms of sale.",
    },
    shop: {
      q: "Can I see it in the shop?",
      a: "Of course. Visit our shop in Meknes, or message us on WhatsApp to hold a phone before you come.",
    },
  },

  card: {
    title: (name: string) => `${name} on promo`,
    teaser: (saving: string) => `Up to ${saving} off, 3-month warranty`,
    bar: (name: string, price: string) => `${name} promo: from ${price}`,
    banner: (name: string, price: string) => `${name} on promo from ${price}`,
    cta: "See the promo",
  },

  brand: {
    metaTitle: (name: string, from: string) => `${name} deals from ${from}`,
    metaDescription: (name: string, from: string, n: number) =>
      fit(
        DESC_MAX,
        `Every ${name} on promo at Electro Zaki in Meknes, from ${from}: ${n} models, every phone checked, 3-month warranty, delivery anywhere in Morocco.`,
        `Every ${name} on promo in Meknes from ${from}: ${n} checked models, 3-month warranty, delivery across Morocco.`
      ),
    eyebrow: "Electro Zaki promo · In stock in Meknes",
    title: (name: string) => `${name} deals`,
    lead: (name: string, n: number) =>
      `${n} ${name} models on promo, on one page. Choose the model, the condition and the exact phone you receive: each one is checked by our technicians.`,
    modelsTitle: "The models on promo",
    modelsIntro: "Each model also has its own page, with its full specifications.",
    phones: (n: number) => `${n} phone${n > 1 ? "s" : ""} on promo`,
    from: "from",
    upTo: (saving: string) => `up to ${saving} off`,
    seeModel: "See the model",
    cardTitle: (name: string) => `All ${name} deals`,
    cardTeaser: (n: number) => `${n} models on promo on one page`,
    finalTitle: (name: string) => `Your ${name} on promo is waiting.`,
  },

  model: {
    metaTitle: (name: string, from: string, isNew: boolean) => {
      const kind = isNew ? "New" : "Used";
      return fit(TITLE_MAX, `${kind} ${name} in Meknes, from ${from}`, `${kind} ${name} in Meknes from ${from}`, `${kind} ${name}, from ${from}`);
    },
    metaDescription: (name: string, from: string, isNew: boolean) =>
      isNew
        ? `New ${name} in stock in Meknes from ${from}: sealed, 12-month warranty, delivery anywhere in Morocco.`
        : fit(
            DESC_MAX,
            `Used ${name} in stock in Meknes from ${from}: condition, battery and parts shown for every phone, 3-month warranty, delivery anywhere in Morocco.`,
            `Used ${name} in stock in Meknes from ${from}: condition, battery and parts shown, 3-month warranty, delivery across Morocco.`,
            `Used ${name} from ${from}: battery and parts shown, 3-month warranty, delivery across Morocco.`
          ),
    eyebrow: "Electro Zaki · In stock in Meknes",
    title: (name: string, isNew: boolean) => `${isNew ? "New" : "Used"} ${name}`,
    priceLabel: "Price",
    lead: (name: string, battery: boolean) =>
      `All our ${name} in stock, on one page. Every phone is checked${battery ? ", its battery health measured and shown" : ""}, and you choose the exact phone you receive.`,
    onPromo: "On promo right now",
  },

  final: {
    title: (name: string) => `Your ${name} is waiting.`,
    text: "Checked by our technicians, 3-month warranty, delivery anywhere in Morocco.",
    cta: "Order now",
  },
};
