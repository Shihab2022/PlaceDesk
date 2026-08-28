"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FiBarChart2, FiChevronsRight } from "react-icons/fi";
import Header from "@/components/placeDesk/layout/Header";
import Sidebar from "@/components/placeDesk/layout/Sidebar";
import ProjectBar from "@/components/placeDesk/layout/ProjectBar";
import LayerList from "@/components/placeDesk/layers/LayerList";
import LayerPanel from "@/components/placeDesk/layers/LayerPanel";
import MapControls from "@/components/placeDesk/map/MapControls";
import MapLegend from "@/components/placeDesk/map/MapLegend";
import type { ViewState } from "@/components/placeDesk/map/MapView";
import AnalyticsDrawer, {
  DrawerSlice,
} from "@/components/placeDesk/analytics/AnalyticsDrawer";
import LocationDetails from "@/components/placeDesk/modals/LocationDetails";
import StreetViewModal from "@/components/placeDesk/modals/StreetViewModal";
import ShareModal from "@/components/placeDesk/modals/ShareModal";
import ExportMenu from "@/components/placeDesk/modals/ExportMenu";
import WorkspaceSection from "@/components/placeDesk/layout/WorkspaceSection";
import GlobalSearch from "@/components/placeDesk/search/GlobalSearch";
import AddDatasetModal from "@/components/placeDesk/modals/AddDatasetModal";
import {
  AppStoreProvider,
  useAppStore,
} from "@/components/placeDesk/app/AppStoreContext";
import { CITIES, MAP_THEMES } from "@/components/placeDesk/data";
import type { CityDef } from "@/components/placeDesk/data";

const DynamicMap = dynamic(() => import("@/components/placeDesk/map/MapView"), {
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
  return (
    <AppStoreProvider>
      <Workspace />
    </AppStoreProvider>
  );
}

function Workspace() {
  /* ---- UI chrome ---- */
  const [navActive, setNavActive] = useState("maps");
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addDatasetOpen, setAddDatasetOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  /* ---- City + multi-layer architecture ---- */
  const store = useAppStore();
  const city: CityDef = useMemo(
    () => CITIES.find((c) => c.id === store.cityId) ?? CITIES[0],
    [store.cityId],
  );
  const { layers, activeId, viewState } = store;

  /* Keep a valid layer selected */
  useEffect(() => {
    if (!layers.some((l) => l.id === activeId)) {
      store.setActiveId(layers[0]?.id ?? null);
    }
  }, [layers, activeId, store.setActiveId]);

  /* Recenter the map when the city changes */
  useEffect(() => {
    store.setSelectedLocation(null);
    store.setViewState({
      longitude: city.center.lng,
      latitude: city.center.lat,
      zoom: city.zoom,
      pitch: 0,
      bearing: 0,
    });
  }, [city, store.setSelectedLocation, store.setViewState]);

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

  /* ---- Handlers ---- */
  const theme = useMemo(
    () => MAP_THEMES.find((t) => t.id === store.mapThemeId) ?? MAP_THEMES[0],
    [store.mapThemeId],
  );

  const mapStyle = theme.style;

  const zoomBy = useCallback(
    (dir: number) => {
      store.setViewState({
        ...store.viewState,
        zoom: Math.min(16, Math.max(3, store.viewState.zoom + dir)),
      });
    },
    [store.setViewState, store.viewState],
  );

  const locateMe = useCallback(() => {
    store.setViewState({
      ...store.viewState,
      longitude: city.center.lng,
      latitude: city.center.lat,
      zoom: Math.max(store.viewState.zoom, city.zoom + 2),
      pitch: 0,
      bearing: 0,
    });
  }, [city, store.setViewState, store.viewState]);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  /* Resolve the currently selected location record */
  const selectedLocation = useMemo(() => {
    if (!store.selectedLocation || !store.selectedLocationLayerId) return null;
    const l = layers.find((x) => x.id === store.selectedLocationLayerId);
    if (!l) return null;
    return { layer: l, loc: store.selectedLocation };
  }, [store.selectedLocation, store.selectedLocationLayerId, layers]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-ink-900">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onShare={() => setShareOpen(true)}
        onExport={() => setExportOpen((v) => !v)}
      />

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
            onCityChange={(c) => store.setCityId(c.id)}
            onSave={() => setSaved(true)}
            saved={saved}
          />
          {navActive !== "maps" && (
            <WorkspaceSection
              section={navActive}
              city={city}
              onNavigate={setNavActive}
            />
          )}

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
              <LayerList />

              {/* Active layer configuration */}
              {activeLayer ? (
                <div className="flex min-h-0 flex-[1_1_50%] flex-col border-t border-line">
                  <LayerPanel layer={activeLayer} cityLabel={city.label} />
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
                  selected={
                    store.selectedLocation && store.selectedLocationLayerId
                      ? {
                          layerId: store.selectedLocationLayerId,
                          locId: store.selectedLocation.id,
                        }
                      : null
                  }
                  viewState={viewState as ViewState}
                  onViewState={store.setViewState}
                  onSelect={(layerId, loc) =>
                    store.setSelectedLocation(loc, layerId)
                  }
                  mapStyle={mapStyle}
                />
              </div>

              {/* Floating controls (right) */}
              <div className="pointer-events-none absolute inset-y-2 right-2 z-20 flex flex-col items-end gap-2.5">
                <MapLegend
                  layers={layers}
                  onSelect={(id) => store.setActiveId(id)}
                />

                <div className="pointer-events-auto mt-auto flex flex-col items-end gap-2.5">
                  <MapControls
                    onZoomIn={() => zoomBy(1)}
                    onZoomOut={() => zoomBy(-1)}
                    onLocate={locateMe}
                    onFullscreen={fullscreen}
                    onOpenLayers={() => setPanelOpen(true)}
                    onOpenFilters={() => {
                      setPanelOpen(true);
                      if (activeLayer) store.setActiveId(activeLayer.id);
                    }}
                    mapThemeId={store.mapThemeId}
                    onMapThemeChange={(id) =>
                      store.setMapThemeId(id as typeof store.mapThemeId)
                    }
                  />

                  {/* Mobile: toggle left panel */}
                  <button
                    type="button"
                    onClick={() => setPanelOpen((v) => !v)}
                    aria-label={
                      panelOpen ? "Close data panel" : "Open data panel"
                    }
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
                  onClose={() => store.setSelectedLocation(null)}
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
      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
      {exportOpen && (
        <div className="fixed right-24 top-[52px] z-[60]">
          <ExportMenu onClose={() => setExportOpen(false)} />
        </div>
      )}
      <AddDatasetModal
        open={addDatasetOpen}
        onClose={() => setAddDatasetOpen(false)}
      />
      <StreetViewModal />
    </div>
  );
}
