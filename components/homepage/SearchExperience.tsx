"use client";

import { useState } from "react";
import { Reveal, Section, Eyebrow } from "./util";
import SpatialGrid from "@/components/spatial/SpatialGrid";
import LocationNodes from "@/components/spatial/LocationNodes";

const QUERIES = [
  {
    q: "Electronics stores in Dhaka",
    note: "1,284 matching Electronics locations in Dhaka Division",
    hl: "Electronics",
  },
  {
    q: "Healthcare around Gulshan",
    note: "312 medical locations within 5 km of Gulshan",
    hl: "Healthcare",
  },
  {
    q: "Food businesses near Koramangala",
    note: "2,140 Food & Beverage locations near Koramangala",
    hl: "Food",
  },
  {
    q: "Show fitness clusters",
    note: "8 Fitness clusters detected across the metro",
    hl: "Fitness",
  },
];

/** Ask your map a question — interactive search concept. */
export default function SearchExperience() {
  const [q, setQ] = useState(0);
  const [typed, setTyped] = useState(QUERIES[0].q);
  const active = QUERIES[q];

  const run = (i: number) => {
    setQ(i);
    setTyped("");
    // re-type animation
    const full = QUERIES[i].q;
    let idx = 0;
    const timer = setInterval(() => {
      idx += 1;
      setTyped(full.slice(0, idx));
      if (idx >= full.length) clearInterval(timer);
    }, 24);
  };

  return (
    <Section className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
          Global search
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Ask Your Map{" "}
          <span className="text-ink-500">a Question.</span>
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-500">
          Search across locations, categories, brands, types, towns, and
          addresses — and watch the map answer.
        </p>
      </div>

      <Reveal>
        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-ink-900/5">
          {/* search bar */}
          <div className="flex items-center gap-3 border-b border-line/60 px-5 py-4">
            <span className="text-ink-400">⌕</span>
            <span className="min-h-[1.2em] flex-1 text-[15px] font-medium text-ink-900">
              {typed}
              <span className="ml-px inline-block h-4 w-px animate-pulse bg-brand-600 align-middle" />
            </span>
            <span className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:block">
              ⌘K
            </span>
          </div>

          <div className="grid gap-0 md:grid-cols-[1fr_1fr]">
            {/* queries */}
            <div className="flex flex-col gap-1 p-4">
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Suggested searches
              </p>
              {QUERIES.map((item, i) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => run(i)}
                  className="focusable rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-600 transition-colors hover:bg-brand-50"
                >
                  <span className="text-brand-500">↗</span> {item.q}
                </button>
              ))}
              <p className="mt-2 px-2 text-[11px] text-ink-400">
                Searches names, categories, brands, types, towns, addresses &amp; pincodes.
              </p>
            </div>

            {/* result visual */}
            <div className="relative min-h-[240px] overflow-hidden border-t border-line/60 bg-canvas/40 md:border-l md:border-t-0">
              <SpatialGrid />
              <div key={q} className="absolute inset-0 anim-fade-up">
                <LocationNodes className="h-full w-full" pointCount={380} />
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="rounded-xl border border-brand-200 bg-white/90 p-3 shadow-md backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-brand-600"
                      style={{ boxShadow: "0 0 6px rgba(124,77,255,0.8)" }}
                    />
                    <span className="text-xs font-bold text-brand-700">
                      {active.hl}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                      search result
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{active.note}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}