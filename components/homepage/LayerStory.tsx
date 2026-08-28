"use client";

import { useState } from "react";
import { Reveal, Section, Eyebrow } from "./util";
import SpatialGrid from "@/components/spatial/SpatialGrid";

const LAYERS: { key: string; color: string }[] = [
  { key: "Malls", color: "#7c4dff" },
  { key: "Electronics", color: "#8b5cf6" },
  { key: "Food", color: "#f59e0b" },
  { key: "Healthcare", color: "#ef4444" },
  { key: "Transport", color: "#0ea5e9" },
];

const PALETTE: Record<string, string> = {
  Malls: "#7c4dff",
  Electronics: "#8b5cf6",
  Food: "#f59e0b",
  Healthcare: "#ef4444",
  Transport: "#0ea5e9",
};

/** Signature section — One Map, Many Perspectives. Interactive layer stacking. */
export default function LayerStory() {
  const [active, setActive] = useState<string[]>(["Malls", "Electronics", "Food"]);

  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <Section className="py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>The core concept</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            One Map. <span className="text-brand-700">Many Perspectives.</span>
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-ink-500">
            Instead of analyzing each dataset independently, combine geographic
            datasets into layered views. Each layer keeps its own data, filters,
            and style — so the map becomes a richer picture of a market.
          </p>

          {/* Layer controls */}
          <div className="mt-7 flex flex-wrap gap-2">
            {LAYERS.map((l) => {
              const on = active.includes(l.key);
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggle(l.key)}
                  aria-pressed={on}
                  className="focusable inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: on ? l.color : "var(--color-line)",
                    background: on ? `${l.color}1a` : "#fff",
                    color: on ? l.color : "#343434",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: l.color, boxShadow: on ? `0 0 6px ${l.color}` : "none" }}
                  />
                  {l.key}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-ink-400">
            {active.length} of {LAYERS.length} layers plotted — click to toggle.
          </p>
        </div>

        {/* Visual map with layered dots */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-ink-900/5">
            <SpatialGrid />
            <div className="relative flex h-72 items-center justify-center sm:h-80">
                {/* Layered dot map */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                {active.map((k, layerIdx) => {
                  const color = PALETTE[k];
                  const points: { x: number; y: number }[] = [];
                  // deterministic-ish smatter cluster per layer
                  for (let i = 0; i < 90; i++) {
                    const seed = (layerIdx * 7919 + i * 104729) % 100000;
                    const a = (seed % 360) * (Math.PI / 180);
                    const cx = 35 + layerIdx * 8;
                    const cy = 30 + (i % 5) * 9;
                    const rad = 18 + (seed % 7);
                    points.push({
                      x: cx + Math.cos(a) * rad,
                      y: cy + Math.sin(a) * rad,
                    });
                  }
                  return (
                    <g key={k} opacity={0.15 + layerIdx * 0.16}>
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="0.8" fill={color} />
                      ))}
                    </g>
                  );
                })}
                {/* map outline motif */}
                <path
                  d="M12 60 C 25 40, 60 40, 78 55 C 88 63, 82 80, 60 82 C 35 84, 12 78, 12 60 Z"
                  fill="none"
                  stroke="#7c4dff"
                  strokeWidth="0.4"
                  strokeDasharray="2 1.4"
                  opacity="0.5"
                />
              </svg>
            </div>

            {/* legend */}
            <div className="border-t border-line/60 bg-canvas/50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Map Layers
                </span>
                {active.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 text-xs font-medium text-ink-700">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PALETTE[a], boxShadow: `0 0 6px ${PALETTE[a]}` }}
                    />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}