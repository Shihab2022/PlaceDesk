"use client";

/**
 * Data explorer: every record collection in the report flattened into one
 * searchable, paginated table with a raw-JSON view.
 */

import { useMemo, useState } from "react";
import type { ReportModel } from "./types";
import { formatInt } from "./parse";
import { EmptyState, PaginationBar, SectionCard } from "./ui";

type SourceRow = Record<string, unknown>;

const PAGE_SIZE = 50;
const MAX_COLUMNS = 40;

function cellText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "N/A";
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => String(v)).join(", ") : "N/A";
  }
  if (typeof value === "object") {
    const text = JSON.stringify(value);
    return text.length > 90 ? `${text.slice(0, 89)}…` : text;
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 1e6) / 1e6);
  }
  return String(value);
}

function buildSources(model: ReportModel): {
  id: string;
  label: string;
  rows: SourceRow[];
}[] {
  const sources: { id: string; label: string; rows: SourceRow[] }[] = [];

  sources.push({
    id: "brands",
    label: `Top brands (${model.brands.length})`,
    rows: model.brands as unknown as SourceRow[],
  });
  sources.push({
    id: "competitors",
    label: `Competitors (${model.competitors.length})`,
    rows: model.competitors as unknown as SourceRow[],
  });
  sources.push({
    id: "anchors",
    label: `Anchors (${model.anchors.length})`,
    rows: model.anchors as unknown as SourceRow[],
  });
  sources.push({
    id: "highStreets",
    label: `High streets (${model.highStreets.length})`,
    rows: model.highStreets.map(
      (h) =>
        ({
          name: h.name,
          locality: h.locality,
          area_m2: h.areaM2,
          lat: h.lat,
          lng: h.lng,
          growth_rate_pct: h.growthRate,
          distance_km: h.distanceKm,
          has_geometry: h.polygon ? "yes" : "no",
        }) as SourceRow,
    ),
  });
  sources.push({
    id: "projects",
    label: `Projects (${model.projects?.projects.length ?? 0})`,
    rows: (model.projects?.projects ?? []) as unknown as SourceRow[],
  });
  sources.push({
    id: "apartments",
    label: `Apartments (${model.apartments.length})`,
    rows: model.apartments as unknown as SourceRow[],
  });
  sources.push({
    id: "demand",
    label: `Demand generators (${model.demandGenerators.length})`,
    rows: model.demandGenerators as unknown as SourceRow[],
  });
  sources.push({
    id: "categories",
    label: `POI categories (${model.poiSummary?.entries.length ?? 0})`,
    rows: (model.poiSummary?.entries ?? []).map((entry) => ({
      category: entry.category,
      count: entry.count,
      avg_reviews_per_day: entry.avgReviewsPerDay,
      top_pois_count: entry.topPois.length,
      top_brands_count: entry.topBrands.length,
    })),
  });

  const scalars: SourceRow = {};
  for (const [key, value] of Object.entries(model.raw)) {
    if (value === null || ["object", "function"].includes(typeof value)) continue;
    if (Array.isArray(value)) continue;
    scalars[key] = value;
  }
  sources.push({ id: "meta", label: "Report fields", rows: [scalars] });

  return sources.filter((s) => s.rows.length);
}

export default function ExplorerTab({ model }: { model: ReportModel }) {
  const sources = useMemo(() => buildSources(model), [model]);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"table" | "json">("table");
  const [page, setPage] = useState(0);

  const source = sources.find((s) => s.id === sourceId) ?? sources[0];

  const rows = useMemo(() => {
    if (!source) return [];
    const q = query.trim().toLowerCase();
    if (!q) return source.rows;
    return source.rows.filter((row) =>
      Object.values(row).some((v) => cellText(v).toLowerCase().includes(q)),
    );
  }, [source, query]);

  const columns = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (seen.has(key) || order.length >= MAX_COLUMNS) continue;
        seen.add(key);
        order.push(key);
      }
    }
    return order;
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (!source) {
    return <EmptyState title="Nothing to explore" message="No collections in this report." />;
  }

  return (
    <SectionCard
      title="Data explorer"
      subtitle={`${formatInt(rows.length)} rows in "${source.label}"`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={source.id}
          onChange={(e) => {
            setSourceId(e.target.value);
            setPage(0);
            setQuery("");
          }}
          aria-label="Choose collection"
          className="focusable h-9 max-w-full rounded-lg border border-line bg-white px-2 text-[12.5px] text-ink-700 outline-none"
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Filter rows…"
          aria-label="Filter rows"
          className="focusable h-9 min-w-[160px] flex-1 rounded-lg border border-line bg-white px-3 text-[12.5px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 sm:max-w-[280px]"
        />
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["table", "json"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`focusable px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                view === v ? "bg-ink-900 text-white" : "bg-white text-ink-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "json" ? (
        <pre className="max-h-[480px] overflow-auto rounded-lg bg-ink-900 p-4 text-[11.5px] leading-relaxed text-emerald-200">
          {JSON.stringify(rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE), null, 2)}
        </pre>
      ) : rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageRows.map((row, i) => (
                <tr key={`${safePage}-${i}`} className="hover:bg-canvas/60">
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="max-w-[240px] truncate px-3 py-2 text-ink-700"
                      title={cellText(row[col])}
                    >
                      {cellText(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No rows match" message="Clear the filter to see data again." />
      )}

      {pageCount > 1 && (
        <PaginationBar
          page={safePage}
          totalItems={rows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </SectionCard>
  );
}

