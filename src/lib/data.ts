export type ProviderId = "aurora" | "atlas" | "lumen";

export type Provider = {
  id: ProviderId;
  label: string;
  used: number;
  resetsInMin: number;
  burnPerMin: number;
};

export type Scenario = "idle" | "working" | "burning-fast" | "limit-reached";

export type WidgetSize = "small" | "medium" | "large";

export type ProviderStatus = "healthy" | "tight" | "empty";

export const BASE_PROVIDERS: Provider[] = [
  { id: "aurora", label: "Aurora", used: 0.73, resetsInMin: 51, burnPerMin: 0.004 },
  { id: "atlas", label: "Atlas", used: 0.21, resetsInMin: 184, burnPerMin: 0.001 },
  { id: "lumen", label: "Lumen", used: 0.52, resetsInMin: 96, burnPerMin: 0.002 },
];

export const SCENARIO_CONFIG: Record<
  Scenario,
  {
    label: string;
    providers: Provider[];
    simulating: boolean;
    burnMultiplier: number;
  }
> = {
  idle: {
    label: "Idle",
    providers: BASE_PROVIDERS.map((p) => ({ ...p })),
    simulating: false,
    burnMultiplier: 1,
  },
  working: {
    label: "Working",
    providers: BASE_PROVIDERS.map((p) => ({ ...p })),
    simulating: true,
    burnMultiplier: 1,
  },
  "burning-fast": {
    label: "Burning fast",
    providers: [
      { id: "aurora", label: "Aurora", used: 0.82, resetsInMin: 38, burnPerMin: 0.012 },
      { id: "atlas", label: "Atlas", used: 0.45, resetsInMin: 120, burnPerMin: 0.004 },
      { id: "lumen", label: "Lumen", used: 0.68, resetsInMin: 52, burnPerMin: 0.008 },
    ],
    simulating: true,
    burnMultiplier: 1,
  },
  "limit-reached": {
    label: "Limit reached",
    providers: [
      { id: "aurora", label: "Aurora", used: 1.0, resetsInMin: 28, burnPerMin: 0 },
      { id: "atlas", label: "Atlas", used: 0.89, resetsInMin: 95, burnPerMin: 0.002 },
      { id: "lumen", label: "Lumen", used: 0.97, resetsInMin: 41, burnPerMin: 0.001 },
    ],
    simulating: false,
    burnMultiplier: 0,
  },
};

export const WIDGET_DIMENSIONS: Record<
  WidgetSize,
  { width: number; height: number; radius: number }
> = {
  small: { width: 170, height: 170, radius: 20 },
  medium: { width: 364, height: 170, radius: 20 },
  large: { width: 364, height: 382, radius: 24 },
};

/** Deterministic 24-point sparkline values (0–1) per provider */
export const SPARKLINE_DATA: Record<ProviderId, number[]> = {
  aurora: [
    0.12, 0.15, 0.18, 0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.58, 0.62, 0.65,
    0.68, 0.7, 0.71, 0.72, 0.73, 0.73, 0.74, 0.74, 0.73, 0.73, 0.73, 0.73,
  ],
  atlas: [
    0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16,
    0.17, 0.18, 0.19, 0.19, 0.2, 0.2, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21,
  ],
  lumen: [
    0.08, 0.1, 0.14, 0.18, 0.22, 0.28, 0.32, 0.36, 0.4, 0.43, 0.46, 0.48,
    0.49, 0.5, 0.51, 0.51, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52,
  ],
};

/** Hourly burn-rate samples for the large-widget chart (last 12 hours) */
export const BURN_RATE_HISTORY: number[] = [
  0.002, 0.003, 0.004, 0.006, 0.008, 0.012, 0.015, 0.011, 0.009, 0.007, 0.005, 0.004,
];
