/**
 * Turns a raw report row into `ReportModel` — the parsed, render-friendly
 * shape every report component consumes.
 *
 * Normalization runs **once per report** and is memoized by report key, so
 * switching tabs or re-rendering never re-parses the multi-MB JSON strings.
 */

import type {
  ApartmentStat,
  BusinessRecord,
  CompanyBreakdown,
  DemandGeneratorEntry,
  HighStreetRecord,
  HouseholdBreakdown,
  PoiCollection,
  PoiSummary,
  PoiSummaryEntry,
  PopulationBreakdown,
  ProjectSummary,
  RawReportPayload,
  ReportModel,
} from "./types";
import {
  humanizeKey,
  parseJsonArray,
  parseJsonObject,
  parsePolygon,
  toNumber,
  toText,
  toNumberRecord,
} from "./parse";

const modelCache = new Map<string, ReportModel>();

/** Stable cache key for a raw report row. */
export function reportKey(raw: RawReportPayload): string {
  const reportId = toText(raw.report_id) ?? toText(raw.id);
  if (reportId) return reportId;
  const lat = toNumber(raw.lat);
  const lng = toNumber(raw.lng);
  if (lat !== null && lng !== null) return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const site = toText(raw.site_name) ?? toText(raw.location);
  if (site) return site;
  return `report-${modelCache.size}`;
}

/** Memoized accessor — call it, then use the object directly in a view. */
export function getReportModel(raw: RawReportPayload): ReportModel {
  const key = reportKey(raw);
  const cached = modelCache.get(key);
  if (cached) return cached;
  const model = normalizeReport(raw, key);
  modelCache.set(key, model);
  return model;
}

/** How many parsed reports are currently cached (for debugging). */
export function reportCacheSize(): number {
  return modelCache.size;
}

/* ------------------------------------------------------------------ */
/* Record parsers                                                      */
/* ------------------------------------------------------------------ */

let businessSeq = 0;

function normalizeBusinesses(value: unknown): BusinessRecord[] {
  const rows = parseJsonArray<Record<string, unknown>>(value);
  const out: BusinessRecord[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const name =
      toText(row.name) ?? toText(row.brand_name) ?? toText(row.title) ?? null;
    if (!name) continue;
    businessSeq += 1;
    const lat = toNumber(row.lat) ?? toNumber(row.latitude);
    const lng = toNumber(row.lng) ?? toNumber(row.longitude);
    const record: BusinessRecord = {
      id: toText(row.id) ?? toText(row.brand_id) ?? `poi-${businessSeq}`,
      name,
      source: toText(row.source) ?? undefined,
      brand_id: toText(row.brand_id) ?? undefined,
      brand_name: toText(row.brand_name) ?? undefined,
      category: toText(row.category) ?? toText(row.type) ?? undefined,
      number_of_votes: toNumber(row.number_of_votes) ?? undefined,
      reviews_per_day: toNumber(row.reviews_per_day) ?? undefined,
      performance_score: toNumber(row.performance_score) ?? undefined,
      distance: toNumber(row.distance) ?? undefined,
      price_level: toNumber(row.price_level) ?? undefined,
      rating: toNumber(row.rating) ?? undefined,
      service_options: row.service_options
        ? parseJsonArray<string>(row.service_options)
        : undefined,
      tags: row.tags ? parseJsonArray<string>(row.tags) : undefined,
      sub_categories: row.sub_categories
        ? parseJsonArray<string>(row.sub_categories)
        : undefined,
      first_review_timestamp: toNumber(row.first_review_timestamp),
      brand_logo: toText(row.brand_logo),
      store_performance_category_and_country_level: toNumber(
        row.store_performance_category_and_country_level,
      ),
      store_performance_category_and_city_level: toNumber(
        row.store_performance_category_and_city_level,
      ),
      store_performance_brand_and_country_level: toNumber(
        row.store_performance_brand_and_country_level,
      ),
      store_performance_brand_and_city_level: toNumber(
        row.store_performance_brand_and_city_level,
      ),
      competitor_type: toText(row.competitor_type) ?? undefined,
      additional_types: row.additional_types
        ? parseJsonArray<string>(row.additional_types)
        : undefined,
      type: toText(row.type) ?? undefined,
    };
    if (lat !== null) record.lat = lat;
    if (lng !== null) record.lng = lng;
    out.push(record);
  }
  return out;
}

function normalizePoiSummary(value: unknown): PoiSummary | null {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  if (!Object.keys(obj).length) return null;
  const entries: PoiSummaryEntry[] = [];
  for (const row of parseJsonArray<Record<string, unknown>>(obj.data)) {
    if (!row || typeof row !== "object") continue;
    const category = toText(row.category);
    if (!category) continue;
    entries.push({
      category,
      count: toNumber(row.count) ?? 0,
      avgReviewsPerDay: toNumber(row.avg_number_of_reviews_per_day),
      topPois: normalizeBusinesses(row.top_pois),
      topBrands: parseJsonArray<Record<string, unknown>>(row.top_brands)
        .map((b) => ({
          name: toText(b?.name) ?? "",
          value: toNumber(b?.value) ?? 0,
        }))
        .filter((b) => b.name),
    });
  }
  return {
    count: toNumber(obj.count),
    avgReviewsPerDay: toNumber(obj.avg_number_of_reviews_per_day),
    entries,
  };
}

function normalizeCollection(value: unknown): PoiCollection | null {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  if (!Object.keys(obj).length) return null;
  const pois = normalizeBusinesses(obj.pois);
  const count = toNumber(obj.count);
  if (count === null && !pois.length) return null;
  return { count, pois };
}

function normalizePopulation(value: unknown): PopulationBreakdown | null {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  if (!Object.keys(obj).length) return null;
  const bands = Object.entries(obj)
    .map(([key, v]) => ({ label: humanizeKey(key), value: toNumber(v) ?? 0 }))
    .filter((band) => band.label.toLowerCase() !== "total");
  if (!bands.length) return null;
  const total = bands.reduce((sum, band) => sum + band.value, 0);
  return { total: total > 0 ? total : null, bands };
}

function normalizeHouseholds(value: unknown): HouseholdBreakdown | null {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  if (!Object.keys(obj).length) return null;
  const segmentKeys = ["ews_hh", "lig_hh", "mig_hh", "aig_hh", "eig_hh"];
  const segments = segmentKeys
    .map((key) => ({ label: humanizeKey(key), value: toNumber(obj[key]) }))
    .filter((s): s is { label: string; value: number } => s.value !== null)
    .map((s) => ({ label: s.label, value: s.value }));
  return {
    segments,
    total: toNumber(obj.hh_count),
    medianIncome: toNumber(obj.household_income),
  };
}

function normalizeApartments(value: unknown): ApartmentStat[] {
  const rows = parseJsonArray<Record<string, unknown>>(value);
  return rows
    .map((row) => ({
      transType: toText(row?.trans_type) ?? "Unknown",
      medianPrice: toNumber(row?.median_price),
      count: toNumber(row?.count) ?? toNumber(row?.apartment_count),
    }))
    .filter((row) => row.transType !== "Unknown" || row.medianPrice !== null);
}

function normalizeProjects(value: unknown): ProjectSummary | null {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  const rows = parseJsonArray<Record<string, unknown>>(obj.projects);
  const defaultUnits = toNumber(obj.default_units);
  const declaredCount = toNumber(obj.project_count);
  if (!rows.length && declaredCount === null && defaultUnits === null) {
    return null;
  }
  const projects = rows.map((row, i) => {
    const id = toText(row?.project_id) ?? toText(row?.id) ?? `project-${i}`;
    const lat = toNumber(row?.lat) ?? toNumber(row?.latitude);
    const lng = toNumber(row?.lng) ?? toNumber(row?.longitude);
    const units = toNumber(row?.units) ?? toNumber(row?.total_units);
    const project: ProjectSummary["projects"][number] = {
      id,
      name: toText(row?.name) ?? toText(row?.project_name) ?? id,
      units,
      distance: toNumber(row?.distance),
    };
    if (lat !== null) project.lat = lat;
    if (lng !== null) project.lng = lng;
    return project;
  });
  const summedUnits = projects.reduce((sum, p) => sum + (p.units ?? 0), 0);
  const units = toNumber(obj.total_units) ?? (summedUnits > 0 ? summedUnits : null);
  return {
    count: declaredCount ?? (rows.length || null),
    units,
    defaultUnits,
    projects,
  };
}

function normalizeHighStreets(value: unknown): HighStreetRecord[] {
  const rows = parseJsonArray<Record<string, unknown>>(value);
  return rows.map((row, i) => {
    const lat = toNumber(row?.lat) ?? toNumber(row?.latitude);
    const lng = toNumber(row?.lng) ?? toNumber(row?.longitude);
    const record: HighStreetRecord = {
      name: toText(row?.name) ?? toText(row?.high_street) ?? `High Street ${i + 1}`,
      locality: toText(row?.locality) ?? toText(row?.city),
      areaM2: toNumber(row?.area),
      lat: lat,
      lng: lng,
      growthRate: toNumber(row?.cluster_growth_rate),
      distanceKm: toNumber(row?.distance),
      polygon: parsePolygon(row?.geometry ?? row?.polygon ?? row?.geojson),
    };
    return record;
  });
}

function normalizeDemand(
  value: unknown,
): { entries: DemandGeneratorEntry[]; companies: CompanyBreakdown | null } {
  const obj = parseJsonObject<Record<string, unknown>>(value, {});
  const entries: DemandGeneratorEntry[] = [];
  let companies: CompanyBreakdown | null = null;

  for (const [key, raw] of Object.entries(obj)) {
    if (key === "companies") {
      const companyObj = parseJsonObject<Record<string, unknown>>(raw, {});
      const segments: CompanyBreakdown["segments"] = [];
      for (const [name, data] of Object.entries(companyObj)) {
        let count = toNumber(data);
        if (count === null && data && typeof data === "object") {
          const bucket = data as Record<string, unknown>;
          count =
            toNumber(bucket.outlet_count) ??
            toNumber(bucket.count) ??
            toNumber(bucket.enterprise_count) ??
            toNumber(bucket.total) ??
            0;
        }
        segments.push({ label: humanizeKey(name), value: count ?? 0 });
      }
      if (segments.length) {
        companies = {
          segments: segments.sort((a, b) => b.value - a.value),
          total: segments.reduce((sum, s) => sum + s.value, 0),
        };
      }
      continue;
    }
    const num = toNumber(raw);
    if (num !== null) {
      entries.push({ key, label: humanizeKey(key), value: num });
    }
  }
  entries.sort((a, b) => b.value - a.value);
  return { entries, companies };
}

/* ------------------------------------------------------------------ */
/* Report assembly                                                     */
/* ------------------------------------------------------------------ */

function firstDefined(...values: unknown[]): number | null {
  for (const v of values) {
    const n = toNumber(v);
    if (n !== null) return n;
  }
  return null;
}

function normalizeReport(raw: RawReportPayload, key: string): ReportModel {
  const lat = toNumber(raw.lat);
  const lng = toNumber(raw.lng);
  const catchment = parsePolygon(raw.geometry);

  const poiSummary = normalizePoiSummary(raw.pois);
  const poiCounts = toNumberRecord(raw.poi_counts_for_isochrone);
  const indexesFromCounts = toNumberRecord(raw.indexes_from_counts);
  const groupedIndexes = toNumberRecord(raw.grouped_indexes);
  const locationScoreWeights = toNumberRecord(raw.location_score_weights);

  const brands = normalizeBusinesses(raw.top_brands);

  // POI highlights double as map points when `top_brands` is thin.
  const highlightPois = poiSummary
    ? poiSummary.entries.flatMap((entry) => entry.topPois)
    : [];
  const seenIds = new Set<string>();
  const mapPois = [...brands, ...highlightPois].filter((poi) => {
    if (seenIds.has(poi.id)) return false;
    seenIds.add(poi.id);
    return true;
  });

  const competition = normalizeCollection(raw.competition);
  const shoppingMalls = normalizeCollection(raw.shopping_malls);
  const { entries: demandGenerators, companies } = normalizeDemand(
    raw.demand_generators,
  );

  const anchorPois: BusinessRecord[] = [...(shoppingMalls?.pois ?? [])];
  const anchorIds = new Set(anchorPois.map((p) => p.id));
  for (const competitor of competition?.pois ?? []) {
    const type = (competitor.competitor_type ?? competitor.type ?? "").toLowerCase();
    if (type.includes("anchor") && !anchorIds.has(competitor.id)) {
      anchorPois.push(competitor);
      anchorIds.add(competitor.id);
    }
  }

  const highStreets = normalizeHighStreets(raw.high_streets);

  const scoredBrands = brands.filter(
    (b) =>
      typeof b.performance_score === "number" &&
      Number.isFinite(b.performance_score),
  );

  const siteLat = lat ?? catchment?.center?.[1] ?? null;
  const siteLng = lng ?? catchment?.center?.[0] ?? null;

  return {
    raw,
    key,
    reportId: toText(raw.report_id) ?? toText(raw.id) ?? key,
    entityId: toText(raw.entity_id),
    siteName: toText(raw.site_name) ?? toText(raw.location) ?? "Reported Site",
    location: toText(raw.location),
    lat: siteLat,
    lng: siteLng,
    cityLat: toNumber(raw.city_lat),
    cityLng: toNumber(raw.city_lng),
    catchmentType: toText(raw.catchment_type),
    catchmentLabel: catchmentLabel(raw, catchment?.areaM2 ?? null),
    catchment,
    createdAt: toNumber(raw.created_at),
    orientation: toText(raw.orientation_from_city_center),
    distanceFromCityCenterKm: toNumber(raw.distance_from_city_center),
    distanceKm: toNumber(raw.distance) ?? highStreets[0]?.distanceKm ?? null,
    areaM2: toNumber(raw.area) ?? catchment?.areaM2 ?? null,
    clusterGrowthRate:
      toNumber(raw.cluster_growth_rate) ??
      highStreets.find((h) => h.growthRate !== null)?.growthRate ??
      null,
    brands,
    mapPois,
    poiSummary,
    poiCounts,
    indexesFromCounts,
    groupedIndexes,
    locationScoreWeights,
    demandGenerators,
    companies,
    competitors: competition?.pois ?? [],
    competitorsDomains: parseJsonArray<string>(raw.competitors_domains),
    shoppingMalls,
    anchors: anchorPois,
    highStreets,
    population: normalizePopulation(raw.population),
    households: normalizeHouseholds(raw.household_distribution),
    apartments: normalizeApartments(raw.apartments),
    projects: normalizeProjects(raw.projects),
    affluence: firstDefined(
      raw.affluence,
      poiCounts.affluence,
      indexesFromCounts.affluence,
    ),
    avgCostForTwo: firstDefined(raw.avg_cost_for_two, poiCounts.avg_cost_for_two),
    revenueScore: firstDefined(raw.revenue_score, poiCounts.revenue_score),
    performanceScore: firstDefined(
      poiCounts.performance_score,
      indexesFromCounts.performance_score,
      groupedIndexes.performance_index,
    ),
    deliveryPerformanceScore: firstDefined(
      poiCounts.delivery_performance_score,
      indexesFromCounts.delivery_performance_score,
      groupedIndexes.delivery_performance_index,
    ),
    scoredBrands,
  };
}

function catchmentLabel(raw: RawReportPayload, areaM2: number | null): string {
  const type = toText(raw.catchment_type);
  if (type) {
    const match = type.match(/^i(\d+)([a-z]+)$/i);
    if (match) {
      const amount = Number(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith("min")) return `${amount} min drive time`;
      if (unit.startsWith("km")) return `${amount} km catchment`;
      if (amount >= 1000) {
        return `${amount / 1000} km drive time`;
      }
      return `${amount} m catchment`;
    }
    return type;
  }
  if (areaM2 !== null) return "Custom catchment";
  return "N/A";
}

/* ------------------------------------------------------------------ */
/* Derived market metrics (KPI source)                                 */
/* ------------------------------------------------------------------ */

export interface MarketMetrics {
  topBrands: number | null;
  totalPois: number | null;
  competitors: number | null;
  anchors: number | null;
  demandGenerators: number | null;
  avgCostForTwo: number | null;
  revenueScore: number | null;
  performanceScore: number | null;
  deliveryPerformanceScore: number | null;
  affluence: number | null;
  projectedGrowth: number | null;
  population: number | null;
  households: number | null;
  medianIncome: number | null;
  apartments: number | null;
  projects: number | null;
  projectUnits: number | null;
}

function firstMetric(...values: unknown[]): number | null {
  return firstDefined(...values);
}

/** KPI values for the report header — resolved across the varying schemas. */
export function deriveMarketMetrics(model: ReportModel): MarketMetrics {
  const poiTotalFromEntries = model.poiSummary
    ? model.poiSummary.entries.reduce((sum, e) => sum + e.count, 0)
    : null;

  return {
    topBrands: model.brands.length || null,
    totalPois: firstMetric(
      model.poiSummary?.count,
      model.poiCounts.total,
      poiTotalFromEntries,
    ),
    competitors: model.competitors.length || model.competitorsDomains.length || null,
    anchors: firstMetric(
      model.shoppingMalls?.count,
      model.poiCounts.shopping_mall,
      model.anchors.length || null,
    ),
    demandGenerators: model.demandGenerators.length || null,
    avgCostForTwo: model.avgCostForTwo,
    revenueScore: model.revenueScore,
    performanceScore: model.performanceScore,
    deliveryPerformanceScore: model.deliveryPerformanceScore,
    affluence: model.affluence,
    projectedGrowth: firstMetric(
      model.poiCounts.projected_growth,
      model.indexesFromCounts.projected_growth,
      model.clusterGrowthRate,
    ),
    population: firstMetric(
      model.population?.total,
      model.poiCounts.population,
      model.groupedIndexes.population,
    ),
    households: firstMetric(
      model.households?.total,
      model.poiCounts.hh_count,
      model.households?.segments.reduce((sum, s) => sum + s.value, 0),
    ),
    medianIncome: firstMetric(
      model.households?.medianIncome,
      model.poiCounts.hh_income,
    ),
    apartments: firstMetric(model.poiCounts.apartments),
    projects: model.projects?.count ?? null,
    projectUnits: firstMetric(model.projects?.units, model.projects?.defaultUnits),
  };
}




