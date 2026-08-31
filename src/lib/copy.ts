function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m}m`;
}

export const copy = {
  healthy: (resetsInMin: number) => `Resets in ${formatMinutes(resetsInMin)}`,
  tight: (gapMin: number) => `Runs out ~${formatMinutes(gapMin)} early`,
  empty: (resetsInMin: number) =>
    `Limit reached · resets in ${formatMinutes(resetsInMin)}`,
  advisory: "Medium effort would last past the reset.",
  effortLabel: "Effort",
} as const;

export { formatMinutes };
