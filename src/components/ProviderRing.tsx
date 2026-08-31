"use client";

import { useId, useState } from "react";
import type { Provider } from "@/lib/data";
import {
  getAriaLabel,
  getProviderStatus,
  STATUS_COLORS,
} from "@/lib/provider-status";
import { formatPercent } from "@/lib/format";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ProviderRingProps = {
  provider: Provider;
  size?: number;
  strokeWidth?: number;
  onSelect?: () => void;
  compact?: boolean;
};

const RING_SIZE = 56;
const STROKE = 4;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProviderRing({
  provider,
  size = RING_SIZE,
  strokeWidth = STROKE,
  onSelect,
  compact = false,
}: ProviderRingProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();

  const tweenedUsed = useTweenedValue(provider.used);
  const status = getProviderStatus(provider);
  const color = STATUS_COLORS[status];

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(tweenedUsed, 1));
  const activeStroke = hovered || focused ? strokeWidth + 1 : strokeWidth;

  const transitionRing = reducedMotion
    ? "none"
    : "stroke-dashoffset 400ms ease-out, stroke-width 120ms ease, stroke 600ms ease";

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        data-no-drag
        className={`relative flex items-center justify-center rounded-full outline-none transition-transform duration-[120ms] ${
          focused ? "ring-2 ring-[#007AFF] ring-offset-2 ring-offset-transparent" : ""
        }`}
        style={{ width: size, height: size }}
        aria-label={getAriaLabel(provider)}
        aria-describedby={hovered ? tooltipId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={activeStroke}
            strokeLinecap="round"
            className="text-[var(--widget-label)] opacity-[0.12]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={activeStroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: transitionRing }}
          />
        </svg>
        {!compact && (
          <span
            className="absolute text-[11px] font-normal leading-none opacity-60"
            style={{ fontFamily: "inherit" }}
          >
            {formatPercent(provider.used)}
          </span>
        )}
      </button>

      {hovered && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full z-50 mt-2 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-normal shadow-lg transition-opacity duration-[120ms]"
          style={{
            background: "var(--tooltip-bg)",
            color: "var(--widget-label)",
            border: "1px solid var(--tooltip-border)",
          }}
        >
          <span className="font-medium">{provider.label}</span>
          {" · "}
          {formatPercent(provider.used)} used
          {" · "}
          Resets in {Math.round(provider.resetsInMin)}m
        </div>
      )}
    </div>
  );
}

export { RING_SIZE, CIRCUMFERENCE, RADIUS };
