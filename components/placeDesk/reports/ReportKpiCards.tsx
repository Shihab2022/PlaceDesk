"use client";

/**
 * KPI row for the report header.
 *
 * Only renders tiles whose data actually exists — a report missing
 * `revenue_score`, for example, simply shows fewer cards instead of
 * invented numbers. Each tile carries an icon and its own colour scheme so
 * the row reads as a colourful dashboard strip rather than a grey list.
 */

import { useMemo } from "react";
import {
  FiActivity,
  FiAward,
  FiCrosshair,
  FiDollarSign,
  FiShoppingBag,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { deriveMarketMetrics } from "./normalize";
import type { ReportModel } from "./types";
import {
  formatCompact,
  formatDecimal,
  formatInt,
  formatNumber,
} from "./parse";
import { StatTile } from "./ui";
import type { SectionScheme } from "./sectionMeta";

interface Tile {
  key: string;
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  scheme: SectionScheme;
}


export default function ReportKpiCards({ model }: { model: ReportModel }) {
  const tiles = useMemo(() => {
    const m = deriveMarketMetrics(model);
    const out: Tile[] = [];

    if (m.topBrands !== null)
      out.push({
        key: "brands",
        label: "Top Brands",
        value: formatInt(m.topBrands),
        icon: <FiAward className="h-4 w-4" />,
        scheme: "brand",
      });
    if (m.competitors !== null)
      out.push({
        key: "competitors",
        label: "Competitors",
        value: formatInt(m.competitors),
        icon: <FiTarget className="h-4 w-4" />,
        scheme: "rose",
      });
    if (m.totalPois !== null)
      out.push({
        key: "pois",
        label: "Total POIs",
        value: formatInt(m.totalPois),
        icon: <FiShoppingBag className="h-4 w-4" />,
        scheme: "amber",
      });
    if (m.anchors !== null)
      out.push({
        key: "anchors",
        label: "Anchors",
        value: formatInt(m.anchors),
        icon: <FiStar className="h-4 w-4" />,
        scheme: "violet",
      });
    if (m.demandGenerators !== null)
      out.push({
        key: "demand",
        label: "Demand Generators",
        value: formatInt(m.demandGenerators),
        icon: <FiZap className="h-4 w-4" />,
        scheme: "teal",
      });
    if (m.avgCostForTwo !== null)
      out.push({
        key: "cft",
        label: "Avg Cost for Two",
        value: formatNumber(m.avgCostForTwo, "N/A"),
        hint: "catchment average",
        icon: <FiDollarSign className="h-4 w-4" />,
        scheme: "emerald",
      });
    if (m.revenueScore !== null)
      out.push({
        key: "revenue",
        label: "Revenue Score",
        value: formatDecimal(m.revenueScore, 2),
        icon: <FiTrendingUp className="h-4 w-4" />,
        scheme: "blue",
      });
    if (m.performanceScore !== null)
      out.push({
        key: "perf",
        label: "Performance Score",
        value: formatDecimal(m.performanceScore, 2),
        icon: <FiActivity className="h-4 w-4" />,
        scheme: "blue",
      });
    if (m.affluence !== null)
      out.push({
        key: "affluence",
        label: "Affluence",
        value: formatDecimal(m.affluence, 2),
        icon: <FiCrosshair className="h-4 w-4" />,
        scheme: "violet",
      });
    if (m.projectedGrowth !== null)
      out.push({
        key: "growth",
        label: "Projected Growth",
        value: `${formatDecimal(m.projectedGrowth, 1)}%`,
        hint: "cluster outlook",
        icon: <FiTrendingUp className="h-4 w-4" />,
        scheme: "emerald",
      });
    if (m.population !== null)
      out.push({
        key: "population",
        label: "Population",
        value: formatCompact(m.population),
        icon: <FiUsers className="h-4 w-4" />,
        scheme: "teal",
      });
    if (m.households !== null)
      out.push({
        key: "households",
        label: "Households",
        value: formatCompact(m.households),
        icon: <FiUsers className="h-4 w-4" />,
        scheme: "brand",
      });

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
          accent
          icon={tile.icon}
          colorScheme={tile.scheme}
        />
      ))}
    </div>
  );
}
