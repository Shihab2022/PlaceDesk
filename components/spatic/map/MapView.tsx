"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer, HexagonLayer } from "@deck.gl/aggregation-layers";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ComputedLayer, LocationData } from "../data";
import { useAppStore } from "../app/AppStoreContext";

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
      const op = l.appearance.opacity / 100;
      const r = l.appearance.radius;
      const bw = Math.max(1, l.appearance.lineWidth);
      const selectedId = selected?.layerId === l.id ? selected.locId : null;
      const searchActive = store.hasActiveSearch;
      const isMatch = (d: LocationData) =>
        !searchActive || store.matchingIds.has(d.id);

      if (l.visualizationType === "heatmap") {
        out.push(
          new HeatmapLayer({
            id: `${l.id}-heat`,
            data,
            pickable: false,
            opacity: op * 0.9,
            getPosition,
            getWeight: (d: LocationData) => 1 + (d.number_of_votes || 0) / 600,
            radiusPixels: 22 + r * 1.5,
            threshold: 0.04,
          }),
        );
        out.push(
          new ScatterplotLayer({
            id: `${l.id}-heat-core`,
            data,
            pickable: true,
            stroked: true,
            filled: true,
            opacity: Math.min(op, 0.9),
            radiusMinPixels: 2.5,
            radiusMaxPixels: 30,
            getRadius: (d: LocationData) => (d.id === selectedId ? r * 1.6 : r * 0.55),
            lineWidthMinPixels: bw,
            getFillColor: (d: LocationData) =>
              isMatch(d) ? [255, 255, 255, 230] : [180, 185, 195, 90],
            getLineColor: (d: LocationData) => (isMatch(d) ? rgb : [150, 155, 165]),
            getPosition,
            onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
          }),
        );
        continue;
      }

      if (l.visualizationType === "hexagon") {
        out.push(
          new HexagonLayer({
            id: `${l.id}-hex`,
            data,
            pickable: true,
            extruded: true,
            opacity: op * 0.8,
            radius: 650,
            elevationScale: 6 + r / 3,
            getPosition,
            getColor: () => [...rgb, 220],
            getElevationValue: (pts: LocationData[]) => pts.length,
            onClick: (info: any) =>
              info.object?.points?.[0] && onSelect(l.id, info.object.points[0]),
          }),
        );
        continue;
      }

      // point | cluster | density | bubble → halo + core markers
      if (l.visualizationType !== "density") {
        out.push(
          new ScatterplotLayer({
            id: `${l.id}-halo`,
            data,
            pickable: false,
            stroked: false,
            filled: true,
            opacity: op,
            radiusMinPixels: r * 1.9,
            radiusMaxPixels: 110,
            getRadius: () => r * 1.25,
            getFillColor: () => [...rgb, 28],
            getPosition,
          }),
        );
      }

      out.push(
        new ScatterplotLayer({
          id: `${l.id}-core`,
          data,
          pickable: true,
          stroked: l.visualizationType !== "density",
          filled: l.visualizationType !== "bubble",
          opacity: l.visualizationType === "density" ? op * 0.75 : op,
          radiusMinPixels: 3,
          radiusMaxPixels: 60,
          getRadius: (d: LocationData) => {
            if (l.visualizationType === "cluster") {
              // fake-aggregate look: slightly larger dots
              return d.id === selectedId ? r * 1.6 : r * 0.85 + 2;
            }
            if (l.visualizationType === "bubble") {
              const base = (d.number_of_votes || 0) > 400 ? r * 1.7 : (d.number_of_votes || 0) > 100 ? r * 1.15 : r * 0.7;
              return d.id === selectedId ? base * 1.35 : base;
            }
            return d.id === selectedId ? r * 1.5 : r;
          },
          lineWidthMinPixels: bw,
          getFillColor: (d: LocationData) =>
            isMatch(d)
              ? l.visualizationType === "density"
                ? [...rgb, 120]
                : [255, 255, 255, 225]
              : [180, 185, 195, 70],
          getLineColor: (d: LocationData) => (isMatch(d) ? rgb : [150, 155, 165]),
          getPosition,
          onClick: (info: any) => info.object && onSelect(l.id, info.object as LocationData),
        }),
      );
    }
    return out;
  }, [layers, selected, onSelect, store.hasActiveSearch, store.matchingIds]);

  return (
    <div className="absolute inset-0">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => onViewState(vs)}
        controller={true}
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
          attributionControl={false}
        />
      </DeckGL>
    </div>
  );
}
