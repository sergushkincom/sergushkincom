"use client";

import type { ModelId } from "@/lib/data";
import { SPARKLINE_DATA } from "@/lib/data";
import { sparklineColor } from "@/lib/provider-status";
import type { Model } from "@/lib/data";

type SparklineProps = {
  modelId: ModelId;
  model: Model;
};

export function Sparkline({ modelId, model }: SparklineProps) {
  const data = SPARKLINE_DATA[modelId];
  const color = sparklineColor(model);
  const w = 316;
  const h = 56;
  const pad = 4;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - v) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="px-4">
      <p className="text-secondary mb-2">Last 24 hours</p>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        className="w-full"
      >
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />
      </svg>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-tertiary">24h ago</span>
        <span className="text-tertiary">Now</span>
      </div>
    </div>
  );
}
