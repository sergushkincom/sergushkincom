"use client";

import type { Effort } from "@/lib/data";
import { EFFORT_OPTIONS } from "@/lib/data";
import { copy } from "@/lib/copy";

type EffortControlProps = {
  value: Effort;
  onChange: (effort: Effort) => void;
};

export function EffortControl({ value, onChange }: EffortControlProps) {
  return (
    <div
      className="flex items-center gap-2 px-4"
      data-no-drag
      role="group"
      aria-label={copy.effortLabel}
    >
      <span className="shrink-0 text-[11px] font-normal opacity-60">
        {copy.effortLabel}
      </span>
      <div
        className="flex flex-1 rounded-md p-0.5"
        role="radiogroup"
        aria-label={copy.effortLabel}
      >
        {EFFORT_OPTIONS.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              data-no-drag
              onClick={() => onChange(opt)}
              className="focus-ring flex-1 rounded px-2 text-[11px] font-medium outline-none transition-colors duration-[400ms]"
              style={{
                height: 24,
                background: selected
                  ? "rgba(255, 255, 255, 0.22)"
                  : "rgba(255, 255, 255, 0.10)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
