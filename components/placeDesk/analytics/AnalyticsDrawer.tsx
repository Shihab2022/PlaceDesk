"use client";

import { FiChevronUp } from "react-icons/fi";

export interface DrawerSlice {
  label: string;
  value: number;
  color: string;
}

interface AnalyticsDrawerProps {
  expanded: boolean;
  onToggle: () => void;
  /** Total visible locations label e.g. "3,842" */
  totalLabel: string;
  /** One slice per visible layer. */
  byLayer: DrawerSlice[];
  /** Top districts across visible layers. */
  topDistricts: { name: string; pct: number }[];
  delta: string;
  districtsCovered: number;
}

const GROWTH = [2, 3, 3, 5, 6, 8, 9, 12, 11, 13, 15, 18, 17, 20, 23];


function MiniBar({ data }: { data: DrawerSlice[] }) {
  const max = Math.max(...data.map((c) => c.value), 1);
  return (
    <div className="space-y-1.5">
      {data.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className="w-20 truncate text-[10px] text-ink-500">{c.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(c.value / max) * 100}%`, background: c.color }}
            />
          </div>
          <span className="w-7 text-right text-[10px] tabular-nums text-ink-400">
            {c.value}
          </span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="py-3 text-center text-[10px] text-ink-300">No visible layers</p>
      )}
    </div>
  );
}

function MiniLine() {
  const w = 160;
  const h = 44;
  const max = Math.max(...GROWTH);
  const pts = GROWTH.map((v, i) => {
    const x = (i / (GROWTH.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="growthgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C4DFF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#7C4DFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#growthgrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#7C4DFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniDonut({
  districts,
  districtsCovered,
}: {
  districts: { name: string; pct: number }[];
  districtsCovered: number;
}) {
  const top3 = districts.slice(0, 3);
  const total = Math.max(
    top3.reduce((s, d) => s + d.pct, 0),
    1,
  ); // top-3 share
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  let acc = 0;
  const palette = ["#7C4DFF", "#8B5CF6", "#A78BFA"];
  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16" aria-hidden="true">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="#EEF0F5" strokeWidth="10" />
      {top3.map((d, i) => {
        const frac = d.pct / total;
        const dash = frac * circ;
        const offset = -acc * circ;
        acc += frac;
        return (
          <circle
            key={d.name}
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={palette[i]}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
          />
        );
      })}
      <text x="36" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#171717">
        {Math.round(total)}
      </text>
      <title>{`${Math.round(total)}% — top districts of ${districtsCovered}`}</title>
    </svg>
  );
}

export default function AnalyticsDrawer({
  expanded,
  onToggle,
  totalLabel,
  byLayer,
  topDistricts,
  delta,
  districtsCovered,
}: AnalyticsDrawerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-white/95 shadow-xl shadow-ink-900/10 backdrop-blur">
        {/* Collapsed summary bar */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="focusable flex w-full items-center justify-between gap-3 px-4 py-2.5"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-semibold text-ink-900">Market Insights</span>
            <span className="hidden items-center gap-1 text-[11px] text-ink-400 sm:flex">
              <span className="font-semibold tabular-nums text-ink-900">{totalLabel}</span>
              locations
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-800">
              ↑ {delta}
            </span>
            <FiChevronUp
              className={`h-4 w-4 text-ink-400 transition-transform duration-200 ${
                expanded ? "" : "rotate-180"
              }`}
            />
          </div>
        </button>

        {/* Expanded charts */}
        <div
          className={`grid gap-4 px-4 transition-all duration-300 ${
            expanded ? "grid-rows-[1fr] pb-4 pt-1 opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="mb-2 text-[11px] font-medium text-ink-500">
                  Locations by layer
                </div>
                <MiniBar data={byLayer} />
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-ink-500">
                  Growth over time
                </div>
                <MiniLine />
                <div className="mt-1 flex justify-between text-[9px] text-ink-400">
                  <span>Jan</span>
                  <span>Now</span>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-ink-500">
                  Market concentration
                </div>
                <div className="flex items-center gap-3">
                  <MiniDonut districts={topDistricts} districtsCovered={districtsCovered} />
                  <div className="space-y-1 min-w-0">
                    {topDistricts.slice(0, 3).map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: ["#7C4DFF", "#8B5CF6", "#A78BFA"][i] }}
                        />
                        <span className="truncate text-[10px] text-ink-500">{d.name}</span>
                      </div>
                    ))}
                    <div className="text-[10px] text-ink-400">of {districtsCovered} covered</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-medium text-ink-500">
                  Top categories (30d)
                </div>
                <div className="flex h-11 items-end gap-1.5">
                  {[22, 34, 28, 46, 38, 52, 44, 60, 54].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-brand-200"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}