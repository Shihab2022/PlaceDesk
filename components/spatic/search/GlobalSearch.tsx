"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiDatabase,
  FiFolder,
  FiMapPin,
  FiSearch,
  FiSmartphone,
} from "react-icons/fi";

interface Group {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { name: string; hint?: string }[];
}

const GROUPS: Group[] = [
  {
    label: "Locations",
    icon: FiMapPin,
    items: [
      { name: "Bengaluru", hint: "State · Karnataka" },
      { name: "Mumbai", hint: "City · Maharashtra" },
      { name: "Delhi NCR", hint: "Metropolitan area" },
    ],
  },
  {
    label: "Businesses",
    icon: FiSmartphone,
    items: [
      { name: "Electronics stores", hint: "2,481 locations" },
      { name: "Fitness centers", hint: "762 locations" },
      { name: "Restaurants", hint: "3,102 locations" },
    ],
  },
  {
    label: "Datasets",
    icon: FiDatabase,
    items: [
      { name: "Business Locations", hint: "Retail layer" },
      { name: "Demographics", hint: "Census 2021" },
      { name: "Retail Data", hint: "Updated daily" },
    ],
  },
  {
    label: "Recent Searches",
    icon: FiFolder,
    items: [{ name: "Electronics — Bengaluru" }, { name: "Fashion — Koramangala" }],
  },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.hint ?? "").toLowerCase().includes(q),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const flatResults = useMemo(
    () => results.flatMap((g) => g.items.map((item) => ({ group: g.label, ...item }))),
    [results],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  let cursor = -1;

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[100] flex items-start justify-center bg-ink-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="anim-fade-scale w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, flatResults.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && flatResults[active]) {
                onClose();
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search locations, companies, datasets…"
            aria-label="Search query"
            className="w-full bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="select-none rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-3 py-10 text-center text-[13px] text-ink-400">
              No results for “{query}”
            </div>
          )}

          {results.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.label} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <GroupIcon className="h-3.5 w-3.5 text-ink-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {group.label}
                  </span>
                </div>
                {group.items.map((item) => {
                  cursor += 1;
                  const activeItem = cursor === active;
                  return (
                    <button
                      key={`${group.label}-${item.name}`}
                      type="button"
                      onClick={onClose}
                      onMouseEnter={() => setActive(cursor)}
                      className={`focusable flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        activeItem ? "bg-brand-50" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${
                            activeItem ? "bg-brand-600 text-white" : "bg-canvas text-ink-500"
                          }`}
                        >
                          <GroupIcon className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[13px] font-medium text-ink-900">{item.name}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {item.hint && (
                          <span className="hidden text-[11px] text-ink-400 sm:block">
                            {item.hint}
                          </span>
                        )}
                        <FiArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[10px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-canvas px-1">↑↓</kbd> navigate
            <kbd className="ml-1 rounded border border-line bg-canvas px-1">↵</kbd> select
          </span>
          <span>Spatic · Command Search</span>
        </div>
      </div>
    </div>
  );
}