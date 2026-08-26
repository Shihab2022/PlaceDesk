"use client";

import { FiCopy, FiMaximize, FiEye, FiEyeOff } from "react-icons/fi";
import { CATEGORY_FILTERS, VISUALIZATION_TYPES } from "../data";
import type { Appearance, LayerState, LocationData } from "../data";
import { FilterSet } from "../filters/FilterControls";
import { Section, SliderRow, SwatchPicker } from "../ui";

type ComputedLayer = LayerState & { filteredData: LocationData[] };

interface LayerPanelProps {
  layer: ComputedLayer | null;
  cityLabel: string;
  onUpdate: (
    id: string,
    p: {
      name?: string;
      visualizationType?: LayerState["visualizationType"];
      appearance?: Partial<Appearance>;
    },
  ) => void;
  onSetFilters: (id: string, filters: Record<string, unknown>) => void;
  onDuplicate: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onZoom: (id: string) => void;
  onRemove: (id: string) => void;
}

const VIZ_LABEL: Record<string, string> = {
  point: "Point",
  cluster: "Cluster",
  density: "Density",
  heatmap: "Heatmap",
  hexagon: "Hexagon",
  bubble: "Bubble",
};

function VizMini({ type, color }: { type: string; color: string }) {
  const c = color;
  return (
    <svg viewBox="0 0 44 30" className="h-8 w-11" aria-hidden="true">
      {type === "point" && (
        <g>
          <circle cx="14" cy="15" r="5" fill={c} opacity="0.22" />
          <circle cx="14" cy="15" r="2.6" fill="#fff" stroke={c} strokeWidth="1.6" />
          <circle cx="28" cy="12" r="2.2" fill="#fff" stroke={c} strokeWidth="1.5" opacity="0.7" />
          <circle cx="31" cy="21" r="2" fill="#fff" stroke={c} strokeWidth="1.4" opacity="0.5" />
        </g>
      )}
      {type === "cluster" && (
        <g>
          <circle cx="20" cy="15" r="8" fill={c} opacity="0.16" />
          <circle cx="20" cy="15" r="5" fill={c} opacity="0.35" />
          <circle cx="20" cy="15" r="2.6" fill="#fff" stroke={c} strokeWidth="1.6" />
          <circle cx="14" cy="8" r="2" fill={c} opacity="0.7" />
          <circle cx="30" cy="23" r="2.2" fill={c} opacity="0.7" />
          <circle cx="31" cy="10" r="1.8" fill={c} opacity="0.6" />
        </g>
      )}
      {type === "density" && (
        <g fill={c}>
          <circle cx="20" cy="14" r="3" opacity="0.9" />
          <circle cx="14" cy="16" r="2.4" opacity="0.55" />
          <circle cx="27" cy="13" r="2.4" opacity="0.55" />
          <circle cx="19" cy="21" r="2.6" opacity="0.7" />
          <circle cx="11" cy="11" r="2" opacity="0.4" />
          <circle cx="30" cy="19" r="2" opacity="0.4" />
          <circle cx="17" cy="8" r="1.8" opacity="0.4" />
          <circle cx="26" cy="8" r="1.8" opacity="0.35" />
        </g>
      )}
      {type === "heatmap" && (
        <>
          <defs>
            <radialGradient id="hmc">
              <stop offset="0" stopColor={c} stopOpacity="0.95" />
              <stop offset="0.7" stopColor={c} stopOpacity="0.4" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="14" r="12" fill="url(#hmc)" />
          <circle cx="30" cy="21" r="8" fill="url(#hmc)" opacity="0.6" />
          <circle cx="13" cy="20" r="6" fill="url(#hmc)" opacity="0.5" />
        </>
      )}
      {type === "hexagon" && (
        <g fill={c}>
          <polygon points="11,15 15,12.5 19,12.5 23,15 19,17.5 15,17.5" opacity="0.7" />
          <polygon points="18,8 22,5.5 26,5.5 30,8 26,10.5 22,10.5" opacity="0.45" />
          <polygon points="20,19 24,16.5 28,16.5 32,19 28,21.5 24,21.5" opacity="0.9" />
          <polygon points="25,10 29,7.5 33,7.5 37,10 33,12.5 29,12.5" opacity="0.4" />
        </g>
      )}
      {type === "bubble" && (
        <g>
          <circle cx="17" cy="14" r="7" fill="#fff" stroke={c} strokeWidth="1.6" opacity="0.85" />
          <circle cx="19" cy="15" r="2" fill={c} />
          <circle cx="29" cy="21" r="4" fill="#fff" stroke={c} strokeWidth="1.4" opacity="0.6" />
          <circle cx="29" cy="21" r="1.3" fill={c} />
          <circle cx="27" cy="8" r="3" fill="#fff" stroke={c} strokeWidth="1.4" opacity="0.6" />
          <circle cx="27" cy="8" r="1" fill={c} />
        </g>
      )}
      <g stroke="rgba(91,47,191,0.12)" strokeWidth="0.6">
        <path d="M11 0v24M22 0v24M33 0v24" />
        <path d="M0 8h44M0 16h44M0 24h44" />
      </g>
    </svg>
  );
}

/* ---- small statistics ---- */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas px-3 py-2">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink-900">
        {value}
      </div>
    </div>
  );
}

export default function LayerPanel({
  layer,
  cityLabel,
  onUpdate,
  onSetFilters,
  onDuplicate,
  onToggleVisible,
  onZoom,
  onRemove,
}: LayerPanelProps) {
  if (!layer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas text-brand-600">
          <FiMaximize className="h-5 w-5" />
        </div>
        <p className="mt-3 text-[12px] font-medium text-ink-700">No layer selected</p>
        <p className="mt-1 text-[11px] text-ink-400">
          Select a layer from the manager to configure it.
        </p>
      </div>
    );
  }

  const id = layer.id;
  const color = layer.appearance.color;
  const defs = CATEGORY_FILTERS[layer.categoryKey] ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-2.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-ink-900">
              {layer.label} Layer
            </h2>
            <p className="truncate text-[10px] text-ink-400">City · {cityLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Duplicate layer"
            title="Duplicate"
            onClick={() => onDuplicate(id)}
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-brand-700"
          >
            <FiCopy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Zoom to layer"
            title="Zoom to layer"
            onClick={() => onZoom(id)}
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-brand-700"
          >
            <FiMaximize className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={layer.visible ? "Hide layer" : "Show layer"}
            title={layer.visible ? "Hide layer" : "Show layer"}
            onClick={() => onToggleVisible(id)}
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-brand-700"
          >
            {layer.visible ? (
              <FiEye className="h-3.5 w-3.5" />
            ) : (
              <FiEyeOff className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            aria-label="Remove layer"
            title="Remove layer"
            onClick={() => onRemove(id)}
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-red-600"
          >
            <FiCopy className="hidden" />
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Layer name */}
        <div className="px-4 pt-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink-500">
              Layer name
            </span>
            <input
              value={layer.name}
              onChange={(e) => onUpdate(id, { name: e.target.value })}
              className="focusable w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink-900 focus:border-brand-400"
              aria-label="Layer name"
            />
          </label>
        </div>

        {/* Visualization */}
        <div className="px-4 pt-4">
          <span className="mb-2 block text-[11px] font-medium text-ink-500">
            Visualization
          </span>
          <div className="grid grid-cols-3 gap-2">
            {VISUALIZATION_TYPES.map((v) => {
              const active = layer.visualizationType === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdate(id, { visualizationType: v })}
                  aria-pressed={active}
                  className={`focusable flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all duration-150 ${
                    active
                      ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-600/10"
                      : "border-line bg-white hover:border-brand-300 hover:bg-canvas"
                  }`}
                >
                  <VizMini type={v} color={color} />
                  <span
                    className={`text-[11px] font-medium ${
                      active ? "text-brand-800" : "text-ink-500"
                    }`}
                  >
                    {VIZ_LABEL[v]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>