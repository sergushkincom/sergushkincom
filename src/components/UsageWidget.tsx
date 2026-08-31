"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import type {
  BaseModel,
  Effort,
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
import { getClosestToLimitModel } from "@/lib/status-copy";
import { useDraggable } from "@/hooks/useDraggable";
import { ModelRing } from "./ModelRing";
import { WidgetSmall } from "./widget/widget-small";
import { WidgetMedium } from "./widget/widget-medium";
import { WidgetLargeRow } from "./widget/widget-large-row";
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

const LARGE_RING = 44;

function Spacer({ h }: { h: number }) {
  return <div style={{ height: h, flexShrink: 0 }} aria-hidden="true" />;
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

  const models = useMemo(
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
          className={`widget-surface flex h-full flex-col ${
            dragging ? "widget-surface--lift" : ""
          }`}
          onPointerDown={(e) => {
            if (e.button === 0 && menu) closeMenu();
          }}
        >
          {size === "small" && (
            <WidgetSmall model={getClosestToLimitModel(models)} />
          )}
          {size === "medium" && (
            <WidgetMedium
              models={models}
              effort={effort}
              onEffortChange={handleEffortChange}
            />
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

function LargeFace({
  models,
  effort,
  onEffortChange,
  advisory,
  sparklineModel,
}: {
  models: ReturnType<typeof applyEffortToAll>;
  effort: Effort;
  onEffortChange: (e: Effort) => void;
  advisory: string | null;
  sparklineModel: ReturnType<typeof applyEffortToAll>[number];
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
                  paddingRight: 16,
                  boxSizing: "border-box",
                }}
              >
                <ModelRing model={m} diameter={LARGE_RING} bindingOnly />
                <WidgetLargeRow model={m} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 8 }} />

      <Sparkline modelId={sparklineModel.id} model={sparklineModel} />

      <Spacer h={12} />
      <div style={{ height: 24, flexShrink: 0 }}>
        <EffortControl value={effort} onChange={onEffortChange} />
      </div>

      {advisory && (
        <>
          <Spacer h={8} />
          <p className="widget-advisory m-0 shrink-0 text-center">{advisory}</p>
        </>
      )}
    </div>
  );
}
