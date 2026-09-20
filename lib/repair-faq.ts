import { BatteryCharging, Camera, Globe, Plug, Smartphone, Volume2, type LucideIcon } from "lucide-react";

// Content grounded in well-established, publicly documented troubleshooting
// knowledge (battery chemistry aging, carrier-lock vs. IMEI-blacklist,
// digitizer/LCD failure modes, etc.) — not brand-specific claims we can't
// verify. Keep new entries at this same "generally true, defensible" level
// rather than inventing model-specific specifics.
export type RepairFaqEntry = { question: string; answer: string };
export type RepairFaqBrandSection = { brand: string; entries: RepairFaqEntry[] };

export type RepairTopic = {
  slug: string;
  title: string;
  shortTitle: string;
  cardDescription: string;
  icon: LucideIcon;
  intro: string;
  brands: RepairFaqBrandSection[];
};

export const REPAIR_TOPIC_ORDER = ["ecran", "batterie", "connecteur", "camera", "son", "reseau"] as const;

export const REPAIR_TOPICS: Record<string, RepairTopic> = {
  ecran: {
    slug: "ecran",
    title: "Écran cassé ou fissuré",
    shortTitle: "Écran cassé",
    cardDescription: "Remplacement d'écran toutes marques, pièces de qualité.",
    icon: Smartphone,
    intro:
      "Un écran de smartphone est en réalité deux couches solidaires : la vitre (verre de protection) et la dalle (LCD/OLED) avec son digitizer tactile. Une fissure qui ne touche « que » le verre peut sembler cosmétique, mais l'humidité et la poussière s'infiltrent vite par les micro-fissures et finissent par atteindre la dalle.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Le tactile fonctionne encore malgré la fissure, faut-il quand même le changer ?",
            answer:
              "Oui, c'est recommandé. Une vitre fissurée continue de se fragiliser à chaque manipulation, les éclats peuvent blesser, et l'infiltration d'humidité par la fissure peut endommager la dalle en dessous — un problème bien plus coûteux à réparer qu'un simple remplacement de vitre.",
          },
          {
            question: "Face ID fonctionne-t-il encore après un remplacement d'écran ?",
            answer:
              "Oui. Face ID dépend du module caméra TrueDepth situé dans l'encoche, pas de l'écran lui-même. Tant que ce module n'est pas endommagé séparément (chute sur la tranche supérieure, par exemple), il continue de fonctionner normalement après un changement d'écran.",
          },
          {
            question: "Pourquoi la luminosité automatique ou True Tone semble différente après réparation ?",
            answer:
              "Sur certains modèles, le capteur de luminosité/True Tone est apparié logiciellement à l'écran d'origine. Une pièce de qualité correctement recalibrée règle ce point — c'est pour ça que le choix de la pièce et du technicien fait la différence.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "J'ai des taches sombres ou des lignes sur l'écran, pas de casse visible en surface : que faire ?",
            answer:
              "C'est un signe que la dalle elle-même est touchée, pas seulement la vitre — fréquent après un choc même sans fissure visible. Sur la plupart des Galaxy, la vitre et la dalle forment un seul bloc, donc le remplacement du module complet est nécessaire.",
          },
          {
            question: "Le tactile ne répond plus sur certaines zones alors que le verre semble intact ?",
            answer:
              "Un choc peut endommager le digitizer (couche tactile) sans casser le verre en surface. C'est une panne fréquente et bien identifiable en diagnostic avant réparation.",
          },
          {
            question: "Existe-t-il un moyen de tester l'écran avant de décider d'une réparation ?",
            answer:
              "Oui — le menu de diagnostic caché de Samsung (composer *#0*# dans l'app téléphone) permet de tester le multitouch, les pixels morts et la vibration, utile pour confirmer l'étendue du problème avant réparation.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "Après une réparation ailleurs, j'ai des touches \"fantômes\" qui apparaissent seules ?",
            answer:
              "C'est généralement le signe d'une nappe tactile mal reconnectée ou d'une colle de fixation de qualité insuffisante lors d'un remplacement précédent — un problème d'installation, pas de la pièce elle-même.",
          },
          {
            question: "MIUI affiche \"pièce non originale détectée\" après un changement d'écran, est-ce grave ?",
            answer:
              "Non, c'est une notification logicielle informative sur certains modèles Xiaomi quand l'écran n'est pas la pièce d'usine exacte — elle n'empêche pas le fonctionnement normal avec une pièce de qualité équivalente.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "Mon téléphone vibre et sonne à la réception d'un appel, mais l'écran reste noir après une chute ?",
            answer:
              "C'est souvent la connectique de l'écran (nappe débranchée par le choc) ou le rétroéclairage, pas la carte mère — un signe plutôt rassurant qui pointe vers une réparation simple.",
          },
        ],
      },
      {
        brand: "Autres marques",
        entries: [
          {
            question: "Toutes les marques utilisent-elles le même type d'écran ?",
            answer:
              "Non — LCD, AMOLED et leurs variantes ont des coûts et des sensibilités différentes. Le diagnostic détermine si seule la vitre extérieure ou l'ensemble du module doit être remplacé, ce qui influence fortement le prix.",
          },
        ],
      },
    ],
  },

  batterie: {
    slug: "batterie",
    title: "Batterie qui ne tient plus la charge",
    shortTitle: "Batterie",
    cardDescription: "Batterie qui ne tient plus la charge ? On la remplace.",
    icon: BatteryCharging,
    intro:
      "Toute batterie lithium-ion perd naturellement de sa capacité avec le temps — la dégradation devient généralement sensible après environ 500 cycles de charge complets, un peu plus tôt en cas de chaleur fréquente ou de charge à 100% en continu. Ce n'est pas un défaut, c'est de la chimie — mais ça se remplace facilement.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "À partir de quel pourcentage Apple recommande-t-il de remplacer la batterie ?",
            answer:
              "Apple considère qu'une batterie sous 80% de capacité maximale (visible dans Réglages > Batterie > État de la batterie) est arrivée en fin de vie normale et bénéficierait d'un remplacement pour retrouver l'autonomie et les performances d'origine.",
          },
          {
            question: "Mon iPhone s'éteint brutalement à 20-30% de batterie affichée, pourquoi ?",
            answer:
              "Une batterie vieillissante perd sa capacité à fournir un pic de courant important (photo au flash, jeu). L'iPhone se met alors en protection et s'éteint plus tôt que ce que le pourcentage affiché laisse penser.",
          },
          {
            question: "Le message \"batterie non authentique\" apparaît après un remplacement, c'est un problème ?",
            answer:
              "L'iPhone vérifie l'authenticité de la batterie via une puce dédiée. Une batterie de qualité mais non appairée officiellement peut déclencher ce message purement informatif sans empêcher le téléphone de fonctionner normalement.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Le pourcentage de batterie saute brutalement (ex: 40% à 15%) : c'est grave ?",
            answer:
              "C'est un symptôme classique d'une batterie usée dont la capacité réelle ne correspond plus à l'estimation du logiciel. Un remplacement rétablit une lecture fiable et une autonomie cohérente.",
          },
          {
            question: "Mon Galaxy chauffe beaucoup pendant la charge, batterie en cause ?",
            answer:
              "Souvent lié à l'usage du téléphone pendant la charge (jeu, GPS, streaming), qui sollicite processeur et batterie en même temps. Une batterie vieillissante peut amplifier cet échauffement — à vérifier en diagnostic si le phénomène est nouveau.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "MIUI restreint des apps en arrière-plan, est-ce lié à la batterie physique ?",
            answer:
              "Non, c'est une fonction logicielle d'économie d'énergie de MIUI, indépendante de l'état réel de la batterie — elle peut retarder des notifications même sur une batterie neuve.",
          },
          {
            question: "La charge rapide abîme-t-elle la batterie plus vite ?",
            answer:
              "Utilisée avec le chargeur d'origine ou certifié, la charge rapide est conçue pour gérer la chaleur générée. C'est surtout l'usage de chargeurs non certifiés, avec une négociation de tension incorrecte, qui accélère l'usure.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "Ma batterie se vide vite alors que le téléphone est peu utilisé ?",
            answer:
              "Avant de conclure à un problème matériel, vérifiez les apps en arrière-plan qui se relancent fréquemment — un comportement parfois observé sur les modèles sans services Google. Si le drain persiste après vérification logicielle, un diagnostic batterie est justifié.",
          },
        ],
      },
      {
        brand: "Autres marques",
        entries: [
          {
            question: "Comment savoir si c'est vraiment la batterie et pas autre chose ?",
            answer:
              "Extinctions brutales, gonflement visible du dos du téléphone, autonomie qui chute en quelques semaines, ou surchauffe anormale sont les signaux les plus fiables. Un diagnostic rapide permet de confirmer avant tout remplacement.",
          },
        ],
      },
    ],
  },

  connecteur: {
    slug: "connecteur",
    title: "Port de charge qui ne charge plus ou mal",
    shortTitle: "Port de charge",
    cardDescription: "Le téléphone ne charge plus ou mal — réparation rapide.",
    icon: Plug,
    intro:
      "La cause la plus fréquente d'un port de charge capricieux n'est pas une panne électronique mais un blocage mécanique : poussière, peluches de poche ou oxydation liée à l'humidité empêchent un contact correct entre les broches et le câble.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "\"Alerte liquide détectée\" empêche la charge, que faire ?",
            answer:
              "C'est une protection logicielle qui bloque volontairement la charge pour éviter un court-circuit. Laissez le port sécher complètement à l'air libre (jamais de source de chaleur) avant de retenter — forcer la charge pendant l'alerte peut aggraver les dégâts.",
          },
          {
            question: "Le téléphone charge, mais beaucoup plus lentement qu'avant : le port est-il en cause ?",
            answer:
              "Le plus souvent non — un câble ou chargeur non certifié, ou un câble usé, sont les premières causes de charge lente. Tester avec un câble et un adaptateur certifiés différents permet d'isoler le vrai problème avant de suspecter le port.",
          },
        ],
      },
      {
        brand: "Samsung, Xiaomi, Huawei (USB-C)",
        entries: [
          {
            question: "Le câble tient mal ou bouge dans le port, c'est normal ?",
            answer:
              "Non — un connecteur USB-C en bon état maintient le câble fermement. Un jeu ou un mouvement anormal signale une usure mécanique des broches qu'il vaut mieux traiter avant qu'elle n'empire et n'endommage aussi le câble.",
          },
          {
            question: "Le téléphone ne charge que dans une position précise du câble ?",
            answer:
              "C'est presque toujours le signe d'un connecteur partiellement endommagé ou encrassé plutôt qu'un défaut de câble — un nettoyage professionnel du port résout la majorité de ces cas.",
          },
        ],
      },
      {
        brand: "Autres marques",
        entries: [
          {
            question: "Puis-je nettoyer le port moi-même ?",
            answer:
              "Un jet d'air sec et une extrême prudence peuvent aider, mais évitez tout objet métallique qui pourrait plier une broche ou provoquer un court-circuit. En cas de doute, un nettoyage professionnel reste plus sûr qu'une tentative maison.",
          },
        ],
      },
    ],
  },

  camera: {
    slug: "camera",
    title: "Appareil photo flou ou hors service",
    shortTitle: "Caméra",
    cardDescription: "Photo floue ou caméra hors service, diagnostic et réparation.",
    icon: Camera,
    intro:
      "Avant de suspecter le matériel, un simple redémarrage ou la fermeture forcée de l'application résout une bonne partie des soucis de caméra — le reste vient d'un module physique désaligné ou encrassé après un choc.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "\"Impossible d'activer l'appareil photo\", que vérifier avant réparation ?",
            answer:
              "Ce message peut venir d'une app tierce qui bloque l'accès à la caméra ou, après une chute, d'un module caméra désolidarisé de sa connectique. Un redémarrage élimine la première cause avant de passer au diagnostic matériel.",
          },
          {
            question: "L'objectif est propre mais les photos restent floues, pourquoi ?",
            answer:
              "Cela peut indiquer un problème de mise au point automatique ou de stabilisation optique (OIS) après un choc, qui nécessite un remplacement du module caméra plutôt qu'un simple nettoyage.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Une tache identique apparaît sur toutes mes photos, même après nettoyage de l'objectif ?",
            answer:
              "C'est un signe de poussière infiltrée à l'intérieur du module, entre les lentilles — invisible et impossible à nettoyer de l'extérieur. Cela nécessite une ouverture du module par un technicien.",
          },
          {
            question: "L'appareil photo se ferme tout seul (crash) au lancement ?",
            answer:
              "Commencez par vider le cache de l'application appareil photo et vérifier les mises à jour système — la majorité des crashs de ce type sont logiciels, pas matériels.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "Le mode nuit ou portrait a disparu ou ne fonctionne plus après une mise à jour ?",
            answer:
              "C'est généralement lié à la mise à jour logicielle (MIUI/EMUI) plutôt qu'au capteur lui-même. Vérifiez les notes de version ou réinitialisez les paramètres de l'app caméra avant d'envisager un diagnostic matériel.",
          },
        ],
      },
      {
        brand: "Autres marques",
        entries: [
          {
            question: "Comment savoir si c'est logiciel ou matériel ?",
            answer:
              "Testez l'app caméra native après redémarrage, et essayez une app tierce de photo si possible. Si le problème persiste partout et après redémarrage, c'est un bon indicateur qu'un diagnostic matériel est nécessaire.",
          },
        ],
      },
    ],
  },

  son: {
    slug: "son",
    title: "Haut-parleur ou micro défaillant",
    shortTitle: "Son / Micro",
    cardDescription: "Haut-parleur ou micro défaillant, remis en état.",
    icon: Volume2,
    intro:
      "Un smartphone a en réalité plusieurs micros et haut-parleurs distincts (écouteur d'appel, haut-parleur multimédia, micros de réduction de bruit) — identifier lequel est en cause change beaucoup le diagnostic. La poussière accumulée dans les grilles est la cause la plus fréquente et la plus simple à résoudre.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Le son est étouffé uniquement pendant les appels, pas en musique ?",
            answer:
              "C'est le signe que l'écouteur d'appel (haut-parleur supérieur, distinct du haut-parleur multimédia du bas) est encrassé ou endommagé, plutôt qu'un problème général de son.",
          },
          {
            question: "Mon correspondant m'entend mal alors que j'entends bien de mon côté ?",
            answer:
              "Le problème vient probablement d'un des micros, pas du haut-parleur. Plusieurs micros participant à la réduction de bruit, un seul défaillant peut dégrader la clarté de la voix envoyée sans affecter la réception.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Comment isoler quel composant audio est en cause avant réparation ?",
            answer:
              "Le menu de diagnostic caché (*#0*#) permet de tester séparément le haut-parleur, l'écouteur et le ou les micros, ce qui évite de remplacer une pièce qui fonctionne en réalité correctement.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "Le son a un grésillement à volume élevé uniquement ?",
            answer:
              "C'est un signe classique de membrane de haut-parleur endommagée ou encrassée — un nettoyage professionnel suffit parfois, sinon un remplacement de la pièce est nécessaire.",
          },
        ],
      },
      {
        brand: "Autres marques",
        entries: [
          {
            question: "Une exposition à l'eau peut-elle causer ce genre de panne même sur un téléphone \"résistant à l'eau\" ?",
            answer:
              "Oui — la certification de résistance à l'eau (IP) se dégrade avec le temps et les chocs, et les grilles de haut-parleur sont un point d'entrée classique pour l'humidité résiduelle qui affecte le son après coup.",
          },
        ],
      },
    ],
  },

  reseau: {
    slug: "reseau",
    title: "Désimlockage réseau",
    shortTitle: "Désimlockage réseau",
    cardDescription: "Déblocage réseau pour utiliser votre téléphone partout.",
    icon: Globe,
    intro:
      "Un verrouillage réseau (SIM lock) est une restriction logicielle imposée par un opérateur, liée à l'IMEI de l'appareil — souvent posée en échange d'un prix subventionné. C'est très différent d'un IMEI blacklisté (téléphone déclaré volé ou impayé), un statut qu'aucun déblocage ne peut lever puisqu'il ne s'agit pas du même problème.",
    brands: [
      {
        brand: "Tous appareils",
        entries: [
          {
            question: "Comment savoir si mon téléphone est verrouillé sur un opérateur ?",
            answer:
              "Insérez une carte SIM d'un autre opérateur : si le téléphone demande un « code de déverrouillage réseau », il est verrouillé. Sans ce message et avec un réseau qui s'affiche normalement, l'appareil est déjà libre.",
          },
          {
            question: "Quelle est la différence entre déverrouillage réseau et IMEI blacklisté ?",
            answer:
              "Le déverrouillage réseau retire une restriction logicielle posée par l'opérateur d'origine. Un IMEI blacklisté signifie que l'appareil a été signalé volé ou avec un solde impayé auprès des opérateurs — un problème totalement différent qu'aucun déblocage ne peut résoudre légalement.",
          },
          {
            question: "Après le déblocage, mon téléphone affiche \"réseau non enregistré\" avec la nouvelle SIM ?",
            answer:
              "C'est très souvent un simple réglage d'APN manquant ou incorrect pour le nouvel opérateur, pas un échec du déblocage lui-même — un point que nous vérifions systématiquement après chaque désimlockage.",
          },
        ],
      },
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Un iPhone financé par un opérateur peut-il être désimlocké avant la fin du remboursement ?",
            answer:
              "Généralement non — le verrouillage lié au financement reste actif tant que les conditions de l'opérateur ne sont pas remplies, indépendamment de tout service de déblocage tiers.",
          },
        ],
      },
    ],
  },
};
