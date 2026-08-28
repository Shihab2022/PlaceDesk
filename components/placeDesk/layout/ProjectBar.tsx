"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiMoreHorizontal,
  FiSave,
  FiShare2,
  FiUpload,
} from "react-icons/fi";
import { CITIES } from "../data";
import type { CityDef } from "../data";

interface ProjectBarProps {
  title: string;
  updated: string;
  city: CityDef;
  onCityChange: (city: CityDef) => void;
  onSave: () => void;
  saved: boolean;
}

export default function ProjectBar({
  title,
  updated,
  city,
  onCityChange,
  onSave,
  saved,
}: ProjectBarProps) {
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

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5 sm:px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[16px] font-semibold leading-tight text-ink-900">
            {title}
          </h1>
          <p className="text-[11px] text-ink-400">Updated {updated}</p>
        </div>

        {/* City selector */}
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="Select city"
            className="focusable flex items-center gap-1.5 rounded-lg border border-line py-1.5 pl-2.5 pr-2 text-[12px] transition-colors hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
              Location
            </span>
            <span className="font-semibold text-ink-900">{city.label}</span>
            <FiChevronDown
              className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <ul
              role="listbox"
              aria-label="Cities"
              className="anim-scale-in absolute left-0 top-full z-40 mt-1.5 max-h-72 w-48 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-xl shadow-ink-900/10"
            >
              {CITIES.map((c) => {
                const active = c.id === city.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setOpen(false);
                        if (!active) onCityChange(c);
                      }}
                      className={`focusable flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                        active
                          ? "bg-brand-50 font-semibold text-brand-800"
                          : "text-ink-700 hover:bg-canvas"
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className="text-[10px] text-ink-400">{c.country}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="focusable flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-700"
        >
          <FiShare2 className="h-3.5 w-3.5" /> Share
        </button>
        <button
          type="button"
          className="focusable flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-700"
        >
          <FiUpload className="h-3.5 w-3.5" /> Export
        </button>
        <button
          type="button"
          onClick={onSave}
          className="focusable flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110"
        >
          <FiSave className="h-3.5 w-3.5" />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          aria-label="More project actions"
          title="More"
          className="focusable flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink-400 transition-colors hover:bg-canvas hover:text-ink-700"
        >
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
