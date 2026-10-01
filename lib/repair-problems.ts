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

// The words shown for each kind and problem are in the dictionaries
// (t.repairKinds, t.repairProblems), keyed the same way.
export const REPAIR_KINDS: { kind: RepairKind; icon: LucideIcon }[] = [
  { kind: "HARDWARE", icon: Wrench },
  { kind: "SOFTWARE", icon: Monitor },
  { kind: "CONSULTATION", icon: Headphones },
];

export type RepairProblem = { key: string; icon: LucideIcon };

export const PROBLEMS: Record<RepairKind, RepairProblem[]> = {
  HARDWARE: [
    { key: "ecran", icon: Smartphone },
    { key: "batterie", icon: BatteryCharging },
    { key: "camera", icon: Camera },
    { key: "connecteur", icon: Plug },
    { key: "son", icon: Volume2 },
    { key: "reseau", icon: Globe },
    { key: "autre_materiel", icon: Wrench },
  ],
  SOFTWARE: [
    { key: "systeme_bloque", icon: RefreshCcw },
    { key: "mise_a_jour", icon: Settings },
    { key: "donnees", icon: DatabaseBackup },
    { key: "compte_config", icon: Smartphone },
  ],
  CONSULTATION: [{ key: "consultation", icon: Headphones }],
};

export const ALL_PROBLEM_KEYS = Object.values(PROBLEMS).flat().map((p) => p.key);
