import type { BaseModel, Effort, Model, ProviderStatus } from "./data";
import {
  EFFORT_OPTIONS,
  applyEffort,
} from "./data";
import { copy } from "./copy";

export const STATUS_COLORS: Record<ProviderStatus, string> = {
  healthy: "#34C759",
  tight: "#FF9F0A",
  empty: "#FF3B30",
};

export function getMinutesUntilEmpty(model: Model): number {
  if (model.burnPerMin <= 0 || model.used >= 1) return 0;
  return (1 - model.used) / model.burnPerMin;
}

export function getProviderStatus(model: Model): ProviderStatus {
  if (model.used >= 1) return "empty";
  const minutesLeft = getMinutesUntilEmpty(model);
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < model.resetsInMin) return "tight";
  return "healthy";
}

export function getPrimaryLine(model: Model): string {
  const status = getProviderStatus(model);

  if (status === "empty") {
    return copy.empty(model.resetsInMin);
  }

  const minutesLeft = getMinutesUntilEmpty(model);
  if (minutesLeft > model.resetsInMin) {
    return copy.healthy(model.resetsInMin);
  }

  const gap = Math.max(0, model.resetsInMin - minutesLeft);
  return copy.tight(gap);
}

/** Numeric values for tweened time-label transitions */
export function getPrimaryLineValues(model: Model): {
  status: ProviderStatus;
  displayValue: number;
} {
  const status = getProviderStatus(model);
  if (status === "empty") {
    return { status, displayValue: model.resetsInMin };
  }
  const minutesLeft = getMinutesUntilEmpty(model);
  if (minutesLeft > model.resetsInMin) {
    return { status, displayValue: model.resetsInMin };
  }
  return { status, displayValue: model.resetsInMin - minutesLeft };
}

export function formatPrimaryLineFromValues(
  status: ProviderStatus,
  displayValue: number,
  resetsInMin: number
): string {
  if (status === "empty") return copy.empty(resetsInMin);
  if (status === "healthy") return copy.healthy(displayValue);
  return copy.tight(displayValue);
}

export function getAriaLabel(model: Model): string {
  const status = getProviderStatus(model);
  const primary = getPrimaryLine(model);
  return `${model.name}, ${Math.round(model.used * 100)} percent used, ${status}, ${primary}`;
}

export function getAdvisoryLine(
  models: BaseModel[],
  effort: Effort
): string | null {
  if (effort !== "High") return null;

  const effortIndex = EFFORT_OPTIONS.indexOf(effort);
  const lowerEffort = EFFORT_OPTIONS[effortIndex - 1];
  if (!lowerEffort) return null;

  const hasQualifyingModel = models.some((base) => {
    const atCurrent = applyEffort(base, effort);
    const atLower = applyEffort(base, lowerEffort);
    return (
      getProviderStatus(atCurrent) === "tight" &&
      getProviderStatus(atLower) === "healthy"
    );
  });

  if (!hasQualifyingModel) return null;

  // Copy is fixed to Medium per spec
  if (lowerEffort === "Medium") return copy.advisory;
  return null;
}

export function getStatusColor(model: Model): string {
  return STATUS_COLORS[getProviderStatus(model)];
}

export function getLabelColor(model: Model): string {
  const status = getProviderStatus(model);
  return status === "healthy" ? "var(--widget-label)" : STATUS_COLORS[status];
}
