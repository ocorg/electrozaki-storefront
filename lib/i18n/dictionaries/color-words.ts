// Colour names come from the ERP in French, one name per colour ("Noir
// Fantôme", "Bleu Ciel", "Titane Noir"…; owner, 2026-10-29). They are
// translated word by word (lib/i18n/labels.ts → colorName): keys are the
// French words without accents, lower-case. A word missing here is shown as
// typed, so a new colour never breaks a page. Multi-word expressions
// ("clair de lune") are translated as one piece.

export const COLOR_PHRASES = ["arc-en-ciel", "clair de lune", "coucher de soleil", "pop art"];

export const colorWordsEn: Record<string, string> = {
  "arc-en-ciel": "Rainbow", "clair de lune": "Moonlight", "coucher de soleil": "Sunset", "pop art": "Pop Art",
  acier: "Steel", agate: "Agate", alpin: "Alpine", ambre: "Amber", aqua: "Aqua", arctique: "Arctic",
  argent: "Silver", argentee: "Silvery", artisanal: "Crafted", asteroide: "Asteroid", aube: "Dawn",
  aura: "Aura", aurore: "Aurora", beige: "Beige", blanc: "White", blanche: "White", bleu: "Blue",
  bora: "Bora", bordeaux: "Burgundy", bourgogne: "Burgundy", brillant: "Gleaming", bronze: "Bronze",
  brume: "Mist", brumeux: "Misty", brun: "Brown", cascade: "Waterfall", cerise: "Cherry",
  champagne: "Champagne", ciel: "Sky", citron: "Lemon", clair: "Light", cobalt: "Cobalt", corail: "Coral",
  cosmique: "Cosmic", cramoisi: "Crimson", cristal: "Crystal", creme: "Cream", crepuscule: "Twilight",
  cuivre: "Copper", cyan: "Cyan", cygne: "Swan", ceramique: "Ceramic", diamant: "Diamond", dore: "Golden",
  doux: "Soft", desert: "Desert", eau: "Water", fantome: "Phantom", flash: "Flash", fluide: "Flowing",
  fonce: "Dark", foret: "Forest", furtif: "Stealth", fusion: "Fusion", galet: "Pebble", gamma: "Gamma",
  gemme: "Gem", givre: "Frost", glacier: "Glacier", glace: "Icy", graphite: "Graphite", gris: "Grey",
  grise: "Greyish", indigo: "Indigo", inoxydable: "Stainless", interstellaire: "Interstellar", iris: "Iris",
  jade: "Jade", jaune: "Yellow", jet: "Jet", kaki: "Khaki", lac: "Lake", laser: "Laser", lavande: "Lavender",
  lierre: "Ivy", lilas: "Lilac", liquide: "Liquid", lumiere: "Light", lunaire: "Lunar", magique: "Magic",
  marbre: "Marble", marine: "Navy", marron: "Brown", menthe: "Mint", mer: "Sea", minuit: "Midnight",
  mineral: "Mineral", miroir: "Mirror", moka: "Mocha", montagne: "Mountain", mousson: "Monsoon",
  mystique: "Mystic", meteore: "Meteor", nacre: "Pearl", naturel: "Natural", neptune: "Neptune",
  nocturne: "Night", noir: "Black", nuage: "Cloud", nuit: "Night", nebuleuse: "Nebula", obsidienne: "Obsidian",
  ocean: "Ocean", olive: "Olive", ombrage: "Shaded", ombre: "Shadow", ondulation: "Ripple", onyx: "Onyx",
  or: "Gold", orange: "Orange", outremer: "Ultramarine", pacifique: "Pacific", palmier: "Palm",
  panda: "Panda", pistache: "Pistachio", plume: "Feather", pluvieux: "Rainy", polaire: "Polar",
  porcelaine: "Porcelain", poussiere: "Dust", prisme: "Prism", profond: "Deep", prune: "Plum", pale: "Pale",
  peche: "Peach", racing: "Racing", radiant: "Radiant", reflet: "Reflection", rose: "Pink", rouge: "Red",
  rougeatre: "Reddish", reve: "Dream", reveur: "Dreamy", sable: "Sand", sableux: "Sandy", saphir: "Sapphire",
  sarcelle: "Teal", sauge: "Sage", scintillant: "Glitter", sideral: "Space", sierra: "Sierra", soie: "Silk",
  soleil: "Sun", sombre: "Dark", sonique: "Sonic", spectre: "Spectrum", stellaire: "Stellar", titane: "Titanium",
  tropical: "Tropical", tropicale: "Tropical", trefle: "Clover", vagues: "Waves", velours: "Velvet",
  vert: "Green", verte: "Green", vintage: "Vintage", violet: "Purple", zele: "Zeal", eclatant: "Dazzling",
  eclipse: "Eclipse", electrique: "Electric", elegant: "Elegant", emeraude: "Emerald", etoile: "Starry",
};

export const colorWordsAr: Record<string, string> = {
  "arc-en-ciel": "قوس قزح", "clair de lune": "ضوء القمر", "coucher de soleil": "غروب الشمس", "pop art": "بوب آرت",
  acier: "فولاذي", agate: "عقيقي", alpin: "ألبي", ambre: "كهرماني", aqua: "مائي", arctique: "قطبي",
  argent: "فضي", argentee: "فضي", artisanal: "حرفي", asteroide: "كويكبي", aube: "فجري", aura: "أورا",
  aurore: "شفقي", beige: "بيج", blanc: "أبيض", blanche: "أبيض", bleu: "أزرق", bora: "بورا",
  bordeaux: "عنابي", bourgogne: "عنابي", brillant: "لامع", bronze: "برونزي", brume: "ضبابي",
  brumeux: "ضبابي", brun: "بني", cascade: "شلالي", cerise: "كرزي", champagne: "شمباني", ciel: "سماوي",
  citron: "ليموني", clair: "فاتح", cobalt: "كوبالت", corail: "مرجاني", cosmique: "كوني", cramoisi: "قرمزي",
  cristal: "كريستالي", creme: "كريمي", crepuscule: "شفقي", cuivre: "نحاسي", cyan: "سماوي مخضر",
  cygne: "بجعي", ceramique: "سيراميك", diamant: "ماسي", dore: "ذهبي", doux: "هادئ", desert: "صحراوي",
  eau: "مائي", fantome: "شبحي", flash: "لامع", fluide: "انسيابي", fonce: "داكن", foret: "غابي",
  furtif: "خفي", fusion: "مدمج", galet: "حصوي", gamma: "غاما", gemme: "جوهري", givre: "صقيعي",
  glacier: "جليدي", glace: "جليدي", graphite: "غرافيت", gris: "رمادي", grise: "رمادي", indigo: "نيلي",
  inoxydable: "مقاوم للصدأ", interstellaire: "نجمي", iris: "سوسني", jade: "يشمي", jaune: "أصفر",
  jet: "فاحم", kaki: "كاكي", lac: "بحيري", laser: "ليزري", lavande: "لافندر", lierre: "لبلابي",
  lilas: "ليلكي", liquide: "سائل", lumiere: "ضوئي", lunaire: "قمري", magique: "سحري", marbre: "رخامي",
  marine: "كحلي", marron: "بني", menthe: "نعناعي", mer: "بحري", minuit: "منتصف الليل", mineral: "معدني",
  miroir: "مرآتي", moka: "موكا", montagne: "جبلي", mousson: "موسمي", mystique: "غامض", meteore: "نيزكي",
  nacre: "لؤلؤي", naturel: "طبيعي", neptune: "نبتون", nocturne: "ليلي", noir: "أسود", nuage: "غيمي",
  nuit: "ليلي", nebuleuse: "سديمي", obsidienne: "سبجي", ocean: "محيطي", olive: "زيتوني", ombrage: "مظلل",
  ombre: "ظلي", ondulation: "متموج", onyx: "جزعي", or: "ذهبي", orange: "برتقالي", outremer: "لازوردي",
  pacifique: "هادئ", palmier: "نخيلي", panda: "باندا", pistache: "فستقي", plume: "ريشي", pluvieux: "ممطر",
  polaire: "قطبي", porcelaine: "خزفي", poussiere: "غباري", prisme: "منشوري", profond: "عميق", prune: "برقوقي",
  pale: "باهت", peche: "خوخي", racing: "سباق", radiant: "متألق", reflet: "انعكاس", rose: "وردي",
  rouge: "أحمر", rougeatre: "مائل للحمرة", reve: "حالم", reveur: "حالم", sable: "رملي", sableux: "رملي",
  saphir: "ياقوتي", sarcelle: "أزرق مخضر", sauge: "مريمي", scintillant: "متلألئ", sideral: "فلكي",
  sierra: "سييرا", soie: "حريري", soleil: "شمسي", sombre: "داكن", sonique: "صوتي", spectre: "طيفي",
  stellaire: "نجمي", titane: "تيتانيوم", tropical: "استوائي", tropicale: "استوائي", trefle: "برسيمي",
  vagues: "أمواج", velours: "مخملي", vert: "أخضر", verte: "أخضر", vintage: "كلاسيكي", violet: "بنفسجي",
  zele: "حماسي", eclatant: "ساطع", eclipse: "كسوفي", electrique: "كهربائي", elegant: "أنيق",
  emeraude: "زمردي", etoile: "نجمي",
};

// Darija: the base colours are said in Darija, the rest stays as in French
// ("K7el Fantôme"), the way the shop talks.
export const colorWordsDarija: Record<string, string> = {
  noir: "K7el", blanc: "Byed", blanche: "Byed", bleu: "Zre9", vert: "Khdar", verte: "Khdar", rouge: "7mer",
  jaune: "Sfer", gris: "Rmadi", marron: "Qahwi", brun: "Qahwi", or: "Dheb", argent: "Fedda", violet: "Mouv",
};
