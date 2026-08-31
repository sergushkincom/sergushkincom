"use client";

import { useId, useState } from "react";
import type { Model, WindowKey } from "@/lib/data";
import {
  getAriaLabel,
  getBindingWindow,
  getWindow,
  getWindowLine,
  getWindowStatus,
  NEUTRAL_RING,
  STATUS_COLORS,
} from "@/lib/provider-status";
import { formatPercent } from "@/lib/format";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ModelRingProps = {
  model: Model;
  size?: number;
  onSelect?: () => void;
  compact?: boolean;
  selected?: boolean;
  /** Small widget: only the binding window ring */
  bindingOnly?: boolean;
};

const RING_SIZE = 56;
const OUTER_STROKE = 4;
const INNER_STROKE = 2.5;
const RING_GAP = 6;

export function ModelRing({
  model,
  size = RING_SIZE,
  onSelect,
  compact = false,
  selected = false,
  bindingOnly = false,
}: ModelRingProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();

  const binding = getBindingWindow(model);
  const bindingWindow = getWindow(model, binding);

  const tweenedSession = useTweenedValue(model.session.used);
  const tweenedWeekly = useTweenedValue(model.weekly.used);
  const tweenedBinding = useTweenedValue(bindingWindow.used);

  const bindingStatus = getWindowStatus(bindingWindow);

  const transitionRing = reducedMotion
    ? "none"
    : "stroke-dashoffset 400ms ease-out, stroke-width 120ms ease, stroke 600ms ease";

  const interactive = Boolean(onSelect);
  const activeOuterStroke = hovered || focused ? OUTER_STROKE + 1 : OUTER_STROKE;
  const activeInnerStroke = hovered || focused ? INNER_STROKE + 0.5 : INNER_STROKE;

  function ringColor(key: WindowKey): string {
    if (bindingOnly) return STATUS_COLORS[bindingStatus];
    return key === binding
      ? STATUS_COLORS[getWindowStatus(getWindow(model, key))]
      : NEUTRAL_RING;
  }

  function drawRing(
    r: number,
    stroke: number,
    used: number,
    color: string,
    trackOpacity = 0.12
  ) {
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(used, 1));
    return (
      <>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-[var(--widget-label)]"
          opacity={trackOpacity}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: transitionRing }}
        />
      </>
    );
  }

  const outerR = (size - OUTER_STROKE) / 2;
  const innerR = outerR - OUTER_STROKE / 2 - RING_GAP - INNER_STROKE / 2;

  const ringContent = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      {bindingOnly ? (
        drawRing(
          outerR,
          activeOuterStroke,
          tweenedBinding,
          STATUS_COLORS[bindingStatus]
        )
      ) : (
        <>
          {drawRing(
            outerR,
            activeOuterStroke,
            tweenedSession,
            ringColor("session")
          )}
          {innerR > 0 &&
            drawRing(
              innerR,
              activeInnerStroke,
              tweenedWeekly,
              ringColor("weekly"),
              0.08
            )}
        </>
      )}
    </svg>
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
          {!compact && bindingOnly && (
            <span className="absolute text-[11px] font-normal leading-none opacity-60">
              {formatPercent(bindingWindow.used)}
            </span>
          )}
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
          <div>
            <span className="font-medium">{model.name}</span>
          </div>
          <div className="mt-0.5 opacity-80">
            Session {formatPercent(model.session.used)} ·{" "}
            {getWindowLine("session", model.session)}
          </div>
          <div className="opacity-80">
            Weekly {formatPercent(model.weekly.used)} ·{" "}
            {getWindowLine("weekly", model.weekly)}
          </div>
        </div>
      )}
    </div>
  );
}

export { RING_SIZE };
