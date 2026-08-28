"use client";

/**
 * PlaceDesk brand mark — a geometric glyph combining layered map tiles,
 * coordinate nodes and connected locations.
 */
export default function BrandLogo({
  size = 34,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="placedesk_g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#5B2FBF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#placedesk_g)" />
      {/* coordinate grid lines */}
      <path
        d="M12 14h24M12 22h24M12 30h24M12 38h24M18 8v32M26 8v32M34 8v32"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      {/* layered tiles */}
      <rect x="14" y="15" width="9" height="9" rx="2" fill="#fff" />
      <rect x="25" y="15" width="9" height="9" rx="2" fill="rgba(255,255,255,0.55)" />
      <rect x="14" y="26" width="9" height="9" rx="2" fill="rgba(255,255,255,0.55)" />
      {/* location node */}
      <circle cx="30" cy="30" r="4" fill="#fff" />
      <circle cx="30" cy="30" r="1.6" fill="#7C4DFF" />
      {/* route connectors */}
      <path
        d="M23 19.5l7 7M18 30l6-8M30 26l4-4M23 30.5l7 8"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.9"
      />
    </svg>
  );
}