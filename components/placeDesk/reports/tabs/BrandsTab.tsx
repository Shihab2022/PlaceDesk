"use client";

/**
 * Brands: searchable / sortable table over `top_brands` (up to 1.5k rows in
 * the sample data), a performance scatter plot and a detail drawer.
 * Rendering is capped per page so the table stays responsive.
 */

import { useMemo, useState } from "react";
import type { BusinessRecord, ReportModel } from "../types";
import {
  formatDecimal,
  formatDistanceKm,
  formatInt,
  formatNumber,
  humanizeKey,
} from "../parse";
import {
  EmptyState,
  PaginationBar,
  SectionCard,
  usePagination,
} from "../ui";
import { ScatterPlot } from "../charts";

type SortKey = "reviews" | "performance" | "distance" | "votes" | "name";

export default function BrandsTab({
  model,
  onOpenBrand,
}: {
  model: ReportModel;
  onOpenBrand: (brand: BusinessRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("reviews");
  const [scoredOnly, setScoredOnly] = useState(false);
  const [geoOnly, setGeoOnly] = useState(false);
  const table = usePagination();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = model.brands;
    if (q) {
      rows = rows.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.brand_name ?? "").toLowerCase().includes(q) ||
          (b.category ?? "").toLowerCase().includes(q),
      );
    }
    if (scoredOnly) rows = rows.filter((b) => b.performance_score != null);
    if (geoOnly) rows = rows.filter((b) => b.lat != null && b.lng != null);

    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "performance":
          return (b.performance_score ?? -Infinity) - (a.performance_score ?? -Infinity);
        case "distance":
          return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        case "votes":
          return (b.number_of_votes ?? -Infinity) - (a.number_of_votes ?? -Infinity);
        case "reviews":
        default:
          return (b.reviews_per_day ?? -Infinity) - (a.reviews_per_day ?? -Infinity);
      }
    });
    return sorted;
  }, [model.brands, query, sort, scoredOnly, geoOnly]);

  const scatterPoints = useMemo(
    () =>
      model.brands
        .filter((b) => b.reviews_per_day != null && b.performance_score != null)
        .sort((a, b) => (b.reviews_per_day ?? 0) - (a.reviews_per_day ?? 0))
        .slice(0, 160)
        .map((b) => ({
          x: b.reviews_per_day!,
          y: b.performance_score!,
          label: b.name,
          key: b.id,
        })),
    [model.brands],
  );

  /* Median crosshair values — drawn as quadrant guides by the scatter plot. */
  const medians = useMemo(() => {
    if (scatterPoints.length < 2) return null;
    const median = (list: number[]) => {
      const sorted = [...list].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    };
    return {
      x: median(scatterPoints.map((p) => p.x)),
      y: median(scatterPoints.map((p) => p.y)),
    };
  }, [scatterPoints]);

  /**
   * The four quadrants of the median crosshair, with their brand counts.
   * Naming + counting them is what turns the plot from "a cloud of dots" into
   * something readable: it says *which* brands are strong, cheap to win, or
   * under-performing.
   */
  const quadrants = useMemo(() => {
    if (!medians) return null;
    const buckets = [
      {
        key: "stars",
        label: "Stars",
        note: "Above median footfall and above median score — the benchmark to match.",
        color: "#22C55E",
        count: 0,
        match: (p: { x: number; y: number }) => p.x >= medians.x && p.y >= medians.y,
      },
      {
        key: "gems",
        label: "Hidden gems",
        note: "Score highly without much footfall yet — quietly strong performers.",
        color: "#2563EB",
        count: 0,
        match: (p: { x: number; y: number }) => p.x < medians.x && p.y >= medians.y,
      },
      {
        key: "watch",
        label: "Watch list",
        note: "Busy but scoring below the median — demand is there, conversion is not.",
        color: "#F59E0B",
        count: 0,
        match: (p: { x: number; y: number }) => p.x >= medians.x && p.y < medians.y,
      },
      {
        key: "quiet",
        label: "Underperformers",
        note: "Below the median on both axes — the quietest part of the catchment.",
        color: "#94A3B8",
        count: 0,
        match: (p: { x: number; y: number }) => p.x < medians.x && p.y < medians.y,
      },
    ];
    for (const point of scatterPoints) {
      const bucket = buckets.find((b) => b.match(point));
      if (bucket) bucket.count += 1;
    }
    return buckets;
  }, [scatterPoints, medians]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / table.pageSize));
  const safePage = Math.min(table.page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * table.pageSize,
    (safePage + 1) * table.pageSize,
  );

  const resetPage = () => table.setPage(0);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Brand performance scatter"
        subtitle={
          medians
            ? `Each dot is one brand · ${formatInt(scatterPoints.length)} brands with both reviews/day and a performance score`
            : `${formatInt(scatterPoints.length)} brands with both reviews/day and a performance score`
        }
      >
        {scatterPoints.length >= 2 ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
            <div className="min-w-0">
              <ScatterPlot
                points={scatterPoints}
                xLabel="Reviews per day (demand)"
                yLabel="Performance score"
                height={320}
                labelTop={6}
                quadrants={medians}
                quadrantLabels={
                  medians
                    ? {
                        topRight: "STARS",
                        topLeft: "HIDDEN GEMS",
                        bottomRight: "WATCH LIST",
                        bottomLeft: "UNDERPERFORMERS",
                      }
                    : null
                }
                formatX={(v) => formatDecimal(v, 1)}
                formatY={(v) => formatDecimal(v, 1)}
                onPointClick={(point) => {
                  const brand = model.brands.find((b) => b.id === point.key);
                  if (brand) onOpenBrand(brand);
                }}
              />
            </div>

            {/* How to read it — the plot is only useful with a legend. */}
            <div className="min-w-0 space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  How to read this
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                  <span className="font-medium text-ink-700">→ X axis</span> is
                  demand: how many reviews per day a brand collects.{" "}
                  <span className="font-medium text-ink-700">↑ Y axis</span> is
                  performance: how well it scores. The dashed lines are the
                  catchment medians, so every dot is positioned{" "}
                  <span className="font-medium text-ink-700">relative to the
                  others</span>.
                </p>
              </div>

              <ul className="space-y-2">
                {(quadrants ?? []).map((q) => (
                  <li
                    key={q.key}
                    className="flex items-start gap-2.5 rounded-xl bg-canvas/60 px-3.5 py-2.5"
                  >
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: q.color }}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[12.5px] font-semibold text-ink-900">
                          {q.label}
                        </span>
                        <span className="text-[11px] font-semibold tabular-nums text-ink-500">
                          {formatInt(q.count)} brands
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
                        {q.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-[11px] text-ink-400">
                Hover a dot to read its name · select it to open the brand
                panel. The six highest-scoring brands are labelled on the chart.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Not enough scored brands"
            message="Scatter plot needs brands with both reviews/day and performance score."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Top brands"
        subtitle={`${formatInt(filtered.length)} of ${formatInt(model.brands.length)} rows`}
        actions={
          <span className="hidden rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-500 sm:inline">
            page {safePage + 1} / {pageCount}
          </span>
        }
      >
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Search brand, category…"
            aria-label="Search brands"
            className="focusable h-9 w-full min-w-[180px] flex-1 rounded-xl bg-canvas px-3 text-[12.5px] text-ink-900 outline-none placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 sm:max-w-[260px]"
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              resetPage();
            }}
            aria-label="Sort brands"
            className="focusable h-9 rounded-xl bg-canvas px-2.5 text-[12.5px] text-ink-700 outline-none hover:bg-canvas-subtle"
          >
            <option value="reviews">Sort: Reviews/day</option>
            <option value="performance">Sort: Performance</option>
            <option value="distance">Sort: Distance</option>
            <option value="votes">Sort: Votes</option>
            <option value="name">Sort: Name</option>
          </select>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-canvas px-3 text-[12px] text-ink-700 hover:bg-canvas-subtle">
            <input
              type="checkbox"
              checked={scoredOnly}
              onChange={(e) => {
                setScoredOnly(e.target.checked);
                resetPage();
              }}
              className="h-3.5 w-3.5 accent-brand-600"
            />
            Scored only
          </label>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-canvas px-3 text-[12px] text-ink-700 hover:bg-canvas-subtle">
            <input
              type="checkbox"
              checked={geoOnly}
              onChange={(e) => {
                setGeoOnly(e.target.checked);
                resetPage();
              }}
              className="h-3.5 w-3.5 accent-brand-600"
            />
            With coordinates
          </label>
        </div>

        {pageRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line/40 text-[10.5px] uppercase tracking-wide text-ink-400">
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Brand</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 text-right font-semibold">Distance</th>
                  <th className="px-3 py-2 text-right font-semibold">Rev/day</th>
                  <th className="px-3 py-2 text-right font-semibold">Perf.</th>
                  <th className="px-3 py-2 text-right font-semibold">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {pageRows.map((brand, i) => {
                  const rank = safePage * table.pageSize + i + 1;
                  return (
                    <tr
                      key={`${brand.id}-${rank}`}
                      onClick={() => onOpenBrand(brand)}
                      className="cursor-pointer transition-colors hover:bg-brand-50/50"
                    >
                      <td className="px-3 py-2 tabular-nums text-ink-400">{rank}</td>
                      <td className="px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2">
                          {brand.brand_logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={brand.brand_logo}
                              alt=""
                              className="h-5 w-5 shrink-0 rounded object-contain"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="min-w-0 truncate font-medium text-ink-900">
                            {brand.name}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink-500">
                        {brand.category ? humanizeKey(brand.category) : "N/A"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                        {formatDistanceKm(brand.distance)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                        {formatDecimal(brand.reviews_per_day, 2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {brand.performance_score != null ? (
                          <span
                            className={`rounded px-1.5 py-0.5 font-semibold ${
                              brand.performance_score >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {formatDecimal(brand.performance_score, 1)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                        {formatNumber(brand.number_of_votes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No brands match the filters"
            message="Adjust the search or toggles to see rows again."
          />
        )}

        <PaginationBar
          page={safePage}
          totalItems={filtered.length}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.changePageSize}
        />
      </SectionCard>
    </div>
  );
}

