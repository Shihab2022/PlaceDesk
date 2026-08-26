"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/spatic/layout/Header";
import Sidebar from "@/components/spatic/layout/Sidebar";
import ProjectBar from "@/components/spatic/layout/ProjectBar";
import WorkspacePanel from "@/components/spatic/layers/WorkspacePanel";
import type {
  LayerFiltersState,
  LayerStyleState,
} from "@/components/spatic/layers/LayerPanel";
import MapControls from "@/components/spatic/map/MapControls";
import type { ViewState } from "@/components/spatic/map/MapView";
import MarketOverview from "@/components/spatic/analytics/MarketOverview";
import AnalyticsDrawer from "@/components/spatic/analytics/AnalyticsDrawer";
import LocationDetails from "@/components/spatic/modals/LocationDetails";
import GlobalSearch from "@/components/spatic/search/GlobalSearch";
import AddDatasetModal from "@/components/spatic/modals/AddDatasetModal";
import {
  BUSINESSES,
  CATEGORIES,
  MAP_THEMES,
  type BusinessPoint,
  type CategoryId,
} from "@/components/spatic/data";

const DynamicMap = dynamic(() => import("@/components/spatic/map/MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/* Minimal geometric map loading state (not "Loading...") */
function MapSkeleton() {
  return (
    <div className="absolute inset-0 bg-canvas">
      <div className="coordinate-grid absolute inset-0" />
      <div className="contour-rings absolute inset-0" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="mx-auto mb-3 h-14 w-14 animate-pulse rounded-2xl bg-brand-100" />
        <div className="skeleton mx-auto mb-2 h-3 w-28 rounded-full" />
        <div className="skeleton mx-auto h-2.5 w-40 rounded-full" />
      </div>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <div className="skeleton h-9 w-9 rounded-xl" />
        <div className="skeleton h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [navActive, setNavActive] = useState("maps");
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addDatasetOpen, setAddDatasetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("electronics");
  const [view, setView] = useState<"data" | "layer">("data");
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] =
    useState<BusinessPoint | null>(null);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const [layerStyle, setLayerStyle] = useState<LayerStyleState>({
    name: "Electronics — Bengaluru",
    visualization: "Point",
    opacity: 80,
    radius: 12,
    borderWidth: 2,
    fillColor: "#7C4DFF",
    borderColor: "#171717",
    mapTheme: "light",
  });

  const [filters, setFilters] = useState<LayerFiltersState>({
    subcategory: "All Subcategories",
    brandType: "All Brands",
    storeType: "All Store Types",
    revenueMin: 0,
    revenueMax: 50,
    size: "Any Size",
    openFrom: "",
    openTo: "",
  });

  const [visible, setVisible] = useState<Record<string, boolean>>({
    electronics: true,
    fashion: true,
    food: true,
    fitness: true,
    furniture: true,
    healthcare: true,
    education: true,
  });

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 10.4,
    pitch: 0,
    bearing: 0,
  });

  const categoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "Electronics";
  const recordCount =
    CATEGORIES.find((c) => c.id === selectedCategory)?.records ?? "0";

  const mapData = useMemo(() => {
    const base = BUSINESSES[selectedCategory] ?? [];
    const b = filters.brandType !== "All Brands";
    const s = filters.storeType !== "All Store Types";
    const z = filters.size !== "Any Size";
    const from = filters.openFrom ? Number(filters.openFrom.slice(0, 4)) : null;
    const to = filters.openTo ? Number(filters.openTo.slice(0, 4)) : null;
    return base.filter((p) => {
      if (b && p.brandType !== filters.brandType) return false;
      if (s && p.storeType !== filters.storeType) return false;
      if (z && p.size !== filters.size) return false;
      if (p.revenue < filters.revenueMin || p.revenue > filters.revenueMax)
        return false;
      if (from && p.established < from) return false;
      if (to && p.established > to) return false;
      return true;
    });
  }, [selectedCategory, filters]);

  const mapStyle =
    MAP_THEMES.find((t) => t.id === layerStyle.mapTheme)?.style ??
    MAP_THEMES[0].style;

  /* Sync layer name with the selected category */
  useEffect(() => {
    // setLayerStyle((s) => ({ ...s, name: `${categoryLabel} — Bengaluru` }));
  }, [categoryLabel]);

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

  const zoomBy = (dir: number) =>
    setViewState((v) => ({
      ...v,
      zoom: Math.min(15, Math.max(3, v.zoom + dir * 0.8)),
    }));

  const locateMe = () =>
    setViewState({
      longitude: 77.5946,
      latitude: 12.9716,
      zoom: 11.5,
      pitch: 0,
      bearing: 0,
    });

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  const onSave = () => setSaved(true);

  const toggleVisible = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

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
            title="Bengaluru Market Intelligence"
            updated="8 minutes ago"
            onSave={onSave}
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

            {/* Left workspace panel */}
            <div
              className={`absolute inset-y-0 left-0 z-40 flex h-full w-[312px] max-w-[85vw] transition-transform duration-200 lg:relative lg:z-auto lg:w-[336px] lg:translate-x-0 ${
                panelOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <WorkspacePanel
                view={view}
                onViewChange={setView}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => setSelectedCategory(id as CategoryId)}
                visible={visible}
                onToggleVisible={toggleVisible}
                onAddDataset={() => setAddDatasetOpen(true)}
                categoryLabel={categoryLabel}
                style={layerStyle}
                onStyle={setLayerStyle}
                filters={filters}
                onFilters={setFilters}
              />
            </div>

            {/* Map region — the hero */}
            <div className="relative min-h-0 min-w-0 flex-1 bg-canvas">
              <DynamicMap
                data={mapData}
                selected={selectedLocation}
                viewState={viewState}
                onViewState={setViewState}
                onSelect={(b) => setSelectedLocation(b)}
                fillColor={layerStyle.fillColor}
                borderColor={layerStyle.borderColor}
                opacity={layerStyle.opacity}
                radius={layerStyle.radius}
                borderWidth={layerStyle.borderWidth}
                mapStyle={mapStyle}
              />

              {/* Active layer ledger (bottom-left) */}
              <div className="pointer-events-none absolute bottom-14 left-3 z-10 flex items-center gap-2 rounded-lg bg-white/85 px-2.5 py-1.5 text-[11px] font-medium text-ink-700 shadow-sm backdrop-blur">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: layerStyle.fillColor }}
                />
                {categoryLabel} Layer
                <span className="text-ink-400">
                  {mapData.length.toLocaleString("en-US")} pts
                </span>
              </div>

              <MarketOverview
                className="absolute left-3 top-3 z-10"
                locations={recordCount}
              />

              {/* Mobile open-panel FAB */}
              {!panelOpen && (
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="focusable absolute bottom-20 left-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-px lg:hidden"
                  aria-label="Open data panel"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M12 3l9 5-9 5-9-5 9-5z"
                      fill="currentColor"
                      opacity="0.5"
                    />
                    <path
                      d="M3 13l9 5 9-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              <LocationDetails
                business={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />

              <MapControls
                onZoomIn={() => zoomBy(1)}
                onZoomOut={() => zoomBy(-1)}
                onLocate={locateMe}
                onFullscreen={fullscreen}
                onOpenFilters={() => setView("layer")}
                onOpenLayers={() => setView("layer")}
              />

              <AnalyticsDrawer
                expanded={drawerExpanded}
                onToggle={() => setDrawerExpanded((v) => !v)}
                locations={recordCount}
                delta="12.4%"
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
