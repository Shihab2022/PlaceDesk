/**
 * Types for the location-intelligence report feed consumed by
 * `Dashboard -> Reports`.
 *
 * The report JSON is produced by the spatial engine and is deliberately
 * loosely typed: most complex fields arrive as JSON *strings*, several are
 * optional, and a few can be `null` or empty. `RawReportPayload` mirrors the
 * wire format exactly, while `ReportModel` (see `normalize.ts`) is the parsed,
 * render-friendly shape used by the UI.
 */

/* ------------------------------------------------------------------ */
/* Wire format                                                         */
/* ------------------------------------------------------------------ */

/** A report row exactly as returned by `/api/pois` (`data: []`). */
export interface RawReportPayload {
  report_id?: string | null;
  id?: string | null;
  site_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  /** WKT (`POLYGON ((...))`) or a GeoJSON string. */
  geometry?: unknown;
  location?: string | null;
  catchment_type?: string | null;
  /** JSON string / array of business records. */
  top_brands?: unknown;
  /** `{ count, avg_number_of_reviews_per_day, data: [...] }` as JSON string. */
  pois?: unknown;
  projects?: unknown;
  apartments?: unknown;
  household_distribution?: unknown;
  competition?: unknown;
  population?: unknown;
  affluence?: number | null;
  avg_cost_for_two?: number | null;
  revenue_score?: number | null;
  high_streets?: unknown;
  shopping_malls?: unknown;
  created_at?: number | null;
  location_score_weights?: unknown;
  grouped_indexes?: unknown;
  demand_generators?: unknown;
  city_lat?: number | null;
  city_lng?: number | null;
  distance_from_city_center?: number | null;
  orientation_from_city_center?: string | null;
  competitors_domains?: unknown;
  poi_counts_for_isochrone?: unknown;
  indexes_from_counts?: unknown;
  area?: number | null;
  distance?: number | null;
  cluster_growth_rate?: number | null;
  [key: string]: unknown;
}

/** Envelope returned by the API route. */
export interface RawReportEnvelope {
  success?: boolean;
  data?: RawReportPayload[];
  error?: string;
  [key: string]: unknown;
}

/** A business / POI row (top brands, POI highlights, competitors, anchors). */
export interface BusinessRecord {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  source?: string;
  brand_id?: string;
  brand_name?: string;
  category?: string;
  number_of_votes?: number;
  reviews_per_day?: number;
  performance_score?: number;
  distance?: number;
  price_level?: number;
  rating?: number;
  service_options?: string[];
  tags?: string[];
  sub_categories?: string[];
  first_review_timestamp?: number | null;
  brand_logo?: string | null;
  store_performance_category_and_country_level?: number | null;
  store_performance_category_and_city_level?: number | null;
  store_performance_brand_and_country_level?: number | null;
  store_performance_brand_and_city_level?: number | null;
  competitor_type?: string;
  additional_types?: string[];
  type?: string;
}

/** One entry of `pois.data`: a category roll-up with its highlights. */
export interface PoiSummaryEntry {
  category: string;
  count: number;
  avgReviewsPerDay: number | null;
  topPois: BusinessRecord[];
  topBrands: { name: string; value: number }[];
}

/** `pois` — overall POI roll-up for the site. */
export interface PoiSummary {
  count: number | null;
  avgReviewsPerDay: number | null;
  entries: PoiSummaryEntry[];
}

/** `competition` / `shopping_malls`: `{ count, pois: [] }`. */
export interface PoiCollection {
  count: number | null;
  pois: BusinessRecord[];
}

/** `demand_generators.companies` (enterprise segmentation). */
export interface CompanyBreakdown {
  segments: { label: string; value: number }[];
  total: number | null;
}

/** One demand generator row (category + count, or the companies roll-up). */
export interface DemandGeneratorEntry {
  key: string;
  label: string;
  value: number;
}

/** `population` — age-band breakdown for the catchment. */
export interface PopulationBreakdown {
  total: number | null;
  bands: { label: string; value: number }[];
}

/** `household_distribution` — income segmentation. */
export interface HouseholdBreakdown {
  segments: { label: string; value: number }[];
  total: number | null;
  medianIncome: number | null;
}

/** `apartments` — median price per transaction type. */
export interface ApartmentStat {
  transType: string;
  medianPrice: number | null;
  count: number | null;
}

/** `projects` — residential supply pipeline. */
export interface ProjectSummary {
  count: number | null;
  units: number | null;
  defaultUnits: number | null;
  projects: {
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    units: number | null;
    distance: number | null;
  }[];
}

/** One `high_streets` cluster (retail high street with its own polygon). */
export interface HighStreetRecord {
  name: string;
  locality: string | null;
  areaM2: number | null;
  lat: number | null;
  lng: number | null;
  growthRate: number | null;
  distanceKm: number | null;
  polygon: ReportPolygon | null;
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

export type Position = [number, number];

export interface ReportPolygon {
  /** GeoJSON geometry, directly consumable by deck.gl. */
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  /** Outer ring (first ring of the first polygon). */
  ring: Position[];
  center: Position | null;
  areaM2: number | null;
}

/* ------------------------------------------------------------------ */
/* Normalized model                                                    */
/* ------------------------------------------------------------------ */

/** Everything the report UI needs, parsed once per report. */
export interface ReportModel {
  /** Raw payload, kept for the data explorer. */
  raw: RawReportPayload;
  /** Stable identity used for caching + selection. */
  key: string;
  reportId: string;
  entityId: string | null;
  siteName: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  cityLat: number | null;
  cityLng: number | null;
  catchmentType: string | null;
  catchmentLabel: string;
  catchment: ReportPolygon | null;
  createdAt: number | null;
  orientation: string | null;
  distanceFromCityCenterKm: number | null;
  /** Report-level distance to the site (km), when provided. */
  distanceKm: number | null;
  areaM2: number | null;
  clusterGrowthRate: number | null;
  brands: BusinessRecord[];
  /** Map POIs: `top_brands` merged with the `pois.data[].top_pois` highlights. */
  mapPois: BusinessRecord[];
  poiSummary: PoiSummary | null;
  poiCounts: Record<string, number>;
  indexesFromCounts: Record<string, number>;
  groupedIndexes: Record<string, number>;
  locationScoreWeights: Record<string, number>;
  demandGenerators: DemandGeneratorEntry[];
  companies: CompanyBreakdown | null;
  competitors: BusinessRecord[];
  competitorsDomains: string[];
  shoppingMalls: PoiCollection | null;
  anchors: BusinessRecord[];
  highStreets: HighStreetRecord[];
  population: PopulationBreakdown | null;
  households: HouseholdBreakdown | null;
  apartments: ApartmentStat[];
  projects: ProjectSummary | null;
  affluence: number | null;
  avgCostForTwo: number | null;
  revenueScore: number | null;
  performanceScore: number | null;
  deliveryPerformanceScore: number | null;
  /** Brands that carry a `performance_score`, for market-performance stats. */
  scoredBrands: BusinessRecord[];
}

/** A selectable report in the header selector. */
export interface ReportOption {
  /** Key into the report cache. */
  key: string;
  reportId: string;
  /** File the report was (or would be) loaded from. */
  path: string;
  /** Config entry name (available before the file is loaded). */
  sourceName: string;
  loaded: boolean;
  siteName: string;
  location: string | null;
  catchmentType: string | null;
  createdAt: number | null;
  lat: number | null;
  lng: number | null;
}

/** Tabs of the report workspace. */
export type ReportTabId =
  | "overview"
  | "map"
  | "market"
  | "demographics"
  | "pois"
  | "competitors"
  | "brands"
  | "indexes"
  | "data";

