"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, TextLayer } from "@deck.gl/layers";
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
        const hm = settings.heatmap;
        const weightFn =
          hm.weight === "cost"
            ? (d: LocationData) => (d.cost_for_two || 0) / 400
            : hm.weight === "votes"
              ? (d: LocationData) => 1 + (d.number_of_votes || 0) / 600
              : (d: LocationData) => 1;
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
        out.push(
          new HexagonLayer({
            id: `${l.id}-hex`,
            data,
            pickable: true,
            extruded: true,
            opacity: (l.appearance.opacity / 100) * 0.8,
            radius: 650,
            elevationScale: 6 + l.appearance.radius / 3,
            getPosition,
            getColor: (d: LocationData) =>
              isMatch(d) ? [...rgb, 220] : [...mutedFill, 160],
            getElevationValue: (pts: LocationData[]) => pts.length,
            onClick: (info: any) =>
              info.object?.points?.[0] && onSelect(l.id, info.object.points[0]),
          }),
        );
        continue;
      }

      /* ---- Icon (TextLayer glyphs) ---- */
      if (viz === "icon") {
        const icon = settings.icon;
        const iconRgb = hexToRgb(icon.color);
        out.push(
          new TextLayer({
            id: `${l.id}-icon`,
            data,
            pickable: true,
            opacity: icon.opacity / 100,
            getPosition,
            getText: () => icon.glyph,
            getSize: icon.size,
            sizeUnits: "pixels",
            getAngle: icon.rotation,
            getColor: (d: LocationData) => (isMatch(d) ? iconRgb : mutedFill),
            getTextAnchor: "middle" as "middle",
            getAlignmentBaseline: "center" as "center",
            onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
          }),
        );
        continue;
      }

      /* ---- Scatter / Cluster / Density ---- */
      const isScatter = viz === "scatter";
      const isCluster = viz === "cluster";
      const isDensity = viz === "density";

      let fillColor: [number, number, number];
      let lineColor: [number, number, number];
      let radiusPx: number;
      let lineWidthPx: number;
      let opacity: number;
      let halo: { radius: number; fill: [number, number, number] } | null = null;

      if (isScatter) {
        const sc = settings.scatter;
        fillColor = hexToRgb(sc.fillColor);
        lineColor = hexToRgb(sc.borderColor);
        radiusPx = sc.pointSize;
        lineWidthPx = Math.max(0.5, sc.borderWidth);
        opacity = sc.opacity / 100;
        halo = { radius: radiusPx * 1.25, fill: fillColor };
      } else if (isCluster) {
        const cl = settings.cluster;
        fillColor = hexToRgb(cl.color);
        lineColor = hexToRgb(cl.color);
        radiusPx = Math.max(4, cl.clusterRadius / 12);
        lineWidthPx = 1.5;
        opacity = cl.opacity / 100;
        halo = { radius: radiusPx * 1.5, fill: fillColor };
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
          stroked: !isDensity,
          filled: true,
          opacity,
          radiusMinPixels: 2,
          radiusMaxPixels: 60,
          getRadius: (d: LocationData) =>
            d.id === selectedId ? radiusPx * 1.35 : radiusPx,
          lineWidthMinPixels: lineWidthPx,
          getFillColor: (d: LocationData) =>
            isMatch(d)
              ? isDensity || isCluster
                ? [...fillColor, 200]
                : [255, 255, 255, 230]
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
          const layerName = layer?.id?.replace(/-(core|halo|heat|hex)$/, "");
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
