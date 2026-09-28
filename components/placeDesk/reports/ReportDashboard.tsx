"use client";

/**
 * `Reports -> report` — the report workspace (route `/report/<reportId>`).
 *
 * **Everything lives on one continuously scrollable page.** The order is:
 *   1. report header (selector + map image export)
 *   2. the deck.gl catchment map — the hero, first content block
 *   3. location details
 *   4. KPI tiles
 *   5. section navigation cards  →  deep-links (`?section=`)
 *   6. every section rendered in full, each with its own anchor
 *
 * Clicking a navigation card writes `?section=<key>` to the URL (so the state
 * is shareable / bookmarkable and the back button works) and scrolls the
 * matching section into view. Switching report navigates to that report's route.
 *
 * Deliberately independent of the map workspace store: it only needs the
 * basemap style, so opening a report never loads the POI layers.
 *
 * Payloads are loaded through the existing `/api/pois` route (see `useReports`).
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
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

/** Read `reportId` / `section` straight from `window.location` (client-only). */
function readUrlState(): {
  reportId: string | null;
  section: ReportSectionKey | null;
} {
  if (typeof window === "undefined") return { reportId: null, section: null };
  const params = new URLSearchParams(window.location.search);
  const rawSection = params.get("section");
  return {
    /* `report` is the legacy param — still honoured for old bookmarks. */
    reportId: params.get("reportId") ?? params.get("report"),
    section: isSectionKey(rawSection) ? rawSection : null,
  };
}


export default function ReportDashboard({
  reportId = null,
  mapStyle,
}: {
  /** Report to open — the `/report/<reportId>` route segment. */
  reportId?: string | null;
  /** Basemap style for the catchment map (defaults to the first theme). */
  mapStyle?: string;
}) {
  const router = useRouter();

  /* ---- URL state (report + section) -------------------------------- */
  /* The report id is the route segment; `?reportId=` is still honoured so
     older deep links keep working. */
  const [initialUrl] = useState(() => {
    const url = readUrlState();
    return { reportId: reportId ?? url.reportId, section: url.section };
  });
  const [activeSection, setActiveSection] = useState<ReportSectionKey | null>(
    initialUrl.section,
  );

  const { options, selectedKey, selected, status, error, select, retry } =
    useReports(initialUrl.reportId);
  const [activeBrand, setActiveBrand] = useState<BusinessRecord | null>(null);

  const selectedMapStyle = mapStyle ?? MAP_THEMES[0].style;

  /* Reflect the current section in the URL. `replaceState` keeps the history
     clean while still making the state shareable / bookmarkable. */
  useEffect(() => {
    if (typeof window === "undefined" || !selected) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("reportId");
    url.searchParams.delete("report");
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

  /**
   * Switching report: on the dedicated route the report id *is* the URL, so a
   * different report becomes a navigation (`/report/<id>`) — that keeps the
   * address bar, the back button and sharing all correct.
   */
  const handleSelectReport = useCallback(
    (key: string) => {
      const option = options.find((o) => o.key === key);
      if (!option || option.reportId === initialUrl.reportId) {
        /* Same report (e.g. picking a second row of the same file). */
        select(key);
        return;
      }
      router.push(`/report/${encodeURIComponent(option.reportId)}`);
    },
    [options, select, router, initialUrl.reportId],
  );

  /* ---- Top bar (always visible) ------------------------------------ */
  const topBar = (
    <div className="space-y-3">
      {/* Back to the report index — `/dashboard?tab=reports` lists every
          report as a card and links back into this route. */}
      <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
        <a
          href="/dashboard?tab=reports"
          className="focusable inline-flex items-center gap-1.5 rounded-md font-medium text-brand-700 transition-colors hover:text-brand-800 hover:underline"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          All reports
        </a>
        <span aria-hidden="true">·</span>
        <span className="truncate">Report workspace</span>
      </div>

      <ReportHeader
        options={options}
        selectedKey={selectedKey}
        onSelect={handleSelectReport}
        status={status}
        model={selected}
        mapAvailable
      />
    </div>
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
          <div className="rounded-2xl bg-brand-50 px-4 py-2.5 text-[12.5px] font-medium text-brand-700 shadow-xs">
            Loading report… fetching {selected.siteName}
          </div>
        )}

        {/* 1 — The catchment map leads the report */}
        <ReportSectionShell id="map">
          <div className="relative h-[420px] overflow-hidden rounded-2xl bg-canvas shadow-sm sm:h-[460px] xl:h-[520px]">
            <ReportMapSurface
              key={selected.key}
              model={selected}
              mapStyle={selectedMapStyle}
            />
          </div>
          <p className="mt-2 text-[11.5px] text-ink-500">
            Catchment polygon, POIs, competitors and anchors · toggle layers
            inside the map and use <span className="font-medium text-ink-700">Export</span>{" "}
            in the header to save the map as an image.
          </p>
        </ReportSectionShell>

        {/* 2 — Location details */}
        <ReportLocationCard model={selected} />

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
        <div className="rounded-2xl bg-white px-5 py-4 text-[12px] text-ink-500 shadow-xs sm:px-6">
          End of report ·{" "}
          <span className="font-mono font-medium text-ink-700">{selected.reportId}</span> ·{" "}
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

