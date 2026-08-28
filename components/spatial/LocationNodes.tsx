"use client";

import { useMemo, useState } from "react";

const CATS: { key: string; color: string; label: string }[] = [
  { key: "Retail", color: "#7c4dff", label: "Retail" },
  { key: "Food", color: "#f59e0b", label: "Food" },
  { key: "Healthcare", color: "#ef4444", label: "Healthcare" },
  { key: "Education", color: "#10b981", label: "Education" },
  { key: "Transport", color: "#0ea5e9", label: "Transport" },
  { key: "Companies", color: "#6366f1", label: "Companies" },
  { key: "Fitness", color: "#ec4899", label: "Fitness" },
  { key: "Electronics", color: "#8b5cf6", label: "Electronics" },
];

const COLLECTORS: { x: number; y: number; radius: number; key: string }[] = [
  { x: 22, y: 30, radius: 10, key: "Retail" },
  { x: 50, y: 22, radius: 9, key: "Food" },
  { x: 76, y: 32, radius: 8, key: "Healthcare" },
  { x: 38, y: 58, radius: 10, key: "Education" },
  { x: 66, y: 62, radius: 9, key: "Transport" },
  { x: 30, y: 82, radius: 8, key: "Companies" },
  { x: 82, y: 80, radius: 7, key: "Fitness" },
  { x: 56, y: 46, radius: 7, key: "Electronics" },
];

type Pt = { x: number; y: number; color: string; r: number; d: number };

/**
 * LocationNodes — a living cluster of geographic points grouped by category.
 * Hovering reacts; prefers-reduced-motion shows a static map. No dashboards.
 */
export default function LocationNodes({
  className = "",
  pointCount = 620,
}: {
  className?: string;
  pointCount?: number;
}) {
  const pts = useMemo<Pt[]>(() => {
    const catColor = (key: string) =>
      CATS.find((c) => c.key === key)?.color ?? "#7c4dff";
    const out: Pt[] = [];
    for (let i = 0; i < pointCount; i++) {
      const cl = COLLECTORS[i % COLLECTORS.length];
      const a = Math.random() * Math.PI * 2;
      const rad = Math.random() * cl.radius;
      out.push({
        x: cl.x + Math.cos(a) * rad,
        y: cl.y + Math.sin(a) * rad,
        color: catColor(cl.key),
        r: 0.5 + Math.random() * 1.1,
        d: Math.random() * 8,
      });
    }
    return out;
  }, [pointCount]);

  const [active, setActive] = useState<number | null>(null);

  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Animated geographic location clusters by category"
      onMouseLeave={() => setActive(null)}
    >
      {/* faint category cluster rings */}
      {COLLECTORS.map((cl, i) => {
        const col = CATS.find((c) => c.key === cl.key)?.color;
        return (
          <circle
            key={i}
            cx={cl.x}
            cy={cl.y}
            r={cl.radius}
            fill={col}
            opacity={0.08}
            className="transition-opacity duration-300"
          />
        );
      })}
      {/* route markers */}
      {COLLECTORS.map((cl, i) => (
        <line
          key={`route${i}`}
          x1={cl.x}
          y1={cl.y}
          x2={cl.x + 6}
          y2={cl.y - 6}
          stroke="rgba(124,77,255,0.15)"
          strokeWidth="0.15"
          strokeDasharray="1 1.2"
        />
      ))}

      {/* animated points */}
      {pts.map((p, i) => {
        const activePt = active === i;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={activePt ? p.r * 4.5 : p.r}
            fill={p.color}
            opacity={activePt ? 1 : 0.4 + p.r * 0.35}
            className="anim-float"
            style={{
              animationDelay: `${p.d}s`,
              transformOrigin: `${p.x}px ${p.y}px`,
            }}
            onMouseEnter={() => setActive(i)}
          />
        );
      })}
    </svg>
  );
}