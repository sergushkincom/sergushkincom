"use client";

import { useId, useState } from "react";
import type { Model } from "@/lib/data";
import { getAriaLabel, getProviderStatus, STATUS_COLORS } from "@/lib/provider-status";
import { formatPercent } from "@/lib/format";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ModelRingProps = {
  model: Model;
  size?: number;
  strokeWidth?: number;
  onSelect?: () => void;
  compact?: boolean;
  selected?: boolean;
};

const RING_SIZE = 56;
const STROKE = 4;

export function ModelRing({
  model,
  size = RING_SIZE,
  strokeWidth = STROKE,
  onSelect,
  compact = false,
  selected = false,
}: ModelRingProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();

  const tweenedUsed = useTweenedValue(model.used);
  const status = getProviderStatus(model);
  const color = STATUS_COLORS[status];

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(tweenedUsed, 1));
  const activeStroke = hovered || focused ? strokeWidth + 1 : strokeWidth;

  const transitionRing = reducedMotion
    ? "none"
    : "stroke-dashoffset 400ms ease-out, stroke-width 120ms ease, stroke 600ms ease";

  const interactive = Boolean(onSelect);

  const ringContent = (
    <>
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
        <span className="absolute text-[11px] font-normal leading-none opacity-60">
          {formatPercent(model.used)}
        </span>
      )}
    </>
  );

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
    >
      {interactive ? (
        <button
          type="button"
          data-no-drag
          className={`focus-ring relative flex items-center justify-center rounded-full outline-none transition-transform duration-[120ms] ${
            selected ? "ring-1 ring-[var(--widget-label)] ring-opacity-20" : ""
          }`}
          style={{ width: size, height: size }}
          aria-label={getAriaLabel(model)}
          aria-describedby={hovered ? tooltipId : undefined}
          aria-pressed={selected}
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
          {ringContent}
        </button>
      ) : (
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          {ringContent}
        </div>
      )}

      {interactive && hovered && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full z-50 mt-2 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-normal transition-opacity duration-[120ms]"
          style={{
            background: "var(--tooltip-bg)",
            color: "var(--widget-label)",
            border: "1px solid var(--tooltip-border)",
            boxShadow: "var(--tooltip-shadow)",
          }}
        >
          <span className="font-medium">{model.name}</span>
          {" · "}
          {formatPercent(model.used)} used
          {" · "}
          Resets in {Math.round(model.resetsInMin)}m
        </div>
      )}
    </div>
  );
}

/** @deprecated Use ModelRing */
export const ProviderRing = ModelRing;

export { RING_SIZE };
