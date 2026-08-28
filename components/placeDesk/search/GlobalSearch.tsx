"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiDatabase,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import { CATEGORIES } from "../data";
import { useAppStore } from "../app/AppStoreContext";

interface Group {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SearchItem[];
}

interface SearchItem {
  name: string;
  hint?: string;
  layerId?: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const store = useAppStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Group[];
    const locations: SearchItem[] = [];
    for (const layer of store.layers) {
      for (const location of layer.data) {
        if (!store.matchingIds.has(location.id)) continue;
        locations.push({
          name: location.name,
          hint: `${layer.label} · ${location.town_name || "Unknown"}`,
          layerId: layer.id,
          locationId: location.id,
          latitude: location.lat,
          longitude: location.lng,
        });
        if (locations.length >= 30) break;
      }
      if (locations.length >= 30) break;
    }
    const categories: SearchItem[] = store.searchResults.layersTouched.map((key) => {
      const category = CATEGORIES.find((item) => item.key === key);
      return {
        name: category?.label ?? key,
        hint: `${store.searchResults.byCategory.get(key)?.length ?? 0} locations`,
      };
    });
    const brands = [...store.searchResults.byBrand.keys()].slice(0, 12).map((name) => ({
      name,
      hint: "Brand",
    }));
    const next: Group[] = [];
    if (categories.length) next.push({ label: "Categories", icon: FiDatabase, items: categories });
    if (locations.length) next.push({ label: "Locations", icon: FiMapPin, items: locations });
    if (brands.length) next.push({ label: "Brands", icon: FiSearch, items: brands });
    return next;
  }, [query, store.layers, store.matchingIds, store.searchResults]);

  const flatResults = useMemo(
    () => results.flatMap((g) => g.items.map((item) => ({ group: g.label, ...item }))),
    [results],
  );

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      setQuery("");
      store.clearSearch();
      setActive(0);
    }, 0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, store.clearSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectItem = (item: SearchItem) => {
    if (item.layerId && item.locationId) {
      const layer = store.layers.find((candidate) => candidate.id === item.layerId);
      const location = layer?.data.find((candidate) => candidate.id === item.locationId);
      if (layer && location) {
        store.setActiveId(layer.id);
        store.setSelectedLocation(location, layer.id);
        store.setViewport({
          longitude: location.lng,
          latitude: location.lat,
          zoom: Math.max(store.viewState.zoom, 14),
        });
      }
    }
    onClose();
  };

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
            store.setSearchQuery(e.target.value);
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
          {results.length === 0 && query.trim() && (
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
                {group.items.map((item, itemIndex) => {
                  const cursor = results
                    .slice(0, results.indexOf(group))
                    .reduce((sum, current) => sum + current.items.length, 0) + itemIndex;
                  const activeItem = cursor === active;
                  return (
                    <button
                      key={`${group.label}-${item.name}`}
                      type="button"
                      onClick={() => selectItem(item)}
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
          <span>PlaceDesk · Command Search</span>
        </div>
      </div>
    </div>
  );
}