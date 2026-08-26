"use client";

import {
  FiMoreHorizontal,
  FiShare2,
  FiUpload,
  FiSave,
} from "react-icons/fi";

interface ProjectBarProps {
  title: string;
  updated: string;
  onSave: () => void;
  saved: boolean;
}

export default function ProjectBar({
  title,
  updated,
  onSave,
  saved,
}: ProjectBarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
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