import type { Locale } from "@/lib/i18n/config";
import type { RepairSlug } from "@/lib/repair-faq";
import { DESC_MAX, fit } from "@/lib/seo-fit";

// Repair pages in Google's results: a short title in the words people search
// ("réparation écran téléphone Meknès"), under ~50 characters so the shop's
// name still fits, and a description that says what happens next.

type Seo = { title: string; what: string };

const FR: Record<RepairSlug, Seo> = {
  ecran: { title: "Réparation écran téléphone à Meknès", what: "Écran cassé, fissuré ou tactile qui ne répond plus" },
  batterie: { title: "Changement batterie téléphone à Meknès", what: "Batterie qui se vide vite ou téléphone qui s'éteint" },
  connecteur: { title: "Réparation port de charge à Meknès", what: "Téléphone qui ne charge plus ou mal" },
  camera: { title: "Réparation caméra téléphone à Meknès", what: "Photo floue, caméra noire ou qui tremble" },
  son: { title: "Réparation haut-parleur et micro à Meknès", what: "On ne vous entend plus, ou le son grésille" },
  reseau: { title: "Déblocage réseau téléphone à Meknès", what: "Téléphone bloqué sur un opérateur" },
  "logiciel-bloque": { title: "Téléphone bloqué ou lent : réparation à Meknès", what: "Téléphone bloqué, lent ou qui redémarre en boucle" },
  "mise-a-jour": { title: "Mise à jour et flash téléphone à Meknès", what: "Mise à jour ratée ou système à réinstaller" },
  donnees: { title: "Récupération de données téléphone à Meknès", what: "Photos, contacts et messages à récupérer ou transférer" },
  "compte-configuration": { title: "Compte et configuration téléphone à Meknès", what: "Compte Google ou Apple, configuration d'un nouveau téléphone" },
  "consultation-en-ligne": { title: "Diagnostic téléphone en ligne, partout au Maroc", what: "Un conseil ou un diagnostic à distance, par WhatsApp ou appel vidéo" },
};

const EN: Record<RepairSlug, Seo> = {
  ecran: { title: "Phone screen repair in Meknes", what: "Cracked screen or touch that no longer responds" },
  batterie: { title: "Phone battery replacement in Meknes", what: "Battery that drains fast or a phone that shuts down" },
  connecteur: { title: "Charging port repair in Meknes", what: "A phone that no longer charges, or charges badly" },
  camera: { title: "Phone camera repair in Meknes", what: "Blurry photos, black or shaking camera" },
  son: { title: "Speaker and microphone repair in Meknes", what: "People can't hear you, or the sound crackles" },
  reseau: { title: "Phone network unlocking in Meknes", what: "A phone locked to one carrier" },
  "logiciel-bloque": { title: "Frozen or slow phone repair in Meknes", what: "A phone that freezes, slows down or keeps restarting" },
  "mise-a-jour": { title: "Phone update and reflashing in Meknes", what: "A failed update or a system to reinstall" },
  donnees: { title: "Phone data recovery in Meknes", what: "Photos, contacts and messages to recover or transfer" },
  "compte-configuration": { title: "Phone account and setup help in Meknes", what: "Google or Apple account, setting up a new phone" },
  "consultation-en-ligne": { title: "Online phone diagnosis, anywhere in Morocco", what: "Advice or a diagnosis remotely, by WhatsApp or video call" },
};

const AR: Record<RepairSlug, Seo> = {
  ecran: { title: "إصلاح شاشة الهاتف في مكناس", what: "شاشة مكسورة أو لمس لا يستجيب" },
  batterie: { title: "تغيير بطارية الهاتف في مكناس", what: "بطارية تنفد بسرعة أو هاتف ينطفئ" },
  connecteur: { title: "إصلاح منفذ الشحن في مكناس", what: "هاتف لا يشحن أو يشحن بصعوبة" },
  camera: { title: "إصلاح كاميرا الهاتف في مكناس", what: "صور ضبابية أو كاميرا سوداء أو مهتزة" },
  son: { title: "إصلاح السماعة والميكروفون في مكناس", what: "لا يسمعك المتصل أو الصوت متقطع" },
  reseau: { title: "فك قفل شبكة الهاتف في مكناس", what: "هاتف مقفل على شبكة واحدة" },
  "logiciel-bloque": { title: "إصلاح هاتف معطل أو بطيء في مكناس", what: "هاتف معطل أو بطيء أو يعيد التشغيل باستمرار" },
  "mise-a-jour": { title: "تحديث وتفليش الهاتف في مكناس", what: "تحديث فاشل أو نظام يحتاج إعادة تثبيت" },
  donnees: { title: "استرجاع بيانات الهاتف في مكناس", what: "صور وجهات اتصال ورسائل لاسترجاعها أو نقلها" },
  "compte-configuration": { title: "الحساب وإعداد الهاتف في مكناس", what: "حساب Google أو Apple، وإعداد هاتف جديد" },
  "consultation-en-ligne": { title: "تشخيص الهاتف عن بعد في كل المغرب", what: "نصيحة أو تشخيص عن بعد عبر واتساب أو مكالمة فيديو" },
};

const DARIJA: Record<RepairSlug, Seo> = {
  ecran: { title: "Tasli7 écran dyal t-téléphone f Mknas", what: "Écran mherres wla tactile ma khddamch" },
  batterie: { title: "Tbdil batterie dyal t-téléphone f Mknas", what: "Batterie katkhwa dghya wla téléphone kaytfa" },
  connecteur: { title: "Tasli7 port de charge f Mknas", what: "Téléphone ma kaycharjich wla kaycharji b sw3ouba" },
  camera: { title: "Tasli7 caméra dyal t-téléphone f Mknas", what: "Tsawer mghabrin, caméra k7la wla katrje3" },
  son: { title: "Tasli7 haut-parleur w micro f Mknas", what: "Ma kaysm3ouch, wla s-sout ma n9ich" },
  reseau: { title: "Déblocage réseau dyal t-téléphone f Mknas", what: "Téléphone msdoud 3la opérateur wa7ed" },
  "logiciel-bloque": { title: "Téléphone bloqué wla t9il: tasli7 f Mknas", what: "Téléphone bloqué, t9il wla kay3awd ytcharja bo7do" },
  "mise-a-jour": { title: "Mise à jour w flash dyal t-téléphone f Mknas", what: "Mise à jour fachla wla système khasso ytbeddel" },
  donnees: { title: "Rjou3 données dyal t-téléphone f Mknas", what: "Tsawer, contacts w messages bach trj3ohom wla tnqlohom" },
  "compte-configuration": { title: "Compte w configuration dyal t-téléphone f Mknas", what: "Compte Google wla Apple, w configuration dyal téléphone jdid" },
  "consultation-en-ligne": { title: "Diagnostic dyal t-téléphone en ligne f ga3 lmghrib", what: "Nasi7a wla diagnostic b WhatsApp wla appel vidéo" },
};

const BY_LOCALE: Record<Locale, Record<RepairSlug, Seo>> = { fr: FR, en: EN, ar: AR, darija: DARIJA };

const TAIL: Record<Locale, (online: boolean) => string> = {
  fr: (online) => (online ? " : réponse rapide, toutes marques. Electro Zaki, Meknès." : " ? À partir de 150 DH, diagnostic et devis gratuits dans notre atelier à Meknès (Ouislane), toutes marques."),
  en: (online) => (online ? ": quick answer, all brands. Electro Zaki, Meknes." : "? From 150 DH, free diagnosis and quote at our workshop in Meknes (Ouislane), all brands."),
  ar: (online) => (online ? ": رد سريع لكل العلامات. إلكترو زكي، مكناس." : "؟ ابتداءً من 150 درهم، تشخيص وعرض سعر مجاني في ورشتنا بمكناس (ويسلان)، لكل العلامات."),
  darija: (online) => (online ? ": jawab dghya, ga3 les marques. Electro Zaki, Mknas." : "? Men 150 DH, diagnostic w devis fabor f l'atelier dyalna f Mknas (Ouislane), ga3 les marques."),
};

// The same ending without "(Ouislane)", for a description that would pass
// Google's 160 characters.
const SHORT_TAIL: Record<Locale, string> = {
  fr: " ? Dès 150 DH, diagnostic et devis gratuits à notre atelier de Meknès, toutes marques.",
  en: "? From 150 DH, free diagnosis and quote at our Meknes workshop, all brands.",
  ar: "؟ ابتداءً من 150 درهم، تشخيص وعرض سعر مجاني في ورشتنا بمكناس، لكل العلامات.",
  darija: "? Men 150 DH, diagnostic w devis fabor f l'atelier dyalna f Mknas, ga3 les marques.",
};

export function repairSeo(locale: Locale, topic: RepairSlug): { title: string; description: string } {
  const seo = BY_LOCALE[locale][topic];
  const online = topic === "consultation-en-ligne";
  const description = online ? seo.what + TAIL[locale](true) : fit(DESC_MAX, seo.what + TAIL[locale](false), seo.what + SHORT_TAIL[locale]);
  return { title: seo.title, description };
}
