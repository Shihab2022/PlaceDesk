"use client";

import { useMemo } from "react";

/**
 * A decorative "spatial grid" — latitude/longitude lines + contour curves +
 * coordinate markers. Used as a subtle brand motif across the homepage.
 */
export default function SpatialGrid({
  className = "",
  labeled = false,
  animate = true,
}: {
  className?: string;
  labeled?: boolean;
  animate?: boolean;
}) {
  const cells = useMemo(() => {
    const out: { x: number; y: number; s: number; d: number }[] = [];
    for (let i = 0; i < 18; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 2.5,
        d: Math.random() * 6,
      });
    }
    return out;
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* grid lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g stroke="rgba(124,77,255,0.08)" strokeWidth="0.08">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 10} x2={i * 10} y1="0" y2="100" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" x2="100" y1={i * 10} y2={i * 10} />
          ))}
        </g>
        {/* contour rings */}
        <g fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="0.12">
          <circle cx="62" cy="40" r="8" />
          <circle cx="62" cy="40" r="14" />
          <circle cx="62" cy="40" r="22" />
          <circle cx="26" cy="68" r="7" />
          <circle cx="26" cy="68" r="12" />
        </g>
      </svg>

      {/* markers */}
      {cells.map((c, i) => (
        <span
          key={i}
          className={`absolute flex h-1 w-1 items-center justify-center ${
            animate ? "anim-float" : ""
          }`}
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            animationDelay: `${c.d}s`,
          }}
        >
          <span
            className="h-full w-full rounded-full bg-brand-400"
            style={{
              transform: `scale(${c.s})`,
              boxShadow: "0 0 6px rgba(124,77,255,0.5)",
            }}
          />
        </span>
      ))}

      {/* coordinate labels */}
      {labeled && (
        <div className="absolute left-3 top-3 select-none font-mono text-[9px] leading-tight text-ink-500/60">
          <span className="block">28.6139° N</span>
          <span className="block">77.2090° E</span>
        </div>
      )}
    </div>
  );
}