"use client";

import { useId } from "react";
import {
  FiAlertTriangle,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiMaximize,
  FiRefreshCw,
} from "react-icons/fi";
import {
  CATEGORIES,
  CATEGORY_FILTERS,
  VISUALIZATION_TYPES,
  countActiveFilters,
  formatCount,
} from "../data";
import type { Appearance, ComputedLayer, FilterValue } from "../data";
import { FilterSet } from "../filters/FilterControls";
import { Section, SliderRow, SwatchPicker } from "../ui";

const VIZ_LABEL: Record<string, string> = {
  point: "Point",
  cluster: "Cluster",
  density: "Density",
  heatmap: "Heatmap",
  hexagon: "Hexagon",
  bubble: "Bubble",
};

function VizMini({ type, color }: { type: string; color: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = color;
  const gradId = `hm-${uid}`;
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
            <radialGradient id={gradId}>
              <stop offset="0" stopColor={c} stopOpacity="0.95" />
              <stop offset="0.7" stopColor={c} stopOpacity="0.4" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="14" r="12" fill={`url(#${gradId})`} />
          <circle cx="30" cy="21" r="8" fill={`url(#${gradId})`} opacity="0.6" />
          <circle cx="13" cy="20" r="6" fill={`url(#${gradId})`} opacity="0.5" />
        </>
      )}
      {type === "hexagon" && (
        <g fill={c}>
          <polygon points="11,15 15,12.5 19,12.5 23,15 19,17.5 15,17.5" opacity="0.7" />
          <polygon points="18,8 22,5.5 26,5.5 30,8 26,10.5 22,10.5" opacity="0.5" />
          <polygon points="25,17 29,14.5 33,14.5 37,17 33,19.5 29,19.5" opacity="0.9" />
        </g>
      )}
      {type === "bubble" && (
        <g stroke={c} fill="#fff">
          <circle cx="16" cy="17" r="5.5" strokeWidth="1.6" />
          <circle cx="29" cy="11" r="3.5" strokeWidth="1.4" opacity="0.75" />
          <circle cx="32" cy="21" r="2.4" strokeWidth="1.3" opacity="0.55" />
        </g>
      )}
    </svg>
  );
}

export interface LayerPanelProps {
  layer: ComputedLayer;
  cityLabel: string;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      visualizationType?: ComputedLayer["visualizationType"];
      appearance?: Partial<Appearance>;
    },
  ) => void;
  onSetFilters: (id: string, filters: Record<string, FilterValue>) => void;
  onClearFilters: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onZoom: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

function HeaderAction({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas ${
        danger ? "hover:text-red-600" : "hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

export interface LayerPanelProps {
  layer: ComputedLayer;
  cityLabel: string;
  onUpdate: (
    id: string,
    patch: {
      name?: string;
      visualizationType?: ComputedLayer["visualizationType"];
      appearance?: Partial<Appearance>;
    },
  ) => void;
  onSetFilters: (id: string, filters: Record<string, FilterValue>) => void;
  onClearFilters: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onZoom: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export default function LayerPanel(props: LayerPanelProps) {
  const { layer, cityLabel } = props;
  const id = layer.id;
  const category = CATEGORIES.find((c) => c.key === layer.categoryKey);
  const Icon = category?.icon;
  const color = layer.appearance.color;

  const defs = CATEGORY_FILTERS[layer.categoryKey] ?? [];
  const activeFilters = layer.dataLoaded ? countActiveFilters(defs, layer.filters, layer.data) : 0;
  const shown = layer.filteredData.length;
  const total = layer.data.length;
  const districts = new Set(layer.filteredData.map((l) => l.town_name)).size;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ---- Panel header ---- */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-4 py-3">
        {layer.loading || !Icon ? (
          <span className="skeleton h-8 w-8 rounded-lg" />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: `${color}1A`, color }}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-tight text-ink-900">
            {category?.label ?? layer.label} Layer
          </div>
          <div className="text-[11px] text-ink-400">{cityLabel}</div>
        </div>
        <HeaderAction label="Zoom to layer" onClick={() => props.onZoom(id)}>
          <FiMaximize className="h-3.5 w-3.5" />
        </HeaderAction>
        <HeaderAction
          label={layer.visible ? "Hide layer" : "Show layer"}
          onClick={() => props.onToggleVisible(id)}
        >
          {layer.visible ? <FiEye className="h-3.5 w-3.5" /> : <FiEyeOff className="h-3.5 w-3.5" />}
        </HeaderAction>
        <HeaderAction label="Duplicate layer" onClick={() => props.onDuplicate(id)}>
          <FiCopy className="h-3.5 w-3.5" />
        </HeaderAction>
        <HeaderAction label="Remove layer" danger onClick={() => props.onRemove(id)}>
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </HeaderAction>
      </div>

      {/* ---- Loading / error banners (scoped to this layer only) ---- */}
      {layer.loading && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />
          <span className="text-[12px] font-medium text-ink-600">Loading dataset…</span>
          <span className="skeleton ml-auto h-2 w-16 rounded-full" />
        </div>
      )}
      {layer.error && !layer.loading && (
        <div
          role="alert"
          className="anim-fade-in mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
        >
          <FiAlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <span className="flex-1 truncate text-[12px] font-medium text-red-700">
            Unable to load {category?.label ?? "dataset"}
          </span>
          <button
            type="button"
            onClick={() => props.onRetry(id)}
            className="focusable flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <FiRefreshCw className="h-3 w-3" /> Try again
          </button>
        </div>
      )}

      {!layer.loading && !layer.error && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ---- Layer name ---- */}
          <div className="px-4 pt-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink-500">Layer name</span>
              <input
                value={layer.name}
                onChange={(e) => props.onUpdate(id, { name: e.target.value })}
                aria-label="Layer name"
                className="focusable w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink-900 transition-colors hover:border-brand-300 focus:border-brand-400"
              />
            </label>
          </div>

          {/* ---- Visualization ---- */}
          <Section title="Visualization" defaultOpen>
            <div className="grid grid-cols-3 gap-2">
              {VISUALIZATION_TYPES.map((v) => {
                const active = layer.visualizationType === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => props.onUpdate(id, { visualizationType: v })}
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
          </Section>

          {/* ---- Filters ---- */}
          <Section
            title="Filters"
            badge={
              activeFilters > 0 ? (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                  {activeFilters} active
                </span>
              ) : undefined
            }
            action={
              activeFilters > 0 ? (
                <button
                  type="button"
                  onClick={() => props.onClearFilters(id)}
                  className="focusable rounded-md px-1.5 py-0.5 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Clear all
                </button>
              ) : undefined
            }
          >
            <div className="mb-2 text-[11px] font-medium text-ink-400">
              {total > 0 ? `${formatCount(shown)} / ${formatCount(total)} locations` : "No data yet"}
            </div>
            <FilterSet
              defs={defs}
              filters={layer.filters}
              data={layer.data}
              onChange={(next) =>
                props.onSetFilters(id, next as Record<string, FilterValue>)
              }
            />
          </Section>

          {/* ---- Appearance ---- */}
          <Section title="Appearance">
            <SliderRow
              label="Opacity"
              value={layer.appearance.opacity}
              min={20}
              max={100}
              step={5}
              format={(v) => `${v}%`}
              onChange={(v) => props.onUpdate(id, { appearance: { opacity: v } })}
            />
            <SliderRow
              label="Point size"
              value={layer.appearance.radius}
              min={3}
              max={24}
              step={1}
              format={(v) => `${v} px`}
              onChange={(v) => props.onUpdate(id, { appearance: { radius: v } })}
            />
            <SliderRow
              label="Border width"
              value={layer.appearance.lineWidth}
              min={0}
              max={6}
              step={1}
              format={(v) => (v === 0 ? "None" : `${v} px`)}
              onChange={(v) => props.onUpdate(id, { appearance: { lineWidth: v } })}
            />
            <SwatchPicker
              label="Layer color"
              value={color}
              onChange={(c) => props.onUpdate(id, { appearance: { color: c } })}
            />
          </Section>

          {/* ---- Statistics ---- */}
          <Section title="Statistics" defaultOpen>
            {layer.dataLoaded && layer.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[17px] font-semibold tabular-nums text-ink-900">
                    {formatCount(shown)}
                  </div>
                  <div className="text-[10.5px] text-ink-400">Visible locations</div>
                </div>
                <div className="rounded-xl border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[17px] font-semibold tabular-nums text-ink-900">
                    {districts}
                  </div>
                  <div className="text-[10.5px] text-ink-400">Districts covered</div>
                </div>
                <div className="rounded-xl border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[17px] font-semibold tabular-nums text-ink-900">
                    {activeFilters}
                  </div>
                  <div className="text-[10.5px] text-ink-400">Filters active</div>
                </div>
                <div className="rounded-xl border border-line bg-canvas px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
                      style={{ background: color }}
                    />
                    <span className="text-[13px] font-medium text-ink-700">{VIZ_LABEL[layer.visualizationType]}</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-ink-400">Rendered as</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
              </div>
            )}
          </Section>
          <div className="h-4" />



        </div>
      )}
    </div>
  );
}


