"use client";

/**
 * `/report/<reportId>` — the standalone report page.
 *
 * The report index (`/dashboard?tab=reports`) links here; every report keeps
 * its own shareable URL. The page owns the basemap choice so the report
 * workspace never has to touch the map-layer store.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiArrowLeft, FiHome, FiMap } from "react-icons/fi";
import { reportDataLayerConfig } from "@/constant/mapConfilg";
import { MAP_THEMES } from "@/components/placeDesk/data";
import PlaceDeskLogo from "@/components/placeDesk/layout/PlaceDeskLogo";
import ThemeToggle from "@/components/placeDesk/theme/ThemeToggle";
import { ReportSkeleton } from "./ui";

/** Map + charts are browser-heavy — load the workspace lazily. */
const DynamicReportDashboard = dynamic(() => import("./ReportDashboard"), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-4 sm:px-6">
      <ReportSkeleton />
    </div>
  ),
});

export default function ReportDetailPage({ reportId }: { reportId: string }) {
  const config = useMemo(
    () => reportDataLayerConfig.find((c) => c.id === reportId) ?? null,
    [reportId],
  );
  const [themeId, setThemeId] = useState(MAP_THEMES[0].id);
  const mapStyle =
    MAP_THEMES.find((t) => t.id === themeId)?.style ?? MAP_THEMES[0].style;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-ink-900">
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 bg-white px-3 shadow-xs sm:px-4">
        <Link href="/" aria-label="PlaceDesk home" className="focusable rounded-lg">
          <PlaceDeskLogo variant="compact" size={34} />
        </Link>

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <Link
          href="/dashboard?tab=reports"
          className="focusable inline-flex items-center gap-1.5 rounded-xl bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-canvas-subtle hover:text-brand-700"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All reports</span>
        </Link>

        <span className="flex min-w-0 flex-1 items-center gap-2 text-[12.5px] text-ink-500">
          <span className="hidden truncate sm:inline">Location intelligence report</span>
          {config && (
            <>
              <span className="hidden sm:inline" aria-hidden>
                ·
              </span>
              <span className="truncate font-semibold text-ink-900">
                {config.name}
              </span>
            </>
          )}
        </span>

        {/* Basemap picker — report-local, does not touch the map workspace */}
        <label className="hidden items-center gap-2 text-[11.5px] font-medium text-ink-500 sm:flex">
          <FiMap className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Basemap style</span>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="focusable h-8 rounded-xl bg-canvas px-2.5 text-[12px] text-ink-700 outline-none hover:bg-canvas-subtle"
          >
            {MAP_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <Link
          href="/dashboard"
          className="focusable hidden items-center gap-1.5 rounded-xl bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-canvas-subtle hover:text-brand-700 lg:inline-flex"
        >
          <FiHome className="h-3.5 w-3.5" />
          Workspace
        </Link>

        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {config ? (
          <DynamicReportDashboard reportId={config.id} mapStyle={mapStyle} />
        ) : (
          <ReportNotFound reportId={reportId} />
        )}
      </main>
    </div>
  );
}

/** Unknown ids happen after a typo or when a data source is removed. */
function ReportNotFound({ reportId }: { reportId: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-[16px] font-semibold text-ink-900">
          Report not found
        </h1>
        <p className="mt-2 text-[12.5px] text-ink-500">
          No configured data source matches{" "}
          <span className="font-mono text-ink-700">{reportId || "(empty)"}</span>.
        </p>
        <Link
          href="/dashboard?tab=reports"
          className="focusable mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to all reports
        </Link>
      </div>
    </div>
  );
}
