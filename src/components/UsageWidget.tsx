"use client";

import type { Provider, ProviderId, WidgetSize } from "@/lib/data";
import { WIDGET_DIMENSIONS } from "@/lib/data";
import { ProviderCell } from "./ProviderCell";
import { ProviderDetail } from "./ProviderDetail";
import { BurnRateChart, ResetTimesList } from "./BurnRateChart";
import { useDraggable } from "@/hooks/useDraggable";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  getPrimaryLine,
  getSecondaryLine,
  getProviderStatus,
  STATUS_COLORS,
} from "@/lib/provider-status";
import { ProviderGlyph } from "./ProviderGlyph";
import { ProviderRing } from "./ProviderRing";
import { useRef, useState } from "react";

type UsageWidgetProps = {
  providers: Provider[];
  size: WidgetSize;
  desktopRef: React.RefObject<HTMLElement | null>;
};

function getCriticalProvider(providers: Provider[]): Provider {
  return providers.reduce((worst, p) => {
    const wStatus = getProviderStatus(worst);
    const pStatus = getProviderStatus(p);
    const order = { empty: 0, tight: 1, healthy: 2 };
    if (order[pStatus] < order[wStatus]) return p;
    if (pStatus === wStatus && p.used > worst.used) return p;
    return worst;
  });
}

export function UsageWidget({ providers, size, desktopRef }: UsageWidgetProps) {
  const dims = WIDGET_DIMENSIONS[size];
  const reducedMotion = useReducedMotion();
  const [flippedId, setFlippedId] = useState<ProviderId | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const initialPos = { x: 80, y: 120 };
  const { position, dragging, dragHandlers } = useDraggable(
    initialPos,
    desktopRef,
    dims
  );

  const flippedProvider = flippedId
    ? providers.find((p) => p.id === flippedId)
    : null;

  const handleSelect = (id: ProviderId) => setFlippedId(id);
  const handleBack = () => setFlippedId(null);

  const critical = getCriticalProvider(providers);
  const isFlipped = flippedProvider !== null && flippedProvider !== undefined;

  const shadow = dragging
    ? "0 20px 48px rgba(0,0,0,.24), 0 4px 12px rgba(0,0,0,.14)"
    : "0 12px 32px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.10)";

  const transform = dragging && !reducedMotion ? "scale(1.02)" : "scale(1)";

  return (
    <div
      ref={widgetRef}
      className="absolute touch-none select-none"
      style={{
        left: position.x,
        top: position.y,
        width: dims.width,
        height: dims.height,
        zIndex: dragging ? 50 : 10,
        transform,
        transition: reducedMotion ? "none" : "transform 150ms ease, box-shadow 150ms ease",
      }}
      {...dragHandlers}
      role="application"
      aria-label="AI usage widget"
    >
      <div
        className="relative h-full w-full"
        style={{ perspective: reducedMotion ? undefined : "1000px" }}
      >
        {reducedMotion ? (
          <>
            <div
              className="widget-surface absolute inset-0 flex flex-col overflow-hidden"
              style={{
                borderRadius: dims.radius,
                boxShadow: shadow,
                opacity: isFlipped ? 0 : 1,
                transition: "opacity 320ms ease",
                pointerEvents: isFlipped ? "none" : "auto",
              }}
            >
              {size === "small" && (
                <SmallFace provider={critical} onSelect={() => handleSelect(critical.id)} />
              )}
              {size === "medium" && (
                <MediumFace providers={providers} onSelect={handleSelect} />
              )}
              {size === "large" && (
                <LargeFace providers={providers} onSelect={handleSelect} />
              )}
            </div>
            <div
              className="widget-surface absolute inset-0 overflow-hidden"
              style={{
                borderRadius: dims.radius,
                boxShadow: shadow,
                opacity: isFlipped ? 1 : 0,
                transition: "opacity 320ms ease",
                pointerEvents: isFlipped ? "auto" : "none",
              }}
            >
              {flippedProvider && (
                <ProviderDetail provider={flippedProvider} onBack={handleBack} />
              )}
            </div>
          </>
        ) : (
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 320ms ease",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="widget-surface absolute inset-0 flex flex-col overflow-hidden"
              style={{
                borderRadius: dims.radius,
                boxShadow: shadow,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                pointerEvents: isFlipped ? "none" : "auto",
              }}
            >
              {size === "small" && (
                <SmallFace provider={critical} onSelect={() => handleSelect(critical.id)} />
              )}
              {size === "medium" && (
                <MediumFace providers={providers} onSelect={handleSelect} />
              )}
              {size === "large" && (
                <LargeFace providers={providers} onSelect={handleSelect} />
              )}
            </div>
            <div
              className="widget-surface absolute inset-0 overflow-hidden"
              style={{
                borderRadius: dims.radius,
                boxShadow: shadow,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                pointerEvents: isFlipped ? "auto" : "none",
              }}
            >
              {flippedProvider && (
                <ProviderDetail provider={flippedProvider} onBack={handleBack} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallFace({
  provider,
  onSelect,
}: {
  provider: Provider;
  onSelect: () => void;
}) {
  const status = getProviderStatus(provider);
  const primary = getPrimaryLine(provider);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-3 gap-1.5">
      <ProviderRing provider={provider} onSelect={onSelect} size={80} compact />
      <div className="flex items-center gap-1.5 mt-1">
        <ProviderGlyph id={provider.id} className="opacity-70" />
        <span className="text-[13px] font-medium">{provider.label}</span>
      </div>
      <p
        className="text-primary-num font-semibold text-center leading-tight tracking-[-0.02em] transition-colors duration-[600ms]"
        style={{ color: status === "healthy" ? "var(--widget-label)" : STATUS_COLORS[status] }}
      >
        {primary}
      </p>
      <p className="text-secondary">{getSecondaryLine(provider)}</p>
    </div>
  );
}

function MediumFace({
  providers,
  onSelect,
}: {
  providers: Provider[];
  onSelect: (id: ProviderId) => void;
}) {
  return (
    <div className="flex h-full items-center justify-around px-4 py-3">
      {providers.map((p) => (
        <ProviderCell
          key={p.id}
          provider={p}
          layout="inline"
          onSelect={() => onSelect(p.id)}
        />
      ))}
    </div>
  );
}

function LargeFace({
  providers,
  onSelect,
}: {
  providers: Provider[];
  onSelect: (id: ProviderId) => void;
}) {
  return (
    <div className="flex h-full flex-col py-4">
      <div className="flex items-start justify-around px-4 pb-3">
        {providers.map((p) => (
          <ProviderCell
            key={p.id}
            provider={p}
            layout="inline"
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>
      <div className="mx-5 h-px bg-[var(--widget-border)]" />
      <div className="flex-1 flex flex-col justify-center py-3 gap-3">
        <BurnRateChart />
        <ResetTimesList
          providers={providers.map((p) => ({
            label: p.label,
            resetsInMin: p.resetsInMin,
          }))}
        />
      </div>
    </div>
  );
}
