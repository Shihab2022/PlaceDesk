"use client";

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
  const selected = Array.isArray(value) ? value : [];
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
  const cur: [number, number] = Array.isArray(value)
    ? [(value[0] as number) || min, (value[1] as number) || max]
    : [min, max];
  const fmt = (v: number) => (def.format ? def.format(v) : String(v));
  return (
    <div>
      <Label>{def.label}</Label>
      <div className="flex items-center justify-between rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink-700">
        <span>{fmt(cur[0])}</span>
        <span className="text-ink-400">—</span>
        <span>{cur[1] >= max ? `${fmt(cur[1])}+` : fmt(cur[1])}</span>
      </div>
      <div className="relative mt-3 h-4">
        <div
          className="pointer-events-none absolute bottom-1.5 h-1 rounded-full bg-brand-300"
          style={{
            left: `${((cur[0] - min) / (max - min || 1)) * 100}%`,
            width: `${((cur[1] - cur[0]) / (max - min || 1)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={def.step ?? 1}
          value={cur[0]}
          onChange={(e) =>
            onPick([Math.min(Number(e.target.value), cur[1] - (def.step ?? 1)), cur[1]])
          }
          aria-label={`${def.label} (minimum)`}
          className="absolute inset-x-0 bottom-0 z-10 w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={def.step ?? 1}
          value={cur[1]}
          onChange={(e) =>
            onPick([cur[0], Math.max(Number(e.target.value), cur[0] + (def.step ?? 1))])
          }
          aria-label={`${def.label} (maximum)`}
          className="absolute inset-x-0 bottom-0 z-20 w-full"
        />
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
    if (v === undefined || isEmpty(defs.find((d) => d.key === key), v)) delete next[key];
    else next[key] = v;
    onChange(next);
  };

  const active = defs.filter((def) => !isEmpty(def, filters[def.key])).length;

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

function isEmpty(def: FilterDef | undefined, v: unknown): boolean {
  if (v === undefined) return true;
  if (def?.type === "select") return String(v).length === 0;
  if (def?.type === "multiselect") return Array.isArray(v) && v.length === 0;
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