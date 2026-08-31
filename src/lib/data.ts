export type ModelId = "opus" | "sonnet" | "haiku";

export type Effort = "Low" | "Medium" | "High";

export type Model = {
  id: ModelId;
  name: string;
  tier: string;
  used: number;
  resetsInMin: number;
  baseBurnPerMin: number;
  burnPerMin: number;
};

export type Scenario = "idle" | "working" | "burning-fast" | "limit-reached";

export type WidgetSize = "small" | "medium" | "large";

export type ProviderStatus = "healthy" | "tight" | "empty";

/** Stable display order — heaviest first */
export const MODEL_ORDER: ModelId[] = ["opus", "sonnet", "haiku"];

export const EFFORT_MULTIPLIER: Record<Effort, number> = {
  Low: 0.6,
  Medium: 1.0,
  High: 1.8,
};

export const EFFORT_OPTIONS: Effort[] = ["Low", "Medium", "High"];

type BaseModel = Omit<Model, "burnPerMin">;

export type { BaseModel };

export const BASE_MODELS: BaseModel[] = [
  {
    id: "opus",
    name: "Opus 5",
    tier: "For complex tasks",
    used: 0.73,
    resetsInMin: 51,
    // Tuned so Medium lasts past reset, High runs out ~18m early
    baseBurnPerMin: 0.0045,
  },
  {
    id: "sonnet",
    name: "Sonnet 5",
    tier: "Most efficient for everyday tasks",
    used: 0.21,
    resetsInMin: 184,
    baseBurnPerMin: 0.0009,
  },
  {
    id: "haiku",
    name: "Haiku 4.5",
    tier: "Fastest for quick answers",
    used: 0.52,
    resetsInMin: 96,
    baseBurnPerMin: 0.0004,
  },
];

export function applyEffort(model: BaseModel, effort: Effort): Model {
  return {
    ...model,
    burnPerMin: model.baseBurnPerMin * EFFORT_MULTIPLIER[effort],
  };
}

export function applyEffortToAll(models: BaseModel[], effort: Effort): Model[] {
  return MODEL_ORDER.map((id) => {
    const model = models.find((m) => m.id === id);
    if (!model) throw new Error(`Missing model: ${id}`);
    return applyEffort(model, effort);
  });
}

export const SCENARIO_CONFIG: Record<
  Scenario,
  {
    label: string;
    models: BaseModel[];
    simulating: boolean;
    burnMultiplier: number;
    effort: Effort;
  }
> = {
  idle: {
    label: "Idle",
    models: BASE_MODELS.map((m) => ({ ...m })),
    simulating: false,
    burnMultiplier: 1,
    effort: "Medium",
  },
  working: {
    label: "Working",
    models: BASE_MODELS.map((m) => ({ ...m })),
    simulating: true,
    burnMultiplier: 1,
    effort: "Medium",
  },
  "burning-fast": {
    label: "Burning fast",
    models: [
      {
        id: "opus",
        name: "Opus 5",
        tier: "For complex tasks",
        used: 0.82,
        resetsInMin: 38,
        baseBurnPerMin: 0.0045,
      },
      {
        id: "sonnet",
        name: "Sonnet 5",
        tier: "Most efficient for everyday tasks",
        used: 0.45,
        resetsInMin: 120,
        baseBurnPerMin: 0.0009,
      },
      {
        id: "haiku",
        name: "Haiku 4.5",
        tier: "Fastest for quick answers",
        used: 0.68,
        resetsInMin: 52,
        baseBurnPerMin: 0.0004,
      },
    ],
    simulating: true,
    burnMultiplier: 1,
    effort: "High",
  },
  "limit-reached": {
    label: "Limit reached",
    models: [
      {
        id: "opus",
        name: "Opus 5",
        tier: "For complex tasks",
        used: 1.0,
        resetsInMin: 28,
        baseBurnPerMin: 0.0045,
      },
      {
        id: "sonnet",
        name: "Sonnet 5",
        tier: "Most efficient for everyday tasks",
        used: 0.89,
        resetsInMin: 95,
        baseBurnPerMin: 0.0009,
      },
      {
        id: "haiku",
        name: "Haiku 4.5",
        tier: "Fastest for quick answers",
        used: 0.97,
        resetsInMin: 41,
        baseBurnPerMin: 0.0004,
      },
    ],
    simulating: false,
    burnMultiplier: 0,
    effort: "Medium",
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

/** Deterministic 24-point sparkline values (0–1) per model */
export const SPARKLINE_DATA: Record<ModelId, number[]> = {
  opus: [
    0.12, 0.15, 0.18, 0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.58, 0.62, 0.65,
    0.68, 0.7, 0.71, 0.72, 0.73, 0.73, 0.74, 0.74, 0.73, 0.73, 0.73, 0.73,
  ],
  sonnet: [
    0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16,
    0.17, 0.18, 0.19, 0.19, 0.2, 0.2, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21,
  ],
  haiku: [
    0.08, 0.1, 0.14, 0.18, 0.22, 0.28, 0.32, 0.36, 0.4, 0.43, 0.46, 0.48,
    0.49, 0.5, 0.51, 0.51, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52,
  ],
};

/** @deprecated Use Model */
export type Provider = Model;
/** @deprecated Use ModelId */
export type ProviderId = ModelId;
