import type { OfferCopy } from "./fr";

// Text of the iPhone 13 offer page — Darija (Latin letters + numbers).
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const darija: OfferCopy = {
  meta: {
    title: (gifts: string | null) => `iPhone 13 128GB 7ala mzyana bzzaf${gifts ? ` - ${gifts} cadeau` : ""}`,
    description: (gifts: string | null) =>
      `iPhone 13 128GB f 7ala mzyana bzzaf f Mknas: batterie mchoufa w bayna, pièces d'origine, garantie 3 chhour. ${
        gifts ? `${cap(gifts)} cadeau, livraison` : "Livraison"
      } l ga3 lmghrib.`,
  },

  hero: {
    eyebrow: "Offre Electro Zaki · Kayn f Mknas",
    title: "iPhone 13",
    subtitle: "128GB · 7ala mzyana bzzaf",
    lead: "L 7ajm li ki3jbek, puce A15 Bionic w double caméra mazal katsawer mzyan. Kol téléphone mchouf, w sa7t l batterie dyalo m9iyssa w bayna 9bel ma tkhtaro.",
    priceLabel: "Prix dyal l offre",
    instead: "f blast",
    giftBadge: "Cadeau: {item}",
    cta: "Commandi daba",
    trust: ["Batterie {min}% w ktar", "Pièces d'origine", "Garantie 3 chhour", "Livraison l ga3 lmghrib"],
  },

  form: {
    title: "iPhone 13 dyalek",
    included: "Cadeau m3a iPhone dyalek",
    items: {
      "iphone-transparent": { title: "Coque transparente" },
      crystale: { title: "Verre trempé" },
      "apple-c-l-25w": { title: "Chargeur rapide Apple 25W", hint: "Tête USB-C + câble Lightning" },
      "apple-cable-c-l-1m": { title: "Câble USB-C l Lightning", hint: "1 mètre" },
      "apple-iphone-20w-originale": { title: "Tête de charge Apple 20W", hint: "Originale" },
      "mm-300df": { title: "Sticky pad double face", hint: "Kaylsse9 téléphone f l mraya, f zzaj…" },
    },
    free: "Fabor",
    addons: "Zid ila bghiti",
    addonsHint: "iPhone ma kayjich m3ah chargeur.",
    add: "Zid",
    added: "Tzad",
    contact: "Les coordonnées dyalek",
    fullName: "Smiya kamla",
    phone: "Téléphone (bhal: 06XXXXXXXX)",
    summary: "Résumé",
    phoneLine: "iPhone 13 128GB",
    delivery: "Livraison",
    deliveryPending: "khtar lmdina dyalek",
    total: "Total",
    advanceTitle: "3arboun dyal 300 DH bach tconfirmer",
    advanceText: "Bach n7jzo lik téléphone, khass 3arboun dyal 300 DH 9bel l expédition. Lba9i ({rest}) katkhllso mnin twslek.",
    callNote: "Men b3d l commande, kan3ayto lik bach nconfirmiw l'adresse b dbt w n3tiwk les détails dyal l3arboun.",
    submit: "Confirmer commande dyali",
    sending: "Kansifto…",
    failed: "Ma tsifetch. Chouf l connexion dyalek w 3awed.",
    consent: "Mnin katconfirmer, rak mwafe9 belli Electro Zaki y3ayet lik bach ykmmel l commande.",
    needUnit: "Khtar iPhone dyalek l fou9",
    needCity: "Khtar lmdina dyal livraison",
    successTitle: "Commande wslatna, choukran!",
    successRef: "Référence: {ref}",
    successText: "Ghadi n3ayto lik dghya f {phone} bach nconfirmiw l commande, l'adresse w l3arboun dyal 300 DH.",
    successSteps: ["Appel dyal confirmation", "3arboun dyal 300 DH", "Expédition w khlles lba9i mnin twslek"],
    whatsapp: "Kmmel f WhatsApp",
    soldOutTitle: "Ga3 les iPhone 13 dyal l offre salaw",
    soldOutText: "Kayjiw jdad dima. Kteb lina f WhatsApp w n3lmouk.",
  },

  stockOut: {
    title: "Had l offre salat",
    text: "Ga3 les iPhone 13 dyal had l offre tba3o. Kaynin tilifounat khrin kaytsennawk f l7anout.",
    cta: "Chouf tilifounat",
  },

  why: {
    eyebrow: "3lach iPhone 13",
    title: "L iPhone li mzyan, b l prix li mzyan.",
    intro: "9wi, sghir w mazal kaytl9a les mises à jour: iPhone 13 fih kolchi li khassek kol nhar, b prix rkhis bzzaf 3la modèle jdid.",
    cards: [
      {
        title: "Puce A15 Bionic",
        text: "Processeur 6 cœurs w GPU 4 cœurs: les applis, les jeux, tsawer w réseaux sociaux kaymchiw bla mouchkil 7ta lyouma.",
      },
      {
        title: "Double caméra 12 Mpx",
        text: "Grand-angle b stabilisation, ultra grand-angle, mode Nuit w mode Cinématique f l vidéo.",
      },
      {
        title: "Écran Super Retina XDR",
        text: "OLED 6,1 pouces, k7el ghame9 w couleurs s7a7, kayban mzyan 7ta f chems (7tal 1 200 nits f HDR).",
      },
      {
        title: "Batterie l nhar kamel",
        text: "7tal 19 sa3a d vidéo mnin kan jdid, w charge rapide: 50% f 30 d9i9a b chargeur 20W wla ktar.",
      },
      {
        title: "9a7 w kay9awem l ma",
        text: "Ceramic Shield l9ddam w IP68: kay9awem l ma (6 m 30 d9i9a) w l ghbra.",
      },
      {
        title: "5G, MagSafe, Face ID",
        text: "Réseau 5G, eSIM, charge MagSafe w Face ID. Kaymchi m3a akher versions dyal iOS.",
      },
    ],
  },

  battery: {
    eyebrow: "Batterie bla mfaj2at",
    title: "Katchouf sa7t l batterie 9bel ma tkhtar.",
    text: "Kol iPhone f had l offre kaybayen sa7t l batterie dyalo m9iyssa (Réglages > Batterie > État de la batterie). Fou9 80%, Apple kat3tabar batterie mzyana: b {min}% w ktar, katb9a 3ndek ktar l autonomie d'origine.",
    points: ["L pourcentage b dbt bayn l kol téléphone", "Batteries d'origine, 3emmerha ma tbeddlat", "Pièces d'origine: l'écran, caméras, Face ID"],
  },

  specs: {
    eyebrow: "Fiche technique",
    title: "Kolchi 3la iPhone 13.",
    rows: [
      ["L'écran", "6,1 pouces Super Retina XDR OLED, 2532 × 1170 px, 460 ppp, 800 nits (1 200 nits f HDR)"],
      ["Puce", "A15 Bionic: CPU 6 cœurs, GPU 4 cœurs, Neural Engine 16 cœurs"],
      ["Stockage", "128GB"],
      ["Caméras l lor", "Double 12 Mpx: grand-angle ƒ/1.6 b stabilisation, ultra grand-angle ƒ/2.4 (120°)"],
      ["Tsawer", "Mode Nuit, Smart HDR 4, Styles photographiques, Deep Fusion"],
      ["Vidéo", "4K 7tal 60 i/s, mode Cinématique, Dolby Vision HDR"],
      ["Caméra l9ddam", "12 Mpx TrueDepth, Face ID"],
      ["Batterie", "3 227 mAh, 7tal 19 sa3a d vidéo"],
      ["Charge", "Rapide (50% f 30 d9i9a, 20W wla ktar), MagSafe 7tal 15W, Qi 7,5W, port Lightning"],
      ["Résistance", "IP68 (6 m 30 d9i9a), Ceramic Shield"],
      ["Réseau", "5G, Wi-Fi 6, Bluetooth 5.0, NFC"],
      ["SIM", "Nano-SIM + eSIM"],
      ["L 7ajm", "146,7 × 71,5 × 7,65 mm, 173 g"],
    ],
  },

  box: {
    eyebrow: "F l colis dyalek",
    title: "Chno ghadi twslek.",
    phone: "iPhone 13 128GB, mchouf mn 3nd les techniciens dyalna",
    gift: (item: string) => `${item} (cadeau)`,
    note: "Chargeur ma kaynch: zido l commande dyalek ila khassek.",
  },

  checks: {
    eyebrow: "Mchouf mn 3nd les techniciens dyalna",
    title: "Mtesti 9bel l bi3.",
    items: ["Sa7t l batterie", "L'écran w tactile", "Face ID", "Caméras l9ddam w l lor", "Haut-parleurs w micros", "Réseau, Wi-Fi w Bluetooth"],
  },

  steps: {
    eyebrow: "Kifach katdouz",
    title: "Commandi f 4 étapes.",
    items: [
      { title: "Katcommandi", text: "Khtar iPhone dyalek w lmdina, w khlli smiytek w r9mek." },
      { title: "Kan3ayto lik", text: "Kanconfirmiw l commande w l'adresse b dbt." },
      { title: "3arboun 300 DH", text: "Kay7jez lik téléphone 9bel l expédition." },
      { title: "Livraison", text: "Kaywslek iPhone dyalek w katkhlles lba9i mnin twslek." },
    ],
  },

  faq: {
    eyebrow: "Les questions",
    title: "Yemken katsawel…",
    items: [
      {
        q: "3lach 3arboun dyal 300 DH?",
        a: "Kay7jez lik téléphone w kaygetti masarif l expédition. Lba9i katkhllso mnin twslek. Kifach tkhllso kan9oulouh lik f l'appel dyal confirmation.",
      },
      {
        q: "Imta ghadi iwslni iPhone?",
        a: "Men b3d l'appel dyal confirmation w l3arboun, kaymchi m3a Ameex: ghaliban 24 l 30 sa3a men b3d ma yjiwh. Nhar l livraison kayban mnin tkhtar lmdina dyalek.",
      },
      {
        q: "Wach l batterie li bayna s7i7a?",
        a: "Ah. Hiya sa7t li kay9iss iPhone b rasso (Réglages > Batterie > État de la batterie), mchoufa f kol téléphone. Katkhtar nit téléphone li ghadi iwslek.",
      },
      {
        q: "Wach chargeur kayn m3ah?",
        a: "La, iPhone ma kayjich m3ah chargeur. T9der tzid chargeur Apple wla câble Lightning f l formulaire.",
      },
      {
        q: "Wach téléphone fih garantie?",
        a: "Ah, fih garantie dyal 3 chhour. Les conditions dyalha kan9oulouhom lik f l'appel dyal confirmation.",
      },
      {
        q: "Wach n9der nchoufo f l7anout?",
        a: "Akid. Dowz l l7anout dyalna f Mknas, wla kteb lina f WhatsApp bach n7jzo lik wa7ed 9bel ma tji.",
      },
    ],
  },

  card: {
    title: "iPhone 13 128GB",
    teaser: (gifts: string | null) => (gifts ? `${cap(gifts)} cadeau` : "7ala mzyana bzzaf, garantie 3 chhour"),
    bar: (price: string, gifts: string | null) => `Offre iPhone 13: ${price}${gifts ? `, ${gifts} cadeau` : ""}`,
    banner: (price: string, gifts: string | null) =>
      `Kayn f l offre b ${price}${gifts ? ` m3a ${gifts} cadeau` : ""}, garantie 3 chhour.`,
    cta: "Chouf l offre",
  },

  final: {
    title: "iPhone 13 dyalek kaytsennak.",
    text: (gifts: string | null) => `${gifts ? `${cap(gifts)} cadeau, b` : "B"}atterie bayna, garantie 3 chhour.`,
    cta: "Commandi daba",
  },
};
