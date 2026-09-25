"use client";

/** Demographics: age bands, household segments and income. */

import type { ReportModel } from "../types";
import { formatCompact, formatCurrency, formatInt, formatNumber } from "../parse";
import { EmptyState, KeyValueList, SectionCard } from "../ui";
import { ColumnChart, DonutChart, StackedBar } from "../charts";

export default function DemographicsTab({ model }: { model: ReportModel }) {
  const population = model.population;
  const households = model.households;

  const ageBands = (population?.bands ?? []).map((band) => ({
    label: band.label,
    value: band.value,
  }));

  const incomeTiles = [
    { label: "Total households", value: formatInt(households?.total) },
    { label: "Median household income", value: formatCurrency(households?.medianIncome) },
    { label: "Population", value: formatCompact(population?.total) },
    {
      label: "Avg household size",
      value:
        population?.total != null && households?.total
          ? (population.total / households.total).toFixed(1)
          : "N/A",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Catchment vitals" subtitle="Population and households">
        <KeyValueList items={incomeTiles} columns={4} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Population by age band"
          subtitle={
            population?.total != null
              ? `${formatNumber(population.total)} residents`
              : "Total not provided"
          }
        >
          {ageBands.length ? (
            <>
              <ColumnChart data={ageBands} format={(v) => formatCompact(v)} />
              <div className="mt-3">
                <DonutChart
                  data={ageBands.map((b) => ({ label: b.label, value: b.value }))}
                  centerLabel="residents"
                  centerValue={formatCompact(population?.total)}
                  format={(v) => formatCompact(v)}
                />
              </div>
            </>
          ) : (
            <EmptyState title="No population data" message="Age bands are missing from this report." />
          )}
        </SectionCard>

        <SectionCard
          title="Household segments"
          subtitle={
            households?.total != null
              ? `${formatNumber(households.total)} households`
              : "Household totals not provided"
          }
        >
          {households?.segments.length ? (
            <div className="space-y-4">
              <StackedBar
                segments={households.segments.map((seg) => ({
                  label: seg.label,
                  value: seg.value,
                }))}
                format={(v) => formatCompact(v)}
              />
              <div className="space-y-0.5">
                {households.segments.map((seg) => {
                  const total =
                    households.segments.reduce((sum, s) => sum + s.value, 0) || 1;
                  return (
                    <div
                      key={seg.label}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-[12.5px]"
                    >
                      <span className="text-ink-700">{seg.label}</span>
                      <span className="flex items-center gap-3 tabular-nums">
                        <span className="font-semibold text-ink-900">
                          {formatInt(seg.value)}
                        </span>
                        <span className="w-12 text-right text-ink-400">
                          {((seg.value / total) * 100).toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState title="No household breakdown" message="Segments are missing from this report." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
