"use client";

import { useId } from "react";
import type { Model, WindowKey } from "@/lib/data";
import { getAriaLabel, getBindingWindow, getWindow, getWindowStatus, NEUTRAL_RING, STATUS_COLORS } from "@/lib/provider-status";
import { useTweenedValue } from "@/hooks/useTweenedValue";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ModelMonogram } from "./ModelMonogram";

type ModelRingProps = {
  model: Model;
  diameter?: number;
  onSelect?: () => void;
  selected?: boolean;
  /** Single ring for the binding window (medium / small / large row) */
  bindingOnly?: boolean;
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
  bindingOnly = true,
}: ModelRingProps) {
  const labelId = useId();
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
  const monogramScale = diameter / RING_DIAMETER;

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
      <g>
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

  const ringSvg = (
    <svg
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className="block shrink-0 -rotate-90"
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

  const ringBlock = (
    <div
      className="relative shrink-0"
      style={{ width: diameter, height: diameter }}
    >
      {ringSvg}
      <div className="absolute inset-0 flex items-center justify-center">
        <ModelMonogram id={model.id} scale={monogramScale} />
      </div>
    </div>
  );

  if (interactive) {
    return (
      <button
        type="button"
        data-no-drag
        className={`focus-ring shrink-0 outline-none ${selected ? "opacity-100" : ""}`}
        style={{ width: diameter, height: diameter }}
        aria-label={getAriaLabel(model)}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
      >
        {ringBlock}
      </button>
    );
  }

  return (
    <div aria-labelledby={labelId} role="img" className="shrink-0">
      <span id={labelId} className="sr-only">
        {getAriaLabel(model)}
      </span>
      {ringBlock}
    </div>
  );
}

export { RING_DIAMETER as RING_SIZE };
