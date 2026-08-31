"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { ModelRing, RING_DIAMETER } from "./ModelRing";
import { TimeLine, WindowBreakdown } from "./TimeLine";
import { EffortControl } from "./EffortControl";
import { Sparkline } from "./Sparkline";
import {
  WidgetContextMenu,
  type MenuState,
} from "./WidgetContextMenu";

type UsageWidgetProps = {
  baseModels: BaseModel[];
  scenario: Scenario;
  size: WidgetSize;
  desktopRef: React.RefObject<HTMLElement | null>;
  onEffortChange: (effort: Effort) => void;
  onSizeChange: (size: WidgetSize) => void;
  onScenarioChange: (scenario: Scenario) => void;
};

export function UsageWidget({
  baseModels,
  scenario,
  size,
  desktopRef,
  onEffortChange,
  onSizeChange,
  onScenarioChange,
}: UsageWidgetProps) {
  const dims = WIDGET_DIMENSIONS[size];
  const [effort, setEffort] = useState<Effort>("Medium");
  const [selectedId, setSelectedId] = useState<ModelId>("opus");
  const [menu, setMenu] = useState<MenuState>(null);
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

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <>
      <div
        ref={widgetRef}
        className="absolute touch-none select-none"
        style={{
          left: position.x,
          top: position.y,
          width: dims.width,
          height: dims.height,
          zIndex: dragging ? 50 : 10,
        }}
        onContextMenu={handleContextMenu}
        {...dragHandlers}
        role="application"
        aria-label="AI usage widget"
      >
        <div
          className={`widget-surface flex h-full flex-col overflow-hidden ${
            dragging ? "widget-surface--lift" : ""
          }`}
          onPointerDown={(e) => {
            if (e.button === 0 && menu) closeMenu();
          }}
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

      <WidgetContextMenu
        open={menu}
        size={size}
        scenario={scenario}
        onClose={closeMenu}
        onSizeChange={onSizeChange}
        onScenarioChange={onScenarioChange}
      />
    </>
  );
}

function SmallFace({ model, effort }: { model: Model; effort: Effort }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-1 -m-1">
      <ModelRing model={model} bindingOnly onSelect={() => undefined} />
      <span className="widget-model-name">{model.name}</span>
      <TimeLine model={model} className="w-full text-center px-1" bindingOnly />
      <span className="absolute bottom-0 right-0 widget-effort-label">{effort}</span>
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
  const ringSize = Math.min(RING_DIAMETER, 52);

  return (
    <div className="flex h-full flex-col -m-1">
      <div className="flex flex-1 items-start justify-around gap-1 min-h-0 pt-0">
        {models.map((m) => (
          <div key={m.id} className="flex flex-1 flex-col items-center min-w-0 gap-0.5">
            <ModelRing model={m} diameter={ringSize} onSelect={() => undefined} />
            <span className="widget-model-name truncate max-w-full">{m.name}</span>
            <TimeLine model={m} className="w-full text-center" />
          </div>
        ))}
      </div>
      <div className="shrink-0 pt-2">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>
    </div>
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
  const rowRing = 44;

  return (
    <div className="flex h-full flex-col -m-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {MODEL_ORDER.map((id) => {
          const m = models.find((model) => model.id === id)!;
          const isSelected = id === selectedId;
          return (
            <div key={id} className="space-y-0.5">
              <div
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
                className={`focus-ring flex w-full cursor-pointer items-center gap-2 rounded-lg py-0.5 outline-none ${
                  isSelected ? "bg-[rgba(255,255,255,0.06)]" : "hover:bg-[rgba(255,255,255,0.03)]"
                }`}
                aria-pressed={isSelected}
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="widget-model-name leading-tight">{m.name}</div>
                  <div className="widget-tier truncate">{m.tier}</div>
                </div>
                <div className="pointer-events-none shrink-0">
                  <ModelRing
                    model={m}
                    diameter={rowRing}
                    minimal
                    selected={isSelected}
                  />
                </div>
                <div className="min-w-0 flex-[1.2] pointer-events-none">
                  <TimeLine model={m} />
                </div>
              </div>
              <WindowBreakdown model={m} />
            </div>
          );
        })}
      </div>

      <div className="widget-divider my-2 shrink-0" />

      <div className="shrink-0 -mx-2">
        <Sparkline modelId={selected.id} model={selected} />
      </div>

      <div className="shrink-0 pt-2">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>

      {advisory && (
        <p className="widget-advisory shrink-0 pt-2 text-center">{advisory}</p>
      )}
    </div>
  );
}
