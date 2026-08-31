"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Provider, Scenario } from "@/lib/data";
import { SCENARIO_CONFIG } from "@/lib/data";

const SIM_SPEED = 60; // 1 real second ≈ 1 simulated minute

export function useSimulation(scenario: Scenario) {
  const config = SCENARIO_CONFIG[scenario];
  const [providers, setProviders] = useState<Provider[]>(() =>
    config.providers.map((p) => ({ ...p }))
  );

  const providersRef = useRef(providers);
  const scenarioRef = useRef(scenario);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // Reset when scenario changes
  useEffect(() => {
    scenarioRef.current = scenario;
    const fresh = SCENARIO_CONFIG[scenario].providers.map((p) => ({ ...p }));
    providersRef.current = fresh;
    setProviders(fresh);
    lastTimeRef.current = null;
  }, [scenario]);

  const tick = useCallback((now: number) => {
    const cfg = SCENARIO_CONFIG[scenarioRef.current];
    if (cfg.simulating) {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        const deltaMin = deltaSec * SIM_SPEED * cfg.burnMultiplier;

        const next = providersRef.current.map((p) => {
          let used = p.used + p.burnPerMin * deltaMin;
          let resetsInMin = p.resetsInMin - deltaMin;
          if (used >= 1) {
            used = 1;
          }
          if (resetsInMin < 0) resetsInMin = 0;
          return { ...p, used, resetsInMin };
        });

        providersRef.current = next;
        setProviders(next);
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

  return providers;
}
