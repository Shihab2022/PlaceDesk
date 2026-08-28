/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";

type Node = { id: number; x: number; y: number; r: number; c: string };
type Edge = { a: number; b: number };

const PALETTE = ["#7c4dff", "#8b5cf6", "#a78bfa", "#c4b5fd", "#6d3fe8"];

/**
 * A geographic network: floating category nodes connected by thin route lines.
 * Pulsing nodes + subtle connection lines that appear on hover.
 */
export default function GeographicNetwork({
  className = "",
  count = 46,
  showLabels = false,
}: {
  className?: string;
  count?: number;
  showLabels?: boolean;
}) {
  const { nodes, edges } = useMemo(() => {
    const n: Node[] = [];
    // clustered generator so points form spatial groups
    const clusters = [
      { cx: 30, cy: 34, k: 5 },
      { cx: 66, cy: 28, k: 4 },
      { cx: 48, cy: 58, k: 6 },
      { cx: 74, cy: 66, k: 4 },
      { cx: 24, cy: 72, k: 3 },
    ];
    for (let i = 0; i < count; i++) {
      const cl = clusters[i % clusters.length];
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * cl.k;
      n.push({
        id: i,
        x: cl.cx + Math.cos(ang) * rad,
        y: cl.cy + Math.sin(ang) * rad,
        r: 1.4 + Math.random() * 2.4,
        c: PALETTE[i % PALETTE.length],
      });
    }
    // build a connected network (each node joins nearest neighbours)
    const e: Edge[] = [];
    for (let i = 0; i < n.length; i++) {
      const nearest: { j: number; d: number }[] = [];
      for (let j = 0; j < n.length; j++) {
        if (i === j) continue;
        const d = Math.hypot(n[i].x - n[j].x, n[i].y - n[j].y);
        nearest.push({ j, d });
      }
      nearest.sort((a, b) => a.d - b.d);
      nearest.slice(0, 2).forEach(({ j }) => {
        if (
          !e.some(
            (ed) => (ed.a === i && ed.b === j) || (ed.a === j && ed.b === i),
          )
        ) {
          e.push({ a: i, b: j });
        }
      });
    }
    return { nodes: n, edges: e };
  }, [count]);

  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Spatial geographic network"
      >
        {/* connections */}
        {edges.map((ed, i) => {
          const a = nodes[ed.a];
          const b = nodes[ed.b];
          const active = hover === ed.a || hover === ed.b;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={active ? "rgba(124,77,255,0.5)" : "rgba(124,77,255,0.14)"}
              strokeWidth={active ? 0.5 : 0.2}
              className="transition-all duration-300"
            />
          );
        })}
        {/* nodes */}
        {nodes.map((nd) => (
          <g key={nd.id}>
            <circle
              cx={nd.x}
              cy={nd.y}
              r={nd.r + 2.6}
              fill={nd.c}
              opacity="0.18"
              className="anim-pulse-ring"
              style={{ transformOrigin: `${nd.x}px ${nd.y}px` }}
            />
            <circle
              cx={nd.x}
              cy={nd.y}
              r={nd.r}
              fill={nd.c}
              className="cursor-pointer transition-all duration-300"
              style={{ filter: `drop-shadow(0 0 3px ${nd.c})` }}
              onMouseEnter={() => setHover(nd.id)}
            />
          </g>
        ))}
        {showLabels &&
          ["Market cluster", "Retail corridor", "Growth zone"].map(
            (label, i) => (
              <text
                key={label}
                x={[30, 58, 74][i]}
                y={[18, 22, 56][i]}
                fontSize="2.6"
                fill="rgba(52,52,52,0.5)"
                fontFamily="var(--font-inter)"
              >
                {label}
              </text>
            ),
          )}
      </svg>
    </div>
  );
}
