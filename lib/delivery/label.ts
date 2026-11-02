// Ameex's town list mixes "Fes", "AIN SMEN-FES" and "ain aicha - taounate":
// shown to customers in one style ("Ain Smen-Fes"). The original name stays
// the value sent with the order (it's Ameex's own key).
export function cityLabel(name: string): string {
  return name.toLocaleLowerCase("fr").replace(/(^|[\s\-'(])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toLocaleUpperCase("fr"));
}
