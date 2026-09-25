"use client";

/**
 * Indexes: grouped index scores, location-score weights and the raw
 * isochrone POI counts that produced them.
 */

import { useMemo } from "react";
import type { ReportModel } from "../types";
import {
  formatDecimal,
  formatInt,
  humanizeKey,
  indexScale,
  sortMetricsDesc,
  weightToPercent,
} from "../parse";
import { BarRow, EmptyState, SectionCard } from "../ui";
import { ColumnChart, StackedBar } from "../charts";

export default function IndexesTab({ model }: { model: ReportModel }) {
  const grouped = useMemo(
    () => sortMetricsDesc(model.groupedIndexes),
    [model.groupedIndexes],
  );
  const fromCounts = useMemo(
    () => sortMetricsDesc(model.indexesFromCounts),
    [model.indexesFromCounts],
  );
  const weights = useMemo(() => {
    const entries = Object.entries(model.locationScoreWeights)
      .map(([key, value]) => ({
        key,
        label: humanizeKey(key),
        pct: weightToPercent(value),
        value,
      }))
      .filter((w) => w.pct !== null)
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
    return entries as { key: string; label: string; pct: number; value: number }[];
  }, [model.locationScoreWeights]);

  const counts = useMemo(
    () => sortMetricsDesc(model.poiCounts),
    [model.poiCounts],
  );

  const groupedScale = indexScale(grouped.map((m) => m.value));
  const countScale = indexScale(counts.map((m) => m.value), 10);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Grouped indexes"
          subtitle="Normalized 0–5 style scores for the catchment"
        >
          {grouped.length ? (
            <ColumnChart
              data={grouped.slice(0, 12).map((m) => ({
                label: humanizeKey(m.key),
                value: m.value,
              }))}
              format={(v) => formatDecimal(v, 1)}
              height={210}
            />
          ) : (
            <EmptyState title="No grouped indexes" />
          )}
        </SectionCard>

        <SectionCard
          title="Indexes from counts"
          subtitle="Scores derived from raw POI counts"
        >
          {fromCounts.length ? (
            <div className="space-y-0.5">
              {fromCounts.map((m) => (
                <BarRow
                  key={m.key}
                  label={humanizeKey(m.key)}
                  value={m.value}
                  displayValue={formatDecimal(m.value, 2)}
                  max={Math.max(fromCounts[0]?.value ?? 1, 1)}
                  color="#14B8A6"
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No count-based indexes" />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Location score weights"
          subtitle={
            weights.length
              ? `Contributing factors · ${formatDecimal(groupedScale, 1)}-point index scale`
              : "No weights provided"
          }
        >
          {weights.length ? (
            <div className="space-y-4">
              <StackedBar
                segments={weights.map((w) => ({
                  key: w.key,
                  label: w.label,
                  value: w.pct,
                }))}
                format={(v) => `${formatDecimal(v, 1)}%`}
              />
              <div className="space-y-0.5">
                {weights.map((w) => (
                  <BarRow
                    key={w.key}
                    label={w.label}
                    value={w.pct}
                    displayValue={`${formatDecimal(w.pct, 1)}%`}
                    max={Math.max(...weights.map((x) => x.pct), 1)}
                    color="#EC4899"
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No location score weights" />
          )}
        </SectionCard>

        <SectionCard
          title="POI counts in catchment"
          subtitle={`${formatInt(counts.length)} measured categories · scale max ${formatInt(countScale)}`}
        >
          {counts.length ? (
            <div className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
              {counts.map((m) => (
                <BarRow
                  key={m.key}
                  label={humanizeKey(m.key)}
                  value={m.value}
                  displayValue={formatInt(m.value)}
                  max={countScale}
                  color="#2563EB"
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No POI counts" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

