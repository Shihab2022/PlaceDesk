import type { ComponentType } from "react";

/* ================================================================ */
/* Core types for the multi-layer Spatic workspace                  */
/* ================================================================ */

/** A single location/business record — mirrors the Delhi dataset schema. */
export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  sub_categories: string;
  pincode: string;
  type: string;
  address: string;
  town_name: string;
  brand_name: string;
  number_of_votes: number;
  service_options: string;
  cost_for_two: number;
}

export const CATEGORY_KEYS = [
  "malls",
  "furniture",
  "electronics",
  "leisure",
  "medical",
  "transport",
  "companies",
  "education",
  "fashion",
  "fitness",
  "food",
  "others",
  "supermarket",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** Static definition for a geography dataset category. */
export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string; // default appearance color (hex)
  targetPath?: string; // Delhi real dataset path
  mockCount: number; // generated locations per (other) city
}

export interface CityDef {
  id: string;
  label: string;
  country: string;
  center: { lat: number; lng: number };
  zoom: number;
  useApi: boolean; // uses the /api/pois real-data backend
  districts: { name: string; lat: number; lng: number }[];
  pincode: string; // prefix, e.g. "1100"
  pincodeLength: number; // total digits
  roads: string[];
}

/* Layer presentation */

export type VisualizationType =
  | "point"
  | "cluster"
  | "density"
  | "heatmap"
  | "hexagon"
  | "bubble";

export const VISUALIZATION_TYPES: VisualizationType[] = [
  "point",
  "cluster",
  "density",
  "heatmap",
  "hexagon",
  "bubble",
];

export interface Appearance {
  color: string;
  opacity: number; // 0-100
  radius: number; // px
  lineWidth: number; // px
}

export type FilterValue = string | number | string[] | [number, number] | undefined;

/* Filters */

export type FilterControlType = "select" | "multiselect" | "range";

export interface FilterDef {
  key: string;
  label: string;
  type: FilterControlType;
  accessor: (loc: LocationData) => string | string[] | number;
  options?: (data: LocationData[]) => string[]; // data-derived options
  min?: number; // for range
  max?: number; // for range (optional; computed from data if absent)
  step?: number;
  format?: (v: number) => string;
}

/** Runtime state of a single map layer. */
export interface LayerState {
  id: string;
  categoryKey: CategoryKey;
  label: string;
  color: string; // default category color (new layers adopt it)
  targetPath?: string;
  name: string;
  data: LocationData[];
  dataLoaded: boolean;
  loading: boolean;
  error?: string;
  visible: boolean;
  visualizationType: VisualizationType;
  appearance: Appearance;
  filters: Record<string, FilterValue>;
}

/* ================================================================ */
/* Small pure helpers (shared util-ish, kept to avoid extra files)  */
/* ================================================================ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];

/** Parse bracket-ish text arrays like "[[Shopping mall]]" or "[]" */
export function parseTextArray(s?: string): string[] {
  if (!s) return [];
  const cleaned = String(s).replace(/\[|\]|"/g, "");
  return cleaned
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Deterministic pseudo rating (3.0–5.0) derived from stable fields. */
export function getRating(loc: LocationData): number {
  let h = 0;
  const str = String(loc.id || loc.name);
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const base = 3.0 + ((h + (loc.number_of_votes || 0)) % 20) / 10;
  return Number(base.toFixed(1));
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function extractByAccessor(
  data: LocationData[],
  accessor: (loc: LocationData) => string | string[] | number,
): string[] {
  const set = new Set<string>();
  for (const loc of data) {
    const v = accessor(loc);
    if (Array.isArray(v)) v.forEach((x) => x && set.add(String(x)));
    else if (v !== undefined && v !== null && v !== "" && v !== "N_A")
      set.add(String(v));
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}