"use client";

import { Reveal, Section, Eyebrow } from "./util";

const STEPS = ["Data", "Layers", "Filter", "Visualize", "Explore", "Insight"];

/** "What is PlaceDesk" — the product pipeline. */
export default function ProductIntro() {
  return (
    <Section id="platform" className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>What is PlaceDesk</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          One Platform. Every Location Story.
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-500">
          PlaceDesk brings geographic data, business locations, visualization,
          filtering, and spatial analysis into one intelligent workspace.
        </p>
      </div>

      <Reveal>
        <div className="mt-14 flex flex-col items-center gap-2 sm:flex-row sm:items-stretch sm:gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div
                className="flex h-16 w-full max-w-[120px] flex-col items-center justify-center rounded-xl border border-line bg-white text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                  Step {i + 1}
                </span>
                <span className="text-sm font-bold text-ink-900">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="my-1 text-xl text-brand-300 sm:my-auto sm:mx-1 sm:rotate-0 rotate-90"
                >
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-400">
          Every stage connects to a real dataset — filter into a segment,
          visualize the pattern, then drill into any location.
        </p>
      </Reveal>
    </Section>
  );
}