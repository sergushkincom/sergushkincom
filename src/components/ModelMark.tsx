import type { ModelId } from "@/lib/data";

type ModelMarkProps = {
  id: ModelId;
  size?: number;
  className?: string;
};

/** Concentric arcs — density expresses the model ladder (3 / 2 / 1). */
export function ModelMark({ id, size = 22, className = "" }: ModelMarkProps) {
  const stroke = "rgba(255, 255, 255, 0.85)";
  const sw = 1.5;
  const scale = size / 18;
  const cx = 9 * scale;
  const cy = 13 * scale;

  const radii: Record<ModelId, number[]> = {
    opus: [4, 6, 8],
    sonnet: [6, 8],
    haiku: [8],
  };

  function arcPath(r: number): string {
    const sr = r * scale;
    const x1 = cx - sr;
    const x2 = cx + sr;
    return `M ${x1} ${cy} A ${sr} ${sr} 0 0 1 ${x2} ${cy}`;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
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
