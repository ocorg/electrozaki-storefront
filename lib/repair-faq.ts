import {
  BatteryCharging,
  Camera,
  DatabaseBackup,
  Globe,
  Headphones,
  Plug,
  RefreshCcw,
  Settings,
  Smartphone,
  UserCog,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { REPAIR_SLUGS, type RepairSlug, type RepairTopicText } from "@/lib/i18n/repair/types";

// Repair topics: the language-neutral parts (slugs, icons, display order).
// Their words — titles, intros, per-brand FAQs — are in lib/i18n/repair/,
// one file per language, and are read with getRepairTopics().
//
// Content grounded in well-established, publicly documented troubleshooting
// knowledge (battery chemistry aging, carrier-lock vs. IMEI-blacklist,
// digitizer/LCD failure modes, etc.) — not brand-specific claims we can't
// verify. Keep new entries at this same "generally true, defensible" level
// rather than inventing model-specific specifics.

export { REPAIR_SLUGS, type RepairSlug };
export type { RepairFaqEntry, RepairFaqBrandSection } from "@/lib/i18n/repair/types";

export type RepairTopic = RepairTopicText & { slug: RepairSlug; icon: LucideIcon };

export const REPAIR_TOPIC_ORDER = ["ecran", "batterie", "connecteur", "camera", "son", "reseau"] as const;
export const SOFTWARE_TOPIC_ORDER = ["logiciel-bloque", "mise-a-jour", "donnees", "compte-configuration"] as const;

export const REPAIR_ICONS: Record<RepairSlug, LucideIcon> = {
  ecran: Smartphone,
  batterie: BatteryCharging,
  connecteur: Plug,
  camera: Camera,
  son: Volume2,
  reseau: Globe,
  "logiciel-bloque": RefreshCcw,
  "mise-a-jour": Settings,
  donnees: DatabaseBackup,
  "compte-configuration": UserCog,
  "consultation-en-ligne": Headphones,
};

export function isRepairSlug(value: string): value is RepairSlug {
  return (REPAIR_SLUGS as readonly string[]).includes(value);
}
