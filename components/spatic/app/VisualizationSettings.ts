/**
 * VisualizationSettings types — shared between the app store and the
 * LayerState type. Lives outside AppStoreContext to avoid circular imports.
 */

export interface ScatterSettings {
  pointSize: number;
  opacity: number;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
}
export interface IconSettings {
  glyph: string;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}
export interface HeatmapSettings {
  radius: number;
  intensity: number;
  opacity: number;
  weight: "votes" | "cost" | "constant";
  gradient: "purple" | "viridis" | "warm" | "cool";
}
export interface ClusterSettings {
  clusterRadius: number;
  maxZoom: number;
  color: string;
  opacity: number;
}

export interface VisualizationSettings {
  scatter: ScatterSettings;
  icon: IconSettings;
  heatmap: HeatmapSettings;
  cluster: ClusterSettings;
}

export const VISUALIZATIONS = [
  "scatter",
  "icon",
  "heatmap",
  "cluster",
  "hexagon",
  "density",
] as const;
export type VisualizationId = (typeof VISUALIZATIONS)[number];

export const VISUALIZATION_LABELS: Record<VisualizationId, string> = {
  scatter: "Scatter",
  icon: "Icon",
  heatmap: "Heatmap",
  cluster: "Cluster",
  hexagon: "Hexagon",
  density: "Density",
};

export const VISUALIZATION_PRIORITY: VisualizationId[] = [
  "scatter",
  "icon",
  "heatmap",
  "cluster",
  "hexagon",
  "density",
];

export const DEFAULT_VISUALIZATION: VisualizationId = "scatter";

export const DEFAULT_VIZ_SETTINGS: VisualizationSettings = {
  scatter: {
    pointSize: 8,
    opacity: 80,
    fillColor: "#7C4DFF",
    borderColor: "#5B2FBF",
    borderWidth: 2,
  },
  icon: {
    glyph: "\u25CF",
    size: 18,
    color: "#7C4DFF",
    opacity: 90,
    rotation: 0,
  },
  heatmap: {
    radius: 30,
    intensity: 1,
    opacity: 70,
    weight: "votes",
    gradient: "purple",
  },
  cluster: {
    clusterRadius: 60,
    maxZoom: 14,
    color: "#7C4DFF",
    opacity: 80,
  },
};
