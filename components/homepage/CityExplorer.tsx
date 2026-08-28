"use client";

import { useState } from "react";
import { Reveal, Section, Eyebrow } from "./util";
import LocationNodes from "@/components/spatial/LocationNodes";
import SpatialGrid from "@/components/spatial/SpatialGrid";

const CITIES: {
  name: string;
  coords: string;
  density: string;
  top: string;
  locations: string;
}[] = [
  { name: "Delhi", coords: "28.61° N · 77.20° E", density: "High", top: "Electronics", locations: "12,842" },
  { name: "Mumbai", coords: "19.07° N · 72.87° E", density: "Very High", top: "Retail", locations: "14,210" },
  { name: "Bengaluru", coords: "12.97° N · 77.59° E", density: "High", top: "Technology", locations: "16,540" },
  { name: "Chennai", coords: "13.08° N · 80.27° E", density: "High", top: "Manufacturing", locations: "9,312" },
  { name: "Kolkata", coords: "22.57° N · 88.36° E", density: "Medium", top: "Services", locations: "8,120" },
  { name: "Dhaka", coords: "23.81° N · 90.41° E", density: "Very High", top: "Electronics", locations: "18,904" },
  { name: "Hyderabad", coords: "17.38° N · 78.49° E", density: "Medium", top: "Companies", locations: "11,076" },
];

/** City / market exploration — city-aware selector with stats. Illustrative. */
export default function CityExplorer() {
  const [idx, setIdx] = useState(0);
  const c = CITIES[idx];

  return (
    <Section className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>City-aware datasets</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          From One City to{" "}
          <span className="text-ink-500">Entire Markets.</span>
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-500">
          PlaceDesk is built around city and region datasets — switch location and
          the distribution of markets, categories, and clusters changes with it.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* City list */}
        <Reveal>
          <div
            role="listbox"
            aria-label="Select a city"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 lg:flex-col"
          >
            {CITIES.map((city, i) => {
              const on = i === idx;
              return (
                <button
                  key={city.name}
                  role="option"
                  aria-selected={on}
                  onClick={() => setIdx(i)}
                  className={`focusable flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 lg:flex-none lg:justify-start ${
                    on
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                      : "text-ink-600 hover:bg-brand-50"
                  }`}
                >
                  {on && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-white/80"
                    />
                  )}
                  {city.name}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Map visual */}
        <Reveal delay={80}>
          <div key={c.name} className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-ink-900/5">
            <SpatialGrid />
            <div className="relative h-72 sm:h-80">
              <LocationNodes className="h-full w-full anim-drift" pointCount={460} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 bg-canvas/50 px-4 py-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <span className="h-2 w-2 rounded-full bg-brand-600 shadow-[0_0_6px_rgba(124,77,255,0.8)]" />
                  {c.name}
                </div>
                <p className="font-mono text-[11px] text-ink-500">{c.coords}</p>
              </div>
              <div className="flex gap-6 text-xs">
                <span className="text-ink-500">
                  Locations{" "}
                  <span className="font-bold text-ink-900">{c.locations}</span>
                </span>
                <span className="text-ink-500">
                  Density{" "}
                  <span className="font-bold text-ink-900">{c.density}</span>
                </span>
                <span className="text-ink-500">
                  Top{" "}
                  <span className="font-bold text-brand-700">{c.top}</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <p className="mt-4 text-center text-xs text-ink-400">
        Illustrative demo figures for marketing only.
      </p>
    </Section>
  );
}