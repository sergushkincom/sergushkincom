import type { ModelId } from "@/lib/data";

const MONOGRAM: Record<ModelId, string> = {
  opus: "O",
  sonnet: "S",
  haiku: "H",
};

type ModelMonogramProps = {
  id: ModelId;
  /** Scale relative to 15px base (e.g. 44/56 ring) */
  scale?: number;
};

export function ModelMonogram({ id, scale = 1 }: ModelMonogramProps) {
  const size = 15 * scale;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none select-none leading-none"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: "rgba(255, 255, 255, 0.90)",
        transform: "translateY(-0.5px)",
      }}
    >
      {MONOGRAM[id]}
    </span>
  );
}

export { MONOGRAM };
