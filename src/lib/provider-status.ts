import type { Provider, ProviderStatus } from "./data";

export const STATUS_COLORS: Record<ProviderStatus, string> = {
  healthy: "#34C759",
  tight: "#FF9F0A",
  empty: "#FF3B30",
};

export function getMinutesUntilEmpty(provider: Provider): number {
  if (provider.burnPerMin <= 0 || provider.used >= 1) return 0;
  return (1 - provider.used) / provider.burnPerMin;
}

export function getProviderStatus(provider: Provider): ProviderStatus {
  if (provider.used >= 1) return "empty";
  const minutesLeft = getMinutesUntilEmpty(provider);
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < provider.resetsInMin) return "tight";
  return "healthy";
}

export function getPrimaryLine(provider: Provider): string {
  const status = getProviderStatus(provider);
  if (status === "empty") return "Limit reached";

  const minutesLeft = getMinutesUntilEmpty(provider);
  if (minutesLeft > provider.resetsInMin) {
    return `Resets in ${formatMinutesShort(provider.resetsInMin)}`;
  }

  const gap = Math.max(0, provider.resetsInMin - minutesLeft);
  return `Runs out ~${formatMinutesShort(gap)} before reset`;
}

export function getSecondaryLine(provider: Provider): string {
  return `${Math.round(provider.used * 100)}% used`;
}

function formatMinutesShort(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m}m`;
}

export function getAriaLabel(provider: Provider): string {
  const status = getProviderStatus(provider);
  const primary = getPrimaryLine(provider);
  return `${provider.label}, ${Math.round(provider.used * 100)} percent used, ${status}, ${primary}`;
}
