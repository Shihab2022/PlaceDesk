"use client";

/**
 * PlaceDeskLogo — the product's geometric brand mark.
 *
 * A "P" constructed from connected location nodes, a coordinate grid and a
 * layered geographic tile — communicating Location + Data + Places + Intelligence.
 *
 * Variants:
 *  - "full"    : icon + wordmark + descriptor (for homepage hero/footer)
 *  - "compact" : icon + wordmark (for app header)
 *  - "favicon" : icon glyph only (also used for app/nav favicon)
 */
export default function PlaceDeskLogo({
  size = 34,
  variant = "compact",
  theme = "light",
  className = "",
}: {
  size?: number;
  variant?: "full" | "compact" | "favicon";
  theme?: "light" | "dark";
  className?: string;
}) {
  const wordmark = theme === "dark" ? "text-white" : "text-ink-900";
  const sub = theme === "dark" ? "text-white/60" : "text-ink-400";

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <Mark size={size} />
        <span className="flex flex-col leading-none">
          <span className={`text-[17px] font-semibold tracking-tight ${wordmark}`}>
            PlaceDesk
          </span>
          <span className={`text-[10px] font-medium uppercase tracking-[0.16em] ${sub}`}>
            Location Intelligence
          </span>
        </span>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <Mark size={size} />
        <span className="flex flex-col leading-none">
          <span className={`text-[20px] font-semibold tracking-tight ${wordmark}`}>
            PlaceDesk
          </span>
          <span className={`text-[11px] font-medium uppercase tracking-[0.18em] ${sub}`}>
            Turn Location Into Intelligence
          </span>
        </span>
      </span>
    );
  }

  // favicon / icon-only
  return <Mark size={size} className={className} />;
}

/** The icon glyph itself. */
function Mark({
  size,
  className = "",
}: {
  size: number;
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
        <linearGradient id="pd_g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#5B2FBF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#pd_g)" />
      {/* coordinate grid */}
      <path
        d="M13 13h22M13 19h22M13 25h22M13 31h22M13 37h22M17 7v34M24 7v34M31 7v34"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1"
      />
      {/* layered spatial tiles (the "arms" of the P) */}
      <rect x="15" y="14" width="10" height="9" rx="2" fill="#fff" />
      <rect x="27" y="14" width="6" height="9" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="15" y="25" width="10" height="9" rx="2" fill="rgba(255,255,255,0.55)" />
      {/* connected location nodes forming the bowl */}
      <circle cx="21" cy="31.5" r="3.4" fill="#fff" />
      <circle cx="21" cy="31.5" r="1.3" fill="#7C4DFF" />
      {/* route connectors */}
      <path
        d="M25 18l6 6M21 25v-3M27 30l3-3"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.9"
      />
      {/* accent coordinate markers */}
      <circle cx="38" cy="10" r="1.6" fill="#fff" opacity="0.9" />
      <path d="M37 10h.01" stroke="#fff" />
    </svg>
  );
}