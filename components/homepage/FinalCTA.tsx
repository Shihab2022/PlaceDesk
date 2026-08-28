"use client";

import Link from "next/link";
import { Reveal } from "./util";
import GeographicNetwork from "@/components/spatial/GeographicNetwork";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-105 w-105 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-70">
          <GeographicNetwork className="h-full w-full" count={30} />
        </div>
        <Reveal>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Start Exploring the World{" "}
            <span className="text-brand-700">Through Data.</span>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-500">
            Build layers. Explore markets. Discover patterns. Make location part
            of every decision.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="focusable group inline-flex items-center gap-2 rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg"
            >
              Explore PlaceDesk
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <a
              href="#platform"
              className="focusable inline-flex items-center rounded-lg border border-line bg-white px-7 py-3.5 text-sm font-semibold text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-800"
            >
              Talk to Us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
