"use client";

import {
  FiCopy,
  FiDelete,
  FiEye,
  FiMoreHorizontal,
} from "react-icons/fi";
import { FILTER_OPTIONS, MAP_THEMES, VISUALIZATIONS } from "../../spatic/data";
import {
  Section,
  Select,
  SliderRow,
  SwatchPicker,
} from "../../spatic/ui";

export interface LayerFiltersState {
  subcategory: string;
  brandType: string;
  storeType: string;
  revenueMin: number;
  revenueMax: number;
  size: string;
  openFrom: string;
  openTo: string;
}

export interface LayerStyleState {
  name: string;
  visualization: string;
  opacity: number;
  radius: number;
  borderWidth: number;
  fillColor: string;
  borderColor: string;
  mapTheme: string;
}

interface LayerPanelProps {
  categoryLabel: string;
  style: LayerStyleState;
  onStyle: (s: LayerStyleState) => void;
  filters: LayerFiltersState;
  onFilters: (f: LayerFiltersState) => void;
}

/* ------------- miniature visual previews ------------- */
function VizMini({ type }: { type: string }) {
  const dotColor = "#7C4DFF";
  return (
    <svg viewBox="0 0 44 32" className="h-8 w-11" aria-hidden="true">
      {type === "Point" && (
        <>
          <circle cx="14" cy="16" r="4.5" fill={dotColor} opacity="0.25" />
          <circle cx="14" cy="16" r="2.6" fill="#fff" stroke={dotColor} strokeWidth="1.6" />
          <circle cx="28" cy="12" r="2.4" fill="#fff" stroke={dotColor} strokeWidth="1.5" opacity="0.7" />
          <circle cx="32" cy="22" r="2.2" fill="#fff" stroke={dotColor} strokeWidth="1.4" opacity="0.5" />
        </>
      )}
      {type === "Cluster" && (
        <>
          <circle cx="22" cy="16" r="8" fill={dotColor} opacity="0.18" />
          <circle cx="22" cy="16" r="5" fill={dotColor} opacity="0.35" />
          <circle cx="22" cy="16" r="2.6" fill="#fff" stroke={dotColor} strokeWidth="1.6" />
          <circle cx="14" cy="9" r="2.2" fill={dotColor} opacity="0.7" />
          <circle cx="31" cy="24" r="2.2" fill={dotColor} opacity="0.7" />
        </>
      )}
      {type === "Density" && (
        <g fill={dotColor}>
          <circle cx="22" cy="15" r="3" opacity="0.9" />
          <circle cx="16" cy="17" r="2.4" opacity="0.6" />
          <circle cx="28" cy="14" r="2.4" opacity="0.6" />
          <circle cx="21" cy="22" r="2.6" opacity="0.75" />
          <circle cx="12" cy="12" r="2" opacity="0.4" />
          <circle cx="31" cy="20" r="2" opacity="0.45" />
          <circle cx="18" cy="9" r="2" opacity="0.4" />
          <circle cx="27" cy="9" r="1.8" opacity="0.4" />
        </g>
      )}
      {type === "Heatmap" && (
        <>
          <defs>
            <radialGradient id={`hm-${1}`}>
              <stop offset="0" stopColor="#7C4DFF" stopOpacity="0.9" />
              <stop offset="0.7" stopColor="#7C4DFF" stopOpacity="0.4" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="15" r="11" fill={`url(#hm-${1})`} />
          <circle cx="29" cy="21" r="9" fill={`url(#hm-${1})`} opacity="0.6" />
          <circle cx="13" cy="22" r="7" fill={`url(#hm-${1})`} opacity="0.5" />
        </>
      )}
      {type === "Hexagon" && (
        <g fill={dotColor}>
          <polygon points="11,16 15,13.5 19,13.5 23,16 19,18.5 15,18.5" opacity="0.7" />
          <polygon points="19,9 23,6.5 27,6.5 31,9 27,11.5 23,11.5" opacity="0.5" />
          <polygon points="20,20 24,17.5 28,17.5 32,20 28,22.5 24,22.5" opacity="0.85" />
          <polygon points="24,11 28,8.5 32,8.5 36,11 32,13.5 28,13.5" opacity="0.4" />
        </g>
      )}
      {type === "Bubble" && (
        <>
          <circle cx="18" cy="15" r="7" fill="#fff" stroke={dotColor} strokeWidth="1.6" opacity="0.85" />
          <circle cx="20" cy="16" r="2" fill={dotColor} />
          <circle cx="30" cy="22" r="4" fill="#fff" stroke={dotColor} strokeWidth="1.4" opacity="0.6" />
          <circle cx="30" cy="22" r="1.2" fill={dotColor} />
          <circle cx="28" cy="9" r="3" fill="#fff" stroke={dotColor} strokeWidth="1.4" opacity="0.6" />
        </>
      )}
      {/* coordinate grid backdrop for all */}
      <g stroke="rgba(91,47,191,0.12)" strokeWidth="0.6">
        <path d="M11 0v24M22 0v24M33 0v24" />
        <path d="M0 8h44M0 16h44M0 24h44" />
      </g>
    </svg>
  );
}

export default function LayerPanel({
  categoryLabel,
  style,
  onStyle,
  filters,
  onFilters,
}: LayerPanelProps) {
  const set = (patch: Partial<LayerStyleState>) => onStyle({ ...style, ...patch });
  const setF = (patch: Partial<LayerFiltersState>) =>
    onFilters({ ...filters, ...patch });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-2.5 rounded-full" style={{ background: style.fillColor }} />
          <h2 className="text-[15px] font-semibold text-ink-900">
            {categoryLabel} Layer
          </h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Duplicate layer"
            title="Duplicate"
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-brand-700"
          >
            <FiCopy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Hide layer"
            title="Hide"
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-brand-700"
          >
            <FiEye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete layer"
            title="Delete"
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas hover:text-red-600"
          >
            <FiDelete className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="More layer actions"
            title="More"
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-canvas"
          >
            <FiMoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pb-4">
        {/* Layer name */}
        <div className="px-4 pt-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink-500">
              Layer name
            </span>
            <input
              value={style.name}
              onChange={(e) => set({ name: e.target.value })}
              className="focusable w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink-900 focus:border-brand-400"
              aria-label="Layer name"
            />
          </label>
        </div>

        {/* Visualization */}
        <div className="px-4 pt-2">
          <span className="mb-2 block text-[11px] font-medium text-ink-500">
            Visualization
          </span>
          <div className="grid grid-cols-3 gap-2">
            {VISUALIZATIONS.map((v) => {
              const active = style.visualization === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set({ visualization: v })}
                  aria-pressed={active}
                  className={`focusable flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all duration-150 ${
                    active
                      ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-600/10"
                      : "border-line bg-white hover:border-brand-300 hover:bg-canvas"
                  }`}
                >
                  <VizMini type={v} />
                  <span
                    className={`text-[11px] font-medium ${
                      active ? "text-brand-800" : "text-ink-500"
                    }`}
                  >
                    {v}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <Section title="Filters">
          <Select
            label="Category"
            value={categoryLabel}
            options={[categoryLabel]}
            onChange={() => {}}
          />
          <Select
            label="Subcategory"
            value={filters.subcategory}
            options={FILTER_OPTIONS.subcategory}
            onChange={(v) => setF({ subcategory: v })}
          />
          <Select
            label="Brand Type"
            value={filters.brandType}
            options={FILTER_OPTIONS.brandType}
            onChange={(v) => setF({ brandType: v })}
          />
          <Select
            label="Store Type"
            value={filters.storeType}
            options={FILTER_OPTIONS.storeType}
            onChange={(v) => setF({ storeType: v })}
          />

          <div>
            <span className="mb-1 block text-[11px] font-medium text-ink-500">
              Revenue Range
            </span>
            <div className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-medium text-ink-700">
              <span>৳{filters.revenueMin}M</span>
              <span className="text-ink-400">—</span>
              <span>
                {filters.revenueMax >= 50 ? "৳50M+" : `৳${filters.revenueMax}M`}
              </span>
            </div>
            <div className="relative mt-3 h-4">
              <div
                className="pointer-events-none absolute bottom-1.5 h-1 rounded-full bg-brand-300"
                style={{
                  left: `${(filters.revenueMin / 50) * 100}%`,
                  width: `${((filters.revenueMax - filters.revenueMin) / 50) * 100}%`,
                }}
              />
              <input
                type="range"
                min={0}
                max={50}
                value={filters.revenueMin}
                onChange={(e) =>
                  setF({ revenueMin: Math.min(Number(e.target.value), filters.revenueMax - 2) })
                }
                aria-label="Minimum revenue"
                className="absolute inset-x-0 bottom-0 z-10 w-full"
              />
              <input
                type="range"
                min={0}
                max={50}
                value={filters.revenueMax}
                onChange={(e) =>
                  setF({ revenueMax: Math.max(Number(e.target.value), filters.revenueMin + 2) })
                }
                aria-label="Maximum revenue"
                className="absolute inset-x-0 bottom-0 z-20 w-full"
              />
            </div>
          </div>

          <Select
            label="Store Size"
            value={filters.size}
            options={FILTER_OPTIONS.size}
            onChange={(v) => setF({ size: v })}
          />

          <div>
            <span className="mb-1 block text-[11px] font-medium text-ink-500">
              Opening Date
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.openFrom}
                onChange={(e) => setF({ openFrom: e.target.value })}
                aria-label="Opening date from"
                className="focusable w-full rounded-lg border border-line bg-white px-2 py-1.5 text-[12px] text-ink-700"
              />
              <span className="text-ink-400">to</span>
              <input
                type="date"
                value={filters.openTo}
                onChange={(e) => setF({ openTo: e.target.value })}
                aria-label="Opening date to"
                className="focusable w-full rounded-lg border border-line bg-white px-2 py-1.5 text-[12px] text-ink-700"
              />
            </div>
          </div>
        </Section>

        {/* Map styling */}
        <Section title="Map Style">
          <SliderRow
            label="Opacity"
            value={style.opacity}
            suffix="%"
            onChange={(v) => set({ opacity: v })}
          />
          <SliderRow
            label="Point Radius"
            value={style.radius}
            suffix=" px"
            min={4}
            max={28}
            onChange={(v) => set({ radius: v })}
          />
          <SliderRow
            label="Border Width"
            value={style.borderWidth}
            suffix=" px"
            min={0}
            max={8}
            onChange={(v) => set({ borderWidth: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <SwatchPicker
              label="Fill"
              value={style.fillColor}
              onChange={(v) => set({ fillColor: v })}
            />
            <SwatchPicker
              label="Border"
              value={style.borderColor}
              onChange={(v) => set({ borderColor: v })}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-ink-500">
              Map Theme
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {MAP_THEMES.map((t) => {
                const active = style.mapTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set({ mapTheme: t.id })}
                    aria-pressed={active}
                    className={`focusable rounded-lg border px-1 py-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-line text-ink-500 hover:border-brand-300 hover:text-ink-900"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>
        </div>
      </div>
  );
}