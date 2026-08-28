"use client";

import { useEffect, useRef, useState } from "react";
import { Section, Eyebrow } from "./util";
import SpatialGrid from "@/components/spatial/SpatialGrid";
import GeographicNetwork from "@/components/spatial/GeographicNetwork";

const STAGES = [
  {
    label: "Locations",
    caption: "Thousands of raw points",
    note: "12,842 locations plotted",
  },
  {
    label: "Categories",
    caption: "Point clouds organize by type",
    note: "Retail · Food · Healthcare · Education …",
  },
  {
    label: "Layers",
    caption: "Datasets stack into layers",
    note: "Each layer keeps its own data & style",
  },
  {
    label: "Patterns",
    caption: "Clusters and density emerge",
    note: "Markets begin to reveal themselves",
  },
  {
    label: "Intelligence",
    caption: "The signal becomes clear",
    note: "From locations to intelligence",
  },
];

/**
 * The signature experience — a spatial field that organizes itself across
 * five scroll stages, ending with "From locations to intelligence."
 */
export default function DataTransformation() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // advance while visible (reduced motion: static)
  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const t = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 2200);
    return () => clearInterval(t);
  }, [inView]);

  const cur = STAGES[stage];

  return (
    <Section className="py-20 sm:py-28">
      <div
        ref={ref}
        className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-ink-900/5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 bg-canvas/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Eyebrow>The signature view</Eyebrow>
          </div>
          <div className="flex items-center gap-1">
            {STAGES.map((St, i) => (
              <button
                key={St.label}
                type="button"
                onClick={() => setStage(i)}
                aria-label={`Show stage ${St.label}`}
                aria-pressed={i === stage}
                className={`focusable h-2 rounded-full transition-all duration-300 ${
                  i === stage
                    ? "w-8 bg-brand-600"
                    : "w-2 bg-line hover:bg-brand-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative grid gap-0 lg:grid-cols-[1.1fr_1fr]">
          {/* visualization */}
          <div className="relative min-h-80 overflow-hidden">
            <SpatialGrid />
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{
                opacity: stage >= 2 ? 1 : stage >= 1 ? 0.7 : 0.4,
                filter: stage >= 3 ? "none" : "blur(1px)",
              }}
            >
              <GeographicNetwork
                className="h-full w-full"
                count={44}
                showLabels={stage >= 3}
              />
            </div>
            <div className="absolute left-4 top-4 rounded-lg bg-white/85 px-3 py-1.5 font-mono text-xs text-ink-500 shadow-sm ring-1 ring-black/5">
              {cur.note}
            </div>
          </div>

          {/* stage caption */}
          <div className="flex flex-col justify-center border-t border-line/60 p-8 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-brand-600">
                0{stage + 1} / 0{STAGES.length}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-400">
                Observe
              </span>
            </div>
            <h3
              key={cur.label}
              className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 anim-fade-up"
            >
              {cur.label}
            </h3>
            <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-ink-500">
              {cur.caption}
            </p>
            {stage === 4 && (
              <p className="mt-5 text-lg font-semibold text-brand-700 anim-fade-up">
                From locations to intelligence.
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {STAGES.slice(0, stage + 1).map((St) => (
                <span
                  key={St.label}
                  className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 anim-fade-scale"
                >
                  {St.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
