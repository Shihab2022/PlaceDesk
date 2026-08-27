"use client";

import { useMemo } from "react";
import { FiLayers } from "react-icons/fi";
import type { ComputedLayer } from "../data";

/** Compact dynamic legend for all visible layers on the map. */
export default function MapLegend({
  layers,
  onSelect,
}: {
  layers: ComputedLayer[];
  onSelect?: (id: string) => void;
}) {
  const visible = useMemo(
    () =>
      layers.filter((l) => l.visible && !l.error && (l.loading || l.filteredData.length > 0)),
    [layers],
  );

  if (visible.length === 0) return null;

  return (
    <div
      className="glass pointer-events-auto rounded-xl border border-line/70 bg-white/85 px-3 py-2.5 shadow-lg shadow-ink-900/5"
      role="region"
      aria-label="Map legend"
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        <FiLayers className="h-3 w-3" aria-hidden /> Map Layers
      </div>
      <ul className="space-y-1">
        {visible.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => onSelect?.(l.id)}
              className="focusable flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-brand-50"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: l.appearance.color,
                  opacity: l.appearance.opacity / 100,
                  boxShadow: `0 0 0 2px ${l.appearance.color}26`,
                }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-700">
                {l.label}
              </span>
              <span className="text-[10.5px] font-semibold tabular-nums text-ink-500">
                {l.loading ? "…" : l.filteredData.length.toLocaleString("en-US")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
