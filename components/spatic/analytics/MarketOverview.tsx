"use client";

interface MarketOverviewProps {
  /** Formatted total of visible locations across layers, e.g. "3,842". */
  totalLabel: string;
  /** Number of distinct districts/towns visible. */
  districts: number;
  /** Number of active (added) layers. */
  activeLayers: number;
  className?: string;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-ink-500">{label}</span>
      <span className="flex items-center gap-1 font-semibold tabular-nums text-ink-900">
        {value}
      </span>
    </div>
  );
}

export default function MarketOverview({
  totalLabel,
  districts,
  activeLayers,
  className = "",
}: MarketOverviewProps) {
  return (
    <div
      className={`pointer-events-auto w-52 rounded-2xl border border-line bg-white/95 p-3.5 shadow-xl shadow-ink-900/10 backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          Market Overview
        </span>
        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> LIVE
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink-900">
          {totalLabel}
        </span>
        <span className="text-[11px] font-medium text-ink-500">locations</span>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-line pt-2.5">
        <Stat label="Growth" value="+12.4%" />
        <Stat label="Districts covered" value={String(districts)} />
        <Stat label="Active layers" value={String(activeLayers)} />
      </div>
    </div>
  );
}
