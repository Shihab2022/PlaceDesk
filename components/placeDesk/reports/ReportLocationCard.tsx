"use client";

/**
 * Location details hero — always the first thing shown on the report page.
 *
 * Surfaces every site fact the payload carries (identity, coordinates,
 * catchment, area, distance/orientation from the city centre) plus a compact
 * coordinate read-out. Missing values fall back to `"N/A"`.
 */

import {
  FiCompass,
  FiCopy,
  FiCrosshair,
  FiMapPin,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import { useState } from "react";
import type { ReportModel } from "./types";
import {
  formatArea,
  formatCoordinates,
  formatDate,
  formatDistanceKm,
  formatNumber,
} from "./parse";
import { Pill } from "./ui";

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-white/70 px-3 py-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </span>
        <span
          className="mt-0.5 block truncate text-[13px] font-semibold text-ink-900"
          title={value}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

export default function ReportLocationCard({
  model,
  siteLabel = "Site location",
}: {
  model: ReportModel;
  siteLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const coords =
    model.lat !== null && model.lng !== null
      ? formatCoordinates(model.lat, model.lng, 5)
      : "N/A";

  const copyCoords = async () => {
    if (model.lat === null || model.lng === null) return;
    const text = `${model.lat},${model.lng}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <section
      aria-label="Location details"
      className="overflow-hidden rounded-xl border border-line bg-linear-to-br from-brand-50/60 via-white to-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            {siteLabel}
          </p>
          <h2 className="mt-1 truncate text-[18px] font-semibold leading-tight text-ink-900">
            {model.location ?? model.siteName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Pill tone="brand">{model.catchmentLabel}</Pill>
            {model.catchmentType && <Pill>{model.catchmentType}</Pill>}
            {model.orientation && (
              <Pill>
                {model.orientation} of city centre
              </Pill>
            )}
            {model.areaM2 !== null && <Pill>{formatArea(model.areaM2)}</Pill>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-xl border border-line bg-white px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              Coordinates
            </p>
            <p className="mt-0.5 font-mono text-[12.5px] font-semibold tabular-nums text-ink-900">
              {coords}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCoords}
            disabled={model.lat === null || model.lng === null}
            title="Copy coordinates"
            aria-label="Copy coordinates"
            className="focusable flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-white text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiCopy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <Fact
          icon={<FiMapPin className="h-3.5 w-3.5" />}
          label="Site name"
          value={model.siteName}
        />
        <Fact
          icon={<FiCrosshair className="h-3.5 w-3.5" />}
          label="Distance from city centre"
          value={formatDistanceKm(model.distanceFromCityCenterKm)}
        />
        <Fact
          icon={<FiCompass className="h-3.5 w-3.5" />}
          label="Cluster growth rate"
          value={
            model.clusterGrowthRate !== null
              ? `${model.clusterGrowthRate >= 0 ? "+" : ""}${formatNumber(model.clusterGrowthRate)}%`
              : "N/A"
          }
        />
        <Fact
          icon={<FiLayers className="h-3.5 w-3.5" />}
          label="Catchment area"
          value={formatArea(model.areaM2)}
        />
        <Fact
          icon={<FiMapPin className="h-3.5 w-3.5" />}
          label="Report ID"
          value={model.reportId}
        />
        <Fact
          icon={<FiCalendar className="h-3.5 w-3.5" />}
          label="Report generated"
          value={formatDate(model.createdAt)}
        />
        <Fact
          icon={<FiMapPin className="h-3.5 w-3.5" />}
          label="Entity ID"
          value={model.entityId ?? "N/A"}
        />
        <Fact
          icon={<FiCompass className="h-3.5 w-3.5" />}
          label="Orientation"
          value={model.orientation ?? "N/A"}
        />
      </div>

      {copied && (
        <p
          role="status"
          className="border-t border-brand-100 bg-white/70 px-4 py-2 text-[11.5px] font-medium text-brand-700 sm:px-5"
        >
          Coordinates copied to clipboard.
        </p>
      )}
    </section>
  );
}
