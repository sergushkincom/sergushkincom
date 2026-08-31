"use client";

import { useCallback, useRef } from "react";
import type { Effort, Scenario, WidgetSize } from "@/lib/data";
import { SCENARIO_CONFIG } from "@/lib/data";
import { Wallpaper } from "./desktop/wallpaper";
import { MenuBar } from "./MenuBar";
import { UsageWidget } from "./UsageWidget";
import { SegmentedControl } from "./SegmentedControl";
import { useSimulation } from "@/hooks/useSimulation";

const SIZE_OPTIONS: { value: WidgetSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const SCENARIO_OPTIONS = (
  Object.keys(SCENARIO_CONFIG) as Scenario[]
).map((key) => ({
  value: key,
  label: SCENARIO_CONFIG[key].label,
}));

type DesktopStageProps = {
  size: WidgetSize;
  scenario: Scenario;
};

export function DesktopStage({ size, scenario }: DesktopStageProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { models, setEffort } = useSimulation(scenario);

  const handleEffortChange = useCallback(
    (effort: Effort) => {
      setEffort(effort);
    },
    [setEffort]
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />

      <div
        ref={desktopRef}
        className="absolute inset-0 top-7 z-[1]"
        aria-label="Simulated macOS desktop"
      >
        <UsageWidget
          baseModels={models}
          scenario={scenario}
          size={size}
          desktopRef={desktopRef}
          onEffortChange={handleEffortChange}
        />
      </div>
    </div>
  );
}

type PrototypeControlsProps = {
  size: WidgetSize;
  scenario: Scenario;
  onSizeChange: (size: WidgetSize) => void;
  onScenarioChange: (scenario: Scenario) => void;
};

export function PrototypeControls({
  size,
  scenario,
  onSizeChange,
  onScenarioChange,
}: PrototypeControlsProps) {
  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <SegmentedControl
          options={SIZE_OPTIONS}
          value={size}
          onChange={onSizeChange}
          ariaLabel="Widget size"
        />
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <SegmentedControl
          options={SCENARIO_OPTIONS}
          value={scenario}
          onChange={onScenarioChange}
          ariaLabel="Simulation scenario"
        />
      </div>
    </>
  );
}
