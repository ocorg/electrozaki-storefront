import type { OfferCopy } from "./fr";

// Text of the phone offer pages — Darija (Latin letters + numbers).
export const darija: OfferCopy = {
  meta: {
    title: (name: string, from: string) => `${name} f promo men ${from}`,
    description: (name: string, from: string) =>
      `${name} mchouf mn 3nd les techniciens dyalna f Mknas, f promo men ${from}. Katkhtar nit téléphone li ghadi iwslek, garantie 3 chhour, livraison l ga3 lmghrib.`,
  },

  hero: {
    eyebrow: "Promo Electro Zaki · Kayn f Mknas",
    priceLabel: "Prix dyal promo",
    instead: "f blast",
    cta: "Commandi daba",
    lead: (name: string, battery: boolean) =>
      `${name} b prix promo. Kol téléphone mchouf${battery ? ", w sa7t l batterie dyalo m9iyssa w bayna" : ""}, w nta li katkhtar nit téléphone li ghadi iwslek.`,
    trustBattery: "Batterie {min}% w ktar",
    trust: ["Mchouf 9bel l bi3", "Garantie 3 chhour", "Livraison l ga3 lmghrib"],
  },

  form: (name: string) => ({
    model: "Modèle",
    title: `${name} dyalek`,
    grade: "L7ala",
    storage: "Stockage",
    all: "Kolchi",
    addons: "Zid ila bghiti",
    addonsHint: "Téléphone ma kayjich m3ah chargeur.",
    add: "Zid",
    added: "Tzad",
    contact: "Les coordonnées dyalek",
    fullName: "Smiya kamla",
    phone: "Téléphone (bhal: 06XXXXXXXX)",
    summary: "Résumé",
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
    needUnit: "Khtar téléphone dyalek l fou9",
    needCity: "Khtar lmdina dyal livraison",
    needName: "Kteb smitek kamla",
    needPhone: "Kteb nmrat t-téléphone dyalek",
    successTitle: "Commande wslatna, choukran!",
    successRef: "Référence: {ref}",
    successText: "Ghadi n3ayto lik dghya f {phone} bach nconfirmiw l commande, l'adresse w l3arboun dyal 300 DH.",
    successSteps: ["Appel dyal confirmation", "3arboun dyal 300 DH", "Expédition w khlles lba9i mnin twslek"],
    whatsapp: "Kmmel f WhatsApp",
    soldOutTitle: `Ga3 les ${name} dyal promo salaw`,
    soldOutText: "Kayjiw jdad dima. Kteb lina f WhatsApp w n3lmouk.",
  }),

  stockOut: {
    title: "Had promo salat",
    text: (name: string) => `Ga3 les ${name} dyal promo tba3o. Kaynin tilifounat khrin kaytsennawk f l7anout.`,
    cta: "Chouf tilifounat",
  },

  why: {
    eyebrow: (name: string) => `3lach ${name}`,
    title: "Téléphone li mzyan, b l prix li mzyan.",
    intro: (name: string) => `${name} fih kolchi li khassek kol nhar, b prix rkhis bzzaf 3la modèle jdid.`,
    chip: "Les applis, les jeux, tsawer w réseaux sociaux kaymchiw bla mouchkil 7ta lyouma.",
    display: "Couleurs s7a7 w k7el ghame9, kayban mzyan 7ta f chems.",
    camera: "Tsawer wad7in f nhar w f lil, w vidéo mstabla.",
    batteryTitle: (hours: number) => `7tal ${hours} sa3a d vidéo`,
    battery: "L'autonomie d'origine li 3lnat 3liha la marque, m3a charge rapide.",
    durability: "Kay9awem l ma w l ghbra, b zzaj m9wwi.",
    extra: "Les fonctions li katbeddel kol nhar.",
  },

  battery: {
    eyebrow: "Batterie bla mfaj2at",
    title: "Katchouf sa7t l batterie 9bel ma tkhtar.",
    text: "Kol iPhone f promo kaybayen sa7t l batterie dyalo m9iyssa (Réglages > Batterie > État de la batterie). Men 80% w ktar, l batterie mzyana: hna, kol téléphone f {min}% wla ktar.",
    textAny: "Kol iPhone f promo kaybayen sa7t l batterie dyalo m9iyssa (Réglages > Batterie > État de la batterie). Men 80% w ktar, l batterie mzyana; ta7t dik, mzyan tbeddelha.",
    points: ["L pourcentage b dbt bayn l kol téléphone", "Kol pièce tbeddlat mktouba", "Katkhtar nit téléphone li ghadi iwslek"],
  },

  specs: {
    eyebrow: "Fiche technique",
    title: (name: string) => `Kolchi 3la ${name}.`,
    labels: {
      display: "L'écran",
      chip: "Processeur",
      storage: "Stockage",
      ram: "RAM",
      rearCameras: "Caméras l lor",
      frontCamera: "Caméra l9ddam",
      battery: "Batterie",
      charging: "Charge",
      durability: "Résistance",
      network: "Réseau",
      sim: "SIM",
      size: "L 7ajm w l miziane",
      unlock: "Déverrouillage",
      sound: "Sout",
    },
    unlocks: {
      faceid: "Face ID (kay3ref wjhek b 3D)",
      ultrasonic: "Empreinte ta7t l'écran (ultrasons)",
      optical: "Empreinte ta7t l'écran",
      side: "Empreinte f l bouton jenbi",
      face: "Reconnaissance faciale",
    },
    stereo: "Haut-parleurs stéréo",
    video: (hours: number) => `7tal ${hours} sa3a d vidéo`,
  },

  box: {
    eyebrow: "F l colis dyalek",
    title: "Chno ghadi twslek.",
    phone: (name: string) => `${name}, mchouf mn 3nd les techniciens dyalna`,
    note: "Chargeur ma kaynch.",
  },

  steps: {
    eyebrow: "Kifach katdouz",
    title: "Commandi f 4 étapes.",
    items: [
      { title: "Katcommandi", text: "Khtar téléphone dyalek w lmdina, w khlli smiytek w r9mek." },
      { title: "Kan3ayto lik", text: "Kanconfirmiw l commande w l'adresse b dbt." },
      { title: "3arboun 300 DH", text: "Kay7jez lik téléphone 9bel l expédition." },
      { title: "Livraison", text: "Kaywslek téléphone dyalek w katkhlles lba9i mnin twslek." },
    ],
  },

  faq: {
    eyebrow: "Les questions",
    title: "Yemken katsawel…",
    advance: {
      q: "3lach 3arboun dyal 300 DH?",
      a: "Kay7jez lik téléphone w kaygetti masarif l expédition. Lba9i katkhllso mnin twslek. Kifach tkhllso kan9oulouh lik f l'appel dyal confirmation.",
    },
    when: {
      q: "Imta ghadi iwslni téléphone?",
      a: "Men b3d l'appel dyal confirmation w l3arboun, kaymchi m3a Ameex: ghaliban 24 l 30 sa3a men b3d ma yjiwh. Nhar l livraison kayban mnin tkhtar lmdina dyalek.",
    },
    battery: {
      q: "Wach l batterie li bayna s7i7a?",
      a: "Ah. Hiya sa7t li kay9iss iPhone b rasso (Réglages > Batterie > État de la batterie), mchoufa f kol téléphone. Katkhtar nit téléphone li ghadi iwslek.",
    },
    grades: { q: "Chno kat3ni les états?" },
    charger: {
      q: "Wach chargeur kayn m3ah?",
      a: "La, téléphone kayji bla chargeur. Ila khassek, 9olha lina f l'appel dyal confirmation.",
    },
    warranty: {
      q: "Wach téléphone fih garantie?",
      a: "Ah, kol téléphone fih garantie dyal 3 chhour. Les conditions dyalha kan9oulouhom lik f l'appel dyal confirmation.",
    },
    shop: {
      q: "Wach n9der nchoufo f l7anout?",
      a: "Akid. Dowz l l7anout dyalna f Mknas, wla kteb lina f WhatsApp bach n7jzo lik wa7ed 9bel ma tji.",
    },
  },

  card: {
    title: (name: string) => `${name} f promo`,
    teaser: (saving: string) => `7tal ${saving} na9sin, garantie 3 chhour`,
    bar: (name: string, price: string) => `Promo ${name}: men ${price}`,
    banner: (name: string, price: string) => `${name} f promo men ${price}`,
    cta: "Chouf promo",
  },

  brand: {
    metaTitle: (name: string, from: string) => `Promos ${name} men ${from}`,
    metaDescription: (name: string, from: string, n: number) =>
      `Ga3 les ${name} f promo 3nd Electro Zaki f Mknas, men ${from}: ${n} modèles, kol téléphone mchouf, garantie 3 chhour, livraison l ga3 lmghrib.`,
    eyebrow: "Promo Electro Zaki · Kayn f Mknas",
    title: (name: string) => `Promos ${name}`,
    lead: (name: string, n: number) =>
      `${n} modèles dyal ${name} f promo, f page wa7da. Khtar l modèle, l7ala w nit téléphone li ghadi iwslek: kol wa7ed mchouf mn 3nd les techniciens dyalna.`,
    modelsTitle: "Les modèles li f promo",
    modelsIntro: "Kol modèle 3ndo 7ta l page dyalo, b la fiche technique kamla.",
    phones: (n: number) => `${n} téléphone f promo`,
    from: "men",
    upTo: (saving: string) => `7tal ${saving} na9sin`,
    seeModel: "Chouf l modèle",
    cardTitle: (name: string) => `Ga3 les promos ${name}`,
    cardTeaser: (n: number) => `${n} modèles f promo f page wa7da`,
    finalTitle: (name: string) => `${name} dyalek f promo kaytsennak.`,
  },

  model: {
    metaTitle: (name: string, from: string, isNew: boolean) => `${name} ${isNew ? "jdid" : "mosta3mal"} f Mknas, men ${from}`,
    metaDescription: (name: string, from: string, isNew: boolean) =>
      isNew
        ? `${name} jdid kayn f Mknas men ${from}: msdoud, garantie 3 chhour, livraison l ga3 lmghrib.`
        : `${name} mosta3mal kayn f Mknas men ${from}: l7ala, l batterie w l pièces bayna l kol téléphone, garantie 3 chhour, livraison l ga3 lmghrib.`,
    eyebrow: "Electro Zaki · Kayn f Mknas",
    title: (name: string, isNew: boolean) => `${name} ${isNew ? "jdid" : "mosta3mal"}`,
    priceLabel: "Taman",
    lead: (name: string, battery: boolean) =>
      `Ga3 les ${name} li 3ndna f page wa7da. Kol téléphone mchouf${battery ? ", w s-sa7a dyal l batterie m9yassa w bayna" : ""}, w nta li katkhtar nit téléphone li ghadi iwslek.`,
    onPromo: "F promo daba",
  },

  final: {
    title: (name: string) => `${name} dyalek kaytsennak.`,
    text: "Mchouf mn 3nd les techniciens dyalna, garantie 3 chhour, livraison l ga3 lmghrib.",
    cta: "Commandi daba",
  },
};
