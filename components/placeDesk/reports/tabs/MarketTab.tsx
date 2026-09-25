"use client";

/**
 * Market overview: score gauges, demand generators (companies + institutions)
 * and apartment price stats.
 */

import { useMemo } from "react";
import type { ReportModel } from "../types";
import { deriveMarketMetrics } from "../normalize";
import {
  formatCurrency,
  formatDecimal,
  formatInt,
  formatNumber,
} from "../parse";
import { BarRow, EmptyState, SectionCard } from "../ui";
import { ColumnChart, RadialGauge } from "../charts";

export default function MarketTab({ model }: { model: ReportModel }) {
  const metrics = useMemo(() => deriveMarketMetrics(model), [model]);

  const gauges = [
    { key: "performance", label: "Performance", value: metrics.performanceScore },
    {
      key: "delivery",
      label: "Delivery Performance",
      value: metrics.deliveryPerformanceScore,
    },
    { key: "revenue", label: "Revenue Score", value: metrics.revenueScore },
    { key: "affluence", label: "Affluence", value: metrics.affluence },
    { key: "cft", label: "Avg Cost for Two", value: metrics.avgCostForTwo },
  ].filter((g) => g.value !== null) as {
    key: string;
    label: string;
    value: number;
  }[];

  const maxDemand = Math.max(...model.demandGenerators.map((d) => d.value), 1);
  const maxCompany = Math.max(
    ...(model.companies?.segments ?? []).map((s) => s.value),
    1,
  );
  const apartmentData = model.apartments
    .filter((a) => a.medianPrice !== null)
    .map((a) => ({ label: a.transType, value: a.medianPrice! }));

  return (
    <div className="space-y-4">
      <SectionCard title="Market scores" subtitle="Performance, revenue & wealth">
        {gauges.length ? (
          <div className="flex flex-wrap justify-around gap-6 py-2">
            {gauges.map((g) => (
              <RadialGauge
                key={g.key}
                label={g.label}
                value={g.value}
                max={Math.max(5, Math.ceil(g.value))}
                displayValue={formatDecimal(g.value, 1)}
                color={
                  g.key === "affluence"
                    ? "#14B8A6"
                    : g.key === "revenue"
                      ? "#F97316"
                      : "#7C4DFF"
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No market scores available"
            message="This report did not include performance, revenue or affluence scores."
          />
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Demand generators"
          subtitle={`${formatInt(model.demandGenerators.length)} generators in the catchment`}
        >
          {model.demandGenerators.length ? (
            <div className="space-y-0.5">
              {model.demandGenerators.map((entry) => (
                <BarRow
                  key={entry.key}
                  label={entry.label}
                  value={entry.value}
                  displayValue={formatInt(entry.value)}
                  max={maxDemand}
                  color="#7C4DFF"
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No demand generator data" />
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Companies & institutions"
            subtitle={
              model.companies
                ? `${formatInt(model.companies.total)} total entities`
                : "Not included in this report"
            }
          >
            {model.companies ? (
              <div className="space-y-0.5">
                {model.companies.segments.map((seg) => (
                  <BarRow
                    key={seg.label}
                    label={seg.label}
                    value={seg.value}
                    displayValue={formatInt(seg.value)}
                    max={maxCompany}
                    color="#2563EB"
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No company breakdown" />
            )}
          </SectionCard>

          <SectionCard title="Apartment prices" subtitle="Median price by type">
            {apartmentData.length ? (
              <ColumnChart
                data={apartmentData}
                format={(v) => formatCurrency(Math.round(v))}
                accent="#F97316"
                height={180}
              />
            ) : (
              <EmptyState title="No apartment price data" />
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Catchment totals" subtitle="Headline market quantities">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total POIs", value: formatInt(metrics.totalPois) },
            { label: "Top brands", value: formatInt(metrics.topBrands) },
            { label: "Population", value: formatNumber(metrics.population) },
            { label: "Households", value: formatNumber(metrics.households) },
            { label: "Median income", value: formatCurrency(metrics.medianIncome) },
            {
              label: "Projected growth",
              value:
                metrics.projectedGrowth !== null
                  ? `${formatDecimal(metrics.projectedGrowth, 1)}%`
                  : "N/A",
            },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg border border-line bg-canvas/60 px-3 py-2.5"
            >
              <p className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                {tile.label}
              </p>
              <p className="mt-0.5 truncate text-[15px] font-semibold text-ink-900">
                {tile.value}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

