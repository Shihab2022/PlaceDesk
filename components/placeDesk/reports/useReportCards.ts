"use client";

/**
 * Card summaries for `Dashboard -> Reports` (the report index).
 *
 * Each configured report file is multi-MB because it carries every brand, POI
 * and competitor of the catchment. The index only needs the *headline* facts,
 * so it fetches a trimmed projection through the existing `/api/pois` route
 * (`?fields=…&counts=…`, see `app/api/pois/route.ts`) — a few hundred bytes per
 * report instead of megabytes.
 *
 * Files load **one after another** (never in parallel) so the tab stays
 * responsive, and results are cached module-wide: coming back to the index is
 * instant. The full payload is still fetched by `useReports` when a report is
 * actually opened — the two caches are deliberately kept apart.
 */

import { useCallback, useEffect, useState } from "react";
import { reportDataLayerConfig } from "@/constant/mapConfilg";
import {
  labelCatchmentType,
  parseJsonObject,
  toNumber,
  toText,
} from "./parse";

export type ReportCardStatus = "loading" | "ready" | "error";

/** Headline facts shown on one report card. */
export interface ReportCardSummary {
  /** Config id — also the `/report/<id>` route segment. */
  id: string;
  /** Configured data-source name (e.g. "Sample Report Data 1"). */
  name: string;
  /** Path of the file inside the data repo. */
  path: string;
  /** Accent colour from the data-source config. */
  color: string;
  status: ReportCardStatus;
  error: string | null;
  reportId: string | null;
  siteName: string | null;
  location: string | null;
  catchmentType: string | null;
  catchmentLabel: string | null;
  lat: number | null;
  lng: number | null;
  areaM2: number | null;
  distanceFromCityCenterKm: number | null;
  orientation: string | null;
  clusterGrowthRate: number | null;
  createdAt: number | null;
  /** `top_brands` rows in the file. */
  brands: number | null;
  /** Total POIs in the catchment (`pois.count`). */
  pois: number | null;
  /** Number of POI categories (`pois.data`). */
  poiCategories: number | null;
  /** Average reviews/day across the catchment POIs. */
  avgReviewsPerDay: number | null;
  competitors: number | null;
  anchors: number | null;
  demandGenerators: number | null;
  highStreets: number | null;
  apartments: number | null;
  projects: number | null;
  population: number | null;
  households: number | null;
  performanceScore: number | null;
  deliveryPerformanceScore: number | null;
  revenueScore: number | null;
  affluence: number | null;
  avgCostForTwo: number | null;
}

/** Scalars the cards display (dotted paths are supported by the route). */
const CARD_FIELDS = [
  "report_id",
  "id",
  "site_name",
  "location",
  "lat",
  "lng",
  "catchment_type",
  "area",
  "distance",
  "distance_from_city_center",
  "orientation_from_city_center",
  "cluster_growth_rate",
  "created_at",
  "affluence",
  "revenue_score",
  "avg_cost_for_two",
  "city_lat",
  "city_lng",
  "pois.count",
  "pois.avg_number_of_reviews_per_day",
  "poi_counts_for_isochrone.total",
  "poi_counts_for_isochrone.population",
  "poi_counts_for_isochrone.performance_score",
  "poi_counts_for_isochrone.delivery_performance_score",
  "poi_counts_for_isochrone.revenue_score",
  "poi_counts_for_isochrone.projected_growth",
  "indexes_from_counts.performance_score",
  "indexes_from_counts.projected_growth",
  "grouped_indexes.performance_index",
  "grouped_indexes.population",
  "competition.count",
  "shopping_malls.count",
  "projects.count_projects",
  "population.total_population",
  "household_distribution.total_hh",
].join(",");

/** Collections replaced by their size — these are the multi-MB fields. */
const CARD_COUNTS = [
  "top_brands",
  "competitors_domains",
  "high_streets",
  "apartments",
  "demand_generators",
  "pois.data",
  "competition.pois",
  "shopping_malls.pois",
  "projects.projects",
].join(",");

/* ------------------------------------------------------------------ */
/* Module cache                                                        */
/* ------------------------------------------------------------------ */

type CardConfig = { id: string; name: string; targetPath: string; color: string };

const summaryCache = new Map<string, ReportCardSummary>();

function countOf(value: unknown): number | null {
  const n = toNumber(value);
  return n === null ? null : Math.max(0, Math.round(n));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Weight of a projected row: how much real data it carries. */
function rowWeight(row: Record<string, unknown>): number {
  const keys = [
    "top_brands",
    "high_streets",
    "competitors_domains",
    "apartments",
    "demand_generators",
  ];
  return keys.reduce((sum, key) => sum + (countOf(row[key]) ?? 0), 0);
}

/**
 * Files ship two rows per site (a light summary and the full payload) sharing
 * the same `report_id` — keep the richer one so the cards show real counts.
 */
function pickRow(
  rows: Record<string, unknown>[],
  reportId: string,
): Record<string, unknown> | null {
  const matching = rows.filter((row) => {
    const id = toText(row.report_id) ?? toText(row.id);
    return id === reportId;
  });
  const pool = matching.length ? matching : rows;
  if (!pool.length) return null;
  return pool.reduce((best, row) => (rowWeight(row) > rowWeight(best) ? row : best));
}

function buildSummary(
  cfg: CardConfig,
  row: Record<string, unknown>,
  status: ReportCardStatus,
  error: string | null,
): ReportCardSummary {
  const pois = parseJsonObject<Record<string, unknown>>(row.pois, {});
  const competition = parseJsonObject<Record<string, unknown>>(row.competition, {});
  const malls = parseJsonObject<Record<string, unknown>>(row.shopping_malls, {});
  const projects = parseJsonObject<Record<string, unknown>>(row.projects, {});
  const population = parseJsonObject<Record<string, unknown>>(row.population, {});
  const households = parseJsonObject<Record<string, unknown>>(
    row.household_distribution,
    {},
  );
  const counts = parseJsonObject<Record<string, unknown>>(
    row.poi_counts_for_isochrone,
    {},
  );
  const fromCounts = parseJsonObject<Record<string, unknown>>(
    row.indexes_from_counts,
    {},
  );
  const grouped = parseJsonObject<Record<string, unknown>>(
    row.grouped_indexes,
    {},
  );
  const catchmentType = toText(row.catchment_type);
  const growth = toNumber(row.cluster_growth_rate);

  return {
    id: cfg.id,
    name: cfg.name,
    path: cfg.targetPath,
    color: cfg.color,
    status,
    error,
    reportId: toText(row.report_id) ?? toText(row.id) ?? null,
    siteName: toText(row.site_name) ?? toText(row.location) ?? null,
    location: toText(row.location),
    catchmentType,
    catchmentLabel: catchmentType ? labelCatchmentType(catchmentType) : null,
    lat: toNumber(row.lat) ?? toNumber(row.city_lat),
    lng: toNumber(row.lng) ?? toNumber(row.city_lng),
    areaM2: toNumber(row.area),
    distanceFromCityCenterKm: toNumber(row.distance_from_city_center),
    orientation: toText(row.orientation_from_city_center),
    clusterGrowthRate:
      growth ?? toNumber(counts.projected_growth) ?? toNumber(fromCounts.projected_growth),
    createdAt: toNumber(row.created_at),
    brands: countOf(row.top_brands),
    pois:
      toNumber(pois.count) ??
      toNumber(counts.total) ??
      toNumber(pois.data),
    poiCategories: countOf(pois.data),
    avgReviewsPerDay: toNumber(pois.avg_number_of_reviews_per_day),
    competitors: toNumber(competition.count),
    anchors: toNumber(malls.count),
    demandGenerators: countOf(row.demand_generators),
    highStreets: countOf(row.high_streets),
    apartments: countOf(row.apartments),
    projects: toNumber(projects.count_projects),
    population: toNumber(population.total_population) ?? toNumber(counts.population) ?? toNumber(grouped.population),
    households: toNumber(households.total_hh),
    performanceScore:
      toNumber(counts.performance_score) ??
      toNumber(fromCounts.performance_score) ??
      toNumber(grouped.performance_index),
    deliveryPerformanceScore: toNumber(counts.delivery_performance_score),
    revenueScore: toNumber(row.revenue_score) ?? toNumber(counts.revenue_score),
    affluence: toNumber(row.affluence),
    avgCostForTwo: toNumber(row.avg_cost_for_two),
  };
}

/** Placeholder card — same shape, so the grid never re-flows. */
function placeholder(cfg: CardConfig): ReportCardSummary {
  return buildSummary(cfg, {}, "loading", null);
}

/** Fetch one report's projection (memoized by config id). */
async function loadSummary(cfg: CardConfig): Promise<ReportCardSummary> {
  const cached = summaryCache.get(cfg.id);
  if (cached?.status === "ready") return cached;

  const query = new URLSearchParams({
    path: cfg.targetPath,
    fields: CARD_FIELDS,
    counts: CARD_COUNTS,
  });

  let res = await fetch(`/api/pois?${query.toString()}`);
  if (!res.ok && res.status === 404 && !cfg.targetPath.startsWith("sample/")) {
    const fileName = cfg.targetPath.split("/").pop() ?? cfg.targetPath;
    query.set("path", `sample/${fileName}`);
    res = await fetch(`/api/pois?${query.toString()}`);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string };
      detail = body?.error ?? "";
    } catch {
      /* non-JSON error body */
    }
    throw new Error(
      detail || `Failed to load report details (HTTP ${res.status})`,
    );
  }

  const json: unknown = await res.json();
  const rows: Record<string, unknown>[] = Array.isArray(json)
    ? json.filter(isRecord)
    : isRecord(json) && Array.isArray(json.data)
      ? json.data.filter(isRecord)
      : isRecord(json)
        ? [json]
        : [];

  const row = pickRow(rows, cfg.id);
  if (!row) throw new Error("The data source does not expose any report row");

  const summary = buildSummary(cfg, row, "ready", null);
  summaryCache.set(cfg.id, summary);
  return summary;
}

export interface UseReportCardsResult {
  cards: ReportCardSummary[];
  /** True while at least one card is still being summarised. */
  loading: boolean;
  /** Drop the cache and re-fetch every card. */
  reload: () => void;
}

/**
 * Summarises every configured report, one file at a time.
 * The returned array always mirrors `reportDataLayerConfig` (same order and
 * length), so cards render immediately and fill in as the files land.
 */
export function useReportCards(): UseReportCardsResult {
  const [cards, setCards] = useState<ReportCardSummary[]>(() =>
    reportDataLayerConfig.map(
      (cfg) => summaryCache.get(cfg.id) ?? placeholder(cfg),
    ),
  );
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (const cfg of reportDataLayerConfig) {
        if (cancelled) return;
        try {
          const summary = await loadSummary(cfg);
          if (cancelled) return;
          setCards((prev) => prev.map((c) => (c.id === cfg.id ? summary : c)));
        } catch (err) {
          if (cancelled) return;
          summaryCache.delete(cfg.id);
          const message = err instanceof Error ? err.message : String(err);
          setCards((prev) =>
            prev.map((c) =>
              c.id === cfg.id ? { ...placeholder(cfg), status: "error", error: message } : c,
            ),
          );
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    for (const cfg of reportDataLayerConfig) summaryCache.delete(cfg.id);
    setCards(reportDataLayerConfig.map((cfg) => placeholder(cfg)));
    setReloadToken((v) => v + 1);
  }, []);

  return {
    cards,
    loading: cards.some((card) => card.status === "loading"),
    reload,
  };
}
