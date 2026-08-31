"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import type {
  BaseModel,
  Effort,
  Model,
  Scenario,
  WidgetSize,
} from "@/lib/data";
import {
  applyEffortToAll,
  MODEL_ORDER,
  SCENARIO_CONFIG,
  WIDGET_DIMENSIONS,
} from "@/lib/data";
import { getAdvisoryLine, getBindingWindow, getWindow } from "@/lib/provider-status";
import { useDraggable } from "@/hooks/useDraggable";
import { formatPercent } from "@/lib/format";
import { ModelRing } from "./ModelRing";
import {
  CompactStatusLine,
  getClosestToLimitModel,
  LargeRowContent,
  MediumStatusLine,
} from "./StatusLine";
import { EffortControl } from "./EffortControl";
import { Sparkline } from "./Sparkline";
import { WidgetContextMenu, type MenuState } from "./WidgetContextMenu";

type UsageWidgetProps = {
  baseModels: BaseModel[];
  scenario: Scenario;
  size: WidgetSize;
  desktopRef: React.RefObject<HTMLElement | null>;
  onEffortChange: (effort: Effort) => void;
  onSizeChange: (size: WidgetSize) => void;
  onScenarioChange: (scenario: Scenario) => void;
};

const MEDIUM_RING = 52;
const SMALL_RING = 64;
const LARGE_RING = 44;

function Spacer({ h }: { h: number }) {
  return <div style={{ height: h, flexShrink: 0 }} aria-hidden="true" />;
}

function ModelColumn({
  model,
  ringSize,
}: {
  model: Model;
  ringSize: number;
}) {
  const binding = getBindingWindow(model);
  const used = getWindow(model, binding).used;

  return (
    <div className="flex flex-1 flex-col items-center" style={{ minWidth: 0 }}>
      <ModelRing model={model} diameter={ringSize} bindingOnly />
      <Spacer h={6} />
      <span className="widget-percentage leading-none">{formatPercent(used)}</span>
      <Spacer h={4} />
      <span className="widget-model-name leading-none">{model.name}</span>
      <Spacer h={2} />
      <MediumStatusLine model={model} />
    </div>
  );
}

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

  const advisory = size === "large" ? getAdvisoryLine(baseModels, effort) : null;
  const sparklineModel = models.find((m) => m.id === "opus")!;

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
          {size === "small" && (
            <SmallFace model={getClosestToLimitModel(models)} effort={effort} />
          )}
          {size === "medium" && (
            <MediumFace models={models} effort={effort} onEffortChange={handleEffortChange} />
          )}
          {size === "large" && (
            <LargeFace
              models={models}
              effort={effort}
              onEffortChange={handleEffortChange}
              advisory={advisory}
              sparklineModel={sparklineModel}
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
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <ModelRing model={model} diameter={SMALL_RING} bindingOnly />
        <Spacer h={6} />
        <span className="widget-percentage leading-none">
          {formatPercent(getWindow(model, getBindingWindow(model)).used)}
        </span>
        <Spacer h={4} />
        <span className="widget-model-name leading-none">{model.name}</span>
        <Spacer h={2} />
        <CompactStatusLine model={model} />
      </div>
      <Spacer h={8} />
      <span
        className="widget-effort-label block shrink-0 text-right leading-none"
        style={{ opacity: 0.4 }}
      >
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
    <div className="flex h-full flex-col">
      <div className="flex shrink-0" style={{ gap: 16 }}>
        {models.map((m) => (
          <ModelColumn key={m.id} model={m} ringSize={MEDIUM_RING} />
        ))}
      </div>
      <Spacer h={12} />
      <div className="h-6 shrink-0">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>
    </div>
  );
}

function LargeFace({
  models,
  effort,
  onEffortChange,
  advisory,
  sparklineModel,
}: {
  models: Model[];
  effort: Effort;
  onEffortChange: (e: Effort) => void;
  advisory: string | null;
  sparklineModel: Model;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col">
        {MODEL_ORDER.map((id, index) => {
          const m = models.find((model) => model.id === id)!;
          return (
            <div key={id}>
              {index > 0 && (
                <div style={{ height: 0.5, background: "rgba(255, 255, 255, 0.08)" }} />
              )}
              <div
                className="flex items-start"
                style={{
                  gap: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  boxSizing: "border-box",
                }}
              >
                <ModelRing model={m} diameter={LARGE_RING} bindingOnly />
                <LargeRowContent model={m} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 8 }} />

      <Sparkline modelId={sparklineModel.id} model={sparklineModel} />

      <Spacer h={12} />
      <div className="h-6 shrink-0">
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>

      {advisory && (
        <>
          <Spacer h={8} />
          <p className="widget-advisory shrink-0 text-center">{advisory}</p>
        </>
      )}
    </div>
  );
}
