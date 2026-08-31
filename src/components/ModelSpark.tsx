const SPARK_PATH =
  "M12 2 C12.6 7.2 16.8 11.4 22 12 C16.8 12.6 12.6 16.8 12 22 C11.4 16.8 7.2 12.6 2 12 C7.2 11.4 11.4 7.2 12 2 Z";

const SPARK_SIZE_BY_RING: Record<number, number> = {
  52: 18,
  64: 20,
  44: 15,
};

type ModelSparkProps = {
  ringDiameter: number;
};

export function ModelSpark({ ringDiameter }: ModelSparkProps) {
  const size = SPARK_SIZE_BY_RING[ringDiameter] ?? 18;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none shrink-0"
      style={{ transform: "translateY(-0.5px)" }}
    >
      <path d={SPARK_PATH} fill="rgba(255, 255, 255, 0.85)" />
    </svg>
  );
}
