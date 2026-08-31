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
import { ModelMark } from "./ModelMark";

type ModelRingProps = {
  model: Model;
  diameter?: number;
  onSelect?: () => void;
  selected?: boolean;
  /** Small widget: only the binding window ring */
  bindingOnly?: boolean;
  /** Hide mark and percentage (large row compact) */
  minimal?: boolean;
};

export const RING_DIAMETER = 56;
const OUTER_STROKE = 7;
const INNER_STROKE = 3;
const RING_GAP = 6;
const TRACK = "rgba(255, 255, 255, 0.16)";

export function ModelRing({
  model,
  diameter = RING_DIAMETER,
  onSelect,
  selected = false,
  bindingOnly = false,
  minimal = false,
}: ModelRingProps) {
  const [hovered, setHovered] = useState(false);
  const tooltipId = useId();
  const reducedMotion = useReducedMotion();

  const binding = getBindingWindow(model);
  const bindingWindow = getWindow(model, binding);

  const tweenedSession = useTweenedValue(model.session.used);
  const tweenedWeekly = useTweenedValue(model.weekly.used);
  const tweenedBinding = useTweenedValue(bindingWindow.used);

  const scale = diameter / RING_DIAMETER;
  const outerStroke = OUTER_STROKE * scale;
  const innerStroke = INNER_STROKE * scale;
  const gap = RING_GAP * scale;

  const transitionRing = reducedMotion
    ? "none"
    : "stroke-dasharray 400ms ease-out, stroke 600ms ease";

  const interactive = Boolean(onSelect);

  function ringColor(key: WindowKey): string {
    if (bindingOnly) return STATUS_COLORS[getWindowStatus(bindingWindow)];
    return key === binding
      ? STATUS_COLORS[getWindowStatus(getWindow(model, key))]
      : NEUTRAL_RING;
  }

  function arcLength(used: number, r: number): string {
    const circ = 2 * Math.PI * r;
    const filled = circ * Math.min(Math.max(used, 0), 1);
    return `${filled} ${circ}`;
  }

  function drawRing(r: number, stroke: number, used: number, color: string) {
    const cx = diameter / 2;
    const cy = diameter / 2;

    return (
      <g key={`${r}-${stroke}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={TRACK}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLength(used, r)}
          style={{ transition: transitionRing }}
        />
      </g>
    );
  }

  const outerR = (diameter - outerStroke) / 2;
  const innerR = outerR - outerStroke / 2 - gap - innerStroke / 2;

  const displayUsed = bindingOnly
    ? tweenedBinding
    : binding === "session"
      ? tweenedSession
      : tweenedWeekly;

  const ringSvg = (
    <svg
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className="block -rotate-90"
      aria-hidden="true"
    >
      {bindingOnly ? (
        drawRing(
          outerR,
          outerStroke,
          tweenedBinding,
          STATUS_COLORS[getWindowStatus(bindingWindow)]
        )
      ) : (
        <>
          {drawRing(outerR, outerStroke, tweenedSession, ringColor("session"))}
          {innerR > innerStroke &&
            drawRing(innerR, innerStroke, tweenedWeekly, ringColor("weekly"))}
        </>
      )}
    </svg>
  );

  const markSize = 22 * scale;

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
          className={`focus-ring relative flex flex-col items-center outline-none ${
            selected ? "opacity-100" : ""
          }`}
          aria-label={getAriaLabel(model)}
          aria-describedby={hovered ? tooltipId : undefined}
          aria-pressed={selected}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect?.();
            }
          }}
        >
          <div className="relative" style={{ width: diameter, height: diameter }}>
            {ringSvg}
            {!minimal && (
              <div className="absolute inset-0 flex items-center justify-center rotate-0">
                <ModelMark id={model.id} size={markSize} />
              </div>
            )}
          </div>
          {!minimal && (
            <span className="widget-percentage mt-1 leading-none">
              {formatPercent(
                bindingOnly
                  ? bindingWindow.used
                  : getWindow(model, getBindingWindow(model)).used
              )}
            </span>
          )}
        </button>
      ) : (
        <div className="relative flex flex-col items-center">
          <div className="relative" style={{ width: diameter, height: diameter }}>
            {ringSvg}
            {!minimal && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ModelMark id={model.id} size={markSize} />
              </div>
            )}
          </div>
          {!minimal && (
            <span className="widget-percentage mt-1 leading-none">
              {formatPercent(displayUsed)}
            </span>
          )}
        </div>
      )}

      {interactive && hovered && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full z-50 mt-2 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-normal"
          style={{
            background: "var(--tooltip-bg)",
            color: "rgba(255,255,255,0.92)",
            border: "1px solid var(--tooltip-border)",
            boxShadow: "var(--tooltip-shadow)",
          }}
        >
          <div className="font-medium">{model.name}</div>
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

export { RING_DIAMETER as RING_SIZE };
