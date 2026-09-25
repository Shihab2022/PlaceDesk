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
import { EmptyState, PaginationBar, SectionCard } from "../ui";
import { ScatterPlot } from "../charts";

type SortKey = "reviews" | "performance" | "distance" | "votes" | "name";
const PAGE_SIZE = 25;

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
  const [page, setPage] = useState(0);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Brand performance scatter"
        subtitle={`${formatInt(scatterPoints.length)} brands with both reviews/day and performance score`}
      >
        {scatterPoints.length >= 2 ? (
          <ScatterPlot
            points={scatterPoints}
            xLabel="Reviews per day"
            yLabel="Performance score"
            formatX={(v) => formatDecimal(v, 1)}
            formatY={(v) => formatDecimal(v, 1)}
            onPointClick={(point) => {
              const brand = model.brands.find((b) => b.id === point.key);
              if (brand) onOpenBrand(brand);
            }}
          />
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
            className="focusable h-9 w-full min-w-[180px] flex-1 rounded-lg border border-line bg-white px-3 text-[12.5px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 sm:max-w-[260px]"
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              resetPage();
            }}
            aria-label="Sort brands"
            className="focusable h-9 rounded-lg border border-line bg-white px-2 text-[12.5px] text-ink-700 outline-none"
          >
            <option value="reviews">Sort: Reviews/day</option>
            <option value="performance">Sort: Performance</option>
            <option value="distance">Sort: Distance</option>
            <option value="votes">Sort: Votes</option>
            <option value="name">Sort: Name</option>
          </select>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[12px] text-ink-700">
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
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[12px] text-ink-700">
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
                <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Brand</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 text-right font-semibold">Distance</th>
                  <th className="px-3 py-2 text-right font-semibold">Rev/day</th>
                  <th className="px-3 py-2 text-right font-semibold">Perf.</th>
                  <th className="px-3 py-2 text-right font-semibold">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map((brand, i) => {
                  const rank = safePage * PAGE_SIZE + i + 1;
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
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </SectionCard>
    </div>
  );
}

