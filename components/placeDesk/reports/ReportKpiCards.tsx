"use client";

/**
 * KPI row for the report header.
 *
 * Only renders tiles whose data actually exists — a report missing
 * `revenue_score`, for example, simply shows fewer cards instead of
 * invented numbers.
 */

import { useMemo } from "react";
import { deriveMarketMetrics } from "./normalize";
import type { ReportModel } from "./types";
import {
  formatCompact,
  formatDecimal,
  formatInt,
  formatNumber,
} from "./parse";
import { StatTile } from "./ui";

interface Tile {
  key: string;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export default function ReportKpiCards({ model }: { model: ReportModel }) {
  const tiles = useMemo(() => {
    const m = deriveMarketMetrics(model);
    const out: Tile[] = [];

    if (m.topBrands !== null)
      out.push({ key: "brands", label: "Top Brands", value: formatInt(m.topBrands), accent: true });
    if (m.competitors !== null)
      out.push({ key: "competitors", label: "Competitors", value: formatInt(m.competitors) });
    if (m.totalPois !== null)
      out.push({ key: "pois", label: "Total POIs", value: formatInt(m.totalPois) });
    if (m.anchors !== null)
      out.push({ key: "anchors", label: "Anchors", value: formatInt(m.anchors) });
    if (m.demandGenerators !== null)
      out.push({
        key: "demand",
        label: "Demand Generators",
        value: formatInt(m.demandGenerators),
      });
    if (m.avgCostForTwo !== null)
      out.push({
        key: "cft",
        label: "Avg Cost for Two",
        value: formatNumber(m.avgCostForTwo, "N/A"),
        hint: "catchment average",
      });
    if (m.revenueScore !== null)
      out.push({ key: "revenue", label: "Revenue Score", value: formatDecimal(m.revenueScore, 2) });
    if (m.performanceScore !== null)
      out.push({
        key: "perf",
        label: "Performance Score",
        value: formatDecimal(m.performanceScore, 2),
      });
    if (m.affluence !== null)
      out.push({ key: "affluence", label: "Affluence", value: formatDecimal(m.affluence, 2) });
    if (m.projectedGrowth !== null)
      out.push({
        key: "growth",
        label: "Projected Growth",
        value: `${formatDecimal(m.projectedGrowth, 1)}%`,
        hint: "cluster outlook",
      });
    if (m.population !== null)
      out.push({ key: "population", label: "Population", value: formatCompact(m.population) });
    if (m.households !== null)
      out.push({ key: "households", label: "Households", value: formatCompact(m.households) });

    return out;
  }, [model]);

  if (!tiles.length) {
    return null;
  }

  return (
    <div
      className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      aria-label="Key report metrics"
    >
      {tiles.map((tile) => (
        <StatTile
          key={tile.key}
          label={tile.label}
          value={tile.value}
          hint={tile.hint ?? null}
          accent={tile.accent ?? false}
        />
      ))}
    </div>
  );
}
