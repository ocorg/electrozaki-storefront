// Battery health the shop calls good: at 79 % and below, iOS shows "Service"
// and advises a replacement (and the unit's price drops), so 80 % and up is
// a good battery whatever the exact number.
export const BATTERY_GOOD_FROM = 80;

export function batteryGood(percent: number): boolean {
  return percent >= BATTERY_GOOD_FROM;
}
