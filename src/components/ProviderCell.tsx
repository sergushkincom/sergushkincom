"use client";

import type { Provider } from "@/lib/data";
import { ProviderGlyph } from "./ProviderGlyph";
import { ProviderRing } from "./ProviderRing";
import {
  getPrimaryLine,
  getSecondaryLine,
  getProviderStatus,
  STATUS_COLORS,
} from "@/lib/provider-status";

type ProviderCellProps = {
  provider: Provider;
  layout?: "stacked" | "inline";
  onSelect: () => void;
};

export function ProviderCell({ provider, layout = "stacked", onSelect }: ProviderCellProps) {
  const primary = getPrimaryLine(provider);
  const secondary = getSecondaryLine(provider);
  const status = getProviderStatus(provider);

  if (layout === "inline") {
    return (
      <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
        <ProviderRing provider={provider} onSelect={onSelect} size={52} />
        <div className="flex items-center gap-1 min-w-0">
          <ProviderGlyph id={provider.id} className="shrink-0 opacity-70" />
          <span className="text-[13px] font-medium truncate">{provider.label}</span>
        </div>
        <p
          className="text-[11px] font-normal text-center leading-tight px-1 transition-colors duration-[600ms]"
          style={{ color: STATUS_COLORS[status], opacity: status === "healthy" ? 0.85 : 1 }}
        >
          {primary}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ProviderRing provider={provider} onSelect={onSelect} size={72} />
      <div className="flex items-center gap-1.5">
        <ProviderGlyph id={provider.id} className="opacity-70" />
        <span className="text-[13px] font-medium">{provider.label}</span>
      </div>
      <p
        className="text-primary-num font-semibold text-center leading-tight tracking-[-0.02em] transition-colors duration-[600ms]"
        style={{ color: status === "healthy" ? "var(--widget-label)" : STATUS_COLORS[status] }}
      >
        {primary}
      </p>
      <p className="text-secondary">{secondary}</p>
    </div>
  );
}
