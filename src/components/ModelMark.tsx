import type { ModelId } from "@/lib/data";

type ModelMarkProps = {
  id: ModelId;
  className?: string;
};

/** Concentric arcs — density expresses the model ladder (3 / 2 / 1). */
export function ModelMark({ id, className = "" }: ModelMarkProps) {
  const stroke = "currentColor";
  const sw = 1.5;
  const cx = 9;
  const cy = 13;

  const radii: Record<ModelId, number[]> = {
    opus: [4, 6, 8],
    sonnet: [6, 8],
    haiku: [8],
  };

  function arcPath(r: number): string {
    const x1 = cx - r;
    const x2 = cx + r;
    return `M ${x1} ${cy} A ${r} ${r} 0 0 1 ${x2} ${cy}`;
  }

  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {radii[id].map((r) => (
        <path
          key={r}
          d={arcPath(r)}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** @deprecated Use ModelMark */
export const ProviderGlyph = ModelMark;
