"use client";

import type { ReactNode } from "react";
import { Reveal, Section, Eyebrow } from "./util";
import LocationNodes from "@/components/spatial/LocationNodes";

function FunnelRow() {
  const rows = [
    ["All locations", "24,821", 100],
    ["Category", "8,421", 82],
    ["Brand", "2,184", 64],
    ["Region", "624", 46],
    ["Market segment", "148", 28],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-4 py-2">
      {rows.map((d) => (
        <div key={d[0]} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-right text-xs font-medium text-ink-500">
            {d[0]}
          </span>
          <div
            className="flex h-8 min-w-[40px] items-center justify-center rounded-lg bg-brand-600/15 transition-all duration-500 hover:bg-brand-600/25"
            style={{ width: `${(d[2] as number) * 0.9}%` }}
          >
            <span className="text-xs font-bold text-brand-800">{d[1]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  title,
  text,
  index,
  visual,
}: {
  title: string;
  text: string;
  index: string;
  visual: ReactNode;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-ink-900/5">
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-ink-900">
          {title}
        </h3>
        <span className="font-mono text-sm text-brand-300">{index}</span>
      </div>
      <p className="relative z-10 max-w-sm text-sm leading-relaxed text-ink-500">
        {text}
      </p>
      <div className="mt-4 h-40 overflow-hidden rounded-xl border border-line/60 bg-canvas/60">
        {visual}
      </div>
    </div>
  );
}

/** Four capabilities with editorial/asymmetric layout. */
export default function Capabilities() {
  return (
    <Section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>What PlaceDesk lets you see</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Capabilities that change{" "}
          <span className="text-ink-500">what a location can tell you.</span>
        </h2>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <FeatureCard
            title="Understand Markets"
            text="See where businesses, services, customers, and opportunities are concentrated across a region."
            index="01"
            visual={<LocationNodes className="h-full w-full" pointCount={420} />}
          />
        </Reveal>
        <Reveal delay={80} className="lg:col-span-5">
          <FeatureCard
            title="Layer the World"
            text="Combine multiple datasets on one map and see how different categories interact spatially."
            index="02"
            visual={
              <div className="flex h-full items-center justify-center">
                <div className="relative h-36 w-44">
                  {["Malls", "Food", "Healthcare", "Transport"].map((l, i) => (
                    <div
                      key={l}
                      className="absolute flex items-center justify-center rounded-lg border border-brand-200 bg-white text-xs font-semibold text-ink-700 shadow-sm"
                      style={{
                        width: "140px",
                        height: "30px",
                        left: "10px",
                        top: `${i * 20}px`,
                        transform: `translateY(${i * 2}px)`,
                        opacity: 0.5 + i * 0.12,
                      }}
                    >
                      {i < 4 ? l : ""}
                    </div>
                  ))}
                  <div
                    className="absolute flex items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-md"
                    style={{ width: "140px", height: "30px", left: "10px", top: "116px" }}
                  >
                    = Spatial Market
                  </div>
                </div>
              </div>
            }
          />
        </Reveal>

        <Reveal delay={40} className="lg:col-span-5">
          <FeatureCard
            title="Filter the Signal"
            text="Move from thousands of locations down to the exact segment that matters."
            index="03"
            visual={<FunnelRow />}
          />
        </Reveal>
        <Reveal delay={120} className="lg:col-span-7">
          <FeatureCard
            title="Discover Patterns"
            text="Spot clusters, density, distribution, and geographic relationships that are invisible in raw data."
            index="04"
            visual={<LocationNodes className="h-full w-full" pointCount={420} />}
          />
        </Reveal>
      </div>
    </Section>
  );
}