"use client";

import { Reveal, Section } from "./util";

const RAW = [
  "28,421 records",
  "coordinates",
  "categories",
  "addresses",
  "businesses",
  "regions",
];

const SMART = [
  "Clusters",
  "Patterns",
  "Markets",
  "Opportunities",
  "Relationships",
];

/** Problem: raw location data vs spatial intelligence. */
export default function ProblemSection() {
  return (
    <Section id="data" className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
          The challenge
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Location Data Is Everywhere.{" "}
          <span className="text-ink-500">Intelligence Is Not.</span>
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-500">
          Organizations hold enormous amounts of geographic data — but raw
          coordinates and spreadsheets rarely reveal where demand concentrates,
          where competitors cluster, which areas are underserved, or how markets
          differ from one another.
        </p>
      </div>

      <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Raw data */}
        <Reveal>
          <div className="h-full rounded-2xl border border-line p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
              <span className="h-2 w-2 rounded-full " />
              Raw Location Data
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {RAW.map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-500"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* arrow */}
        <div className="flex items-center justify-center" aria-hidden="true">
          <span className="text-2xl text-brand-500 lg:rotate-0 rotate-90">
            ⟶
          </span>
        </div>

        {/* Intelligence */}
        <Reveal delay={120}>
          <div className="relative h-full overflow-hidden rounded-2xl border border-brand-200 bg-linear-to-br from-brand-50 to-white p-7">
            <div className="coordinate-grid absolute inset-0 opacity-70" />
            <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(124,77,255,0.7)]" />
              Spatial Intelligence
            </div>
            <div className="relative mt-5">
              <ul className="space-y-2.5">
                {SMART.map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2.5 text-sm font-semibold text-ink-800"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-600 text-[11px] text-white">
                      ✓
                    </span>
                    {t}
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
