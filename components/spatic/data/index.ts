export * from "./types";
export * from "./cities";
export * from "./layerConfig";
export * from "./categoryFilters";
export * from "./mockGenerator";

/** Shared map themes + color swatches used across the UI. */
export const MAP_THEMES: { id: string; label: string; style: string }[] = [
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-v9" },
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
];

export const SWATCHES: string[] = [
  "#7C4DFF",
  "#5B2FBF",
  "#6D3FE8",
  "#A78BFA",
  "#2563EB",
  "#06B6D4",
  "#10B981",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
  "#64748B",
];

export const formatNumber = (n: number) => n.toLocaleString("en-US");
export const formatCurrency = (m: number) => `₹${m.toFixed(1)}M`;