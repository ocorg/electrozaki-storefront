import {
  BatteryCharging,
  Camera,
  DatabaseBackup,
  Globe,
  Headphones,
  Monitor,
  Plug,
  RefreshCcw,
  Settings,
  Smartphone,
  Volume2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// What a customer can ask for on /reparation. The keys are the ERP's own
// problem codes (electrozaki_terminal src/lib/codes.ts → repair_problem), so a
// request becomes a repair ticket without any translation — keep both lists
// in step.
export type RepairKind = "HARDWARE" | "SOFTWARE" | "CONSULTATION";

export const REPAIR_KINDS: { kind: RepairKind; label: string; description: string; icon: LucideIcon }[] = [
  { kind: "HARDWARE", label: "Réparation matérielle", description: "Écran, batterie, port de charge, caméra, son…", icon: Wrench },
  { kind: "SOFTWARE", label: "Problème logiciel", description: "Bloqué, lent, mise à jour, données, compte…", icon: Monitor },
  { kind: "CONSULTATION", label: "Consultation en ligne", description: "Un conseil ou un diagnostic à distance, par WhatsApp ou appel vidéo.", icon: Headphones },
];

export type RepairProblem = { key: string; label: string; icon: LucideIcon };

export const PROBLEMS: Record<RepairKind, RepairProblem[]> = {
  HARDWARE: [
    { key: "ecran", label: "Écran", icon: Smartphone },
    { key: "batterie", label: "Batterie", icon: BatteryCharging },
    { key: "camera", label: "Appareil photo", icon: Camera },
    { key: "connecteur", label: "Port de charge", icon: Plug },
    { key: "son", label: "Son / Micro", icon: Volume2 },
    { key: "reseau", label: "Désimlockage réseau", icon: Globe },
    { key: "autre_materiel", label: "Autre panne", icon: Wrench },
  ],
  SOFTWARE: [
    { key: "systeme_bloque", label: "Bloqué, lent ou redémarre en boucle", icon: RefreshCcw },
    { key: "mise_a_jour", label: "Mise à jour / réinstallation", icon: Settings },
    { key: "donnees", label: "Récupération & transfert de données", icon: DatabaseBackup },
    { key: "compte_config", label: "Compte & configuration", icon: Smartphone },
  ],
  CONSULTATION: [{ key: "consultation", label: "Consultation / diagnostic à distance", icon: Headphones }],
};

export const ALL_PROBLEM_KEYS = Object.values(PROBLEMS).flat().map((p) => p.key);

export function problemLabel(key: string): string {
  return Object.values(PROBLEMS).flat().find((p) => p.key === key)?.label ?? key;
}
