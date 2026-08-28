"use client";

import { useRef, useState } from "react";
import LocationNodes from "@/components/spatial/LocationNodes";
import SpatialGrid from "@/components/spatial/SpatialGrid";

type Card = {
  title: string;
  value: string;
  sub: string;
  left: string;
  top: string;
  color: string;
};

const CARDS: Card[] = [
  {
    title: "Electronics",
    value: "42",
    sub: "Koramangala · Bengaluru · Density High",
    left: "22%",
    top: "58%",
    color: "#8b5cf6",
  },
  {
    title: "Food & Beverage",
    value: "128",
    sub: "Cluster detected · Growth +18.4%",
    left: "74%",
    top: "30%",
    color: "#f59e0b",
  },
];

/**
 * The hero "spatial field" — a living geographic dataset that reacts to the
 * cursor with a purple glow and reveals a couple of floating location cards.
 */
export default function SpatialHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, shown: false });
  const [cardIdx, setCardIdx] = useState<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top, shown: true });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, shown: false }))}
      className="relative overflow-hidden rounded-2xl border border-line  shadow-xl shadow-ink-900/5"
    >
      <SpatialGrid />
      <div className="absolute inset-0">
        <LocationNodes className="h-full w-full" pointCount={650} />
      </div>

      {/* cursor glow */}
      <div
        aria-hidden="true"
        className={`spatial-glow h-64 w-64 ${glow.shown ? "" : "hidden-glow"}`}
        style={{ left: glow.x, top: glow.y }}
      />

      {/* floating location cards */}
      {CARDS.map((c, i) => {
        const live = cardIdx === i;
        return (
          <button
            key={c.title}
            type="button"
            onMouseEnter={() => setCardIdx(i)}
            onMouseLeave={() => setCardIdx((v) => (v === i ? null : v))}
            className={`focusable absolute z-10 hidden rounded-xl border bg-white/90 p-3 text-left shadow-lg shadow-ink-900/10 backdrop-blur-md transition-all duration-300 sm:block ${
              live
                ? "-translate-y-1 scale-[1.03] border-brand-300"
                : "border-line hover:border-brand-200"
            }`}
            style={{ left: c.left, top: c.top }}
          >
            <span className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }}
              />
              {live ? "LOCATION DETECTED" : "SPATIAL SIGNAL"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-ink-900">
                {c.title}
              </span>
              <span className="text-lg font-bold" style={{ color: c.color }}>
                {c.value}
              </span>
            </div>
            <span className="text-[11px] text-ink-500">{c.sub}</span>
          </button>
        );
      })}

      {/* bottom legend / live signal strip */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 bg-white/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-700">
            <span className="flex h-1.5 w-1.5">
              <span className="anim-pulse-soft absolute h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand-600" />
            </span>
            Spatial Signal
            <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
              LIVE
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-ink-500">
          <span>
            <span className="font-semibold text-ink-900">12,842</span> locations
          </span>
          <span className="hidden sm:inline">
            <span className="font-semibold text-ink-900">13</span> categories
          </span>
          <span className="hidden sm:inline">
            <span className="font-semibold text-ink-900">24</span> regions
          </span>
          <span className="hidden text-[10px] text-ink-400 md:inline">
            Illustrative demo data
          </span>
        </div>
      </div>
    </div>
  );
}
