"use client";

/**
 * Competition: direct competitors, anchor tenants (malls) and the
 * competitor-domain footprint from the feed.
 */

import { useMemo, useState } from "react";
import type { BusinessRecord, ReportModel } from "../types";
import {
  formatDecimal,
  formatDistanceKm,
  formatInt,
  humanizeKey,
} from "../parse";
import { EmptyState, PaginationBar, SectionCard } from "../ui";

const PAGE_SIZE = 25;

function CompetitorTable({
  rows,
  accent,
  typeLabel,
}: {
  rows: BusinessRecord[];
  accent: string;
  typeLabel: string;
}) {
  const [page, setPage] = useState(0);
  const shown = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (!rows.length) {
    return <EmptyState title={`No ${typeLabel.toLowerCase()} listed`} />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 text-right font-semibold">Distance</th>
              <th className="px-3 py-2 text-right font-semibold">Rev/day</th>
              <th className="px-3 py-2 text-right font-semibold">Perf.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((row, i) => (
              <tr key={`${row.id}-${page * PAGE_SIZE + i}`} className="hover:bg-canvas/60">
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ border: `2px solid ${accent}` }}
                    />
                    <span className="min-w-0 truncate font-medium text-ink-900">
                      {row.name}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 text-ink-500">
                  {humanizeKey(
                    row.competitor_type ?? row.type ?? row.category ?? "",
                  ) || "N/A"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                  {formatDistanceKm(row.distance)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                  {formatDecimal(row.reviews_per_day, 2)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                  {formatDecimal(row.performance_score, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationBar
        page={page}
        totalItems={rows.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function CompetitorsTab({ model }: { model: ReportModel }) {
  const competitors = model.competitors;
  const anchors = useMemo(
    () => model.anchors.filter((a) => !competitors.includes(a)),
    [model.anchors, competitors],
  );
  const malls = model.shoppingMalls?.pois ?? [];

  const facts = [
    { label: "Competitors", value: formatInt(competitors.length) },
    { label: "Anchors / malls", value: formatInt(model.anchors.length) },
    { label: "Mall count (feed)", value: formatInt(model.shoppingMalls?.count) },
    {
      label: "Competitor domains",
      value: formatInt(model.competitorsDomains.length),
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Competition footprint" subtitle="Competing stores and anchors">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-400">
                {fact.label}
              </dt>
              <dd className="mt-0.5 text-[16px] font-semibold text-ink-900">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        {model.competitorsDomains.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {model.competitorsDomains.slice(0, 40).map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] text-ink-500"
              >
                {domain}
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Direct competitors"
        subtitle={`${formatInt(competitors.length)} competing locations`}
      >
        <CompetitorTable rows={competitors} accent="#E11D48" typeLabel="Competitors" />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Anchor tenants"
          subtitle={`${formatInt(anchors.length)} anchors (malls & destination draws)`}
        >
          <CompetitorTable rows={anchors} accent="#D97706" typeLabel="Anchors" />
        </SectionCard>

        <SectionCard
          title="Shopping malls"
          subtitle={`${formatInt(malls.length)} malls listed in the feed`}
        >
          <CompetitorTable rows={malls} accent="#F59E0B" typeLabel="Malls" />
        </SectionCard>
      </div>
    </div>
  );
}
