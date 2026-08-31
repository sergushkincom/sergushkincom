"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseModel, Effort, Scenario } from "@/lib/data";
import { EFFORT_MULTIPLIER, SCENARIO_CONFIG } from "@/lib/data";

const SIM_SPEED = 60; // 1 real second ≈ 1 simulated minute

export function useSimulation(scenario: Scenario) {
  const [models, setModels] = useState<BaseModel[]>(() =>
    SCENARIO_CONFIG[scenario].models.map((m) => ({ ...m }))
  );

  const modelsRef = useRef(models);
  const scenarioRef = useRef(scenario);
  const effortRef = useRef<Effort>("Medium");
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    scenarioRef.current = scenario;
    const fresh = SCENARIO_CONFIG[scenario].models.map((m) => ({ ...m }));
    modelsRef.current = fresh;
    setModels(fresh);
    lastTimeRef.current = null;
  }, [scenario]);

  const setEffort = useCallback((effort: Effort) => {
    effortRef.current = effort;
  }, []);

  const tick = useCallback((now: number) => {
    const cfg = SCENARIO_CONFIG[scenarioRef.current];

    if (cfg.simulating) {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        const deltaMin = deltaSec * SIM_SPEED * cfg.burnMultiplier;
        const multiplier = EFFORT_MULTIPLIER[effortRef.current];

        const next = modelsRef.current.map((m) => {
          const burnPerMin = m.baseBurnPerMin * multiplier;
          let used = m.used + burnPerMin * deltaMin;
          let resetsInMin = m.resetsInMin - deltaMin;
          if (used >= 1) used = 1;
          if (resetsInMin < 0) resetsInMin = 0;
          return { ...m, used, resetsInMin };
        });

        modelsRef.current = next;
        setModels(next);
      }
      lastTimeRef.current = now;
    } else {
      lastTimeRef.current = null;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return { models, setEffort };
}
