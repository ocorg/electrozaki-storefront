import type { Locale } from "@/lib/i18n/config";

// Text of the guides' interactive parts (drawn iPhone screens, battery
// slider, checklist, screen test, parts). Plain strings only: they're handed
// to client components. "{v}", "{n}", "{total}" are filled in there.

export type WidgetsText = {
  drawn: string;
  ios: {
    settings: string;
    general: string;
    about: string;
    battery: string;
    batteryHealth: string;
    maxCapacity: string;
    name: string;
    modelName: string;
    capacity: string;
    carrierLock: string;
    noSimRestrictions: string;
    partsHistory: string;
    display: string;
  };
  battery: {
    title: string;
    slider: string;
    levels: { new: string; good: string; worn: string };
    hints: { new: string; good: string; worn: string };
    life: string;
    cta: string;
    wornCta: string;
  };
  checklist: {
    title: string;
    intro: string;
    ok: string;
    problem: string;
    progress: string;
    reset: string;
    stop: string;
    negotiate: string;
    allGood: string;
  };
  screenTest: {
    title: string;
    text: string;
    colors: string;
    colorsHint: string;
    touch: string;
    touchHint: string;
    touchDone: string;
    exit: string;
  };
  parts: {
    title: string;
    states: { genuine: string; unknown: string; used: string };
    explain: { genuine: string; unknown: string; used: string };
    tapHint: string;
    names: { screen: string; battery: string; camera: string; faceId: string };
  };
  prices: {
    title: string;
    replaced: string;
    original: string;
    note: string;
    see: string;
  };
};

const fr: WidgetsText = {
  drawn: "Écran dessiné à titre d'exemple",
  ios: {
    settings: "Réglages",
    general: "Général",
    about: "Informations",
    battery: "Batterie",
    batteryHealth: "État de la batterie",
    maxCapacity: "Capacité maximale",
    name: "Nom",
    modelName: "Nom du modèle",
    capacity: "Capacité",
    carrierLock: "Verrouillage de l'opérateur",
    noSimRestrictions: "Aucune restriction de SIM",
    partsHistory: "Historique des pièces et des réparations",
    display: "Écran",
  },
  battery: {
    title: "Essayez : déplacez le curseur",
    slider: "Capacité maximale de la batterie",
    levels: { new: "Comme neuve", good: "Bonne", worn: "Usée" },
    hints: {
      new: "Autonomie d'origine ou presque.",
      good: "Tient une journée normale : l'usure normale d'un iPhone d'un ou deux ans.",
      worn: "Autonomie nettement réduite : Apple considère la batterie usée.",
    },
    life: "Environ {v} % de l'autonomie d'origine",
    cta: "Voir nos iPhone avec batterie ≥ {v} %",
    wornCta: "Changer une batterie : à partir de 150 DH",
  },
  checklist: {
    title: "Votre checklist",
    intro: "Gardez cette page ouverte pendant que vous vérifiez le téléphone, et marquez chaque point.",
    ok: "OK",
    problem: "Problème",
    progress: "{n}/{total} vérifiés",
    reset: "Recommencer",
    stop: "Point bloquant : n'achetez pas ce téléphone.",
    negotiate: "À faire expliquer, ou à négocier dans le prix.",
    allGood: "Tout est bon : ce téléphone a passé vos {total} vérifications.",
  },
  screenTest: {
    title: "Testez l'écran depuis cette page",
    text: "Ouvrez cette page sur le téléphone à vérifier, puis lancez un test.",
    colors: "Test des couleurs",
    colorsHint: "Touchez l'écran pour changer de couleur. Cherchez les points morts, les taches et les ombres.",
    touch: "Test du tactile",
    touchHint: "Glissez le doigt partout : chaque case doit devenir dorée.",
    touchDone: "Toutes les cases ont répondu : le tactile fonctionne partout.",
    exit: "Quitter",
  },
  parts: {
    title: "Ce que vous verrez dans les réglages",
    states: { genuine: "Pièce d'origine", unknown: "Pièce inconnue", used: "Réutilisé(e)" },
    explain: {
      genuine: "Une pièce Apple, installée selon la procédure d'Apple.",
      unknown: "La pièce n'est pas d'origine, ou son installation n'a pas été finalisée par Apple.",
      used: "Une pièce d'origine qui a déjà servi dans un autre iPhone (iPhone 15 et plus récents).",
    },
    tapHint: "Touchez une pièce pour voir ce qui change.",
    names: { screen: "Écran", battery: "Batterie", camera: "Caméra", faceId: "Face ID" },
  },
  prices: {
    title: "La différence de prix, en stock aujourd'hui",
    replaced: "Pièces remplacées",
    original: "Pièces d'origine",
    note: "Prix les plus bas en stock, mis à jour automatiquement.",
    see: "Voir le modèle",
  },
};

const en: WidgetsText = {
  drawn: "Drawn example screen",
  ios: {
    settings: "Settings",
    general: "General",
    about: "About",
    battery: "Battery",
    batteryHealth: "Battery Health",
    maxCapacity: "Maximum Capacity",
    name: "Name",
    modelName: "Model Name",
    capacity: "Capacity",
    carrierLock: "Carrier Lock",
    noSimRestrictions: "No SIM restrictions",
    partsHistory: "Parts and Service History",
    display: "Display",
  },
  battery: {
    title: "Try it: move the slider",
    slider: "Battery maximum capacity",
    levels: { new: "Like new", good: "Good", worn: "Worn" },
    hints: {
      new: "Original battery life, or close to it.",
      good: "Lasts a normal day: normal wear for an iPhone a year or two old.",
      worn: "Battery life clearly reduced: Apple considers the battery worn.",
    },
    life: "About {v}% of the original battery life",
    cta: "See our iPhones with battery ≥ {v}%",
    wornCta: "Battery replacement: from 150 DH",
  },
  checklist: {
    title: "Your checklist",
    intro: "Keep this page open while you check the phone, and mark each point.",
    ok: "OK",
    problem: "Problem",
    progress: "{n}/{total} checked",
    reset: "Start over",
    stop: "Deal-breaker: don't buy this phone.",
    negotiate: "Ask for an explanation, or negotiate the price.",
    allGood: "All good: this phone passed your {total} checks.",
  },
  screenTest: {
    title: "Test the screen from this page",
    text: "Open this page on the phone you're checking, then start a test.",
    colors: "Colour test",
    colorsHint: "Tap the screen to change colour. Look for dead pixels, spots and shadows.",
    touch: "Touch test",
    touchHint: "Slide your finger everywhere: every square should turn gold.",
    touchDone: "Every square responded: touch works everywhere.",
    exit: "Exit",
  },
  parts: {
    title: "What you'll see in Settings",
    states: { genuine: "Genuine Apple Part", unknown: "Unknown Part", used: "Used" },
    explain: {
      genuine: "An Apple part, installed following Apple's process.",
      unknown: "The part isn't original, or Apple didn't complete its installation.",
      used: "An original part already used in another iPhone (iPhone 15 and later).",
    },
    tapHint: "Tap a part to see what changes.",
    names: { screen: "Screen", battery: "Battery", camera: "Camera", faceId: "Face ID" },
  },
  prices: {
    title: "The price difference, in stock today",
    replaced: "Replaced parts",
    original: "Original parts",
    note: "Lowest prices in stock, updated automatically.",
    see: "See the model",
  },
};

const ar: WidgetsText = {
  drawn: "شاشة مرسومة للتوضيح",
  ios: {
    settings: "الإعدادات",
    general: "عام",
    about: "حول",
    battery: "البطارية",
    batteryHealth: "صحة البطارية",
    maxCapacity: "السعة القصوى",
    name: "الاسم",
    modelName: "اسم الطراز",
    capacity: "السعة",
    carrierLock: "قفل شركة الاتصالات",
    noSimRestrictions: "لا توجد قيود على SIM",
    partsHistory: "سجل القطع والخدمة",
    display: "الشاشة",
  },
  battery: {
    title: "جرّب: حرّك المؤشر",
    slider: "السعة القصوى للبطارية",
    levels: { new: "كأنها جديدة", good: "جيدة", worn: "مستهلكة" },
    hints: {
      new: "استقلالية أصلية أو قريبة منها.",
      good: "تصمد يومًا عاديًا: الاستهلاك العادي لايفون عمره سنة أو سنتان.",
      worn: "استقلالية منخفضة بوضوح: تعتبر Apple البطارية مستهلكة.",
    },
    life: "حوالي {v} % من الاستقلالية الأصلية",
    cta: "شاهد هواتف iPhone لدينا ببطارية ≥ {v} %",
    wornCta: "تغيير البطارية: ابتداءً من 150 درهم",
  },
  checklist: {
    title: "قائمة الفحص",
    intro: "اترك هذه الصفحة مفتوحة وأنت تفحص الهاتف، وحدد كل نقطة.",
    ok: "سليم",
    problem: "مشكلة",
    progress: "{n}/{total} مفحوصة",
    reset: "ابدأ من جديد",
    stop: "نقطة حاسمة: لا تشترِ هذا الهاتف.",
    negotiate: "اطلب تفسيرًا، أو فاوض على السعر.",
    allGood: "كل شيء سليم: اجتاز هذا الهاتف فحوصاتك الـ {total}.",
  },
  screenTest: {
    title: "افحص الشاشة من هذه الصفحة",
    text: "افتح هذه الصفحة على الهاتف الذي تفحصه، ثم ابدأ اختبارًا.",
    colors: "اختبار الألوان",
    colorsHint: "المس الشاشة لتغيير اللون. ابحث عن البكسلات الميتة والبقع والظلال.",
    touch: "اختبار اللمس",
    touchHint: "مرّر إصبعك في كل مكان: يجب أن يصبح كل مربع ذهبيًا.",
    touchDone: "استجابت كل المربعات: اللمس يعمل في كل مكان.",
    exit: "خروج",
  },
  parts: {
    title: "ما ستراه في الإعدادات",
    states: { genuine: "قطعة Apple أصلية", unknown: "قطعة غير معروفة", used: "مستخدمة" },
    explain: {
      genuine: "قطعة من Apple، مركبة حسب طريقة Apple.",
      unknown: "القطعة ليست أصلية، أو لم تُكمل Apple تركيبها.",
      used: "قطعة أصلية سبق استعمالها في ايفون آخر (iPhone 15 فما فوق).",
    },
    tapHint: "المس قطعة لترى ما الذي يتغير.",
    names: { screen: "الشاشة", battery: "البطارية", camera: "الكاميرا", faceId: "Face ID" },
  },
  prices: {
    title: "فرق السعر، في المخزون اليوم",
    replaced: "قطع مستبدلة",
    original: "قطع أصلية",
    note: "أقل الأسعار في المخزون، تتحدث تلقائيًا.",
    see: "شاهد الطراز",
  },
};

const darija: WidgetsText = {
  drawn: "Écran mrsoum ghir mathal",
  ios: fr.ios,
  battery: {
    title: "Jerreb: 7errek l curseur",
    slider: "Capacité maximale dyal l batterie",
    levels: { new: "B7al jdida", good: "Mzyana", worn: "Mst3mla bzaf" },
    hints: {
      new: "Autonomie asliya wla 9rib.",
      good: "Katsmed nhar 3adi: l isti3mal l 3adi dyal iPhone 3ndo 3am wla 3amayn.",
      worn: "L autonomie n9sat bzaf: Apple katchouf l batterie mst3mla.",
    },
    life: "Chi {v} % men l autonomie l asliya",
    cta: "Chouf les iPhone dyalna b batterie ≥ {v} %",
    wornCta: "Tbdil batterie: men 150 DH",
  },
  checklist: {
    title: "Checklist dyalek",
    intro: "Khlli had l page m7loula w nta katchouf t-téléphone, w 3ellem 3la kol point.",
    ok: "Mzyan",
    problem: "Mouchkil",
    progress: "{n}/{total} mchoufin",
    reset: "3awd men l bdya",
    stop: "Mouchkil kbir: ma tchrich had t-téléphone.",
    negotiate: "Tleb tfsir, wla n9es men t-taman.",
    allGood: "Kolchi mzyan: had t-téléphone dez {total} dyal les vérifications dyalek.",
  },
  screenTest: {
    title: "Jerreb l'écran men had l page",
    text: "7ell had l page f t-téléphone li katchouf, w bda test.",
    colors: "Test dyal l alwan",
    colorsHint: "Mess l'écran bach ytbdel l lon. Qelleb 3la pixels morts, tbe3 w dlal.",
    touch: "Test dyal tactile",
    touchHint: "Douz sb3ek f kolla blasa: kol mrb3 khasso ywlli dhabi.",
    touchDone: "Ga3 les mrb3at jawbo: tactile khddam f kolla blasa.",
    exit: "Khrej",
  },
  parts: {
    title: "Chno ghadi tchouf f Réglages",
    states: fr.parts.states,
    explain: {
      genuine: "Pièce dyal Apple, mrekba kif katgoul Apple.",
      unknown: "L pièce machi d'origine, wla Apple ma kemlatch tarkib dyalha.",
      used: "Pièce d'origine kanet f iPhone akhor (iPhone 15 w fo9).",
    },
    tapHint: "Mess pièce bach tchouf chno kaytbdel.",
    names: { screen: "L'écran", battery: "L batterie", camera: "L caméra", faceId: "Face ID" },
  },
  prices: {
    title: "L fer9 f t-taman, f stock l youm",
    replaced: "Pièces mbdlin",
    original: "Pièces d'origine",
    note: "A9al taman f stock, kayt7dd bo7do.",
    see: "Chouf l modèle",
  },
};

const WIDGETS: Record<Locale, WidgetsText> = { fr, en, ar, darija };

export function widgetsText(locale: Locale): WidgetsText {
  return WIDGETS[locale];
}
