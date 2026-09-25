"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { HeatmapLayer, HexagonLayer } from "@deck.gl/aggregation-layers";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ComputedLayer, LocationData } from "../data";
import { useAppStore } from "../app/AppStoreContext";
import { DEFAULT_VIZ_SETTINGS } from "../app/VisualizationSettings";
import type {
  VisualizationId,
  VisualizationSettings,
} from "../app/VisualizationSettings";

type Position = [number, number, number];

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface SelectedRef {
  layerId: string;
  locId: string;
}

interface MapViewProps {
  layers: ComputedLayer[];
  selected: SelectedRef | null;
  viewState: ViewState;
  onViewState: (vs: ViewState) => void;
  onSelect: (layerId: string, loc: LocationData) => void;
  mapStyle: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) || 124,
    parseInt(h.slice(2, 4), 16) || 77,
    parseInt(h.slice(4, 6), 16) || 255,
  ];
}

/** Escape a string for safe injection into the tooltip HTML. */
function esc(s: unknown): string {
  const el = document.createElement("div");
  el.textContent = String(s ?? "");
  return el.innerHTML;
}

const getPosition = (d: LocationData): Position => [d.lng, d.lat, 0];

/* ---- Glyph atlas (renders the selected glyph into a canvas texture) ---- */
interface GlyphAtlasEntry {
  url: string;
  mapping: Record<
    string,
    { x: number; y: number; width: number; height: number; mask: boolean }
  >;
}
const GLYPH_ATLAS_SIZE = 64;
const glyphAtlasCache = new globalThis.Map<string, GlyphAtlasEntry>();

function getGlyphAtlas(glyph: string): GlyphAtlasEntry {
  const cached = glyphAtlasCache.get(glyph);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_ATLAS_SIZE;
  canvas.height = GLYPH_ATLAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = `900 ${Math.round(GLYPH_ATLAS_SIZE * 0.72)}px system-ui, -apple-system, "Segoe UI Symbol", "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff"; // white + mask:true lets getColor tint the glyph
    ctx.fillText(glyph, GLYPH_ATLAS_SIZE / 2, GLYPH_ATLAS_SIZE / 2 + 2);
  }
  const entry: GlyphAtlasEntry = {
    url: canvas.toDataURL("image/png"),
    mapping: {
      [glyph]: { x: 0, y: 0, width: GLYPH_ATLAS_SIZE, height: GLYPH_ATLAS_SIZE, mask: true },
    },
  };
  glyphAtlasCache.set(glyph, entry);
  return entry;
}

/** Build a light → dark color range from a single hex color (aggregation layers). */
function shadeRange(hex: string): [number, number, number][] {
  const base = hexToRgb(hex);
  return [0.3, 0.45, 0.6, 0.75, 0.9, 1].map((t) => [
    Math.round(255 + (base[0] - 255) * t),
    Math.round(255 + (base[1] - 255) * t),
    Math.round(255 + (base[2] - 255) * t),
  ]);
}

/* ---- Zoom-aware world-grid clustering (pan-independent) ---- */
interface ClusterGroup {
  position: [number, number];
  count: number;
  points: LocationData[];
}

function clusterWorldPoints(
  data: LocationData[],
  zoom: number,
  cellPx: number,
): { clusters: ClusterGroup[]; singles: LocationData[] } {
  const world = 256 * Math.pow(2, zoom);
  const cells = new globalThis.Map<string, { x: number; y: number; points: LocationData[] }>();
  for (const d of data) {
    const x = ((d.lng + 180) / 360) * world;
    const latRad = (d.lat * Math.PI) / 180;
    const y = (0.5 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI)) * world;
    const key = `${Math.floor(x / cellPx)}:${Math.floor(y / cellPx)}`;
    const cell = cells.get(key);
    if (cell) {
      cell.x += x;
      cell.y += y;
      cell.points.push(d);
    } else {
      cells.set(key, { x, y, points: [d] });
    }
  }
  const clusters: ClusterGroup[] = [];
  const singles: LocationData[] = [];
  for (const cell of cells.values()) {
    if (cell.points.length === 1) {
      singles.push(cell.points[0]);
      continue;
    }
    const cx = cell.x / cell.points.length;
    const cy = cell.y / cell.points.length;
    const lng = (cx / world) * 360 - 180;
    const merc = Math.PI * (1 - (2 * cy) / world);
    const lat = (180 / Math.PI) * Math.atan(Math.sinh(merc));
    clusters.push({ position: [lng, lat], count: cell.points.length, points: cell.points });
  }
  return { clusters, singles };
}

/** Normalize internal/legacy visualization ids to the canonical set. */
function normViz(v: string): VisualizationId {
  if (v === "point") return "scatter";
  if (v === "bubble") return "icon";
  const known: VisualizationId[] = ["scatter", "icon", "heatmap", "cluster", "hexagon", "density"];
  return known.includes(v as VisualizationId) ? (v as VisualizationId) : "scatter";
}

const GRADIENT_COLORS: Record<string, [number, number, number][]> = {
  purple: [
    [237, 233, 254],
    [167, 139, 250],
    [124, 77, 255],
    [91, 47, 191],
  ],
  viridis: [
    [253, 231, 37],
    [68, 208, 120],
    [33, 144, 141],
    [68, 1, 84],
  ],
  warm: [
    [254, 243, 199],
    [249, 115, 22],
    [180, 60, 20],
    [124, 45, 18],
  ],
  cool: [
    [207, 250, 254],
    [6, 182, 212],
    [40, 70, 170],
    [30, 58, 138],
  ],
};

export default function MapView({
  layers,
  selected,
  viewState,
  onViewState,
  onSelect,
  mapStyle,
}: MapViewProps) {
  const store = useAppStore();
  const deckLayers = useMemo(() => {
    const out: any[] = [];
    for (const l of layers) {
      if (!l.visible || !l.dataLoaded || l.loading) continue;
      const data = l.filteredData;
      if (data.length === 0) continue;
      const rgb = hexToRgb(l.appearance.color);
      const mutedFill: [number, number, number] = [180, 185, 195];
      const searchActive = store.hasActiveSearch;
      const isMatch = (d: LocationData) =>
        !searchActive || store.matchingIds.has(d.id);
      const selectedId = selected?.layerId === l.id ? selected.locId : null;
      const settings: VisualizationSettings = l.vizSettings ?? DEFAULT_VIZ_SETTINGS;
      const viz = normViz(l.visualizationType);

      /* ---- Heatmap ---- */
      if (viz === "heatmap") {
        const hm = settings.heatmap ?? DEFAULT_VIZ_SETTINGS.heatmap;
        const baseWeight =
          hm.weight === "cost"
            ? (d: LocationData) => (d.cost_for_two || 0) / 400
            : hm.weight === "votes"
              ? (d: LocationData) => 1 + (d.number_of_votes || 0) / 600
              : () => 1;
        // Non-matching records (active search) contribute no heat, so filters visibly apply.
        const weightFn = (d: LocationData) => (isMatch(d) ? baseWeight(d) : 0);
        out.push(
          new HeatmapLayer({
            id: `${l.id}-heat`,
            data,
            pickable: false,
            opacity: (hm.opacity / 100) * 0.95,
            getPosition,
            getWeight: weightFn,
            radiusPixels: hm.radius,
            intensity: hm.intensity,
            colorRange: GRADIENT_COLORS[hm.gradient] ?? GRADIENT_COLORS.purple,
            threshold: 0.03,
          }),
        );
        out.push(
          new ScatterplotLayer({
            id: `${l.id}-heat-core`,
            data,
            pickable: true,
            stroked: true,
            filled: true,
            opacity: Math.min(hm.opacity / 100, 0.9),
            radiusUnits: "pixels",
            radiusMinPixels: 2.5,
            radiusMaxPixels: 30,
            getRadius: (d: LocationData) => (d.id === selectedId ? 8 : 3),
            lineWidthMinPixels: 1,
            getFillColor: (d: LocationData) =>
              isMatch(d) ? [255, 255, 255, 230] : [...mutedFill, 90],
            getLineColor: (d: LocationData) => (isMatch(d) ? rgb : mutedFill),
            getPosition,
            onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
          }),
        );
        continue;
      }

      /* ---- Hexagon ---- */
      if (viz === "hexagon") {
        const hx = settings.hexagon ?? DEFAULT_VIZ_SETTINGS.hexagon;
        const hexRgb = hexToRgb(hx.color);
        // During an active search only matching records feed the aggregation.
        const hexData = searchActive ? data.filter(isMatch) : data;
        out.push(
          new HexagonLayer({
            id: `${l.id}-hex`,
            data: hexData,
            pickable: true,
            extruded: true,
            opacity: (hx.opacity / 100) * 0.9,
            radius: hx.radius,
            coverage: hx.coverage,
            elevationScale: hx.elevationScale,
            getPosition,
            colorRange: shadeRange(hx.color),
            getColorWeight: () => 1,
            getElevationValue: (pts: LocationData[]) => pts.length,
            onClick: (info: any) =>
              info.object?.points?.[0] && onSelect(l.id, info.object.points[0]),
          }),
        );
        // Thin markers keep filtered records clickable on top of the extruded hexes.
        out.push(
          new ScatterplotLayer({
            id: `${l.id}-hex-core`,
            data,
            pickable: true,
            stroked: false,
            filled: true,
            opacity: Math.min(hx.opacity / 100, 0.9),
            radiusUnits: "pixels",
            radiusMinPixels: 2,
            radiusMaxPixels: 20,
            getRadius: (d: LocationData) => (d.id === selectedId ? 7 : 3),
            getFillColor: (d: LocationData) =>
              isMatch(d) ? [...hexRgb, 235] : [...mutedFill, 80],
            getPosition,
            onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
          }),
        );
        continue;
      }

      /* ---- Icon (IconLayer with a generated glyph atlas) ---- */
      if (viz === "icon") {
        const icon = settings.icon ?? DEFAULT_VIZ_SETTINGS.icon;
        const iconRgb = hexToRgb(icon.color);
        const atlas = getGlyphAtlas(icon.glyph);
        out.push(
          new IconLayer({
            id: `${l.id}-icon`,
            data,
            pickable: true,
            opacity: icon.opacity / 100,
            iconAtlas: atlas.url,
            iconMapping: atlas.mapping,
            getIcon: () => icon.glyph,
            sizeUnits: "pixels",
            getSize: icon.size,
            getAngle: icon.rotation,
            getColor: (d: LocationData) => (isMatch(d) ? iconRgb : mutedFill),
            getPosition,
            onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
          }),
        );
        continue;
      }

      /* ---- Cluster (world-grid aggregation at the current zoom) ---- */
      if (viz === "cluster") {
        const cl = settings.cluster ?? DEFAULT_VIZ_SETTINGS.cluster;
        const clRgb = hexToRgb(cl.color);
        const clOpacity = cl.opacity / 100;
        const clusterSource = searchActive ? data.filter(isMatch) : data;
        const canCluster = viewState.zoom < cl.maxZoom && clusterSource.length > 1;
        const { clusters, singles } = canCluster
          ? clusterWorldPoints(clusterSource, viewState.zoom, Math.max(16, cl.clusterRadius))
          : { clusters: [] as ClusterGroup[], singles: clusterSource };

        if (singles.length) {
          out.push(
            new ScatterplotLayer({
              id: `${l.id}-cluster-singles`,
              data: singles,
              pickable: true,
              stroked: false,
              filled: true,
              opacity: clOpacity,
              radiusUnits: "pixels",
              radiusMinPixels: 2,
              radiusMaxPixels: 14,
              getRadius: () => 4.5,
              getFillColor: () => [...clRgb, 255],
              getPosition,
              onClick: (info: any) =>
                info.object && onSelect(l.id, info.object as LocationData),
            }),
          );
        }

        if (clusters.length) {
          out.push(
            new ScatterplotLayer({
              id: `${l.id}-cluster-bubbles`,
              data: clusters,
              pickable: true,
              stroked: true,
              filled: true,
              opacity: clOpacity,
              radiusUnits: "pixels",
              radiusMinPixels: 8,
              radiusMaxPixels: 46,
              getRadius: (c: ClusterGroup) => Math.min(46, 9 + Math.log2(c.count) * 5),
              lineWidthMinPixels: 1.5,
              getFillColor: () => [...clRgb, 235],
              getLineColor: () => [255, 255, 255, 220],
              getPosition: (c: ClusterGroup) => c.position,
              onClick: (info: any) =>
                info.object?.points?.[0] && onSelect(l.id, info.object.points[0]),
            }),
          );
          out.push(
            new TextLayer({
              id: `${l.id}-cluster-counts`,
              data: clusters,
              pickable: false,
              opacity: clOpacity,
              getPosition: (c: ClusterGroup) => c.position,
              getText: (c: ClusterGroup) => String(c.count),
              getSize: 11,
              sizeUnits: "pixels",
              getColor: [255, 255, 255, 235],
              getTextAnchor: "middle",
              getAlignmentBaseline: "center",
            }),
          );
        }
        continue;
      }

      /* ---- Scatter / Density (cluster/icon/heatmap/hexagon handled above) ---- */
      const isScatter = viz === "scatter";
      const isDensity = viz === "density";

      let fillColor: [number, number, number];
      let lineColor: [number, number, number];
      let radiusPx: number;
      let lineWidthPx: number;
      let opacity: number;
      let halo: { radius: number; fill: [number, number, number] } | null = null;

      if (isScatter) {
        const sc = settings.scatter ?? DEFAULT_VIZ_SETTINGS.scatter;
        fillColor = hexToRgb(sc.fillColor);
        lineColor = hexToRgb(sc.borderColor);
        radiusPx = sc.pointSize;
        // borderWidth 0 means "None" in the panel — no outline at all.
        lineWidthPx = sc.borderWidth > 0 ? Math.max(0.5, sc.borderWidth) : 0;
        opacity = sc.opacity / 100;
        halo = { radius: radiusPx * 1.25, fill: fillColor };
      } else {
        fillColor = rgb;
        lineColor = rgb;
        radiusPx = l.appearance.radius;
        lineWidthPx = Math.max(1, l.appearance.lineWidth);
        opacity = (l.appearance.opacity / 100) * 0.75;
      }

      if (halo && !isDensity) {
        out.push(
          new ScatterplotLayer({
            id: `${l.id}-halo`,
            data,
            pickable: false,
            stroked: false,
            filled: true,
            opacity: opacity,
            radiusUnits: "pixels",
            radiusMinPixels: halo.radius,
            radiusMaxPixels: 110,
            getRadius: () => halo!.radius,
            getFillColor: (d: LocationData) =>
              isMatch(d) ? [...halo!.fill, 28] : [...mutedFill, 20],
            getPosition,
          }),
        );
      }

      out.push(
        new ScatterplotLayer({
          id: `${l.id}-core`,
          data,
          pickable: true,
          stroked: !isDensity && lineWidthPx > 0,
          filled: true,
          opacity,
          radiusUnits: "pixels",
          radiusMinPixels: 2,
          radiusMaxPixels: 60,
          getRadius: (d: LocationData) =>
            d.id === selectedId ? radiusPx * 1.35 : radiusPx,
          lineWidthMinPixels: lineWidthPx,
          getFillColor: (d: LocationData) =>
            isMatch(d)
              ? isDensity
                ? [...fillColor, 200]
                : lineWidthPx > 0
                  ? [255, 255, 255, 230]
                  : [...fillColor, 230]
              : [...mutedFill, 70],
          getLineColor: (d: LocationData) => (isMatch(d) ? lineColor : mutedFill),
          getPosition,
          onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
        }),
      );
    }
    return out;
  }, [
    layers,
    selected,
    onSelect,
    store.hasActiveSearch,
    store.matchingIds,
    viewState.zoom,
  ]);

  return (
    <div id="placedesk-map" className="absolute inset-0">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => onViewState(vs)}
        controller={true}
        {...({ glOptions: { preserveDrawingBuffer: true } } as any)}
        layers={deckLayers}
        getTooltip={({
          object,
          layer,
        }: {
          object?: LocationData | any;
          layer?: any;
        }) => {
          if (!object) return null;
          const d = (object.points ? object.points[0] : object) as LocationData;
          const layerName = layer?.id?.replace(
            /-(core|halo|heat|heat-core|hex|hex-core|icon|cluster-singles|cluster-bubbles|cluster-counts)$/,
            "",
          );
          const label =
            layers.find((l) => l.id === layerName)?.label ?? d.category ?? "";
          const subs = String(d.sub_categories || "").replace(/[\[\]"]/g, "");
          return {
            html: `<div style="font-family:inherit;min-width:190px;padding:2px">
                <div style="font-size:9px;letter-spacing:.08em;font-weight:600;color:#7C4DFF;text-transform:uppercase;margin-bottom:3px">
                  ${esc(label)}${subs && subs !== "N_A" ? ` &middot; ${esc(subs.split(",")[0])}` : ""}
                </div>
                <div style="font-size:13px;font-weight:600;color:#171717;margin-bottom:6px">${esc(d.name)}</div>
                <div style="font-size:11px;color:#8a8f98;margin-bottom:6px">${esc(d.town_name)}</div>
                <table style="font-size:11px;color:#343434;border-collapse:collapse;width:100%">
                  ${d.brand_name && d.brand_name !== "N_A" ? `<tr><td style="color:#8a8f98;padding:1px 0">Brand</td><td style="text-align:right;font-weight:600">${esc(d.brand_name)}</td></tr>` : ""}
                  ${
                    d.cost_for_two > 0
                      ? `<tr><td style="color:#8a8f98;padding:1px 0">Cost for two</td><td style="text-align:right;font-weight:600">₹${d.cost_for_two}</td></tr>`
                      : ""
                  }
                  <tr><td style="color:#8a8f98;padding:1px 0">Votes</td><td style="text-align:right;font-weight:600">${d.number_of_votes ?? 0}</td></tr>
                </table>
              </div>`,
            style: {
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 12px 32px rgba(23,23,23,0.16)",
              border: "1px solid #e6e7ec",
              color: "#171717",
            },
          };
        }}
        style={{ position: "absolute", inset: "0" }}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_ACCESS_TOKEN}
          mapStyle={mapStyle}
          reuseMaps
          preserveDrawingBuffer
          attributionControl={false}
        />
      </DeckGL>
    </div>
  );
}
