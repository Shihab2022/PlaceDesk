"use client";

import { useEffect, useState } from "react";
import {
  FiCloud,
  FiDatabase,
  FiFile,
  FiFileText,
  FiGrid,
  FiLink,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

const IMPORT = [
  { label: "CSV", ext: ".csv", icon: FiFileText },
  { label: "Excel", ext: ".xlsx", icon: FiFileText },
  { label: "GeoJSON", ext: ".geojson", icon: FiGrid },
  { label: "JSON", ext: ".json", icon: FiFile },
];

const CONNECT = ["PostgreSQL", "MySQL", "MongoDB", "API", "Cloud Storage"];

const RECENT = [
  "business_locations_bengaluru.csv",
  "demographics_2021.geojson",
  "retail_markets.json",
];

function Chip({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      className="focusable flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-3 text-[12px] font-medium text-ink-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-700 hover:shadow-sm"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {label}
      {sub && <span className="text-[10px] font-normal text-ink-400">{sub}</span>}
    </button>
  );
}

interface AddDatasetModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDatasetModal({ open, onClose }: AddDatasetModalProps) {
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add dataset"
        className="anim-fade-scale w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-ink-900">Add Dataset</h2>
            <p className="text-[12px] text-ink-400">
              Bring a new geographic dataset into your workspace
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focusable flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-canvas hover:text-ink-900"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          {/* Import */}
          <div>
            <div className="mb-2 text-[12px] font-semibold text-ink-900">Import Data</div>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              className={`focusable flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-6 text-center transition-colors ${
                dragOver ? "border-brand-500 bg-brand-50" : "border-line"
              }`}
            >
              <FiUploadCloud className="h-6 w-6 text-brand-600" />
              <span className="text-[12px] font-medium text-ink-700">
                Drop files here
              </span>
              <span className="text-[10px] text-ink-400">or click to browse</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {IMPORT.map((i) => (
                <Chip key={i.label} icon={i.icon} label={i.label} sub={i.ext} />
              ))}
            </div>
            <input type="file" className="hidden" aria-hidden="true" tabIndex={-1} />
          </div>

          {/* Connect */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink-900">
              <FiLink className="h-3.5 w-3.5 text-brand-600" /> Connect Data
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CONNECT.map((c) => {
                const Theme =
                  c === "API" ? FiLink : c === "Cloud Storage" ? FiCloud : FiDatabase;
                return <Chip key={c} icon={Theme} label={c} />;
              })}
            </div>
          </div>

          {/* Recent */}
          <div>
            <div className="mb-2 text-[12px] font-semibold text-ink-900">Existing Data</div>
            <div className="space-y-1.5">
              {RECENT.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="focusable flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left transition-colors hover:border-brand-300"
                >
                  <FiFileText className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <span className="truncate text-[12px] text-ink-700">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="focusable rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-canvas"
          >
            Cancel
          </button>
          <button
            type="button"
            className="focusable rounded-lg bg-brand-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}