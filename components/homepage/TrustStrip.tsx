"use client";

import { Reveal } from "./util";

const AREAS = [
  "Retail",
  "Real Estate",
  "Market Research",
  "Healthcare",
  "Logistics",
  "Expansion",
  "Business Intelligence",
  "Urban Planning",
];

/** Trust / positioning strip below the hero. */
export default function TrustStrip() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8">
      <Reveal>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
          Built for location-driven decisions
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {AREAS.map((area, i) => (
            <span
              key={area}
              className={`text-sm font-medium text-ink-500 ${i > 0 ? "sm:border-l sm:border-line sm:pl-8" : ""}`}
            >
              {area}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}