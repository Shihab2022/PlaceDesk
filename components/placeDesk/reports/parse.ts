/**
 * Defensive parsing + formatting helpers shared by every report component.
 *
 * Report payloads mix typed values, JSON strings, `null`, empty objects and
 * WKT geometry, so all decoding lives here — components never call
 * `JSON.parse` directly.
 */

import type { Position, ReportPolygon } from "./types";

/* ------------------------------------------------------------------ */
/* Safe value parsing                                                  */
/* ------------------------------------------------------------------ */

/** Parse a field that may be a JSON string; returns `fallback` when invalid. */
export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") {
    return (value as T) ?? fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed === null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

/** Parse a JSON field that must resolve to an array of records. */
export function parseJsonArray<T>(value: unknown, fallback: T[] = []): T[] {
  const parsed = parseJsonField<unknown>(value, null);
  return Array.isArray(parsed) ? (parsed as T[]) : fallback;
}

/** Parse a JSON field that must resolve to a plain object. */
export function parseJsonObject<T extends object>(
  value: unknown,
  fallback: T,
): T {
  const parsed = parseJsonField<unknown>(value, null);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return fallback;
  }
  return parsed as T;
}

/** Coerce to a finite number, or `null` when unusable. */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Coerce to a non-empty trimmed string, or `null` (`N_A` counts as empty). */
export function toText(value: unknown): string | null {
  if (typeof value === "string") {
    const t = value.trim();
    return t && t !== "N_A" && t.toLowerCase() !== "n/a" ? t : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

/** Coerce to a string array (tolerant of `"[[A]]"`, `"a, b"` and `["A"]`). */
export function toStringArray(value: unknown): string[] {
  const parsed = parseJsonField<unknown>(value, value);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => (typeof item === "string" ? item : toText(item)))
      .filter((item): item is string => Boolean(item));
  }
  if (typeof parsed === "string") {
    return parsed
      .replace(/[[\]"]/g, "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item && item !== "N_A");
  }
  return [];
}

/** Parse a numeric record (`Record<string, number>`), dropping junk values. */
export function toNumberRecord(value: unknown): Record<string, number> {
  const parsed = parseJsonField<unknown>(value, null);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    const n = toNumber(v);
    if (n !== null) out[k] = n;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const WKT_PREFIX = /^\s*(?:SRID=\d+;)?\s*(POLYGON|MULTIPOLYGON)\s*/i;

function parseRing(text: string): Position[] {
  const ring: Position[] = [];
  for (const pair of text.split(",")) {
    const parts = pair.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const lng = Number(parts[0]);
    const lat = Number(parts[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) ring.push([lng, lat]);
  }
  return ring;
}

/** Splits `(a,b),(c,d)` into `["a,b", "c,d"]` honouring nested parens. */
function splitParenGroups(body: string): string[] {
  const groups: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === "(") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        groups.push(body.slice(start + 1, i));
        start = -1;
      }
    }
  }
  return groups;
}

/** Approximate geodesic area (m²) of a ring via spherical excess. */
export function ringAreaM2(ring: Position[]): number | null {
  if (ring.length < 3) return null;
  const R = 6378137;
  const rad = Math.PI / 180;
  let total = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[(i + 1) % ring.length];
    total +=
      (lng2 - lng1) * rad * (2 + Math.sin(lat1 * rad) + Math.sin(lat2 * rad));
  }
  return Math.abs((total * R * R) / 2);
}

/** Simple ring centroid (average of vertices — good enough for a marker). */
export function ringCenter(ring: Position[]): Position | null {
  if (!ring.length) return null;
  let lng = 0;
  let lat = 0;
  for (const [x, y] of ring) {
    lng += x;
    lat += y;
  }
  return [lng / ring.length, lat / ring.length];
}

/**
 * Decode a `geometry` field into a deck.gl-ready polygon.
 * Accepts WKT (`POLYGON` / `MULTIPOLYGON`) and GeoJSON (string or object).
 */
export function parsePolygon(value: unknown): ReportPolygon | null {
  const geo = resolveGeometry(value);
  if (!geo) return null;
  const firstPolygon =
    geo.type === "Polygon"
      ? (geo.coordinates as number[][][])
      : (geo.coordinates as number[][][][])[0];
  const outer = Array.isArray(firstPolygon) ? firstPolygon[0] : null;
  const ring: Position[] = Array.isArray(outer)
    ? outer
        .filter(
          (p) =>
            Array.isArray(p) &&
            Number.isFinite(Number(p[0])) &&
            Number.isFinite(Number(p[1])),
        )
        .map((p) => [Number(p[0]), Number(p[1])] as Position)
    : [];
  return {
    geometry: geo,
    ring,
    center: ringCenter(ring),
    areaM2: ringAreaM2(ring),
  };
}

type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

function resolveGeometry(value: unknown): GeoGeometry | null {
  if (!value) return null;

  if (typeof value === "object") {
    const obj = value as {
      type?: unknown;
      coordinates?: unknown;
      geometry?: unknown;
    };
    const type = String(obj.type ?? "").toUpperCase();
    if (type === "FEATURE" && obj.geometry) return resolveGeometry(obj.geometry);
    if (
      (type === "POLYGON" || type === "MULTIPOLYGON") &&
      Array.isArray(obj.coordinates)
    ) {
      return {
        type: type === "POLYGON" ? "Polygon" : "MultiPolygon",
        coordinates: obj.coordinates as number[][][] | number[][][][],
      };
    }
    return null;
  }

  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;

  if (text.startsWith("{") || text.startsWith("[")) {
    return resolveGeometry(parseJsonField<unknown>(text, null));
  }

  const match = text.match(WKT_PREFIX);
  if (!match) return null;
  const kind = match[1].toUpperCase();
  const body = text.slice(match[0].length).trim();
  const open = body.indexOf("(");
  if (open < 0) return null;
  const inner = body.slice(open + 1, body.lastIndexOf(")"));

  if (kind === "POLYGON") {
    const rings = splitParenGroups(inner)
      .map(parseRing)
      .filter((ring) => ring.length >= 3);
    if (!rings.length) return null;
    return { type: "Polygon", coordinates: [rings] };
  }

  const polygons = splitParenGroups(inner)
    .map((group) =>
      splitParenGroups(group).map(parseRing).filter((ring) => ring.length >= 3),
    )
    .filter((rings) => rings.length);
  if (!polygons.length) return null;
  return { type: "MultiPolygon", coordinates: polygons };
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const LABEL_OVERRIDES: Record<string, string> = {
  "age_60+": "Age 60+",
  "age_0_19": "Age 0–19",
  "age_20_34": "Age 20–34",
  "age_35_59": "Age 35–59",
  cft_index: "Cost for Two Index",
  delivery_performance_index: "Delivery Performance Index",
  performance_index: "Performance Index",
  game_theory_v1_competitor: "Competitor (Game Theory)",
  game_theory_v1_anchor: "Anchor (Game Theory)",
  smes: "SMEs",
  mnc: "MNC",
  mncs_it_parks: "MNCs / IT Parks",
  ews_hh: "EWS Households",
  lig_hh: "LIG Households",
  mig_hh: "MIG Households",
  aig_hh: "AIG Households",
  eig_hh: "EIG Households",
  household_income: "Median Household Income",
  road_area: "Road Area",
  food_other: "Food (Other)",
  bar_pub: "Bars & Pubs",
  gym_fitness: "Gyms & Fitness",
  electronic_store: "Electronics",
  private_sector: "Private Sector",
  govt_sector: "Government Sector",
  public_sector: "Public Sector",
  shopping_mall: "Shopping Malls",
  tourist_attraction: "Tourist Attractions",
  tuition_center: "Tuition Centres",
  home_decor: "Home Decor",
  religious_place: "Religious Places",
  cinema_hall: "Cinema Halls",
  metro_station: "Metro Stations",
  bus_stop: "Bus Stops",
  wtp: "Willingness To Pay",
};

/** `apartments_index` -> `Apartments`, `gym_fitness` -> `Gyms & Fitness`. */
export function humanizeKey(
  key: string,
  options?: { stripIndex?: boolean },
): string {
  if (!key) return "";
  const raw = key.trim();
  const override = LABEL_OVERRIDES[raw.toLowerCase()];
  if (override) return override;
  const stripped =
    options?.stripIndex === false ? raw : raw.replace(/_index$/i, "");
  const spaced = stripped.replace(/_/g, " ").trim();
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Anything unusable renders as `N/A` rather than throwing. */
export function formatNumber(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  return n === null ? fallback : numberFormat.format(n);
}

export function formatInt(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  return n === null ? fallback : intFormat.format(Math.round(n));
}

export function formatCompact(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  return n === null ? fallback : compactFormat.format(n);
}

export function formatDecimal(
  value: unknown,
  digits = 2,
  fallback = "N/A",
): string {
  const n = toNumber(value);
  return n === null ? fallback : n.toFixed(digits);
}

export function formatPercent(
  value: unknown,
  digits = 0,
  fallback = "N/A",
): string {
  const n = toNumber(value);
  return n === null ? fallback : `${n.toFixed(digits)}%`;
}

export function formatDistanceKm(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  return `${n.toFixed(n >= 10 ? 1 : 2)} km`;
}

export function formatArea(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} km²`;
  return `${intFormat.format(Math.round(n))} m²`;
}

export function formatPrice(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${intFormat.format(Math.round(n))}`;
}

export function formatCurrency(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  return n === null ? fallback : `₹${intFormat.format(Math.round(n))}`;
}

/** Unix seconds (or ms) -> readable date. */
export function formatDate(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  if (n === null || n <= 0) return fallback;
  const ms = n > 1e12 ? n : n * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: unknown, fallback = "N/A"): string {
  const n = toNumber(value);
  if (n === null || n <= 0) return fallback;
  const ms = n > 1e12 ? n : n * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCoordinates(
  lat: unknown,
  lng: unknown,
  digits = 6,
  fallback = "N/A",
): string {
  const la = toNumber(lat);
  const ln = toNumber(lng);
  if (la === null || ln === null) return fallback;
  return `${la.toFixed(digits)}, ${ln.toFixed(digits)}`;
}

/** Price level / price bucket label (0–4 scale used by the feed). */
export function formatPriceLevel(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return "N/A";
  if (n <= 0) return "Not rated";
  return "₹".repeat(Math.min(Math.round(n), 4));
}

/** Catchment codes such as `i2500mtd` / `i15mind` -> `2.5 KM drive time`. */
export function labelCatchmentType(value: unknown): string {
  const text = toText(value);
  if (!text) return "N/A";
  const match = text.match(
    /^i\s*(\d+(?:\.\d+)?)\s*(min|m|km|mtd|kmtd|mind|mintd)/i,
  );
  if (match) {
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("min")) return `${amount} min drive time`;
    if (unit.startsWith("km")) return `${amount} KM catchment`;
    if (amount >= 1000) return `${amount / 1000} KM drive time`;
    return `${amount} m catchment`;
  }
  return text.replace(/^i(?=\d)/i, "").toUpperCase();
}

/** Normalizes an index scale from the data (never mutates the values). */
export function indexScale(values: number[], fallback = 5): number {
  let max = fallback;
  for (const v of values) {
    if (Number.isFinite(v) && v > max) max = v;
  }
  return max;
}

/** `0.05` -> `5` (weights arrive as fractions or percents). */
export function weightToPercent(value: unknown): number | null {
  const n = toNumber(value);
  if (n === null) return null;
  return n <= 1 ? n * 100 : n;
}

/** Sorts metrics descending, ignoring non-finite values. */
export function sortMetricsDesc(
  record: Record<string, number>,
): { key: string; value: number }[] {
  return Object.entries(record)
    .filter(([, v]) => Number.isFinite(v))
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}




