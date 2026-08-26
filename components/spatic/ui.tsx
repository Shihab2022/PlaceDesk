"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { SWATCHES } from "./data";

/* ---- Select (accessible, styled) ---- */
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-ink-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focusable w-full appearance-none rounded-lg border border-line bg-white py-2 pl-3 pr-8 text-[13px] text-ink-900 transition-colors hover:border-brand-300 focus:border-brand-500"
        >
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

/* ---- Toggle ---- */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle"}
      onClick={onChange}
      className={`focusable relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-brand-600" : "bg-[#d8dae2]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ---- Slider row ---- */
export function SliderRow({
  label,
  value,
  suffix,
  min = 0,
  max = 100,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-ink-500">{label}</span>
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-800">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

/* ---- Color swatch picker ---- */
export function SwatchPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-medium text-ink-500">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {SWATCHES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${label}: ${s}`}
            onClick={() => onChange(s)}
            className={`focusable h-6 w-6 rounded-full border-2 transition-transform duration-150 hover:scale-110 ${
              value.toLowerCase() === s.toLowerCase()
                ? "border-ink-900 ring-2 ring-brand-300 ring-offset-1"
                : "border-white shadow-sm"
            }`}
            style={{ background: s }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Collapsible section ---- */
export function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focusable flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-500">
          {title}
        </span>
        <FiChevronDown
          className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-200 ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Tooltip wrapper ---- */
export function IconTip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-ink-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}