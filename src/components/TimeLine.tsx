"use client";

import type { Model, ProviderStatus, WindowKey } from "@/lib/data";
import { copy } from "@/lib/copy";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import {
  getBindingWindow,
  getMinutesUntilEmpty,
  getWindow,
  otherWindow,
  STATUS_COLORS,
  windowLabel,
} from "@/lib/provider-status";

type TimeLineProps = {
  model: Model;
  className?: string;
  size?: "primary" | "compact";
  /** When false, show only the binding window line */
  bindingOnly?: boolean;
};

function statusFromMinutesLeft(
  window: { used: number; resetsInMin: number },
  minutesLeft: number
): ProviderStatus {
  if (window.used >= 1) return "empty";
  if (minutesLeft <= 0) return "empty";
  if (minutesLeft < window.resetsInMin) return "tight";
  return "healthy";
}

function WindowLine({
  windowKey,
  model,
  size,
  opacity = 1,
}: {
  windowKey: WindowKey;
  model: Model;
  size: "primary" | "compact";
  opacity?: number;
}) {
  const window = getWindow(model, windowKey);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);
  const label = windowLabel(windowKey);

  let text: string;
  if (status === "empty") {
    text = copy.empty(label, window.resetsInMin);
  } else if (status === "healthy") {
    text = copy.healthy(label, window.resetsInMin);
  } else {
    const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
    text = copy.tight(label, gap);
  }

  const primaryClass =
    size === "primary"
      ? "text-primary-num font-semibold tracking-[-0.02em] transition-colors duration-[600ms]"
      : "text-[11px] font-normal leading-tight transition-colors duration-[600ms]";

  return (
    <p
      className={primaryClass}
      style={{
        color: status === "healthy" ? "var(--widget-label)" : STATUS_COLORS[status],
        opacity,
      }}
    >
      {text}
    </p>
  );
}

export function TimeLine({
  model,
  className = "",
  size = "primary",
  bindingOnly = false,
}: TimeLineProps) {
  const binding = getBindingWindow(model);
  const other = otherWindow(binding);

  if (bindingOnly) {
    return (
      <div className={`flex flex-col gap-0.5 ${className}`}>
        <WindowLine windowKey={binding} model={model} size={size} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <WindowLine windowKey={binding} model={model} size={size} />
      <WindowLine windowKey={other} model={model} size="compact" opacity={0.55} />
    </div>
  );
}

export function WindowBreakdown({ model }: { model: Model }) {
  return (
    <div className="flex gap-4 text-[11px] font-normal pl-7 pb-0.5">
      <span className="opacity-80">
        {copy.windowShort.session}{" "}
        <span className="opacity-70">{Math.round(model.session.used * 100)}%</span>
      </span>
      <span className="opacity-80">
        {copy.windowShort.weekly}{" "}
        <span className="opacity-70">{Math.round(model.weekly.used * 100)}%</span>
      </span>
    </div>
  );
}
