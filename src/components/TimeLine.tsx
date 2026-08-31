"use client";

import type { Model, ProviderStatus } from "@/lib/data";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import {
  getMinutesUntilEmpty,
  STATUS_COLORS,
} from "@/lib/provider-status";
import { copy, formatMinutes } from "@/lib/copy";

type TimeLineProps = {
  model: Model;
  className?: string;
  size?: "primary" | "compact";
};

function statusFromTweened(
  model: Model,
  tweenedMinutesLeft: number
): ProviderStatus {
  if (model.used >= 1) return "empty";
  if (tweenedMinutesLeft <= 0) return "empty";
  if (tweenedMinutesLeft < model.resetsInMin) return "tight";
  return "healthy";
}

function labelFromStatus(
  status: ProviderStatus,
  model: Model,
  tweenedMinutesLeft: number
): string {
  if (status === "empty") return copy.empty(model.resetsInMin);
  if (status === "healthy") return copy.healthy(model.resetsInMin);
  const gap = Math.max(0, model.resetsInMin - tweenedMinutesLeft);
  return copy.tight(gap);
}

export function TimeLine({ model, className = "", size = "primary" }: TimeLineProps) {
  const minutesLeft = getMinutesUntilEmpty(model);
  const tweenedMinutesLeft = useTweenedValue(minutesLeft);
  const status = statusFromTweened(model, tweenedMinutesLeft);
  const label = labelFromStatus(status, model, tweenedMinutesLeft);

  const primaryClass =
    size === "primary"
      ? "text-primary-num font-semibold tracking-[-0.02em] transition-colors duration-[600ms]"
      : "text-[11px] font-normal text-center leading-tight px-1 transition-colors duration-[600ms]";

  return (
    <p
      className={`${primaryClass} ${className}`}
      style={{
        color: status === "healthy" ? "var(--widget-label)" : STATUS_COLORS[status],
        opacity: status === "healthy" && size === "compact" ? 0.85 : 1,
      }}
    >
      {label}
    </p>
  );
}

export { formatMinutes };
