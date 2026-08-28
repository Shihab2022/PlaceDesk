"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiCode,
  FiDownload,
  FiFileText,
  FiImage,
  FiMap,
} from "react-icons/fi";
import { useAppStore } from "../app/AppStoreContext";
import {
  collectVisibleLocations,
  exportLocationsCsv,
  exportLocationsGeoJson,
  exportLocationsJson,
} from "../services/mapState";

type ExportFormat = "csv" | "json" | "geojson";

export default function ExportMenu({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );
  const [lastFormat, setLastFormat] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const visible = collectVisibleLocations(store.layers);

  const doExport = (format: ExportFormat) => {
    if (visible.length === 0) return;
    setStatus("working");
    setLastFormat(format);
    // Let the UI paint the "Exporting…" state before the download.
    setTimeout(() => {
      try {
        if (format === "csv") exportLocationsCsv(visible);
        else if (format === "json") exportLocationsJson(visible);
        else exportLocationsGeoJson(visible);
        setStatus("done");
      } catch {
        setStatus("error");
      }
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 1200);
    }, 60);
  };

  const items: {
    format: ExportFormat;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      format: "csv",
      label: "CSV",
      desc: "Spreadsheet-friendly table",
      icon: FiFileText,
    },
    {
      format: "json",
      label: "JSON",
      desc: "Raw location records",
      icon: FiCode,
    },
    {
      format: "geojson",
      label: "GeoJSON",
      desc: "Point features for GIS tools",
      icon: FiMap,
    },
  ];

  return (
    <div
      ref={ref}
      className="anim-fade-scale absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-ink-900/10"
      role="menu"
      aria-label="Export map data"
    >
      <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        Export {visible.length.toLocaleString("en-US")} visible locations
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        const busy = status === "working" && lastFormat === item.format;
        return (
          <button
            key={item.format}
            type="button"
            role="menuitem"
            disabled={status !== "idle" || visible.length === 0}
            onClick={() => doExport(item.format)}
            className={`focusable flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
              status !== "idle" || visible.length === 0
                ? "cursor-default opacity-50"
                : "hover:bg-canvas"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              {busy ? (
                <FiDownload className="h-3.5 w-3.5 animate-pulse" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-ink-900">
                {item.label}
              </span>
              <span className="block text-[10.5px] text-ink-400">{item.desc}</span>
            </span>
            {status === "done" && lastFormat === item.format && (
              <FiCheck className="h-4 w-4 text-emerald-500" />
            )}
          </button>
        );
      })}

      <div className="my-1 border-t border-line" />

      <button
        type="button"
        role="menuitem"
        disabled
        className="flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-left opacity-50"
        title="Requires a Mapbox token with the static images API enabled"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-400">
          <FiImage className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-medium text-ink-900">
            Map Image
          </span>
          <span className="block text-[10.5px] text-ink-400">
            Requires Mapbox static-image access
          </span>
        </span>
      </button>

      {status === "working" && (
        <p className="px-2.5 pb-1 text-[11px] font-medium text-brand-700">
          Exporting {visible.length.toLocaleString("en-US")} locations…
        </p>
      )}
      {status === "done" && (
        <p className="px-2.5 pb-1 text-[11px] font-medium text-emerald-600">
          Export complete
        </p>
      )}
      {status === "error" && (
        <p className="px-2.5 pb-1 text-[11px] font-medium text-red-600">
          Export failed — please try again
        </p>
      )}
    </div>
  );
}
