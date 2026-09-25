"use client";

/**
 * The report map — the *same* deck.gl + react-map-gl stack as
 * `components/placeDesk/map/MapView.tsx`, but driven entirely by the report
 * model: catchment polygon, site marker, POI groups, competitors, anchors,
 * high-street clusters and residential projects, with legend toggles and
 * tooltips.
 */

import { useCallback, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FiCrosshair,
  FiLayers,
  FiMinus,
  FiPlus,
  FiTarget,
} from "react-icons/fi";
import type { ViewState } from "../map/MapView";
import type { BusinessRecord, ReportModel } from "./types";
import { formatDecimal, formatDistanceKm, formatNumber } from "./parse";
import { POI_GROUPS, groupForCategory, type PoiGroupKey } from "./poiCategories";

/** Escape a string for safe injection into deck.gl tooltip HTML. */
function esc(value: unknown): string {
  const el = document.createElement("div");
  el.textContent = String(value ?? "");
  return el.innerHTML;
}

type SitePoint = [number, number, number];

/** Initial camera: frame the catchment (or the site when no polygon). */
function fitCamera(model: ReportModel): ViewState {
  const base: ViewState = {
    longitude: model.lng ?? model.cityLng ?? 77.209,
    latitude: model.lat ?? model.cityLat ?? 28.6139,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  };
  const ring = model.catchment?.ring;
  if (!ring?.length) return base;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const spanLng = Math.max(maxLng - minLng, 0.0004);
  const spanLat = Math.max(maxLat - minLat, 0.0004);
  const span = Math.max(spanLng, spanLat * 0.6);
  const zoom = Math.min(Math.max(Math.log2(900 / span), 10), 16.5);
  return {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom,
    pitch: 0,
    bearing: 0,
  };
}

function poiTooltipHtml(record: BusinessRecord, kindLabel: string): string {
  const rows: string[] = [];
  const add = (label: string, value: string | null) => {
    if (value !== null && value !== "" && value !== "N/A") {
      rows.push(
        `<tr><td style="color:#8a8f98;padding:1px 6px 1px 0;white-space:nowrap">${label}</td><td style="text-align:right;font-weight:600">${esc(value)}</td></tr>`,
      );
    }
  };
  add("Category", record.category ?? null);
  add("Reviews/day", formatNumber(record.reviews_per_day));
  add("Performance", formatDecimal(record.performance_score, 1));
  add("Distance", record.distance != null ? formatDistanceKm(record.distance) : null);
  add("Price", record.price_level != null ? "₹".repeat(Math.min(Math.round(record.price_level), 4)) : null);

  return `<div style="font-family:inherit;min-width:180px;padding:2px">
    <div style="font-size:9px;letter-spacing:.08em;font-weight:600;color:#7C4DFF;text-transform:uppercase;margin-bottom:3px">${esc(kindLabel)}</div>
    <div style="font-size:13px;font-weight:600;color:#171717;margin-bottom:6px">${esc(record.name)}</div>
    <table style="font-size:11px;color:#343434;border-collapse:collapse;width:100%">${rows.join("")}</table>
  </div>`;
}

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "10px 12px",
  boxShadow: "0 12px 32px rgba(23,23,23,0.16)",
  border: "1px solid #e6e7ec",
  color: "#171717",
};

export default function ReportMap({
  model,
  mapStyle,
}: {
  model: ReportModel;
  mapStyle: string;
}) {
  const [viewState, setViewState] = useState<ViewState>(() => fitCamera(model));
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [legendOpen, setLegendOpen] = useState(true);
  // The dashboard keys this component by report id, so a new report remounts
  // the map and `fitCamera` runs as the initial state — no effect needed.

  const enabled = useCallback((key: string) => toggles[key] !== false, [toggles]);
  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: prev[key] === false }));

  const site = useMemo(
    () =>
      model.lat !== null && model.lng !== null
        ? { lat: model.lat, lng: model.lng }
        : null,
    [model.lat, model.lng],
  );

  const groupedPois = useMemo(() => {
    const map = new globalThis.Map<PoiGroupKey, BusinessRecord[]>();
    for (const poi of model.mapPois) {
      if (poi.lat == null || poi.lng == null) continue;
      const group = groupForCategory(poi.category);
      const list = map.get(group);
      if (list) list.push(poi);
      else map.set(group, [poi]);
    }
    return map;
  }, [model.mapPois]);

  const competitors = useMemo(
    () => model.competitors.filter((c) => c.lat != null && c.lng != null),
    [model.competitors],
  );
  const anchors = useMemo(
    () => model.anchors.filter((a) => a.lat != null && a.lng != null),
    [model.anchors],
  );
  const projects = useMemo(
    () =>
      (model.projects?.projects ?? []).filter(
        (p) => p.lat != null && p.lng != null,
      ),
    [model.projects],
  );

  const highStreetFeatures = useMemo(() => {
    const features = model.highStreets
      .filter((h) => h.polygon)
      .map((h) => ({
        type: "Feature" as const,
        properties: { name: h.name },
        geometry: h.polygon!.geometry,
      }));
    return features.length
      ? ({ type: "FeatureCollection", features } as GeoJSON.FeatureCollection)
      : null;
  }, [model.highStreets]);

  /* ---- deck.gl layers ---------------------------------------------- */

  function toRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) || 0,
      parseInt(h.slice(2, 4), 16) || 0,
      parseInt(h.slice(4, 6), 16) || 0,
    ];
  }

  const layers = useMemo(() => {
    const out = [];

    if (enabled("catchment") && model.catchment) {
      out.push(
        new GeoJsonLayer({
          id: "report-catchment",
          data: {
            type: "Feature",
            properties: {},
            geometry: model.catchment.geometry,
          } as GeoJSON.Feature,
          filled: true,
          stroked: true,
          getFillColor: [124, 77, 255, 26],
          getLineColor: [124, 77, 255, 190],
          lineWidthMinPixels: 1.6,
          pickable: false,
        }),
      );
    }

    if (enabled("highStreets") && highStreetFeatures) {
      out.push(
        new GeoJsonLayer({
          id: "report-high-streets",
          data: highStreetFeatures,
          filled: true,
          stroked: true,
          getFillColor: [245, 158, 11, 34],
          getLineColor: [245, 158, 11, 150],
          lineWidthMinPixels: 1.2,
          pickable: true,
        }),
      );
    }

    if (enabled("site") && site) {
      const sitePos: SitePoint = [site.lng, site.lat, 0];
      out.push(
        new ScatterplotLayer({
          id: "report-site-halo",
          data: [{ position: sitePos }],
          getPosition: (d: { position: SitePoint }) => d.position,
          getRadius: 420,
          radiusUnits: "meters",
          getFillColor: [124, 77, 255, 34],
          getLineColor: [124, 77, 255, 90],
          stroked: true,
          filled: true,
        }),
        new ScatterplotLayer({
          id: "report-site-core",
          data: [{ position: sitePos }],
          getPosition: (d: { position: SitePoint }) => d.position,
          getRadius: 11,
          radiusUnits: "pixels",
          getFillColor: [124, 77, 255, 255],
          getLineColor: [255, 255, 255, 255],
          lineWidth: 2,
          stroked: true,
        }),
        new TextLayer({
          id: "report-site-label",
          data: [{ position: sitePos, text: model.siteName }],
          getPosition: (d: { position: SitePoint }) => d.position,
          getText: (d: { text: string }) => d.text,
          getColor: [23, 23, 23, 235],
          getPixelOffset: [0, -22],
          getSize: 13,
          fontWeight: 700,
          haloColor: [255, 255, 255, 235],
          haloWidth: 3,
          billboard: true,
          getTextAnchor: "middle",
          getAlignmentBaseline: "bottom",
        }),
      );
    }

    for (const group of POI_GROUPS) {
      const data = groupedPois.get(group.key);
      if (!data?.length || !enabled(`group:${group.key}`)) continue;
      const rgb = toRgb(group.color);
      out.push(
        new ScatterplotLayer({
          id: `report-pois-${group.key}`,
          data,
          getPosition: (d: BusinessRecord) => [d.lng!, d.lat!],
          getRadius: 9,
          radiusUnits: "pixels",
          getFillColor: [...rgb, 225],
          getLineColor: [255, 255, 255, 240],
          lineWidth: 1.5,
          stroked: true,
          pickable: true,
        }),
      );
    }

    if (enabled("competitors") && competitors.length) {
      out.push(
        new ScatterplotLayer({
          id: "report-competitors",
          data: competitors,
          getPosition: (d: BusinessRecord) => [d.lng!, d.lat!],
          getRadius: 10,
          radiusUnits: "pixels",
          getFillColor: [225, 29, 72, 18],
          getLineColor: [225, 29, 72, 235],
          lineWidth: 2.5,
          stroked: true,
          filled: true,
          pickable: true,
        }),
      );
    }

    if (enabled("anchors") && anchors.length) {
      out.push(
        new ScatterplotLayer({
          id: "report-anchors",
          data: anchors,
          getPosition: (d: BusinessRecord) => [d.lng!, d.lat!],
          getRadius: 12,
          radiusUnits: "pixels",
          getFillColor: [245, 158, 11, 26],
          getLineColor: [217, 119, 6, 245],
          lineWidth: 2.5,
          stroked: true,
          filled: true,
          pickable: true,
        }),
      );
    }

    if (enabled("projects") && projects.length) {
      out.push(
        new ScatterplotLayer({
          id: "report-projects",
          data: projects,
          getPosition: (d: (typeof projects)[number]) => [d.lng!, d.lat!],
          getRadius: 8,
          radiusUnits: "pixels",
          getFillColor: [100, 116, 139, 235],
          getLineColor: [255, 255, 255, 245],
          lineWidth: 1.5,
          stroked: true,
          pickable: true,
        }),
      );
    }

    return out;
  }, [
    model.catchment,
    model.siteName,
    site,
    groupedPois,
    competitors,
    anchors,
    projects,
    highStreetFeatures,
    enabled,
  ]);

  const zoomBy = (delta: number) =>
    setViewState((vs) => ({ ...vs, zoom: Math.min(17, Math.max(3, vs.zoom + delta)) }));

  const legendItems: {
    key: string;
    label: string;
    color: string;
    count?: number;
    hollow?: boolean;
  }[] = [];

  if (model.catchment)
    legendItems.push({ key: "catchment", label: "Catchment Area", color: "#7C4DFF" });
  if (site) legendItems.push({ key: "site", label: "Report Location", color: "#7C4DFF" });
  for (const group of POI_GROUPS) {
    const count = groupedPois.get(group.key)?.length ?? 0;
    if (count > 0) {
      legendItems.push({
        key: `group:${group.key}`,
        label: group.label,
        color: group.color,
        count,
      });
    }
  }
  if (competitors.length)
    legendItems.push({
      key: "competitors",
      label: "Competitors",
      color: "#E11D48",
      hollow: true,
    });
  if (anchors.length)
    legendItems.push({
      key: "anchors",
      label: "Anchors / Malls",
      color: "#D97706",
      hollow: true,
    });
  if (projects.length)
    legendItems.push({ key: "projects", label: "Projects", color: "#64748B" });
  if (highStreetFeatures)
    legendItems.push({
      key: "highStreets",
      label: "High Streets",
      color: "#F59E0B",
    });

  return (
    <div id="placedesk-map" className="absolute inset-0">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as ViewState)
        }
        controller={true}
        {...({ glOptions: { preserveDrawingBuffer: true } } as object)}
        layers={layers}
        getTooltip={(info) => {
          const object = info.object as Record<string, unknown> | undefined;
          if (!object) return null;
          const id = info.layer?.id ?? "";
          if (id.startsWith("report-pois-")) {
            const key = id.replace("report-pois-", "");
            const label =
              POI_GROUPS.find((g) => g.key === key)?.label ?? "POI";
            return {
              html: poiTooltipHtml(object as unknown as BusinessRecord, label),
              style: TOOLTIP_STYLE,
            };
          }
          if (id === "report-competitors") {
            return {
              html: poiTooltipHtml(
                object as unknown as BusinessRecord,
                "Competitor",
              ),
              style: TOOLTIP_STYLE,
            };
          }
          if (id === "report-anchors") {
            return {
              html: poiTooltipHtml(object as unknown as BusinessRecord, "Anchor"),
              style: TOOLTIP_STYLE,
            };
          }
          if (id === "report-projects") {
            const p = object as { name?: string; units?: number | null };
            return {
              html: `<div style="font-family:inherit;min-width:150px"><div style="font-size:9px;letter-spacing:.08em;font-weight:600;color:#7C4DFF;text-transform:uppercase;margin-bottom:3px">Residential project</div><div style="font-size:13px;font-weight:600;color:#171717">${esc(p.name ?? "Project")}</div><div style="font-size:11px;color:#8a8f98;margin-top:4px">${p.units != null ? `${formatNumber(p.units)} units` : "Units N/A"}</div></div>`,
              style: TOOLTIP_STYLE,
            };
          }
          if (id === "report-high-streets") {
            const f = object as { properties?: { name?: string } };
            return {
              html: `<div style="font-family:inherit"><div style="font-size:9px;letter-spacing:.08em;font-weight:600;color:#D97706;text-transform:uppercase;margin-bottom:3px">High street</div><div style="font-size:13px;font-weight:600;color:#171717">${esc(f.properties?.name ?? "Cluster")}</div></div>`,
              style: TOOLTIP_STYLE,
            };
          }
          return null;
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

      {/* Legend / layer toggles */}
      <div className="absolute left-3 top-3 z-10 w-[218px] rounded-xl border border-line bg-white/95 p-2.5 shadow-lg shadow-ink-900/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <FiLayers className="h-3.5 w-3.5" /> Layers
          </span>
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            aria-label={legendOpen ? "Collapse legend" : "Expand legend"}
            aria-expanded={legendOpen}
            className="focusable rounded-md px-1 text-[11px] font-medium text-brand-700"
          >
            {legendOpen ? "Hide" : "Show"}
          </button>
        </div>
        {legendOpen && (
          <ul className="mt-2 space-y-0.5">
            {legendItems.map((item) => {
              const on = enabled(item.key);
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    aria-pressed={on}
                    className={`focusable flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-canvas ${
                      on ? "" : "opacity-45"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={
                        item.hollow
                          ? {
                              border: `2px solid ${item.color}`,
                              backgroundColor: "transparent",
                            }
                          : { backgroundColor: item.color }
                      }
                    />
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-700">
                      {item.label}
                    </span>
                    {item.count !== undefined && (
                      <span className="shrink-0 text-[10.5px] tabular-nums text-ink-400">
                        {item.count.toLocaleString("en-US")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Camera controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        {[
          { icon: FiPlus, label: "Zoom in", action: () => zoomBy(1) },
          { icon: FiMinus, label: "Zoom out", action: () => zoomBy(-1) },
          {
            icon: FiTarget,
            label: "Recenter report",
            action: () => setViewState(fitCamera(model)),
          },
          {
            icon: FiCrosshair,
            label: "Reset north",
            action: () => setViewState((vs) => ({ ...vs, bearing: 0, pitch: 0 })),
          },
        ].map((ctrl) => {
          const Icon = ctrl.icon;
          return (
            <button
              key={ctrl.label}
              type="button"
              onClick={ctrl.action}
              aria-label={ctrl.label}
              title={ctrl.label}
              className="focusable flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-ink-500 shadow-md ring-1 ring-black/5 backdrop-blur transition-colors hover:text-brand-700"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Attribution */}
      <div className="pointer-events-none absolute bottom-1.5 right-2 z-10 rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-ink-500">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}



