"use client";

/**
 * Report navigation cards.
 *
 * Every report section is rendered on one page; these cards act as the
 * entry points. Clicking a card pushes `?report=<id>&section=<key>` onto the
 * URL (a real, shareable route) and scrolls the matching section into view.
 */

import { FiArrowRight } from "react-icons/fi";
import type { ReportModel } from "./types";
import {
  REPORT_SECTIONS,
  SCHEME_CLASSES,
  type ReportSectionKey,
} from "./sectionMeta";
import { formatInt } from "./parse";

export interface SectionStat {
  value: string;
  label: string;
}

/** Headline stats shown on each card, derived from the parsed model. */
function statsFor(model: ReportModel): Record<ReportSectionKey, SectionStat[]> {
  const growth =
    model.clusterGrowthRate !== null
      ? `${model.clusterGrowthRate >= 0 ? "+" : ""}${model.clusterGrowthRate.toFixed(2)}%`
      : "N/A";
  const score = (v: number | null) => (v === null ? "N/A" : v.toFixed(2));

  return {
    overview: [
      { value: formatInt(model.highStreets.length), label: "clusters" },
      {
        value: formatInt(model.projects?.projects.length ?? 0),
        label: "projects",
      },
      { value: growth, label: "growth" },
    ],
    map: [
      { value: formatInt(model.mapPois.length), label: "POIs" },
      { value: formatInt(model.competitors.length), label: "competitors" },
      { value: formatInt(model.anchors.length), label: "anchors" },
    ],
    market: [
      { value: score(model.performanceScore), label: "performance" },
      { value: score(model.revenueScore), label: "revenue" },
      { value: score(model.affluence), label: "affluence" },
    ],
    demographics: [
      { value: formatInt(model.population?.total), label: "residents" },
      { value: formatInt(model.households?.total), label: "households" },
      { value: formatInt(model.apartments.length), label: "price bands" },
    ],
    pois: [
      { value: formatInt(model.poiSummary?.count), label: "total POIs" },
      {
        value: formatInt(model.poiSummary?.entries.length ?? 0),
        label: "categories",
      },
      { value: formatInt(model.brands.length), label: "brands" },
    ],
    competitors: [
      { value: formatInt(model.competitors.length), label: "direct" },
      { value: formatInt(model.anchors.length), label: "anchors" },
      { value: formatInt(model.shoppingMalls?.pois.length ?? 0), label: "malls" },
    ],
    brands: [
      { value: formatInt(model.brands.length), label: "listed" },
      { value: formatInt(model.scoredBrands.length), label: "scored" },
      { value: formatInt(model.competitorsDomains.length), label: "domains" },
    ],
    indexes: [
      {
        value: formatInt(Object.keys(model.groupedIndexes).length),
        label: "grouped",
      },
      {
        value: formatInt(Object.keys(model.indexesFromCounts).length),
        label: "from counts",
      },
      {
        value: formatInt(Object.keys(model.locationScoreWeights).length),
        label: "weights",
      },
    ],
    data: [
      { value: formatInt(model.mapPois.length), label: "map rows" },
      { value: formatInt(model.demandGenerators.length), label: "demand gen." },
      { value: formatInt(model.brands.length), label: "brand rows" },
    ],
  };
}

export default function ReportSectionCards({
  model,
  activeId,
  onSelect,
}: {
  model: ReportModel;
  activeId?: ReportSectionKey | null;
  onSelect: (id: ReportSectionKey) => void;
}) {
  const stats = statsFor(model);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
            Report sections
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-500">
            Everything is on this page — open a card to jump straight to it.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-500">
          {REPORT_SECTIONS.length} sections
        </span>
      </div>

      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_SECTIONS.map((section) => {
          const scheme = SCHEME_CLASSES[section.scheme];
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-label={`Open ${section.label}`}
              className={`focusable group relative flex w-full flex-col gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/5 ${scheme.card} ${
                isActive ? "border-brand-400 ring-2 ring-brand-200" : "border-line"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${scheme.icon} transition-transform duration-200 group-hover:scale-105`}
                >
                  {section.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink-900">
                    {section.label}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">
                    {section.blurb}
                  </span>
                </span>
                <FiArrowRight
                  className={`mt-1 h-4 w-4 shrink-0 text-ink-300 transition-transform duration-200 group-hover:translate-x-0.5 ${scheme.text}`}
                  aria-hidden
                />
              </span>

              <span className="flex flex-wrap items-center gap-1.5">
                {stats[section.id].map((stat) => (
                  <span
                    key={`${section.id}-${stat.label}`}
                    className={`inline-flex items-baseline gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${scheme.chip}`}
                  >
                    <span className="font-bold tabular-nums">{stat.value}</span>
                    <span className="opacity-80">{stat.label}</span>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

