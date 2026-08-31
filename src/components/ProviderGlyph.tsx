import type { ProviderId } from "@/lib/data";

type GlyphProps = {
  id: ProviderId;
  className?: string;
};

export function ProviderGlyph({ id, className = "" }: GlyphProps) {
  const stroke = "currentColor";
  const sw = 1.5;

  switch (id) {
    case "aurora":
      // Starburst
      return (
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {[0, 45, 90, 135].map((angle) => (
            <line
              key={angle}
              x1={9}
              y1={9}
              x2={9 + 7 * Math.cos((angle * Math.PI) / 180)}
              y2={9 + 7 * Math.sin((angle * Math.PI) / 180)}
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
            />
          ))}
          <circle cx={9} cy={9} r={2} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "atlas":
      // Ring
      return (
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx={9} cy={9} r={6.5} stroke={stroke} strokeWidth={sw} />
          <circle cx={9} cy={9} r={2.5} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "lumen":
      // Triangle
      return (
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M9 3 L15.5 14.5 H2.5 Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
