"use client";

import { useMemo } from "react";
import SpatialGrid from "@/components/spatial/SpatialGrid";

export default function SpatialBackground({
  density = 40,
  className = "",
}: {
  density?: number;
  className?: string;
}) {
  const nodes = useMemo(
    () =>
      Array.from({ length: density }).map((_, i) => ({
        id: i,
        left: (i * 37.7) % 100,
        top: (i * 53.3 + 13) % 100,
        size: 1 + ((i * 7) % 3),
        drift: ((i * 13) % 8) * 0.5 + 1,
        opacity: 0.4 + ((i * 5) % 40) / 100,
      })),
    [density],
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 12%, rgba(124,77,255,0.10), transparent 45%), radial-gradient(ellipse at 82% 28%, rgba(139,92,246,0.09), transparent 42%), radial-gradient(ellipse at 50% 110%, rgba(167,139,250,0.12), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 120%, rgba(124,77,255,0.16), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-60">
        <SpatialGrid />
      </div>
      {/* contour rings */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.06">
          <circle cx="70" cy="30" r="10" />
          <circle cx="70" cy="30" r="18" />
          <circle cx="70" cy="30" r="26" />
          <circle cx="24" cy="74" r="9" />
          <circle cx="24" cy="74" r="15" />
        </g>
      </svg>
      {/* low-opacity drifting location nodes */}
      {nodes.map((n) => (
        <span
          key={n.id}
          className="absolute block rounded-full bg-brand-400 anim-drift motion-reduce:animate-none"
          style={{
            width: n.size,
            height: n.size,
            left: `${n.left}%`,
            top: `${n.top}%`,
            opacity: n.opacity,
            animationDuration: `${n.drift}s`,
            boxShadow: "0 0 4px rgba(124,77,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}
