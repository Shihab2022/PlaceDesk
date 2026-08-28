"use client";

import Link from "next/link";
import { Eyebrow, Reveal } from "./util";
import SpatialHero from "./SpatialHero";

/**
 * Hero — editorial layout with a large "spatial field" visual underneath.
 */
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* backdrop spatial grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 18% 22%, rgba(124,77,255,0.10), transparent 42%), radial-gradient(circle at 82% 20%, rgba(139,92,246,0.08), transparent 40%), radial-gradient(circle at 50% 90%, rgba(167,139,250,0.10), transparent 45%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow>Spatial Intelligence</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              See Your Market{" "}
              <span className="text-brand-700">From a New Dimension.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-500 sm:text-lg">
              PlaceDesk transforms complex geographic and business data into
              interactive spatial intelligence — helping you discover markets,
              understand location patterns, compare regions, and make smarter
              decisions based on where things actually happen.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="focusable group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-600/30 sm:w-auto"
              >
                Explore PlaceDesk
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="focusable inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-7 py-3 text-sm font-semibold text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-800 sm:w-auto"
              >
                See How It Works
              </a>
            </div>
          </Reveal>
        </div>

        {/* Live spatial visual */}
        <Reveal delay={260} className="mx-auto mt-14 max-w-5xl">
          <SpatialHero />
        </Reveal>
      </div>
    </section>
  );
}