"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiCopy,
  FiCrosshair,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiLayers,
  FiLoader,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { CATEGORIES, formatCount } from "../data";
import { useAppStore } from "../app/AppStoreContext";

export default function LayerList() {
  const store = useAppStore();
  const layers = store.layers;
  const activeKeys = new Set(layers.map((l) => l.categoryKey));
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuFor) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuFor(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuFor(null);
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuFor]);

  return (
    <div ref={rootRef} className="relative flex min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-ink-500">
          Data Layers
          <span className="ml-1.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800">
            {layers.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="btn-primary !px-2.5 !py-1.5 !text-[11px]"
        >
          <FiPlus className="h-3.5 w-3.5" aria-hidden /> Add Layer
        </button>
      </div>

      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
        role="list"
        aria-label="Map layers"
      >
        {layers.map((l) => {
          const cat = CATEGORIES.find((c) => c.key === l.categoryKey);
          const selected = store.activeId === l.id;
          return (
            <div key={l.id} role="listitem" className="relative">
              <button
                type="button"
                onClick={() => store.setActiveId(l.id)}
                aria-pressed={selected}
                className={`w-full rounded-xl border p-2.5 text-left transition-all duration-150 ${
                  selected
                    ? "border-brand-400 bg-brand-50 shadow-sm shadow-brand-600/10"
                    : "border-line bg-white hover:border-brand-200 hover:shadow-sm"
                } ${l.visible ? "" : "opacity-60"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${l.appearance.color}1A`, color: l.appearance.color }}
                  >
                    {cat ? <cat.icon className="h-4 w-4" /> : <FiLayers />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink-900">
                      {l.label}
                    </span>
                    <span className="mt-0.5 block h-3.5 text-[11px] text-ink-400">
                      {l.loading ? (
                        <span className="inline-flex items-center gap-1 text-brand-700">
                          <FiLoader className="h-3 w-3 animate-spin" /> Loading\u2026
                        </span>
                      ) : l.error ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <FiAlertTriangle className="h-3 w-3" /> Load failed
                        </span>
                      ) : (
                        `${formatCount(l.filteredData.length)} locations`
                      )}
                    </span>
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={l.visible ? `Hide ${l.label}` : `Show ${l.label}`}
                    title={l.visible ? "Hide layer" : "Show layer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      store.toggleVisible(l.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        store.toggleVisible(l.id);
                      }
                    }}
                    className={`focusable flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      l.visible
                        ? "text-ink-600 hover:bg-white hover:text-brand-700"
                        : "bg-canvas text-ink-300 hover:text-ink-600"
                    }`}
                  >
                    {l.visible ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`${l.label} options`}
                    aria-haspopup="menu"
                    title="Layer options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuFor(menuFor === l.id ? null : l.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuFor(menuFor === l.id ? null : l.id);
                      }
                    }}
                    className={`focusable flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white hover:text-ink-700 ${
                      menuFor === l.id ? "!bg-white text-ink-700" : ""
                    }`}
                  >
                    <FiMoreVertical className="h-4 w-4" />
                  </span>
                </div>
              </button>
              {menuFor === l.id && (
                <LayerMenu
                  layer={l}
                  onClose={() => setMenuFor(null)}
                  actions={{
                    onSelect: store.setActiveId,
                    onAdd: (k) => {
                      const id = store.addLayer(k as never);
                      store.setActiveId(id);
                    },
                    onDuplicate: (id) => {
                      const nid = store.duplicateLayer(id);
                      if (nid) store.setActiveId(nid);
                    },
                    onRemove: store.removeLayer,
                    onToggleVisible: store.toggleVisible,
                    onZoom: store.zoomToLayer,
                    onClearFilters: store.clearFilters,
                  }}
                />
              )}
            </div>
          );
        })}

        {layers.length === 0 && (
          <div className="anim-fade-in py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-canvas">
              <FiLayers className="h-6 w-6 text-ink-300" />
            </div>
            <div className="text-[13px] font-semibold text-ink-800">No layers yet</div>
            <p className="mx-auto mt-1 max-w-[220px] text-[12px] leading-snug text-ink-400">
              Add a category to start exploring spatial patterns.
            </p>
            <button type="button" onClick={() => setAdding(true)} className="btn-primary mx-auto mt-3">
              <FiPlus className="h-3.5 w-3.5" aria-hidden /> Create Layer
            </button>
          </div>
        )}
      </div>

      {adding && (
        <AddLayerPicker
          activeKeys={activeKeys}
          onAdd={(k) => {
            const id = store.addLayer(k as never);
            if (id) store.setActiveId(id);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

interface LayerMenuActions {
  onSelect: (id: string) => void;
  onAdd: (key: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onZoom: (id: string) => void;
  onClearFilters: (id: string) => void;
}

function LayerMenu({
  layer,
  onClose,
  actions,
}: {
  layer: import("../data").ComputedLayer;
  onClose: () => void;
  actions: LayerMenuActions;
}) {
  const [confirming, setConfirming] = useState(false);
  const item =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-canvas focusable";
  return (
    <div
      className="anim-scale-in absolute right-1 top-8 z-30 w-48 rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-ink-900/8"
      role="menu"
      aria-label={`${layer.label} layer actions`}
    >
      {!confirming ? (
        <>
          <button type="button" role="menuitem" className={item} onClick={() => { actions.onSelect(layer.id); onClose(); }}>
            <FiLayers className="h-3.5 w-3.5 text-ink-400" /> Edit Layer
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => { actions.onDuplicate(layer.id); onClose(); }}>
            <FiCopy className="h-3.5 w-3.5 text-ink-400" /> Duplicate
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => { actions.onZoom(layer.id); onClose(); }}>
            <FiCrosshair className="h-3.5 w-3.5 text-ink-400" /> Zoom to Layer
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => { actions.onToggleVisible(layer.id); onClose(); }}>
            {layer.visible ? (
              <><FiEyeOff className="h-3.5 w-3.5 text-ink-400" /> Hide Layer</>
            ) : (
              <><FiEye className="h-3.5 w-3.5 text-ink-400" /> Show Layer</>
            )}
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => { actions.onClearFilters(layer.id); onClose(); }}>
            <FiFilter className="h-3.5 w-3.5 text-ink-400" /> Clear Filters
          </button>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            className={`${item} !text-red-600 hover:!bg-red-50`}
            onClick={() => setConfirming(true)}
          >
            <FiTrash2 className="h-3.5 w-3.5" /> Remove Layer
          </button>
        </>
      ) : (
        <div className="p-1">
          <div className="text-[12px] font-semibold text-ink-900">Remove {layer.label} layer?</div>
          <p className="mt-0.5 mb-2 text-[11px] leading-snug text-ink-500">
            Removes it from the map but not the underlying dataset.
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              className="focusable flex-1 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:bg-canvas"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="focusable flex-1 rounded-lg bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700"
              onClick={() => { actions.onRemove(layer.id); onClose(); }}
            >
              Remove Layer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddLayerPicker({
  activeKeys,
  onAdd,
  onClose,
}: {
  activeKeys: Set<string>;
  onAdd: (key: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    listRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cats = CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-ink-900/25 px-4 pt-16 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={listRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add map layer"
        className="anim-scale-in w-full max-w-xs rounded-2xl border border-line bg-white p-3 shadow-2xl shadow-ink-900/10"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories\u2026"
          aria-label="Search categories"
          className="focusable mb-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] outline-none transition-colors focus:border-brand-400 focus:bg-white"
        />
        <div className="max-h-64 overflow-y-auto">
          {cats.map((c) => {
            const added = activeKeys.has(c.key);
            return (
              <button
                key={c.key}
                type="button"
                disabled={added}
                onClick={() => {
                  onAdd(c.key);
                  onClose();
                }}
                className={`focusable flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  added ? "cursor-default opacity-50" : "hover:bg-brand-50"
                }`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${c.color}1A`, color: c.color }}
                >
                  <c.icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 text-[13px] font-medium text-ink-900">{c.label}</span>
                {added ? (
                  <span className="text-[11px] font-medium text-emerald-600">\u2713 Added</span>
                ) : (
                  <FiPlus className="h-3.5 w-3.5 text-ink-300" />
                )}
              </button>
            );
          })}
          {cats.length === 0 && (
            <p className="px-2 py-6 text-center text-[12px] text-ink-400">
              No categories match \u201C{query}\u201D
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
