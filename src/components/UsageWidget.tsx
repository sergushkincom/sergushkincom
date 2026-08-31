"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BaseModel,
  Effort,
  Model,
  ModelId,
  Scenario,
  WidgetSize,
} from "@/lib/data";
import {
  applyEffortToAll,
  MODEL_ORDER,
  SCENARIO_CONFIG,
  WIDGET_DIMENSIONS,
} from "@/lib/data";
import { getAdvisoryLine } from "@/lib/provider-status";
import { useDraggable } from "@/hooks/useDraggable";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ModelMark } from "./ModelMark";
import { ModelRing } from "./ModelRing";
import { TimeLine } from "./TimeLine";
import { EffortControl } from "./EffortControl";
import { Sparkline, sparklineColor } from "./Sparkline";
import { useRef } from "react";

type UsageWidgetProps = {
  baseModels: BaseModel[];
  scenario: Scenario;
  size: WidgetSize;
  desktopRef: React.RefObject<HTMLElement | null>;
  onEffortChange: (effort: Effort) => void;
};

export function UsageWidget({
  baseModels,
  scenario,
  size,
  desktopRef,
  onEffortChange,
}: UsageWidgetProps) {
  const dims = WIDGET_DIMENSIONS[size];
  const reducedMotion = useReducedMotion();
  const [effort, setEffort] = useState<Effort>("Medium");
  const [selectedId, setSelectedId] = useState<ModelId>("opus");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = SCENARIO_CONFIG[scenario].effort;
    setEffort(next);
    onEffortChange(next);
  }, [scenario, onEffortChange]);

  const handleEffortChange = (next: Effort) => {
    setEffort(next);
    onEffortChange(next);
  };

  const models: Model[] = useMemo(
    () => applyEffortToAll(baseModels, effort),
    [baseModels, effort]
  );

  const opus = models.find((m) => m.id === "opus")!;
  const advisory = size === "large" ? getAdvisoryLine(baseModels, effort) : null;

  const initialPos = { x: 80, y: 120 };
  const { position, dragging, dragHandlers } = useDraggable(
    initialPos,
    desktopRef,
    dims
  );

  const shadow = dragging ? "var(--widget-shadow-lift)" : "var(--widget-shadow)";
  const transform = dragging && !reducedMotion ? "scale(1.02)" : "scale(1)";

  return (
    <div
      ref={widgetRef}
      className="absolute touch-none select-none"
      style={{
        left: position.x,
        top: position.y,
        width: dims.width,
        height: dims.height,
        zIndex: dragging ? 50 : 10,
        transform,
        transition: reducedMotion ? "none" : "transform 150ms ease, box-shadow 150ms ease",
      }}
      {...dragHandlers}
      role="application"
      aria-label="AI usage widget"
    >
      <div
        className="widget-surface flex h-full flex-col overflow-hidden"
        style={{ borderRadius: dims.radius, boxShadow: shadow }}
      >
        {size === "small" && <SmallFace model={opus} effort={effort} />}
        {size === "medium" && (
          <MediumFace models={models} effort={effort} onEffortChange={handleEffortChange} />
        )}
        {size === "large" && (
          <LargeFace
            models={models}
            effort={effort}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEffortChange={handleEffortChange}
            advisory={advisory}
          />
        )}
      </div>
    </div>
  );
}

function SmallFace({ model, effort }: { model: Model; effort: Effort }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-4 py-3 gap-1">
      <ModelRing model={model} size={72} compact />
      <div className="flex items-center gap-1.5 mt-0.5">
        <ModelMark id={model.id} className="opacity-70" />
        <span className="text-[13px] font-medium">{model.name}</span>
      </div>
      <TimeLine model={model} className="text-center leading-tight" />
      <span className="absolute bottom-2.5 right-3 text-[11px] font-normal opacity-60">
        {effort}
      </span>
    </div>
  );
}

function MediumFace({
  models,
  effort,
  onEffortChange,
}: {
  models: Model[];
  effort: Effort;
  onEffortChange: (e: Effort) => void;
}) {
  return (
    <>
      <div className="flex flex-1 items-center justify-around px-3 pt-2 pb-1">
        {models.map((m) => (
          <div key={m.id} className="flex flex-1 flex-col items-center gap-1 min-w-0">
            <ModelRing model={m} size={48} compact />
            <div className="flex items-center gap-1 min-w-0">
              <ModelMark id={m.id} className="shrink-0 opacity-70" />
              <span className="text-[13px] font-medium truncate">{m.name}</span>
            </div>
            <TimeLine model={m} size="compact" />
          </div>
        ))}
      </div>
      <div className="pb-2.5 pt-1">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>
    </>
  );
}

function LargeFace({
  models,
  effort,
  selectedId,
  onSelect,
  onEffortChange,
  advisory,
}: {
  models: Model[];
  effort: Effort;
  selectedId: ModelId;
  onSelect: (id: ModelId) => void;
  onEffortChange: (e: Effort) => void;
  advisory: string | null;
}) {
  const selected = models.find((m) => m.id === selectedId) ?? models[0];

  return (
    <>
      <div className="flex-1 overflow-hidden px-3 pt-3 pb-2 space-y-2">
        {MODEL_ORDER.map((id) => {
          const m = models.find((model) => model.id === id)!;
          const isSelected = id === selectedId;
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              data-no-drag
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
              className={`focus-ring flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 outline-none transition-colors ${
                isSelected ? "bg-[rgba(255,255,255,0.06)]" : "hover:bg-[rgba(255,255,255,0.03)]"
              }`}
              aria-pressed={isSelected}
            >
              <ModelMark id={m.id} className="shrink-0 opacity-70" />
              <div className="min-w-0 flex-1 text-left">
                <div className="text-[13px] font-medium leading-tight">{m.name}</div>
                <div className="text-[11px] font-normal opacity-60 truncate">{m.tier}</div>
              </div>
              <div className="pointer-events-none">
                <ModelRing model={m} size={40} compact selected={isSelected} />
              </div>
              <div className="w-[108px] shrink-0 pointer-events-none">
                <TimeLine model={m} size="compact" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-4 h-px bg-[var(--widget-border)]" />

      <div className="py-2">
        <Sparkline modelId={selected.id} color={sparklineColor(selected)} />
      </div>

      <div className="pb-2 pt-1">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>

      {advisory && (
        <p className="px-4 pb-3 text-[11px] font-normal opacity-60 text-center">
          {advisory}
        </p>
      )}
    </>
  );
}
