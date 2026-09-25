"use client";

import { useRef, useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import type { FilterDef, FilterValue, LocationData } from "../data";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-medium text-ink-500">{children}</span>
  );
}

function FilterSelect({
  def,
  value,
  options,
  onPick,
}: {
  def: FilterDef;
  value: FilterValue;
  options: string[];
  onPick: (v: string) => void;
}) {
  const picked = typeof value === "string" ? value : "";
  return (
    <label className="block">
      <Label>{def.label}</Label>
      <div className="relative">
        <select
          value={picked}
          onChange={(e) => onPick(e.target.value)}
          className="focusable w-full appearance-none rounded-lg border border-line bg-white py-2 pl-3 pr-8 text-[13px] text-ink-900 transition-colors hover:border-brand-300 focus:border-brand-400"
        >
          <option value="">All {def.label}s</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
      </div>
    </label>
  );
}

function FilterMulti({
  def,
  value,
  options,
  onPick,
}: {
  def: FilterDef;
  value: FilterValue;
  options: string[];
  onPick: (next: string[]) => void;
}) {
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
  return (
    <div>
      <Label>{def.label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.length === 0 && (
          <span className="text-[11px] text-ink-400">No options in dataset</span>
        )}
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() =>
                onPick(on ? selected.filter((x) => x !== o) : [...selected, o])
              }
              className={`focusable rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                on
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-line text-ink-500 hover:border-brand-300 hover:text-ink-700"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function clampNumber(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function stepDecimals(step: number) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/**
 * Dual-thumb range control.
 *
 * Both thumbs are plain spans driven by pointer events on the track — two
 * stacked native `<input type="range">` elements make the lower thumb
 * impossible to grab and misalign the track. Keyboard users can focus either
 * thumb and use arrow / page / home / end keys.
 */
function FilterRange({
  def,
  value,
  min,
  max,
  onPick,
}: {
  def: FilterDef;
  value: FilterValue;
  min: number;
  max: number;
  onPick: (v: [number, number]) => void;
}) {
  const step = def.step && def.step > 0 ? def.step : 1;
  const decimals = stepDecimals(step);
  const span = max - min || 1;

  /** Snap any value onto the slider's step grid, inside [min, max]. */
  const snap = (v: number) =>
    Number(
      clampNumber(min + Math.round((v - min) / step) * step, min, max).toFixed(
        decimals,
      ),
    );

  // Guard against stale / out-of-range values stored on the layer.
  const rawLo = Array.isArray(value) ? Number(value[0]) : min;
  const rawHi = Array.isArray(value) ? Number(value[1]) : max;
  const lo = clampNumber(Number.isFinite(rawLo) ? snap(rawLo) : min, min, max);
  const hi = clampNumber(Number.isFinite(rawHi) ? snap(rawHi) : max, lo, max);

  const pct = (v: number) => ((v - min) / span) * 100;
  const fmt = (v: number) => (def.format ? def.format(v) : String(v));
  const openEnded = def.max !== undefined;

  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"lo" | "hi" | null>(null);

  const valueAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    return snap(min + clampNumber((clientX - rect.left) / rect.width, 0, 1) * span);
  };

  const move = (which: "lo" | "hi", next: number) => {
    if (which === "lo") onPick([clampNumber(next, min, hi), hi]);
    else onPick([lo, clampNumber(next, lo, max)]);
  };

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = valueAt(e.clientX);
    // Grab whichever thumb sits closest to the pointer.
    const which: "lo" | "hi" = Math.abs(v - lo) <= Math.abs(v - hi) ? "lo" : "hi";
    setDrag(which);
    e.currentTarget.setPointerCapture(e.pointerId);
    move(which, which === "lo" ? Math.min(v, hi) : Math.max(v, lo));
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const v = valueAt(e.clientX);
    move(drag, drag === "lo" ? Math.min(v, hi) : Math.max(v, lo));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onThumbKey =
    (which: "lo" | "hi") => (e: React.KeyboardEvent<HTMLSpanElement>) => {
      const current = which === "lo" ? lo : hi;
      const jump = step * 10;
      let next: number;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          next = current - step;
          break;
        case "ArrowRight":
        case "ArrowUp":
          next = current + step;
          break;
        case "PageDown":
          next = current - jump;
          break;
        case "PageUp":
          next = current + jump;
          break;
        case "Home":
          next = which === "lo" ? min : lo;
          break;
        case "End":
          next = which === "lo" ? hi : max;
          break;
        default:
          return;
      }
      e.preventDefault();
      move(which, snap(clampNumber(next, min, max)));
    };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-ink-500">{def.label}</span>
        <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-brand-800">
          {fmt(lo)} – {fmt(hi)}
          {openEnded && hi >= max ? "+" : ""}
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={startDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        className="relative mt-2.5 mb-1 h-6 cursor-pointer touch-none select-none"
      >
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e6e7ec]" />
        <span
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${pct(lo)}%`, width: `${Math.max(0, pct(hi) - pct(lo))}%` }}
        />
        {(["lo", "hi"] as const).map((which) => {
          const v = which === "lo" ? lo : hi;
          return (
            <span
              key={which}
              role="slider"
              tabIndex={0}
              aria-label={`${def.label} ${which === "lo" ? "minimum" : "maximum"}`}
              aria-orientation="horizontal"
              aria-valuemin={which === "lo" ? min : lo}
              aria-valuemax={which === "lo" ? hi : max}
              aria-valuenow={v}
              aria-valuetext={fmt(v)}
              onKeyDown={onThumbKey(which)}
              className={`focusable pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-white shadow-[0_1px_4px_rgba(23,23,23,0.25)] transition-transform duration-150 ${
                drag === which ? "scale-[1.15]" : ""
              }`}
              style={{ left: `${pct(v)}%` }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] tabular-nums text-ink-400">
        <span>{fmt(min)}</span>
        <span>
          {fmt(max)}
          {openEnded ? "+" : ""}
        </span>
      </div>
    </div>
  );
}

/* ================================================================ */
/* Renders the dynamic filter set for one layer                     */
/* ================================================================ */

export function FilterSet({
  defs,
  data,
  filters,
  onChange,
}: {
  defs: FilterDef[];
  data: LocationData[];
  filters: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const set = (key: string, v: FilterValue) => {
    const next = { ...filters };
    if (v === undefined || isEmpty(defs.find((d) => d.key === key), v, data)) delete next[key];
    else next[key] = v;
    onChange(next);
  };

  const active = defs.filter((def) => !isEmpty(def, filters[def.key], data)).length;

  return (
    <div className="space-y-3.5">
      {defs.map((def) => {
        if (def.type === "range") {
          const max = Math.max(1, def.max ?? computeMax(def, data));
          const min = def.min ?? 0;
          return (
            <FilterRange
              key={def.key}
              def={def}
              value={filters[def.key] as FilterValue}
              min={min}
              max={max}
              onPick={(v) => set(def.key, v)}
            />
          );
        }
        const options = def.options?.(data) ?? [];
        if (def.type === "multiselect") {
          return (
            <FilterMulti
              key={def.key}
              def={def}
              value={filters[def.key] as FilterValue}
              options={options}
              onPick={(v) => set(def.key, v)}
            />
          );
        }
        return (
          <FilterSelect
            key={def.key}
            def={def}
            value={filters[def.key] as FilterValue}
            options={options}
            onPick={(v) => set(def.key, v)}
          />
        );
      })}

      {active > 0 && (
        <div className="flex items-center justify-between border-t border-line pt-2.5">
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-800">
            {active} active
          </span>
          <button
            type="button"
            onClick={() => onChange({})}
            className="focusable flex items-center gap-1 text-[11px] font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <FiX className="h-3 w-3" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

function isEmpty(def: FilterDef | undefined, v: unknown, data: LocationData[]): boolean {
  if (v === undefined) return true;
  if (def?.type === "select") return String(v).length === 0;
  if (def?.type === "multiselect") return Array.isArray(v) && v.length === 0;
  if (def?.type === "range" && Array.isArray(v)) {
    const min = def.min ?? 0;
    const max = def.max ?? computeMax(def, data);
    return Number(v[0]) <= min && Number(v[1]) >= max;
  }
  return false;
}

function computeMax(def: FilterDef, data: LocationData[]): number {
  let m = 0;
  for (const l of data) {
    const v = Number(def.accessor(l));
    if (!Number.isNaN(v) && v > m) m = v;
  }
  return m;
}