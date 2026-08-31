"use client";

import { useRef } from "react";
import type { Scenario, WidgetSize } from "@/lib/data";
import { SCENARIO_CONFIG } from "@/lib/data";
import { MenuBar } from "./MenuBar";
import { UsageWidget } from "./UsageWidget";
import { SegmentedControl } from "./SegmentedControl";
import { useSimulation } from "@/hooks/useSimulation";
import type { Provider } from "@/lib/data";

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
  const providers: Provider[] = useSimulation(scenario);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MenuBar />

      <div
        ref={desktopRef}
        className="desktop-wallpaper absolute inset-0 top-7"
        aria-label="Simulated macOS desktop"
      >
        <UsageWidget providers={providers} size={size} desktopRef={desktopRef} />
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
