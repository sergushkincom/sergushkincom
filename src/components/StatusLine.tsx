"use client";

import type { Model, ProviderStatus, WindowKey } from "@/lib/data";
import { copy, MEDIUM_STATUS, WINDOW_SHORT } from "@/lib/copy";
import { formatPercent } from "@/lib/format";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import {
  getBindingWindow,
  getMinutesUntilEmpty,
  getWindow,
  otherWindow,
  STATUS_COLORS,
  windowLabel,
} from "@/lib/provider-status";

function statusFromMinutesLeft(
  window: { used: number; resetsInMin: number },
  minutesLeft: number
): ProviderStatus {
  if (window.used >= 1) return "empty";
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < window.resetsInMin) return "tight";
  return "healthy";
}

function mediumStatusText(model: Model): string {
  const binding = getBindingWindow(model);
  if (binding === "weekly") return MEDIUM_STATUS.weekly;

  const window = getWindow(model, binding);
  const minutesLeft = getMinutesUntilEmpty(window);
  const status = statusFromMinutesLeft(window, minutesLeft);

  if (status === "empty") return MEDIUM_STATUS.empty;
  if (status === "tight") return MEDIUM_STATUS.tight;
  return MEDIUM_STATUS.healthy;
}

function mediumStatusColor(model: Model): string | undefined {
  const binding = getBindingWindow(model);
  if (binding === "weekly") return undefined;

  const window = getWindow(model, binding);
  const minutesLeft = getMinutesUntilEmpty(window);
  const status = statusFromMinutesLeft(window, minutesLeft);
  return status === "healthy" ? undefined : STATUS_COLORS[status];
}

/** Medium — fixed table copy, binding window only */
export function MediumStatusLine({ model }: { model: Model }) {
  const text = mediumStatusText(model);
  const color = mediumStatusColor(model);

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{ color }}
    >
      {text}
    </p>
  );
}

function compactText(
  windowKey: WindowKey,
  status: ProviderStatus,
  window: { resetsInMin: number },
  tweenedMinutesLeft: number
): string {
  const short = WINDOW_SHORT[windowKey];
  if (status === "empty") return copy.compactEmpty(short);
  if (status === "healthy") return copy.compactHealthy(short, window.resetsInMin);
  const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
  return copy.compactTight(short, gap);
}

/** Small — binding window, compact dynamic copy */
export function CompactStatusLine({ model }: { model: Model }) {
  const binding = getBindingWindow(model);
  const window = getWindow(model, binding);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);
  const text = compactText(binding, status, window, tweenedMinutesLeft);

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{
        color: status === "healthy" ? undefined : STATUS_COLORS[status],
      }}
    >
      {text}
    </p>
  );
}

function largeBindingText(
  windowKey: WindowKey,
  status: ProviderStatus,
  window: { resetsInMin: number },
  tweenedMinutesLeft: number
): string {
  const label = windowLabel(windowKey);
  if (status === "empty") return copy.largeBindingEmpty(label, window.resetsInMin);
  if (status === "healthy") return copy.largeBindingHealthy(label, window.resetsInMin);
  const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
  return copy.largeBindingTight(label, gap);
}

function largeOtherText(
  windowKey: WindowKey,
  status: ProviderStatus,
  window: { resetsInMin: number },
  tweenedMinutesLeft: number
): string {
  const label = windowLabel(windowKey);
  if (status === "empty") return copy.largeOtherEmpty(label, window.resetsInMin);
  if (status === "healthy") {
    const left = Math.min(tweenedMinutesLeft, window.resetsInMin);
    return copy.largeOtherHealthy(label, left);
  }
  const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
  return copy.largeOtherTight(label, gap);
}

function LargeBindingLine({ model }: { model: Model }) {
  const binding = getBindingWindow(model);
  const window = getWindow(model, binding);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);
  const text = largeBindingText(binding, status, window, tweenedMinutesLeft);

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{
        color: status === "healthy" ? undefined : STATUS_COLORS[status],
      }}
    >
      {text}
    </p>
  );
}

function LargeOtherLine({ model }: { model: Model }) {
  const other = otherWindow(getBindingWindow(model));
  const window = getWindow(model, other);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);
  const text = largeOtherText(other, status, window, tweenedMinutesLeft);

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{ opacity: 0.42 }}
    >
      {text}
    </p>
  );
}

export function LargeRowContent({ model }: { model: Model }) {
  const sessionPct = formatPercent(model.session.used);
  const weeklyPct = formatPercent(model.weekly.used);
  const summary = `${WINDOW_SHORT.session} ${sessionPct}  ${WINDOW_SHORT.weekly} ${weeklyPct}`;

  return (
    <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
        <span className="widget-model-name shrink-0 leading-none">{model.name}</span>
        <span className="widget-window-summary shrink-0 leading-none">{summary}</span>
      </div>
      <LargeBindingLine model={model} />
      <LargeOtherLine model={model} />
    </div>
  );
}

export function getClosestToLimitModel(models: Model[]): Model {
  return models.reduce((closest, m) => {
    const bind = getBindingWindow(m);
    const left = getMinutesUntilEmpty(m[bind]);
    const cBind = getBindingWindow(closest);
    const cLeft = getMinutesUntilEmpty(closest[cBind]);
    return left < cLeft ? m : closest;
  });
}
