"use client";

import { Reveal, Section, Eyebrow } from "./util";

const STEPS = [
  { n: "01", title: "Connect", text: "Bring together location and business datasets." },
  { n: "02", title: "Organize", text: "Create meaningful layers and give each one a purpose." },
  { n: "03", title: "Explore", text: "Filter, search, compare, and visualize locations." },
  { n: "04", title: "Understand", text: "Turn spatial patterns into confident decisions." },
];

/** From coordinates to context — 4 steps joined by a route path. */
export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>From coordinates to context</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          How PlaceDesk works.
        </h2>
      </div>

      <div className="relative mt-16">
        {/* route connectors on desktop */}
        <svg
          className="absolute left-[6%] right-[6%] top-8 hidden h-6 w-[88%] lg:block"
          viewBox="0 0 1000 20"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M10 10 H 990"
            fill="none"
            stroke="#d6ccff"
            strokeWidth="2"
          />
          <path
            d="M10 10 H 990"
            fill="none"
            stroke="#7c4dff"
            strokeWidth="2"
            strokeDasharray="8 10"
            className="dash-flow"
          />
          {[10, 245, 480, 715, 990].map((x) => (
            <circle key={x} cx={x} cy="10" r="3" fill="#fff" stroke="#7c4dff" strokeWidth="2" />
          ))}
        </svg>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="group relative h-full rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-ink-900/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 font-mono text-sm font-bold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}