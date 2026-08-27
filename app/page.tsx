"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  FiBarChart2,
  FiChevronsRight,
} from "react-icons/fi";
import Header from "@/components/spatic/layout/Header";
import Sidebar from "@/components/spatic/layout/Sidebar";
import ProjectBar from "@/components/spatic/layout/ProjectBar";
import LayerList from "@/components/spatic/layers/LayerList";
import LayerPanel from "@/components/spatic/layers/LayerPanel";
import MapControls from "@/components/spatic/map/MapControls";
import MapLegend from "@/components/spatic/map/MapLegend";
import type { ViewState } from "@/components/spatic/map/MapView";
import MarketOverview from "@/components/spatic/analytics/MarketOverview";
import AnalyticsDrawer, { DrawerSlice } from "@/components/spatic/analytics/AnalyticsDrawer";
import LocationDetails from "@/components/spatic/modals/LocationDetails";
import GlobalSearch from "@/components/spatic/search/GlobalSearch";
import AddDatasetModal from "@/components/spatic/modals/AddDatasetModal";
import { useMapLayers } from "@/components/spatic/hooks/useMapLayers";
import { CITIES, CATEGORIES, DEFAULT_CITY, MAP_THEMES } from "@/components/spatic/data";
import type { CategoryKey, CityDef, ComputedLayer } from "@/components/spatic/data";

const DynamicMap = dynamic(() => import("@/components/spatic/map/MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="absolute inset-0 bg-canvas" aria-hidden="true">
      <div className="coordinate-grid absolute inset-0" />
      <div className="contour-rings absolute inset-0" />
      <div className="absolute left-3 top-3 h-24 w-56 rounded-xl border border-line/60 bg-white/70" />
      <div className="skeleton absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  );
}

export default function HomePage() {
  /* ---- UI chrome ---- */
  const [navActive, setNavActive] = useState("maps");
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addDatasetOpen, setAddDatasetOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  /* ---- City + multi-layer architecture ---- */
  const [cityId, setCityId] = useState<string>(DEFAULT_CITY.id);
  const city: CityDef = useMemo(
    () => CITIES.find((c) => c.id === cityId) ?? DEFAULT_CITY,
    [cityId],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ layerId: string; locId: string } | null>(
    null,
  );

  const [viewState, setViewState] = useState<ViewState>({
    longitude: DEFAULT_CITY.center.lng,
    latitude: DEFAULT_CITY.center.lat,
    zoom: DEFAULT_CITY.zoom,
    pitch: 0,
    bearing: 0,
  });

  const layersApi = useMapLayers(city);
  const { layers, activeKeys } = layersApi;

  /* Keep a valid layer selected */
  useEffect(() => {
    if (!layers.some((l) => l.id === activeId)) {
      setActiveId(layers[0]?.id ?? null);
    }
  }, [layers, activeId]);

  /* Recenter the map when the city changes */
  useEffect(() => {
    setSelected(null);
    setViewState({
      longitude: city.center.lng,
      latitude: city.center.lat,
      zoom: city.zoom,
      pitch: 0,
      bearing: 0,
    });
  }, [city]);

  /* ⌘K global shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeLayer = useMemo(
    () => layers.find((l) => l.id === activeId) ?? null,
    [layers, activeId],
  );

  /* ---- Derived analytics over visible layers ---- */
  const visibleLayers = useMemo(
    () => layers.filter((l) => l.visible && !l.error && l.dataLoaded),
    [layers],
  );

  const totalVisible = useMemo(
    () => visibleLayers.reduce((s, l) => s + l.filteredData.length, 0),
    [visibleLayers],
  );

  const byLayer = useMemo<DrawerSlice[]>(
    () =>
      visibleLayers
        .map((l) => ({
          label: l.label,
          value: l.filteredData.length,
          color: l.appearance.color,
        }))
        .sort((a, b) => b.value - a.value),
    [visibleLayers],
  );

  const districtCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of visibleLayers)
      for (const d of l.filteredData) {
        const key = d.town_name || "Unknown";
        m.set(key, (m.get(key) ?? 0) + 1);
      }
    return [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [visibleLayers]);

  const topDistricts = useMemo(
    () =>
      districtCounts.slice(0, 5).map((d) => ({
        name: d.name,
        pct: Math.round((d.count / Math.max(totalVisible, 1)) * 100),
      })),
    [districtCounts, totalVisible],
  );

const addableKeys = useMemo<Set<CategoryKey>>(() => {
    const s = new Set<CategoryKey>(CATEGORIES.map((c) => c.key));
    for (const l of layers) s.delete(l.categoryKey);
    return s;
  }, [layers]);

  /* ---- Handlers ---- */
  const [themeId, setThemeId] = useState<string>("light");
  const theme = useMemo(
    () => MAP_THEMES.find((t) => t.id === themeId) ?? MAP_THEMES[0],
    [themeId],
  );

  const mapStyle = theme.style;

  const zoomBy = useCallback((dir: number) => {
    setViewState((v) => ({
      ...v,
      zoom: Math.min(16, Math.max(3, v.zoom + dir * 1)),
    }));
  }, []);

  const locateMe = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      longitude: city.center.lng,
      latitude: city.center.lat,
      zoom: Math.max(prev.zoom, city.zoom + 2),
      pitch: 0,
      bearing: 0,
    }));
  }, [city]);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  /* Zoom to the geographic bounds of a layer's filtered data */
  const zoomToLayer = useCallback(
    (id: string) => {
      const l = layers.find((x) => x.id === id);
      if (!l || l.filteredData.length === 0) return;
      const lats = l.filteredData.map((d) => d.lat);
      const lngs = l.filteredData.map((d) => d.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const spanLat = Math.max(maxLat - minLat, 0.004);
      const spanLng = Math.max(maxLng - minLng, 0.004);
      const zoom = Math.min(
        15,
        Math.max(
          4,
          Math.log2(360 / Math.max(spanLng * 2.4, spanLat * 3)),
        ),
      );
      setViewState({
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom,
        pitch: 0,
        bearing: 0,
      });
      setActiveId(id);
    },
    [layers],
  );

  const handleAddLayer = useCallback(
    (key: string) => {
      const nid = layersApi.addLayer(key as CategoryKey);
      setActiveId(nid);
      if (typeof window !== "undefined" && window.innerWidth < 1024)
        setPanelOpen(false);
    },
    [layersApi],
  );

  /* Resolve the currently selected location record */
  const selectedLocation = useMemo(() => {
    if (!selected) return null;
    const l = layers.find((x) => x.id === selected.layerId);
    if (!l) return null;
    const loc =
      l.filteredData.find((d) => d.id === selected.locId) ??
      l.data.find((d) => d.id === selected.locId) ??
      null;
    return loc ? { layer: l, loc } : null;
  }, [selected, layers]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-ink-900">
      <Header onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          active={navActive}
          collapsed={collapsed}
          onNavigate={setNavActive}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <ProjectBar
            title={`${city.label} Market Intelligence`}
            updated="8 minutes ago"
            city={city}
            onCityChange={(c) => setCityId(c.id)}
            onSave={() => setSaved(true)}
            saved={saved}
          />

          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            {/* Mobile backdrop for the left panel */}
            {panelOpen && (
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setPanelOpen(false)}
                className="absolute inset-0 z-30 bg-ink-900/30 lg:hidden"
              />
            )}

            {/* ---- Left workspace: layer manager + active layer config ---- */}
            <div
              className={`absolute inset-y-0 left-0 z-40 flex h-full w-[312px] max-w-[85vw] flex-col border-r border-line bg-white transition-transform duration-200 lg:relative lg:z-auto lg:w-[340px] lg:translate-x-0 ${
                panelOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <LayerList
                layers={layers}
                activeKeys={activeKeys}
                activeId={activeId}
                addableKeys={addableKeys}
                cityLabel={city.label}
                onSelect={(id) => setActiveId(id)}
                onAdd={handleAddLayer}
                onDuplicate={(id) => {
                  const nid = layersApi.duplicateLayer(id);
                  if (nid) setActiveId(nid);
                }}
                onRemove={layersApi.removeLayer}
                onToggleVisible={layersApi.toggleVisible}
                onZoom={zoomToLayer}
                onClearFilters={layersApi.clearFilters}
              />

              {/* Active layer configuration */}
              {activeLayer ? (
                <div className="flex min-h-0 flex-[1_1_50%] flex-col border-t border-line">
                  <LayerPanel
                    layer={activeLayer}
                    cityLabel={city.label}
                    onUpdate={layersApi.updateLayer}
                    onSetFilters={layersApi.setFilters}
                    onClearFilters={layersApi.clearFilters}
                    onDuplicate={(id) => {
                      const nid = layersApi.duplicateLayer(id);
                      if (nid) setActiveId(nid);
                    }}
                    onToggleVisible={layersApi.toggleVisible}
                    onZoom={zoomToLayer}
                    onRemove={layersApi.removeLayer}
                    onRetry={layersApi.reloadLayer}
                  />
                </div>
              ) : (
                <div className="border-t border-line px-4 py-6 text-center text-[12px] text-ink-400">
                  Select a layer above to configure it.
                </div>
              )}
            </div>

            {/* ---- Map region — the hero ---- */}
            <div className="relative min-h-0 min-w-0 flex-1 bg-canvas">
              <div className="absolute inset-0">
                <DynamicMap
                  layers={layers}
                  selected={selected}
                  viewState={viewState}
                  onViewState={setViewState}
                  onSelect={(layerId, loc) =>
                    setSelected({ layerId, locId: loc.id })
                  }
                  mapStyle={mapStyle}
                />
              </div>

              {/* Map intelligence overlay */}
              <MarketOverview
                totalLabel={totalVisible.toLocaleString("en-US")}
                districts={districtCounts.length}
                activeLayers={layers.length}
                className="absolute left-3 top-3 z-10 max-lg:hidden"
              />

              {/* Floating controls (right) */}
              <div className="pointer-events-none absolute inset-y-2 right-2 z-20 flex flex-col items-end gap-2.5">
                <MapLegend layers={layers} onSelect={(id) => setActiveId(id)} />

                <div className="pointer-events-auto mt-auto flex flex-col items-end gap-2.5">
                  <MapControls
                    onZoomIn={() => zoomBy(1)}
                    onZoomOut={() => zoomBy(-1)}
                    onLocate={locateMe}
                    onFullscreen={fullscreen}
                    onOpenLayers={() => setPanelOpen(true)}
                    onOpenFilters={() => {
                      setPanelOpen(true);
                      if (activeLayer) setActiveId(activeLayer.id);
                    }}
                  />

                  {/* Mobile: toggle left panel */}
                  <button
                    type="button"
                    onClick={() => setPanelOpen((v) => !v)}
                    aria-label={panelOpen ? "Close data panel" : "Open data panel"}
                    title={panelOpen ? "Close data panel" : "Open data panel"}
                    className="focusable flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-ink-500 shadow-lg shadow-ink-900/10 ring-1 ring-black/5 backdrop-blur transition-all hover:text-brand-700 lg:hidden"
                  >
                    <FiChevronsRight
                      className={`h-5 w-5 transition-transform duration-200 ${panelOpen ? "" : "rotate-180"}`}
                    />
                  </button>

                  {/* Toggle analytics drawer */}
                  <button
                    type="button"
                    onClick={() => setDrawerExpanded((v) => !v)}
                    aria-expanded={drawerExpanded}
                    aria-label="Toggle market insights"
                    title="Market insights"
                    className="focusable flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-ink-500 shadow-lg shadow-ink-900/10 ring-1 ring-black/5 backdrop-blur transition-all hover:text-brand-700 lg:hidden"
                  >
                    <FiBarChart2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Location details side panel */}
              {selectedLocation && (
                <LocationDetails
                  location={selectedLocation.loc}
                  layerLabel={selectedLocation.layer.label}
                  accent={selectedLocation.layer.appearance.color}
                  onClose={() => setSelected(null)}
                />
              )}

              {/* Bottom analytics drawer */}
              <AnalyticsDrawer
                expanded={drawerExpanded}
                onToggle={() => setDrawerExpanded((v) => !v)}
                totalLabel={totalVisible.toLocaleString("en-US")}
                byLayer={byLayer}
                topDistricts={topDistricts}
                delta="12.4%"
                districtsCovered={districtCounts.length}
              />
            </div>

          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AddDatasetModal
        open={addDatasetOpen}
        onClose={() => setAddDatasetOpen(false)}
      />
    </div>
  );
}


