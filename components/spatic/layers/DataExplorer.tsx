"use client";

import { useState } from "react";
import {
  FiChevronDown,
  FiFilter,
  FiMoreHorizontal,
  FiPlus,
} from "react-icons/fi";
import { CATEGORIES } from "../../spatic/data";
import { Toggle } from "../../spatic/ui";

interface DataExplorerProps {
  selected: string;
  onSelect: (id: string) => void;
  onOpenLayer: () => void;
  onAddDataset: () => void;
  visible: Record<string, boolean>;
  onToggleVisible: (id: string) => void;
}

export default function DataExplorer({
  selected,
  onSelect,
  onOpenLayer,
  onAddDataset,
  visible,
  onToggleVisible,
}: DataExplorerProps) {
  const [query, setQuery] = useState("");

  const filtered = CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-[15px] font-semibold text-ink-900">Data Explorer</h2>
        <button
          type="button"
          onClick={onAddDataset}
          aria-label="Add dataset"
          title="Add dataset"
          className="focusable flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>
      <p className="px-4 pb-2 pt-1 text-[11px] text-ink-400">
        Business categories in Bengaluru
      </p>

      {/* Search + filter */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets"
            aria-label="Search datasets"
            className="focusable w-full rounded-lg border border-line bg-canvas py-1.5 pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brand-400 focus:bg-white"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <button
          type="button"
          aria-label="Filter datasets"
          title="Filter"
          className="focusable flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <FiFilter className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Category groups */}
      <div className="flex items-center justify-between px-4 pb-1.5 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          Business Categories
        </span>
        <span className="text-[10px] text-ink-400">7 groups</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="text-2xl text-ink-300">⌕</div>
            <p className="text-[12px] text-ink-400">No datasets match query</p>
          </div>
        ) : (
          <ul className="stagger space-y-1">
            {filtered.map((cat) => {
              const isSelected = selected === cat.id;
              const Icon = cat.icon;
              const isVisible = visible[cat.id] ?? true;
              return (
                <li key={cat.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(cat.id)}
                    onDoubleClick={() => onOpenLayer()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(cat.id);
                      }
                    }}
                    className={`focusable group relative flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-150 ${
                      isSelected
                        ? "border-brand-400 bg-brand-50 shadow-sm shadow-brand-600/5"
                        : "border-transparent hover:border-line hover:bg-canvas"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />
                    )}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                          : "bg-canvas text-ink-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] font-medium ${
                          isSelected ? "text-brand-900" : "text-ink-900"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        isSelected ? "font-semibold text-brand-800" : "text-ink-400"
                      }`}
                    >
                      {cat.records}
                    </span>
                    <Toggle
                      checked={isVisible}
                      onChange={() => onToggleVisible(cat.id)}
                      label={`toggle ${cat.label}`}
                    />
                    <button
                      type="button"
                      aria-label={`More options for ${cat.label}`}
                      title="Configure layer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLayer();
                      }}
                      className={`focusable hidden h-6 w-6 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-brand-100 hover:text-brand-800 group-hover:flex ${
                        isSelected ? "flex" : ""
                      }`}
                    >
                      <FiMoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}