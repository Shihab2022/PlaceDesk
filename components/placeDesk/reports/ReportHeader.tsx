"use client";

/**
 * Report masthead: identity, key metadata, report switcher and export
 * actions. Reuses the existing `ExportMenu` (map image export) whenever the
 * report map is mounted, plus a raw-JSON download that always works.
 */

import { useState, type ReactNode } from "react";
import { FiDownload, FiImage } from "react-icons/fi";
import ExportMenu from "@/components/placeDesk/modals/ExportMenu";
import type { ReportModel, ReportOption } from "./types";
import {
  formatArea,
  formatDate,
  formatDateTime,
  formatDistanceKm,
} from "./parse";
import { Pill } from "./ui";
import ReportSelector from "./ReportSelector";

function downloadJson(model: ReportModel) {
  const blob = new Blob([JSON.stringify(model.raw, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${model.reportId || "placedesk-report"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function ReportHeader({
  options,
  selectedKey,
  onSelect,
  status,
  model,
  mapAvailable,
}: {
  options: ReportOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  status: "loading" | "ready" | "error";
  model: ReportModel | null;
  mapAvailable: boolean;
}) {
  const [exportOpen, setExportOpen] = useState(false);

  const facts: ReactNode = model ? (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <Pill tone="brand">{model.catchmentLabel}</Pill>
      {model.location && <Pill>{model.location}</Pill>}
      {model.distanceFromCityCenterKm !== null && (
        <Pill>{formatDistanceKm(model.distanceFromCityCenterKm)} from city centre</Pill>
      )}
      {model.areaM2 !== null && <Pill>{formatArea(model.areaM2)}</Pill>}
      <Pill>
        {model.createdAt !== null
          ? `Generated ${formatDateTime(model.createdAt)}`
          : "Date unavailable"}
      </Pill>
    </div>
  ) : (
    <div className="skeleton h-5 w-64 max-w-full rounded-full" />
  );

  return (
    <header className="rounded-xl border border-line bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            Location intelligence report
          </p>
          <h1 className="mt-1 truncate text-[20px] font-semibold leading-tight text-ink-900 sm:text-[22px]">
            {model ? model.siteName : "Loading report…"}
          </h1>
          <div className="mt-2">{facts}</div>
          {model && (
            <p className="mt-2 text-[11.5px] text-ink-500">
              Report ID <span className="font-mono text-ink-700">{model.reportId}</span>
              {formatDate(model.createdAt) !== "N/A" && (
                <> · {formatDate(model.createdAt)}</>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
          <ReportSelector
            options={options}
            selectedKey={selectedKey}
            onSelect={onSelect}
            disabled={options.length === 0}
          />
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((v) => !v)}
                disabled={!mapAvailable}
                title={
                  mapAvailable
                    ? "Export the report map as an image"
                    : "Open the Map tab to export an image"
                }
                className="focusable inline-flex h-[42px] items-center gap-2 rounded-xl border border-line bg-white px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiImage className="h-4 w-4" />
                Export
              </button>
              {exportOpen && mapAvailable && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                  <ExportMenu onClose={() => setExportOpen(false)} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => model && downloadJson(model)}
              disabled={!model}
              title="Download the raw report JSON"
              className="focusable inline-flex h-[42px] items-center gap-2 rounded-xl border border-line bg-white px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
            >
              <FiDownload className="h-4 w-4" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-canvas">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-600" />
        </div>
      )}
    </header>
  );
}
