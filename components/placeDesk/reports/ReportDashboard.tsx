"use client";

/**
 * `Dashboard -> Reports` — the report workspace.
 *
 * Loads report payloads through the existing `/api/pois` route (see
 * `useReports`), renders KPIs, the deck.gl report map and the section tabs,
 * and keeps the map mounted exactly when the export button can capture it.
 */

import { useMemo, useState } from "react";
import { useAppStore } from "../app/AppStoreContext";
import { MAP_THEMES } from "../data";
import { useReports } from "./useReports";
import type { BusinessRecord, ReportTabId } from "./types";
import ReportHeader from "./ReportHeader";
import ReportKpiCards from "./ReportKpiCards";
import ReportMap from "./ReportMap";
import BrandDetailsDrawer from "./BrandDetailsDrawer";
import OverviewTab from "./tabs/OverviewTab";
import MarketTab from "./tabs/MarketTab";
import DemographicsTab from "./tabs/DemographicsTab";
import PoisTab from "./tabs/PoisTab";
import CompetitorsTab from "./tabs/CompetitorsTab";
import BrandsTab from "./tabs/BrandsTab";
import IndexesTab from "./tabs/IndexesTab";
import ExplorerTab from "./ExplorerTab";
import { ErrorState, ReportSkeleton, Tabs } from "./ui";

const TAB_ITEMS: { id: ReportTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Map" },
  { id: "market", label: "Market" },
  { id: "demographics", label: "Demographics" },
  { id: "pois", label: "POIs" },
  { id: "competitors", label: "Competition" },
  { id: "brands", label: "Brands" },
  { id: "indexes", label: "Indexes" },
  { id: "data", label: "Data" },
];

export default function ReportDashboard() {
  const store = useAppStore();
  const { options, selectedKey, selected, status, error, select, retry } =
    useReports();
  const [tab, setTab] = useState<ReportTabId>("overview");
  const [activeBrand, setActiveBrand] = useState<BusinessRecord | null>(null);

  const theme = useMemo(
    () => MAP_THEMES.find((t) => t.id === store.mapThemeId) ?? MAP_THEMES[0],
    [store.mapThemeId],
  );

  const mapMounted = tab === "overview" || tab === "map";

  const topBar = (
    <>
      <ReportHeader
        options={options}
        selectedKey={selectedKey}
        onSelect={select}
        status={status}
        model={selected}
        mapAvailable={mapMounted}
      />
      {selected && status !== "error" && <ReportKpiCards model={selected} />}
      <Tabs tabs={TAB_ITEMS} active={tab} onChange={setTab} />
    </>
  );

  /* ---- Non-ready states -------------------------------------------- */

  if (status === "error") {
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {topBar}
        <ErrorState message={error ?? "Unknown error"} onRetry={retry} />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {topBar}
        <ReportSkeleton />
      </div>
    );
  }

  /* ---- Map tab: full-bleed map ------------------------------------- */

  if (tab === "map") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 space-y-4 px-4 pt-4 sm:px-6">{topBar}</div>
        <div className="relative m-4 mt-3 min-h-[360px] flex-1 overflow-hidden rounded-xl border border-line bg-canvas">
          <ReportMap key={selected.key} model={selected} mapStyle={theme.style} />
        </div>
        <BrandDetailsDrawer brand={activeBrand} onClose={() => setActiveBrand(null)} />
      </div>
    );
  }

  /* ---- Scrollable report body -------------------------------------- */

  const showSkeleton = status === "loading";

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
      {topBar}

      {showSkeleton && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[12.5px] font-medium text-brand-700">
          Loading report… fetching {selected.siteName}
        </div>
      )}

      {tab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,40%)]">
          <div className="min-w-0 space-y-4">
            <OverviewTab model={selected} />
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-xl border border-line bg-canvas xl:sticky xl:top-4 xl:h-[calc(100vh-260px)]">
            <ReportMap key={selected.key} model={selected} mapStyle={theme.style} />
          </div>
        </div>
      ) : tab === "market" ? (
        <MarketTab model={selected} />
      ) : tab === "demographics" ? (
        <DemographicsTab model={selected} />
      ) : tab === "pois" ? (
        <PoisTab model={selected} />
      ) : tab === "competitors" ? (
        <CompetitorsTab model={selected} />
      ) : tab === "brands" ? (
        <BrandsTab model={selected} onOpenBrand={setActiveBrand} />
      ) : tab === "indexes" ? (
        <IndexesTab model={selected} />
      ) : (
        <ExplorerTab model={selected} />
      )}

      <BrandDetailsDrawer
        brand={activeBrand}
        onClose={() => setActiveBrand(null)}
      />
    </div>
  );
}

