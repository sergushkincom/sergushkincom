"use client";

import { BURN_RATE_HISTORY } from "@/lib/data";

export function BurnRateChart() {
  const data = BURN_RATE_HISTORY;
  const w = 316;
  const h = 80;
  const padX = 8;
  const padY = 8;
  const max = Math.max(...data);

  const barWidth = (w - padX * 2) / data.length - 4;

  return (
    <div className="px-5">
      <p className="text-secondary mb-2">Burn rate</p>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-label="Burn rate over the last 12 hours"
        role="img"
        className="w-full"
      >
        {data.map((v, i) => {
          const barH = ((v / max) * (h - padY * 2));
          const x = padX + i * ((w - padX * 2) / data.length) + 2;
          const y = h - padY - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={2}
              fill="var(--widget-label)"
              opacity={0.2 + (v / max) * 0.5}
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-tertiary">12h ago</span>
        <span className="text-tertiary">Now</span>
      </div>
    </div>
  );
}

export function ResetTimesList({
  providers,
}: {
  providers: { label: string; resetsInMin: number }[];
}) {
  return (
    <div className="px-5 mt-3">
      <p className="text-secondary mb-2">Reset times</p>
      <div className="space-y-1.5">
        {providers.map((p) => (
          <div key={p.label} className="flex justify-between text-[11px]">
            <span className="text-secondary">{p.label}</span>
            <span className="font-medium">{Math.round(p.resetsInMin)}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
