"use client";

/**
 * Report picker — lists `reportDataLayerConfig` entries (plus any extra
 * reports discovered inside those files) and drives `useReports().select`.
 * Unloaded entries show a subtle "will load on select" hint.
 */

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiFileText, FiMapPin } from "react-icons/fi";
import type { ReportOption } from "./types";
import { formatDate } from "./parse";

export default function ReportSelector({
  options,
  selectedKey,
  onSelect,
  disabled = false,
}: {
  options: ReportOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active =
    options.find((o) => o.key === selectedKey) ?? options[0] ?? null;

  return (
    <div ref={ref} className="relative w-full min-w-0 sm:w-[320px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || options.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focusable flex w-full items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition-colors hover:border-brand-300 disabled:opacity-60"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <FiFileText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink-900">
            {active ? active.siteName : "No reports"}
          </span>
          <span className="block truncate text-[11px] text-ink-500">
            {active
              ? `${active.sourceName}${active.loaded ? "" : " · loads on select"}`
              : "Waiting for data"}
          </span>
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="anim-fade-in absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-80 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-ink-900/10"
        >
          {options.map((option) => {
            const isActive = option.key === active?.key;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setOpen(false);
                    onSelect(option.key);
                  }}
                  className={`focusable flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    isActive ? "bg-brand-50" : "hover:bg-canvas"
                  }`}
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      option.loaded ? "bg-emerald-500" : "bg-line"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold text-ink-900">
                        {option.loaded ? option.siteName : option.sourceName}
                      </span>
                      {!option.loaded && (
                        <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">
                          not loaded
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 truncate text-[11px] text-ink-500">
                      {option.location && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <FiMapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{option.location}</span>
                        </span>
                      )}
                      {option.loaded && option.createdAt !== null && (
                        <span className="shrink-0">
                          {formatDate(option.createdAt)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {!options.length && (
            <li className="px-3 py-4 text-center text-[12px] text-ink-500">
              No reports available.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
