"use client";

/**
 * Small presentational primitives shared by every report section.
 * Deliberately dependency-free (only `react-icons`, already used app-wide)
 * so the dashboard stays light despite the heavy data payloads.
 */

import { useId, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiChevronDown, FiInbox, FiRefreshCw } from "react-icons/fi";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-white ${className}`}>
      {children}
    </div>
  );
}

/** Collapsible white panel used for report sections. */
export function SectionCard({
  title,
  subtitle,
  actions,
  defaultOpen = true,
  children,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={contentId}
            className="focusable -ml-1 flex items-center gap-1.5 rounded-md text-left"
          >
            <FiChevronDown
              className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
            <h3 className="truncate text-[14px] font-semibold text-ink-900">
              {title}
            </h3>
          </button>
          {subtitle && (
            <p className="mt-0.5 pl-4 text-[12px] text-ink-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div
        id={contentId}
        className={`px-4 pb-4 pt-3 sm:px-5 ${open ? "" : "hidden"}`}
      >
        {open && children}
      </div>
    </section>
  );
}

/** Big number tile for the KPI row. */
export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string | null;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-shadow hover:shadow-sm ${
        accent
          ? "border-brand-200 bg-brand-50/60"
          : "border-line bg-white"
      }`}
    >
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p
        className={`mt-1.5 truncate text-[24px] font-semibold leading-tight ${
          accent ? "text-brand-700" : "text-ink-900"
        }`}
        title={value}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-canvas text-ink-500 border-line",
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Label/value grid — every value already stringified (`"N/A"` when absent). */
export function KeyValueList({
  items,
  columns = 2,
}: {
  items: { label: string; value: string }[];
  columns?: 1 | 2 | 3 | 4;
}) {
  const grid =
    columns === 1
      ? "sm:grid-cols-1"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : columns === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2";
  if (!items.length) {
    return <EmptyState title="Nothing to show" message="No values for this section." />;
  }
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-3 ${grid}`}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-400">
            {item.label}
          </dt>
          <dd className="mt-0.5 break-words text-[13px] font-medium text-ink-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/60 px-6 py-10 text-center">
      <FiInbox className="h-7 w-7 text-ink-400" />
      <p className="mt-3 text-[13px] font-semibold text-ink-700">{title}</p>
      {message && <p className="mt-1 max-w-md text-[12px] text-ink-500">{message}</p>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 px-6 py-10 text-center">
      <FiAlertTriangle className="h-7 w-7 text-rose-500" />
      <p className="mt-3 text-[13px] font-semibold text-rose-700">
        Could not load the report
      </p>
      <p className="mt-1 max-w-lg break-words text-[12px] text-ink-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focusable mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}

/** Shown while the first report payload is being fetched. */
export function ReportSkeleton() {
  return (
    <div className="anim-fade-in space-y-4" aria-busy="true" aria-label="Loading report">
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-72 rounded-xl" />
        <div className="skeleton h-72 rounded-xl" />
      </div>
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );
}

/** Horizontal pill tabs (scrollable on small screens). */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel = "Report sections",
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`focusable shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              isActive
                ? "bg-ink-900 text-white shadow-sm"
                : "border border-line bg-white text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Horizontal bar used by every ranked-list chart
 * (brand share, demand generators, POI mix, weights…).
 */
export function BarRow({
  label,
  value,
  displayValue,
  color,
  max,
  onClick,
}: {
  label: string;
  value: number;
  displayValue: string;
  color?: string;
  max: number;
  onClick?: () => void;
}) {
  const pct = max > 0 ? Math.max(0, (value / max) * 100) : 0;
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12.5px] text-ink-700">
          {label}
        </span>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink-900">
          {displayValue}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${pct.toFixed(1)}%`,
            backgroundColor: color ?? "#4F46E5",
          }}
        />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focusable block w-full rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-canvas/70"
      >
        {body}
      </button>
    );
  }
  return <div className="px-1 py-1.5">{body}</div>;
}

