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

export const copy = {
  healthy: (window: WindowLabel, resetsInMin: number) =>
    `${window} · resets in ${formatMinutes(resetsInMin)}`,
  tight: (window: WindowLabel, gapMin: number) =>
    `${window} · runs out ~${formatMinutes(gapMin)} early`,
  empty: (resetsInMin: number) => `Limit reached · ${formatMinutes(resetsInMin)}`,
  /** Medium / small — binding window, compact */
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
