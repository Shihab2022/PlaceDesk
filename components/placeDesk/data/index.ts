export * from "./types";
export * from "./cities";
export * from "./layerConfig";
export * from "./categoryFilters";
export * from "./mockGenerator";

/** Shared map themes + color swatches used across the UI. */
export const MAP_THEMES: { id: string; label: string; style: string; dark?: boolean }[] = [
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11", dark: true },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-v9" },
  { id: "satellite-streets", label: "Satellite Streets", style: "mapbox://styles/mapbox/satellite-streets-v12", dark: true },
  { id: "outdoors", label: "Outdoors", style: "mapbox://styles/mapbox/outdoors-v12" },
];

export const MAP_THEME_PREVIEWS: Record<string, string> = {
  streets: "linear-gradient(135deg,#eef0f4 0%,#d6d9e0 100%)",
  light: "linear-gradient(135deg,#ffffff 0%,#f0f1f5 100%)",
    dark: "linear-gradient(135deg,#1e1e2a 0%,#2a2b3a 100%)",
  satellite: "linear-gradient(135deg,#2a4d2e 0%,#3a6b3f 100%)",
  "satellite-streets": "linear-gradient(135deg,#1a3a1f 0%,#2a5a2f 100%)",
  outdoors: "linear-gradient(135deg,#e8f0e0 0%,#d0e0c0 100%)",
};

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