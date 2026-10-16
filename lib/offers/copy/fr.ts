// Text of the phone offer pages (/offres/<model>) — French (source; the
// other languages are typed against it). `form` is handed to the order panel
// in the browser, so it returns plain strings only: "{x}" marks a value
// filled in there. The rest stays on the server.

export const fr = {
  meta: {
    title: (name: string, from: string) => `${name} en promo dès ${from}`,
    description: (name: string, from: string) =>
      `${name} vérifié par nos techniciens à Meknès, en promo dès ${from}. Vous choisissez le téléphone exact que vous recevez, garantie 3 mois, livraison partout au Maroc.`,
  },

  hero: {
    eyebrow: "Promo Electro Zaki · Stock à Meknès",
    priceLabel: "Prix promo",
    instead: "au lieu de",
    cta: "Commander maintenant",
    lead: (name: string, battery: boolean) =>
      `Le ${name} à prix promo. Chaque téléphone est vérifié${battery ? ", sa santé de batterie est mesurée et affichée" : ""}, et vous choisissez l'exemplaire exact que vous recevez.`,
    trustBattery: "Batterie {min} % et plus",
    trust: ["Vérifié avant la vente", "Garantie 3 mois", "Livraison partout au Maroc"],
  },

  // Order panel (client). Plain strings; "{x}" = a value filled in there.
  form: (name: string) => ({
    title: `Votre ${name}`,
    grade: "État",
    storage: "Stockage",
    all: "Tous",
    addons: "À ajouter si vous voulez",
    addonsHint: "Le chargeur n'est pas fourni avec le téléphone.",
    add: "Ajouter",
    added: "Ajouté",
    contact: "Vos coordonnées",
    fullName: "Nom complet",
    phone: "Téléphone (ex : 06XXXXXXXX)",
    summary: "Récapitulatif",
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
    needUnit: "Choisissez votre téléphone ci-dessus",
    needCity: "Choisissez votre ville de livraison",
    successTitle: "Commande reçue, merci !",
    successRef: "Référence : {ref}",
    successText: "Nous vous appelons très vite au {phone} pour confirmer la commande, l'adresse et l'avance de 300 DH.",
    successSteps: ["Appel de confirmation", "Avance de 300 DH", "Expédition et paiement du reste à la livraison"],
    whatsapp: "Continuer sur WhatsApp",
    soldOutTitle: `Tous les ${name} en promo sont partis`,
    soldOutText: "De nouveaux arrivent régulièrement. Écrivez-nous sur WhatsApp, on vous prévient.",
  }),

  stockOut: {
    title: "Cette promo est terminée",
    text: (name: string) => `Les ${name} en promo ont tous trouvé preneur. D'autres téléphones vous attendent en boutique.`,
    cta: "Voir les téléphones",
  },

  why: {
    eyebrow: (name: string) => `Pourquoi le ${name}`,
    title: "Le bon téléphone, au bon prix.",
    intro: (name: string) =>
      `Le ${name} garde tout ce qui compte au quotidien, pour une fraction du prix d'un modèle neuf.`,
    chip: "Applis, jeux, photos et réseaux sociaux tournent sans effort, encore aujourd'hui.",
    display: "Des couleurs fidèles et des noirs profonds, lisible même en plein soleil.",
    camera: "Des photos nettes de jour comme de nuit, et des vidéos stabilisées.",
    batteryTitle: (hours: number) => `Jusqu'à ${hours} h de vidéo`,
    battery: "L'autonomie d'origine annoncée par le fabricant, avec la charge rapide.",
    durability: "Il résiste à l'eau et à la poussière, avec un verre renforcé.",
    extra: "Les fonctions qui font la différence au quotidien.",
  },

  battery: {
    eyebrow: "La batterie, sans surprise",
    title: "Vous voyez la santé de la batterie avant de choisir.",
    text: "Chaque iPhone de la promo affiche sa santé de batterie mesurée (Réglages > Batterie > État de la batterie). À 80 % et plus, une batterie est en bon état : ici, chaque téléphone est à {min} % ou plus.",
    textAny: "Chaque iPhone de la promo affiche sa santé de batterie mesurée (Réglages > Batterie > État de la batterie). À 80 % et plus, une batterie est en bon état ; en dessous, son remplacement est conseillé.",
    points: ["Pourcentage exact affiché pour chaque téléphone", "Chaque pièce remplacée est indiquée", "Vous choisissez le téléphone exact que vous recevez"],
  },

  specs: {
    eyebrow: "Fiche technique",
    title: (name: string) => `Tout sur le ${name}.`,
    labels: {
      display: "Écran",
      chip: "Processeur",
      storage: "Stockage",
      ram: "Mémoire (RAM)",
      rearCameras: "Caméras arrière",
      frontCamera: "Caméra avant",
      battery: "Batterie",
      charging: "Charge",
      durability: "Résistance",
      network: "Réseau",
      sim: "SIM",
      size: "Dimensions et poids",
      unlock: "Déverrouillage",
      sound: "Son",
    },
    unlocks: {
      faceid: "Face ID (reconnaissance faciale 3D)",
      ultrasonic: "Empreinte sous l'écran (ultrasons)",
      optical: "Empreinte sous l'écran",
      side: "Empreinte sur le bouton latéral",
      face: "Reconnaissance faciale",
    },
    stereo: "Haut-parleurs stéréo",
    video: (hours: number) => `jusqu'à ${hours} h de vidéo`,
  },

  box: {
    eyebrow: "Dans votre colis",
    title: "Ce que vous recevez.",
    phone: (name: string) => `${name}, vérifié par nos techniciens`,
    note: "Le chargeur n'est pas inclus.",
  },

  checks: {
    eyebrow: "Vérifié par nos techniciens",
    title: "Contrôlé avant la vente.",
    items: (iphone: boolean) => [
      "Santé de la batterie",
      "Écran et tactile",
      iphone ? "Face ID" : "Empreinte et déverrouillage",
      "Caméras avant et arrière",
      "Haut-parleurs et micros",
      "Réseau, Wi-Fi et Bluetooth",
    ],
  },

  steps: {
    eyebrow: "Comment ça se passe",
    title: "Commander en 4 étapes.",
    items: [
      { title: "Vous commandez", text: "Choisissez votre téléphone, votre ville, et laissez votre nom et votre numéro." },
      { title: "On vous appelle", text: "Nous confirmons la commande et l'adresse exacte de livraison." },
      { title: "Avance de 300 DH", text: "Elle réserve votre téléphone avant l'expédition." },
      { title: "Livraison", text: "Vous recevez votre téléphone et payez le reste à la livraison." },
    ],
  },

  faq: {
    eyebrow: "Questions fréquentes",
    title: "Vous vous demandez…",
    advance: {
      q: "Pourquoi une avance de 300 DH ?",
      a: "Elle réserve votre téléphone et couvre les frais d'expédition. Le reste du montant se paie à la livraison. Les détails pour la régler vous sont donnés lors de l'appel de confirmation.",
    },
    when: {
      q: "Quand vais-je recevoir mon téléphone ?",
      a: "Après l'appel de confirmation et la réception de l'avance, il part avec Ameex : en général 24 à 30 h après l'enlèvement. La date estimée s'affiche dès que vous choisissez votre ville.",
    },
    battery: {
      q: "La batterie affichée est-elle la vraie ?",
      a: "Oui. C'est la santé mesurée par l'iPhone lui-même (Réglages > Batterie > État de la batterie), relevée sur chaque téléphone. Vous choisissez le téléphone exact que vous recevez.",
    },
    // Answered with the site's own grade descriptions (t.grades.hint).
    grades: { q: "Que veulent dire les différents états ?" },
    charger: {
      q: "Le chargeur est-il fourni ?",
      a: "Non, le téléphone est livré sans chargeur. Si vous en avez besoin, dites-le-nous lors de l'appel de confirmation.",
    },
    warranty: {
      q: "Le téléphone est-il garanti ?",
      a: "Oui, chaque téléphone est garanti 3 mois. Les conditions de la garantie vous sont précisées lors de l'appel de confirmation.",
    },
    shop: {
      q: "Puis-je le voir en boutique ?",
      a: "Bien sûr. Passez à notre boutique de Meknès, ou écrivez-nous sur WhatsApp pour réserver un téléphone avant de venir.",
    },
  },

  // The offer elsewhere on the site: header bar, offers page, home, product page.
  card: {
    title: (name: string) => `${name} en promo`,
    teaser: (saving: string) => `Jusqu'à ${saving} de remise, garantie 3 mois`,
    bar: (name: string, price: string) => `Promo ${name} : dès ${price}`,
    banner: (name: string, price: string) => `${name} en promo dès ${price} : tous les téléphones de la promo sur une seule page.`,
    cta: "Voir la promo",
  },

  final: {
    title: (name: string) => `Votre ${name} vous attend.`,
    text: "Vérifié par nos techniciens, garantie 3 mois, livraison partout au Maroc.",
    cta: "Commander maintenant",
  },
};

export type OfferCopy = typeof fr;
export type OfferFormCopy = ReturnType<OfferCopy["form"]>;
