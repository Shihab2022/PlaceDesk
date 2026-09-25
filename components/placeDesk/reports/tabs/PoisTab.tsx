"use client";

/** POI mix: category distribution, per-category highlights and top brands. */

import { useMemo, useState } from "react";
import type { ReportModel } from "../types";
import { formatDecimal, formatInt, formatNumber, humanizeKey } from "../parse";
import { EmptyState, KeyValueList, PaginationBar, SectionCard } from "../ui";
import { DonutChart } from "../charts";

const CATEGORY_PAGE_SIZE = 10;

export default function PoisTab({ model }: { model: ReportModel }) {
  const summary = model.poiSummary;
  const [categoryPage, setCategoryPage] = useState(0);

  const sortedEntries = useMemo(() => {
    if (!summary) return [];
    return [...summary.entries].sort((a, b) => b.count - a.count);
  }, [summary]);

  const donutData = useMemo(() => {
    const top = sortedEntries.slice(0, 8);
    const rest = sortedEntries.slice(8);
    const data = top.map((entry) => ({
      label: humanizeKey(entry.category),
      value: entry.count,
    }));
    if (rest.length) {
      data.push({
        label: "Other categories",
        value: rest.reduce((sum, entry) => sum + entry.count, 0),
      });
    }
    return data;
  }, [sortedEntries]);

  const total = summary?.count ?? sortedEntries.reduce((s, e) => s + e.count, 0);

  if (!summary || !sortedEntries.length) {
    return (
      <EmptyState
        title="No POI summary in this report"
        message="The POI roll-up (categories, counts, highlights) is missing."
      />
    );
  }

  const facts = [
    { label: "Total POIs", value: formatInt(summary.count) },
    {
      label: "Avg reviews / day",
      value: formatNumber(summary.avgReviewsPerDay),
    },
    { label: "Categories", value: formatInt(summary.entries.length) },
    {
      label: "Top category",
      value: sortedEntries[0]
        ? `${humanizeKey(sortedEntries[0].category)} (${formatInt(sortedEntries[0].count)})`
        : "N/A",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="POI summary" subtitle="Category roll-up for the catchment">
        <KeyValueList items={facts} columns={4} />
        <div className="mt-4">
          <DonutChart
            data={donutData}
            centerLabel="POIs"
            centerValue={formatInt(total)}
            format={(v) => formatInt(v)}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Category breakdown"
        subtitle="Counts, share and review velocity"
        defaultOpen={false}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 text-right font-semibold">POIs</th>
                <th className="px-3 py-2 text-right font-semibold">Share</th>
                <th className="px-3 py-2 text-right font-semibold">Avg rev/day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sortedEntries
                .slice(
                  categoryPage * CATEGORY_PAGE_SIZE,
                  (categoryPage + 1) * CATEGORY_PAGE_SIZE,
                )
                .map((entry) => (
                  <tr key={entry.category} className="hover:bg-canvas/60">
                    <td className="px-3 py-2 font-medium text-ink-900">
                      {humanizeKey(entry.category)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                      {formatInt(entry.count)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-500">
                      {total > 0 ? ((entry.count / total) * 100).toFixed(1) : "0.0"}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                      {formatDecimal(entry.avgReviewsPerDay, 2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={categoryPage}
          totalItems={sortedEntries.length}
          pageSize={CATEGORY_PAGE_SIZE}
          onPageChange={setCategoryPage}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {sortedEntries.slice(0, 6).map((entry) => (
          <SectionCard
            key={entry.category}
            title={humanizeKey(entry.category)}
            subtitle={`${formatInt(entry.count)} POIs · ${formatDecimal(entry.avgReviewsPerDay, 2)} avg rev/day`}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                  Top POIs
                </p>
                {entry.topPois.length ? (
                  <ul className="divide-y divide-line">
                    {entry.topPois.slice(0, 5).map((poi, i) => (
                      <li
                        key={`${poi.id}-${i}`}
                        className="flex items-center justify-between gap-3 py-1.5 text-[12.5px]"
                      >
                        <span className="min-w-0 truncate text-ink-900">
                          <span className="mr-2 text-ink-400">{i + 1}.</span>
                          {poi.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-ink-500">
                          {formatDecimal(poi.reviews_per_day, 2)} rev/day
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12px] text-ink-500">N/A</p>
                )}
              </div>

              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                  Top brands here
                </p>
                {entry.topBrands.length ? (
                  <ul className="space-y-1">
                    {entry.topBrands.slice(0, 5).map((brand, i) => {
                      const max = entry.topBrands[0]?.value || 1;
                      return (
                        <li key={`${brand.name}-${i}`} className="px-0.5 py-0.5">
                          <div className="flex items-baseline justify-between gap-3 text-[12px]">
                            <span className="min-w-0 truncate text-ink-700">
                              {brand.name}
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums text-ink-900">
                              {formatInt(brand.value)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{
                                width: `${Math.max(2, (brand.value / max) * 100).toFixed(1)}%`,
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-[12px] text-ink-500">N/A</p>
                )}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

