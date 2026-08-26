"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { BusinessPoint } from "../../spatic/data";

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface MapViewProps {
  data: BusinessPoint[];
  selected: BusinessPoint | null;
  viewState: ViewState;
  onViewState: (vs: ViewState) => void;
  onSelect: (b: BusinessPoint) => void;
  fillColor: string;
  borderColor: string;
  opacity: number;
  radius: number;
  borderWidth: number;
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

export default function MapView({
  data,
  selected,
  viewState,
  onViewState,
  onSelect,
  fillColor,
  borderColor,
  opacity,
  radius,
  borderWidth,
  mapStyle,
}: MapViewProps) {
  const { fillRgb, borderRgb } = useMemo(
    () => ({
      fillRgb: hexToRgb(fillColor),
      borderRgb: hexToRgb(borderColor),
    }),
    [fillColor, borderColor],
  );

  const layers = useMemo(() => {
    const selectedId = selected?.id;

    return [
      // Soft halo under the markers
      new ScatterplotLayer({
        id: "spatic-halo",
        data,
        pickable: false,
        stroked: false,
        filled: true,
        opacity: opacity / 100,
        radiusMinPixels: radius * 2.1,
        radiusMaxPixels: 120,
        getRadius: () => radius * 1.3,
        getFillColor: () => [...fillRgb, 26],
        getPosition: (d: BusinessPoint) => [d.lng, d.lat, 0],
      }),
      // Core markers (white center, colored ring, glow)
      new ScatterplotLayer({
        id: "spatic-core",
        data,
        pickable: true,
        stroked: true,
        filled: true,
        opacity: opacity / 100,
        radiusMinPixels: 4,
        radiusMaxPixels: 60,
        getRadius: (d: BusinessPoint) =>
          d.id === selectedId ? radius * 1.5 : radius,
        lineWidthMinPixels: Math.max(1, borderWidth),
        getFillColor: () => [255, 255, 255, 222],
        getLineColor: () =>
          selectedId ? fillRgb : borderRgb,
        getPosition: (d: BusinessPoint) => [d.lng, d.lat, 0],
        onClick: (info: any) => {
          if (info.object) onSelect(info.object as BusinessPoint);
        },
      }),
    ];
  }, [
    data,
    selected,
    fillRgb,
    borderRgb,
    radius,
    borderWidth,
    opacity,
    onSelect,
  ]);

  return (
    <div className="absolute inset-0">
      {/* Map guides / scale decor (non-interfering) */}
      <div className="pointer-events-none absolute left-4 bottom-12 z-10 flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1.5 text-[10px] font-medium text-ink-500 shadow-sm backdrop-blur">
        <span className="inline-block h-px w-10 bg-ink-500" />
        <span>2 km</span>
      </div>

      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => onViewState(vs)}
        controller={true}
        layers={layers}
        getTooltip={({ object }: { object?: BusinessPoint }) => {
          if (!object) return null;
          return {
            html: `<div style="font-family:inherit;min-width:190px;padding:2px">
                <div style="font-size:9px;letter-spacing:.08em;font-weight:600;color:#8a5cf6;text-transform:uppercase;margin-bottom:3px">
                  ${object.categoryLabel} &middot; ${object.district}
                </div>
                <div style="font-size:13px;font-weight:600;color:#171717;margin-bottom:6px">${object.name}</div>
                <table style="font-size:11px;color:#343434;border-collapse:collapse;width:100%">
                  <tr><td style="color:#8a8f98;padding:1px 0">Revenue</td><td style="text-align:right;font-weight:600">₹${object.revenue}M</td></tr>
                  <tr><td style="color:#8a8f98;padding:1px 0">Employees</td><td style="text-align:right;font-weight:600">${object.employees}</td></tr>
                  <tr><td style="color:#8a8f98;padding:1px 0">Open since</td><td style="text-align:right;font-weight:600">${object.established}</td></tr>
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