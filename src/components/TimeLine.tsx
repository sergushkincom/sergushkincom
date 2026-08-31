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
} from "@/lib/provider-status";

type TimeLineProps = {
  model: Model;
  className?: string;
  size?: "primary" | "compact";
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
  opacity = 1,
}: {
  windowKey: WindowKey;
  model: Model;
  opacity?: number;
}) {
  const window = getWindow(model, windowKey);
  const minutesLeft = getMinutesUntilEmpty(window);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromMinutesLeft(window, tweenedMinutesLeft);

  let text: string;
  if (status === "empty") {
    text = copy.empty(window.resetsInMin);
  } else if (status === "healthy") {
    text = copy.healthy(windowKey === "session" ? "Session" : "Weekly", window.resetsInMin);
  } else {
    const gap = Math.max(0, window.resetsInMin - tweenedMinutesLeft);
    text = copy.tight(windowKey === "session" ? "Session" : "Weekly", gap);
  }

  return (
    <p
      className="widget-status-line transition-colors duration-[600ms]"
      style={{
        color: status === "healthy" ? undefined : STATUS_COLORS[status],
        opacity: status === "healthy" ? opacity : Math.min(1, opacity + 0.2),
      }}
    >
      {text}
    </p>
  );
}

export function TimeLine({
  model,
  className = "",
  bindingOnly = false,
}: TimeLineProps) {
  const binding = getBindingWindow(model);
  const other = otherWindow(binding);

  if (bindingOnly) {
    return (
      <div className={`min-w-0 ${className}`}>
        <WindowLine windowKey={binding} model={model} />
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <WindowLine windowKey={binding} model={model} />
      <WindowLine windowKey={other} model={model} opacity={0.55} />
    </div>
  );
}

export function WindowBreakdown({ model }: { model: Model }) {
  return (
    <div className="flex gap-4 widget-status-line pl-7 pb-0.5">
      <span>
        {copy.windowShort.session}{" "}
        <span style={{ opacity: 0.85 }}>{Math.round(model.session.used * 100)}%</span>
      </span>
      <span>
        {copy.windowShort.weekly}{" "}
        <span style={{ opacity: 0.85 }}>{Math.round(model.weekly.used * 100)}%</span>
      </span>
    </div>
  );
}
