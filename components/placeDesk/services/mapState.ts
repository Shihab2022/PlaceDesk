/**
 * Share & Export utilities.
 *
 * - `encodeMapState` serialises the current workspace into a shareable URL.
 * - `decodeMapState` restores it (used on mount when query params exist).
 * - Export helpers download the currently visible/filtered locations.
 */

import type { LocationData } from "../data";
import type { ComputedLayer } from "../data";

export interface ShareableMapState {
  city: string;
  style: string;
  layers: string[];
  visible: string[];
  zoom: number;
  lat: number;
  lng: number;
  division?: string | null;
  search?: string;
}

export function encodeMapState(state: ShareableMapState): string {
  const params = new URLSearchParams();
  params.set("city", state.city);
  params.set("style", state.style);
  if (state.layers.length) params.set("layers", state.layers.join(","));
  if (state.visible.length)
    params.set("visible", state.visible.join(","));
  params.set("zoom", state.zoom.toFixed(2));
  params.set("lat", state.lat.toFixed(5));
  params.set("lng", state.lng.toFixed(5));
  if (state.division) params.set("division", state.division);
  if (state.search) params.set("q", state.search);
  return params.toString();
}

export function decodeMapState(
  search: string,
): Partial<ShareableMapState> | null {
  if (!search || search.length < 2) return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (!params.get("city")) return null;
  return {
    city: params.get("city") ?? undefined,
    style: params.get("style") ?? undefined,
    layers: params.get("layers")?.split(",") ?? undefined,
    visible: params.get("visible")?.split(",") ?? undefined,
    zoom: params.get("zoom") ? Number(params.get("zoom")) : undefined,
    lat: params.get("lat") ? Number(params.get("lat")) : undefined,
    lng: params.get("lng") ? Number(params.get("lng")) : undefined,
    division: params.get("division") || null,
    search: params.get("q") || undefined,
  };
}

/* ----------------------------------------------------------------- */
/* Export helpers                                                     */
/* ----------------------------------------------------------------- */

function download(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportLocationsCsv(
  rows: { location: LocationData; layerLabel: string }[],
) {
  const header = [
    "id", "name", "layer", "category", "sub_categories", "type",
    "address", "town", "brand", "votes", "cost_for_two",
    "service_options", "pincode", "lat", "lng",
  ].join(",");
  const body = rows
    .map(({ location: l, layerLabel }) =>
      [
        l.id, l.name, layerLabel, l.category, l.sub_categories, l.type,
        l.address, l.town_name, l.brand_name, l.number_of_votes,
        l.cost_for_two, l.service_options, l.pincode, l.lat, l.lng,
      ]
        .map(csvEscape)
        .join(","),
    )
    .join("\n");
  download("placedesk-locations.csv", "text/csv;charset=utf-8", `${header}\n${body}`);
}

export function exportLocationsJson(
  rows: { location: LocationData }[],
) {
  download(
    "placedesk-locations.json",
    "application/json",
    JSON.stringify(rows.map((r) => r.location), null, 2),
  );
}

export function exportLocationsGeoJson(
  rows: { location: LocationData }[],
) {
  const geojson = {
    type: "FeatureCollection",
    features: rows.map(({ location: l }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [l.lng, l.lat] },
      properties: { ...l },
    })),
  };
  download(
    "placedesk-locations.geojson",
    "application/geo+json",
    JSON.stringify(geojson, null, 2),
  );
}

/** Collect all currently visible locations across visible layers. */
export function collectVisibleLocations(
  layers: ComputedLayer[],
): { location: LocationData; layerLabel: string }[] {
  const rows: { location: LocationData; layerLabel: string }[] = [];
  for (const layer of layers) {
    if (!layer.visible || !layer.dataLoaded) continue;
    for (const loc of layer.filteredData) {
      rows.push({ location: loc, layerLabel: layer.label });
    }
  }
  return rows;
}
