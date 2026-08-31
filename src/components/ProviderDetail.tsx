"use client";

import type { Provider, ProviderId } from "@/lib/data";
import { SPARKLINE_DATA } from "@/lib/data";
import { ProviderGlyph } from "./ProviderGlyph";
import {
  getPrimaryLine,
  getSecondaryLine,
  getProviderStatus,
  STATUS_COLORS,
} from "@/lib/provider-status";
import { formatPercent } from "@/lib/format";

type ProviderDetailProps = {
  provider: Provider;
  onBack: () => void;
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 280;
  const h = 64;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - v) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="w-full">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - v) * (h - pad * 2);
        return (
          <circle key={i} cx={x} cy={y} r={1.5} fill={color} opacity={0.5} />
        );
      })}
    </svg>
  );
}

export function ProviderDetail({ provider, onBack }: ProviderDetailProps) {
  const status = getProviderStatus(provider);
  const color = STATUS_COLORS[status];
  const sparkData = SPARKLINE_DATA[provider.id as ProviderId];

  return (
    <div className="flex h-full flex-col px-5 py-4" data-no-drag>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ProviderGlyph id={provider.id} className="opacity-70" />
          <span className="text-[13px] font-medium">{provider.label}</span>
        </div>
        <button
          type="button"
          data-no-drag
          onClick={onBack}
          className="focus-ring rounded-md px-2 py-1 text-[11px] font-medium opacity-60 outline-none transition-opacity hover:opacity-100"
          aria-label={`Back from ${provider.label} details`}
        >
          Back
        </button>
      </div>

      <p
        className="text-primary-num font-semibold tracking-[-0.02em] mb-0.5 transition-colors duration-[600ms]"
        style={{ color: status === "healthy" ? "var(--widget-label)" : color }}
      >
        {getPrimaryLine(provider)}
      </p>
      <p className="text-secondary mb-4">{getSecondaryLine(provider)}</p>

      <div className="flex-1 flex flex-col justify-center">
        <p className="text-secondary mb-2">Last 24 hours</p>
        <Sparkline data={sparkData} color={color} />
        <div className="flex justify-between mt-1">
          <span className="text-tertiary">24h ago</span>
          <span className="text-tertiary">Now</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-[var(--widget-border)]">
        <div className="flex justify-between text-secondary">
          <span>Current usage</span>
          <span>{formatPercent(provider.used)}</span>
        </div>
        <div className="flex justify-between text-secondary mt-1">
          <span>Reset in</span>
          <span>{Math.round(provider.resetsInMin)}m</span>
        </div>
      </div>
    </div>
  );
}
