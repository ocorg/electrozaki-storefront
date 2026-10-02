// Text of the iPhone 13 offer page — French (source; the other languages
// are typed against it). `form` is handed to the order panel in the
// browser, so it holds plain strings only: "{x}" marks a value filled in
// there. The rest stays on the server.
//
// Apple figures are the iPhone 13's official specifications.

export const fr = {
  meta: {
    title: "iPhone 13 128 Go très bon état - verre trempé et coque offerts",
    description:
      "iPhone 13 128 Go en très bon état à Meknès : batterie vérifiée et affichée, pièces d'origine, garantie 3 mois. Verre trempé et coque offerts, livraison partout au Maroc.",
  },

  hero: {
    eyebrow: "Offre Electro Zaki · Stock à Meknès",
    title: "iPhone 13",
    subtitle: "128 Go · Très bon état",
    lead: "Le format idéal, la puce A15 Bionic et une double caméra qui n'a rien perdu de sa superbe. Chaque téléphone est vérifié, sa batterie est mesurée et affichée avant que vous le choisissiez.",
    priceLabel: "Prix de l'offre",
    instead: "au lieu de",
    gifts: ["Verre trempé offert", "Coque offerte"],
    cta: "Commander maintenant",
    trust: ["Batterie {min} % et plus", "Pièces d'origine", "Garantie 3 mois", "Livraison partout au Maroc"],
  },

  // Order panel (client). Plain strings; "{x}" = a value filled in there.
  form: {
    title: "Votre iPhone 13",
    included: "Offert avec votre iPhone",
    includedItems: { case: "Coque transparente", glass: "Verre trempé" },
    free: "Offert",
    addons: "À ajouter si vous voulez",
    addonsHint: "Le chargeur n'est pas fourni avec l'iPhone.",
    addonItems: {
      charger25: { title: "Chargeur rapide Apple 25W", hint: "Tête USB-C + câble Lightning" },
      cable: { title: "Câble USB-C vers Lightning", hint: "1 mètre" },
      head20: { title: "Tête de charge Apple 20W", hint: "Originale" },
      sticky: { title: "Sticky pad double face", hint: "Colle le téléphone à un miroir, une vitre…" },
    },
    add: "Ajouter",
    added: "Ajouté",
    contact: "Vos coordonnées",
    fullName: "Nom complet",
    phone: "Téléphone (ex : 06XXXXXXXX)",
    summary: "Récapitulatif",
    phoneLine: "iPhone 13 128 Go",
    giftsLine: "Coque + verre trempé",
    delivery: "Livraison",
    deliveryPending: "choisissez votre ville",
    total: "Total",
    advanceTitle: "Avance de 300 DH pour confirmer",
    advanceText:
      "Pour réserver votre téléphone, une avance de 300 DH est demandée avant l'expédition. Le reste ({rest}) se paie à la livraison.",
    callNote: "Après votre commande, nous vous appelons pour confirmer l'adresse exacte et vous donner les détails pour l'avance.",
    submit: "Confirmer ma commande",
    sending: "Envoi…",
    failed: "Envoi impossible. Vérifiez votre connexion et réessayez.",
    consent: "En confirmant, vous acceptez qu'Electro Zaki vous appelle pour finaliser la commande.",
    needUnit: "Choisissez votre iPhone ci-dessus",
    needCity: "Choisissez votre ville de livraison",
    successTitle: "Commande reçue, merci !",
    successRef: "Référence : {ref}",
    successText: "Nous vous appelons très vite au {phone} pour confirmer la commande, l'adresse et l'avance de 300 DH.",
    successSteps: ["Appel de confirmation", "Avance de 300 DH", "Expédition et paiement du reste à la livraison"],
    whatsapp: "Continuer sur WhatsApp",
    soldOutTitle: "Tous les iPhone 13 de l'offre sont partis",
    soldOutText: "De nouveaux arrivent régulièrement. Écrivez-nous sur WhatsApp, on vous prévient.",
  },

  stockOut: {
    title: "Cette offre est terminée",
    text: "Les iPhone 13 de cette offre ont tous trouvé preneur. D'autres téléphones vous attendent en boutique.",
    cta: "Voir les téléphones",
  },

  why: {
    eyebrow: "Pourquoi l'iPhone 13",
    title: "Le bon iPhone, au bon prix.",
    intro:
      "Puissant, compact et toujours à jour : l'iPhone 13 garde tout ce qui compte au quotidien, pour une fraction du prix d'un modèle récent.",
    cards: [
      {
        title: "Puce A15 Bionic",
        text: "Processeur 6 cœurs et GPU 4 cœurs : applis, jeux, photos et réseaux sociaux tournent sans effort, encore aujourd'hui.",
      },
      {
        title: "Double caméra 12 Mpx",
        text: "Grand-angle avec stabilisation par déplacement du capteur, ultra grand-angle, mode Nuit et mode Cinématique en vidéo.",
      },
      {
        title: "Écran Super Retina XDR",
        text: "OLED 6,1 pouces, noirs profonds et couleurs fidèles, lisible même en plein soleil (jusqu'à 1 200 nits en HDR).",
      },
      {
        title: "Autonomie d'une journée",
        text: "Jusqu'à 19 h de lecture vidéo d'origine, et la charge rapide : 50 % en 30 minutes avec un chargeur 20W ou plus.",
      },
      {
        title: "Solide et étanche",
        text: "Face avant Ceramic Shield et certification IP68 : il résiste à l'eau (6 m pendant 30 min) et à la poussière.",
      },
      {
        title: "5G, MagSafe, Face ID",
        text: "Réseau 5G, eSIM, recharge MagSafe et Face ID. Compatible avec les dernières versions d'iOS.",
      },
    ],
  },

  battery: {
    eyebrow: "La batterie, sans surprise",
    title: "Vous voyez la santé de la batterie avant de choisir.",
    text: "Chaque iPhone de l'offre affiche sa santé de batterie mesurée (Réglages > Batterie > État de la batterie). Au-dessus de 80 %, Apple considère la batterie en bon état : à {min} % et plus, vous gardez l'essentiel de l'autonomie d'origine.",
    points: ["Pourcentage exact affiché pour chaque téléphone", "Batteries d'origine, jamais remplacées", "Pièces d'origine : écran, caméras, Face ID"],
  },

  specs: {
    eyebrow: "Fiche technique",
    title: "Tout sur l'iPhone 13.",
    rows: [
      ["Écran", "6,1 pouces Super Retina XDR OLED, 2532 × 1170 px, 460 ppp, 800 nits (1 200 nits en HDR)"],
      ["Puce", "A15 Bionic : CPU 6 cœurs, GPU 4 cœurs, Neural Engine 16 cœurs"],
      ["Stockage", "128 Go"],
      ["Caméras arrière", "Double 12 Mpx : grand-angle ƒ/1.6 avec stabilisation par déplacement du capteur, ultra grand-angle ƒ/2.4 (120°)"],
      ["Photo", "Mode Nuit, Smart HDR 4, Styles photographiques, Deep Fusion"],
      ["Vidéo", "4K jusqu'à 60 i/s, mode Cinématique, Dolby Vision HDR"],
      ["Caméra avant", "12 Mpx TrueDepth, Face ID"],
      ["Batterie", "3 227 mAh, jusqu'à 19 h de lecture vidéo"],
      ["Charge", "Rapide (50 % en 30 min, 20W ou plus), MagSafe jusqu'à 15W, Qi 7,5W, port Lightning"],
      ["Résistance", "IP68 (6 m pendant 30 min), Ceramic Shield"],
      ["Réseau", "5G, Wi-Fi 6, Bluetooth 5.0, NFC"],
      ["SIM", "Nano-SIM + eSIM"],
      ["Dimensions", "146,7 × 71,5 × 7,65 mm, 173 g"],
    ] as [string, string][],
  },

  box: {
    eyebrow: "Dans votre colis",
    title: "Ce que vous recevez.",
    items: ["iPhone 13 128 Go, vérifié par nos techniciens", "Coque transparente (offerte)", "Verre trempé (offert)"],
    note: "Le chargeur n'est pas inclus : ajoutez-le à votre commande si besoin.",
  },

  checks: {
    eyebrow: "Vérifié par nos techniciens",
    title: "Contrôlé avant la vente.",
    items: ["Santé de la batterie", "Écran et tactile", "Face ID", "Caméras avant et arrière", "Haut-parleurs et micros", "Réseau, Wi-Fi et Bluetooth"],
  },

  steps: {
    eyebrow: "Comment ça se passe",
    title: "Commander en 4 étapes.",
    items: [
      { title: "Vous commandez", text: "Choisissez votre iPhone, votre ville, et laissez votre nom et votre numéro." },
      { title: "On vous appelle", text: "Nous confirmons la commande et l'adresse exacte de livraison." },
      { title: "Avance de 300 DH", text: "Elle réserve votre téléphone avant l'expédition." },
      { title: "Livraison", text: "Vous recevez votre iPhone et payez le reste à la livraison." },
    ],
  },

  faq: {
    eyebrow: "Questions fréquentes",
    title: "Vous vous demandez…",
    items: [
      {
        q: "Pourquoi une avance de 300 DH ?",
        a: "Elle réserve votre téléphone et couvre les frais d'expédition. Le reste du montant se paie à la livraison. Les détails pour la régler vous sont donnés lors de l'appel de confirmation.",
      },
      {
        q: "Quand vais-je recevoir mon iPhone ?",
        a: "Après l'appel de confirmation et la réception de l'avance, il part avec Ameex : en général 24 à 30 h après l'enlèvement. La date estimée s'affiche dès que vous choisissez votre ville.",
      },
      {
        q: "La batterie affichée est-elle la vraie ?",
        a: "Oui. C'est la santé mesurée par l'iPhone lui-même (Réglages > Batterie > État de la batterie), relevée sur chaque téléphone. Vous choisissez le téléphone exact que vous recevez.",
      },
      {
        q: "Le chargeur est-il fourni ?",
        a: "Non, l'iPhone est livré avec une coque et un verre trempé offerts, sans chargeur. Vous pouvez ajouter un chargeur Apple ou un câble Lightning dans le formulaire.",
      },
      {
        q: "Le téléphone est-il garanti ?",
        a: "Oui, il est garanti 3 mois. Les conditions de la garantie vous sont précisées lors de l'appel de confirmation.",
      },
      {
        q: "Puis-je le voir en boutique ?",
        a: "Bien sûr. Passez à notre boutique de Meknès, ou écrivez-nous sur WhatsApp pour réserver un modèle avant de venir.",
      },
    ],
  },

  final: {
    title: "Votre iPhone 13 vous attend.",
    text: "Verre trempé et coque offerts, batterie affichée, garantie 3 mois.",
    cta: "Commander maintenant",
  },
};

export type OfferCopy = typeof fr;
export type OfferFormCopy = OfferCopy["form"];
