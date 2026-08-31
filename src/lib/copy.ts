function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m >= 1440) {
    const d = Math.floor(m / 1440);
    const rem = m % 1440;
    const h = Math.floor(rem / 60);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  }
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m}m`;
}

export type WindowLabel = "Session" | "Weekly";

export const WINDOW_SHORT = {
  session: "5h",
  weekly: "7d",
} as const;

/** Medium — fixed strings only, chosen by binding + status */
export const MEDIUM_STATUS = {
  healthy: "51m left",
  tight: "18m early",
  empty: "Limit · 28m",
  weekly: "2d 4h left",
} as const;

export const copy = {
  /** Large row — binding window, full wording */
  largeBindingHealthy: (window: WindowLabel, resetsInMin: number) =>
    `${window} · resets in ${formatMinutes(resetsInMin)}`,
  largeBindingTight: (window: WindowLabel, gapMin: number) =>
    `${window} · runs out ${formatMinutes(gapMin)} early`,
  largeBindingEmpty: (window: WindowLabel, resetsInMin: number) =>
    `${window} · limit reached, resets in ${formatMinutes(resetsInMin)}`,
  /** Large row — other window, muted */
  largeOtherHealthy: (window: WindowLabel, leftMin: number) =>
    `${window} · ${formatMinutes(leftMin)} left`,
  largeOtherTight: (window: WindowLabel, gapMin: number) =>
    `${window} · runs out ${formatMinutes(gapMin)} early`,
  largeOtherEmpty: (window: WindowLabel, resetsInMin: number) =>
    `${window} · limit reached, resets in ${formatMinutes(resetsInMin)}`,
  /** Small — binding window, compact */
  compactHealthy: (windowShort: string, resetsInMin: number) =>
    `${windowShort} · ${formatMinutes(resetsInMin)}`,
  compactTight: (windowShort: string, gapMin: number) =>
    `${windowShort} · ${formatMinutes(gapMin)} early`,
  compactEmpty: (windowShort: string) => `${windowShort} · limit`,
  advisory: "Medium effort would last past the reset.",
  effortLabel: "Effort",
  windowShort: WINDOW_SHORT,
} as const;

export { formatMinutes };
