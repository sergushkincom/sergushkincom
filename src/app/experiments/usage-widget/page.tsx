"use client";

import { useState } from "react";
import type { Scenario, WidgetSize } from "@/lib/data";
import { DesktopStage, PrototypeControls } from "@/components/DesktopStage";

export default function UsageWidgetPage() {
  const [size, setSize] = useState<WidgetSize>("medium");
  const [scenario, setScenario] = useState<Scenario>("idle");

  return (
    <>
      <DesktopStage size={size} scenario={scenario} />
      <PrototypeControls
        size={size}
        scenario={scenario}
        onSizeChange={setSize}
        onScenarioChange={setScenario}
      />
    </>
  );
}
