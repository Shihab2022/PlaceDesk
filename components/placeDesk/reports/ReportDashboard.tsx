"use client";

/**
 * `Dashboard -> Reports` — the report workspace.
 *
 * **Everything lives on one continuously scrollable page.** The order is:
 *   1. report header (selector + export)
 *   2. location details
 *   3. the deck.gl catchment map
 *   4. KPI tiles
 *   5. section navigation cards  →  deep-links (`?report=&section=`)
 *   6. every section rendered in full, each with its own anchor
 *
 * Clicking a navigation card writes `?report=<id>&section=<key>` to the URL
 * (so the state is shareable / bookmarkable and the back button works) and
 * scrolls the matching section into view.
 *
 * Payloads are loaded through the existing `/api/pois` route (see `useReports`).
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "../app/AppStoreContext";
import { MAP_THEMES } from "../data";
import { useReports } from "./useReports";
import type { BusinessRecord } from "./types";
import {
  REPORT_SECTIONS,
  sectionAnchor,
  type ReportSectionKey,
} from "./sectionMeta";
import ReportHeader from "./ReportHeader";
import ReportKpiCards from "./ReportKpiCards";
import ReportLocationCard from "./ReportLocationCard";
import ReportSectionCards from "./ReportSectionCards";
import ReportSectionShell from "./ReportSectionShell";
import BrandDetailsDrawer from "./BrandDetailsDrawer";
import OverviewTab from "./tabs/OverviewTab";
import MarketTab from "./tabs/MarketTab";
import DemographicsTab from "./tabs/DemographicsTab";
import PoisTab from "./tabs/PoisTab";
import CompetitorsTab from "./tabs/CompetitorsTab";
import BrandsTab from "./tabs/BrandsTab";
import IndexesTab from "./tabs/IndexesTab";
import ExplorerTab from "./ExplorerTab";
import { ErrorState, ReportSkeleton } from "./ui";

/** Map is browser-only (webgl) — load it lazily like the main workspace does. */
const ReportMapSurface = dynamic(() => import("./ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas">
      <span className="skeleton h-10 w-10 rounded-full" />
    </div>
  ),
});

/** Section ids accepted from the `?section=` query parameter. */
const SECTION_IDS = REPORT_SECTIONS.map((s) => s.id);

function isSectionKey(value: string | null): value is ReportSectionKey {
  return value !== null && (SECTION_IDS as string[]).includes(value);
}

/** Read `report` / `section` straight from `window.location` (client-only). */
function readUrlState(): {
  reportId: string | null;
  section: ReportSectionKey | null;
} {
  if (typeof window === "undefined") return { reportId: null, section: null };
  const params = new URLSearchParams(window.location.search);
  const rawSection = params.get("section");
  return {
    reportId: params.get("report"),
    section: isSectionKey(rawSection) ? rawSection : null,
  };
}


export default function ReportDashboard() {
  const store = useAppStore();

  /* ---- URL state (report + section) -------------------------------- */
  const [initialUrl] = useState(readUrlState);
  const [activeSection, setActiveSection] = useState<ReportSectionKey | null>(
    initialUrl.section,
  );

  const { options, selectedKey, selected, status, error, select, retry } =
    useReports(initialUrl.reportId);
  const [activeBrand, setActiveBrand] = useState<BusinessRecord | null>(null);

  const theme = useMemo(
    () => MAP_THEMES.find((t) => t.id === store.mapThemeId) ?? MAP_THEMES[0],
    [store.mapThemeId],
  );

  /* Reflect the current report + section in the URL. `replaceState` keeps the
     history clean while still making the state shareable / bookmarkable. */
  useEffect(() => {
    if (typeof window === "undefined" || !selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("report", selected.reportId);
    if (activeSection) url.searchParams.set("section", activeSection);
    else url.searchParams.delete("section");
    window.history.replaceState(null, "", url.toString());
  }, [selected, activeSection]);

  /* Back / forward navigation between sections. */
  useEffect(() => {
    const onPop = () => {
      const next = readUrlState();
      setActiveSection(next.section);
      if (next.section) {
        const anchor = sectionAnchor(next.section);
        window.requestAnimationFrame(() => {
          document
            .getElementById(anchor)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Deep link: jump to the requested section once the model is ready. */
  useEffect(() => {
    if (!selected || !initialUrl.section) return;
    const anchor = sectionAnchor(initialUrl.section);
    window.requestAnimationFrame(() => {
      document
        .getElementById(anchor)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selected, initialUrl.section]);

  const goToSection = useCallback((id: ReportSectionKey) => {
    setActiveSection(id);
    document
      .getElementById(sectionAnchor(id))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* ---- Top bar (always visible) ------------------------------------ */
  const topBar = (
    <ReportHeader
      options={options}
      selectedKey={selectedKey}
      onSelect={select}
      status={status}
      model={selected}
      mapAvailable
    />
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

  /* ---- Full single-page report ------------------------------------- */

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
      <div className="space-y-5">
        {topBar}

        {status === "loading" && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[12.5px] font-medium text-brand-700">
            Loading report… fetching {selected.siteName}
          </div>
        )}

        {/* 1 — Location details first */}
        <ReportLocationCard model={selected} />

        {/* 2 — Then the catchment map */}
        <section aria-label="Catchment map" className="scroll-mt-24">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight text-ink-900">
                Catchment map
              </h2>
              <p className="mt-0.5 text-[11.5px] text-ink-500">
                Toggle layers, hover a marker for details · export the map as an
                image from the header
              </p>
            </div>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-xl border border-line bg-canvas sm:h-[460px] xl:h-[520px]">
            <ReportMapSurface
              key={selected.key}
              model={selected}
              mapStyle={theme.style}
            />
          </div>
        </section>

        {/* 3 — Key metrics */}
        <ReportKpiCards model={selected} />

        {/* 4 — Section cards (deep links into this page) */}
        <div id="report-sections" className="scroll-mt-24">
          <ReportSectionCards
            model={selected}
            activeId={activeSection}
            onSelect={goToSection}
          />
        </div>

        {/* 5 — Every section, in full, on the same page */}
        <ReportSectionShell id="overview">
          <OverviewTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="market">
          <MarketTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="demographics">
          <DemographicsTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="pois">
          <PoisTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="competitors">
          <CompetitorsTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="brands">
          <BrandsTab model={selected} onOpenBrand={setActiveBrand} />
        </ReportSectionShell>

        <ReportSectionShell id="indexes">
          <IndexesTab model={selected} />
        </ReportSectionShell>

        <ReportSectionShell id="data">
          <ExplorerTab model={selected} />
        </ReportSectionShell>

        {/* Footer summary */}
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-[11.5px] text-ink-500 sm:px-5">
          End of report ·{" "}
          <span className="font-mono text-ink-700">{selected.reportId}</span> ·{" "}
          {REPORT_SECTIONS.length} sections
        </div>
      </div>

      <BrandDetailsDrawer
        brand={activeBrand}
        onClose={() => setActiveBrand(null)}
      />
    </div>
  );
}

