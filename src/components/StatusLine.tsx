"use client";

import type { Model, ProviderStatus, WindowKey } from "@/lib/data";
import { copy, WINDOW_SHORT } from "@/lib/copy";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import {
  getBindingWindow,
  getMinutesUntilEmpty,
  getWindow,
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

function fullText(
  windowKey: WindowKey,
  status: ProviderStatus,
  window: { resetsInMin: number },
  tweenedMinutesLeft: number
): string {
  const label = windowLabel(windowKey);
  if (status === "empty") return copy.empty(window.resetsInMin);
  if (status === "healthy") return copy.healthy(label, window.resetsInMin);
  const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
  return copy.tight(label, gap);
}

/** Binding window — compact copy for medium / small */
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

type FullWindowLineProps = {
  windowKey: WindowKey;
  model: Model;
};

function FullWindowLine({ windowKey, model }: FullWindowLineProps) {
  const window = getWindow(model, windowKey);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);
  const text = fullText(windowKey, status, window, tweenedMinutesLeft);
  const isBinding = getBindingWindow(model) === windowKey;

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{
        color:
          status === "healthy" && !isBinding
            ? undefined
            : status === "healthy"
              ? undefined
              : STATUS_COLORS[status],
        opacity: isBinding ? 1 : 0.55,
      }}
    >
      {text}
    </p>
  );
}

/** Both windows — full copy for large rows */
export function FullStatusLines({ model }: { model: Model }) {
  return (
    <div className="flex flex-col gap-0.5">
      <FullWindowLine windowKey="session" model={model} />
      <FullWindowLine windowKey="weekly" model={model} />
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
