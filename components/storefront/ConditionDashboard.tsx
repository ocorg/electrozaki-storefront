type Props = {
  batteryHealthPercent: number | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
};

// Each tile is omitted entirely when its value is null (not applicable —
// an accessory, or a phone with no Face ID hardware) rather than shown as
// a false "unknown" or "defective" state.
export function ConditionDashboard({
  batteryHealthPercent,
  batteryGenuine,
  screenGenuine,
  faceIdWorking,
}: Props) {
  const tiles: { icon: string; label: string; value: string; ok: boolean }[] = [];

  if (batteryHealthPercent !== null) {
    tiles.push({
      icon: "🔋",
      label: "Batterie",
      value: `${batteryHealthPercent}%${batteryGenuine === true ? " · d'origine" : batteryGenuine === false ? " · remplacée" : ""}`,
      ok: batteryHealthPercent >= 80,
    });
  }

  if (screenGenuine !== null) {
    tiles.push({
      icon: "🖼️",
      label: "Écran",
      value: screenGenuine ? "D'origine" : "Remplacé",
      ok: screenGenuine,
    });
  }

  if (faceIdWorking !== null) {
    tiles.push({
      icon: faceIdWorking ? "🆔" : "🚫",
      label: "Face ID",
      value: faceIdWorking ? "Fonctionnel" : "Non fonctionnel",
      ok: faceIdWorking,
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-lg border p-3 text-center ${
            tile.ok ? "border-black/10" : "border-[#c8922a]/50 bg-[#c8922a]/5"
          }`}
        >
          <div className="text-xl">{tile.icon}</div>
          <p className="mt-1 text-xs font-semibold text-neutral-500">{tile.label}</p>
          <p className="text-sm font-medium">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}
