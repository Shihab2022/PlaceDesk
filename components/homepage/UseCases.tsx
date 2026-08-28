"use client";

import { useState } from "react";
import { Reveal, Section, Eyebrow } from "./util";

const CASES = [
  {
    id: "Retail",
    headline: "Find the next market before your competitors do.",
    points: [
      "Market expansion",
      "Store placement",
      "Competitor mapping",
      "Catchment analysis",
      "Market density",
    ],
  },
  {
    id: "Real Estate",
    headline: "Understand what surrounds every opportunity.",
    points: [
      "Area analysis",
      "Amenity proximity",
      "Commercial clusters",
      "Development opportunities",
    ],
  },
  {
    id: "Logistics",
    headline: "See where demand and infrastructure intersect.",
    points: [
      "Distribution planning",
      "Service coverage",
      "Delivery zones",
      "Geographic demand",
    ],
  },
  {
    id: "Healthcare",
    headline: "See access, coverage, and gaps.",
    points: [
      "Facility mapping",
      "Service coverage",
      "Underserved regions",
      "Healthcare expansion",
    ],
  },
  {
    id: "Market Research",
    headline: "Turn geographic data into market intelligence.",
    points: [
      "Competitor analysis",
      "Category distribution",
      "Regional comparison",
      "Market segmentation",
    ],
  },
];

/** Built for decisions that depend on "where". */
export default function UseCases() {
  const [on, setOn] = useState(0);
  const active = CASES[on];

  return (
    <Section id="solutions" className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Built for decisions that depend on "where"</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Where you decide changes{" "}
          <span className="text-ink-500">what you decide.</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-stretch">
        {/* Selector */}
        <Reveal>
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3 h-full">
            {CASES.map((kase, i) => {
              const isOn = i === on;
              return (
                <button
                  key={kase.id}
                  type="button"
                  onClick={() => setOn(i)}
                  aria-pressed={isOn}
                  className={`focusable group flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
                    isOn
                      ? "border border-brand-300 bg-brand-50"
                      : "border border-transparent hover:bg-canvas"
                  }`}
                >
                  <span
                    className={`text-[15px] font-semibold ${
                      isOn ? "text-brand-800" : "text-ink-700"
                    }`}
                  >
                    {kase.id}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full transition-all ${
                      isOn
                        ? "bg-brand-600 shadow-[0_0_8px_rgba(124,77,255,0.8)]"
                        : "bg-line"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Detail */}
        <Reveal delay={80}>
          <div
            key={active.id}
            className="relative h-full overflow-hidden rounded-2xl border border-line bg-white p-8 anim-fade-scale"
          >
            <div className="coordinate-grid absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">
                {active.id}
              </span>
              <h3 className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-ink-900">
                {active.headline}
              </h3>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {active.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-white/80 px-3 py-2.5 text-sm text-ink-700"
                  >
                    <span className="text-brand-500">▸</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}