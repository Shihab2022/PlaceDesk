"use client";

/**
 * Small presentational primitives shared by every report section.
 * Deliberately dependency-free (only `react-icons`, already used app-wide)
 * so the dashboard stays light despite the heavy data payloads.
 */

import { useCallback, useId, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiChevronDown, FiInbox, FiRefreshCw } from "react-icons/fi";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

/** Collapsible white panel used for report sections. */
export function SectionCard({
  id,
  title,
  subtitle,
  actions,
  defaultOpen = true,
  children,
  className = "",
}: {
  id?: string;
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
    <section id={id} className={`rounded-2xl bg-white shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={contentId}
            className="focusable -ml-1 flex items-center gap-1.5 rounded-lg text-left"
          >
            <FiChevronDown
              className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
            <h3 className="truncate text-[15px] font-semibold text-ink-900">
              {title}
            </h3>
          </button>
          {subtitle && (
            <p className="mt-0.5 pl-5 text-[12px] text-ink-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div
        id={contentId}
        className={`px-5 pb-5 pt-3 sm:px-6 ${open ? "" : "hidden"}`}
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
  icon,
  colorScheme = "brand",
}: {
  label: string;
  value: string;
  hint?: string | null;
  accent?: boolean;
  icon?: ReactNode;
  colorScheme?: "brand" | "blue" | "emerald" | "amber" | "violet" | "rose" | "teal";
}) {
  const schemes: Record<string, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
    brand: {
      bg: "bg-linear-to-br from-brand-50/90 via-white to-brand-50/30",
      iconBg: "bg-brand-100/90 text-brand-700",
      iconColor: "text-brand-700",
      valueColor: "text-brand-800",
    },
    blue: {
      bg: "bg-linear-to-br from-blue-50/90 via-white to-blue-50/30",
      iconBg: "bg-blue-100/90 text-blue-700",
      iconColor: "text-blue-700",
      valueColor: "text-blue-900",
    },
    emerald: {
      bg: "bg-linear-to-br from-emerald-50/90 via-white to-emerald-50/30",
      iconBg: "bg-emerald-100/90 text-emerald-700",
      iconColor: "text-emerald-700",
      valueColor: "text-emerald-900",
    },
    amber: {
      bg: "bg-linear-to-br from-amber-50/90 via-white to-amber-50/30",
      iconBg: "bg-amber-100/90 text-amber-700",
      iconColor: "text-amber-700",
      valueColor: "text-amber-900",
    },
    violet: {
      bg: "bg-linear-to-br from-purple-50/90 via-white to-purple-50/30",
      iconBg: "bg-purple-100/90 text-purple-700",
      iconColor: "text-purple-700",
      valueColor: "text-purple-900",
    },
    rose: {
      bg: "bg-linear-to-br from-rose-50/90 via-white to-rose-50/30",
      iconBg: "bg-rose-100/90 text-rose-700",
      iconColor: "text-rose-700",
      valueColor: "text-rose-900",
    },
    teal: {
      bg: "bg-linear-to-br from-teal-50/90 via-white to-teal-50/30",
      iconBg: "bg-teal-100/90 text-teal-700",
      iconColor: "text-teal-700",
      valueColor: "text-teal-900",
    },
  };

  const current = accent ? schemes[colorScheme] ?? schemes.brand : null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        current
          ? `${current.bg} shadow-xs`
          : "bg-white shadow-xs hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </p>
        {icon && (
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
              current ? current.iconBg : "bg-canvas text-ink-500"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={`mt-2 truncate text-[23px] font-bold tracking-tight leading-tight ${
          current ? current.valueColor : "text-ink-900"
        }`}
        title={value}
      >
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-[11px] text-ink-500">{hint}</p>}
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
    neutral: "bg-canvas text-ink-600",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
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
    <div className="flex flex-col items-center justify-center rounded-2xl bg-canvas/60 px-6 py-10 text-center">
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
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-rose-50/70 p-6 text-center shadow-xs">
      <FiAlertTriangle className="h-7 w-7 text-rose-500" />
      <p className="mt-3 text-[13px] font-semibold text-rose-700">
        Could not load the report
      </p>
      <p className="mt-1 max-w-lg break-words text-[12px] text-ink-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focusable mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
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

/** Rows shown per page by default — every report table respects this. */
export const DEFAULT_PAGE_SIZE = 10;

/** Sizes offered by the rows-per-page toggle in `PaginationBar`. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Page + rows-per-page state for one table.
 * Changing the page size always returns to the first page, so the reader is
 * never stranded on a page that no longer exists.
 */
export function usePagination(initialPageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);
  return { page, pageSize, setPage, changePageSize };
}

/** Ranked bar lists and column charts show this many items before expanding. */
export const DEFAULT_VISIBLE_BARS = 10;

/**
 * Show-more state for long ranked lists / charts.
 * Keeps the first `initial` items in view until the reader asks for the rest,
 * so a 40-category breakdown never buries the rest of the page.
 */
export function useExpandable(
  total: number,
  initial: number = DEFAULT_VISIBLE_BARS,
) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);
  const visible = Math.min(initial, total);
  const visibleCount = expanded ? total : visible;
  return { expanded, total, visible, visibleCount, toggle };
}

/**
 * Shared "show all / show top N" toggle for expandable bar lists and charts.
 * Renders nothing when there is nothing hidden.
 */
export function ShowMore({
  total,
  visible,
  expanded,
  onToggle,
  noun = "items",
  className = "",
}: {
  total: number;
  visible: number;
  expanded: boolean;
  onToggle: () => void;
  noun?: string;
  className?: string;
}) {
  if (total <= visible) return null;
  return (
    <div className={`flex justify-center pt-3 ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="focusable inline-flex items-center gap-1.5 rounded-xl bg-canvas px-3.5 py-1.5 text-[11.5px] font-semibold text-ink-600 transition-colors hover:bg-canvas-subtle hover:text-brand-700"
      >
        <FiChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
        {expanded
          ? `Show top ${visible}`
          : `Show all ${total.toLocaleString("en-US")} ${noun}`}
      </button>
    </div>
  );
}

/**
 * Shared pagination footer: "showing x–y of z", rows-per-page toggles and
 * first / prev / page-number / next / last controls.
 * Pass `onPageSizeChange` to enable the rows-per-page toggle.
 */
export function PaginationBar({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = "",
}: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = totalItems === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min((safePage + 1) * pageSize, totalItems);

  /* Uncontrolled number input: `key` remounts it whenever the page changes,
     so no effect / derived-state juggling is required. */
  const commitValue = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    const next = Math.min(Math.max(parsed, 1), pageCount) - 1;
    if (next !== safePage) onPageChange(next);
  };

  /* With a rows-per-page toggle the bar stays visible even on a single page,
     otherwise the reader could never switch back to a smaller page size. */
  if (totalItems === 0 || (pageCount <= 1 && !onPageSizeChange)) {
    return null;
  }

  const navBtn =
    "focusable inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-lg bg-canvas px-2 text-[11.5px] font-medium text-ink-700 transition-colors hover:bg-canvas-subtle hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 pt-3 text-[12px] ${className}`}
    >
      <span className="tabular-nums text-ink-500">
        Showing <span className="font-semibold text-ink-800">{start}</span>–
        <span className="font-semibold text-ink-800">{end}</span> of{" "}
        <span className="font-semibold text-ink-800">
          {totalItems.toLocaleString("en-US")}
        </span>
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {onPageSizeChange && (
          <span className="mr-1 flex items-center gap-1">
            <span className="text-ink-500">Rows</span>
            <span className="flex overflow-hidden rounded-lg bg-canvas p-0.5">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  aria-pressed={pageSize === size}
                  aria-label={`Show ${size} rows per page`}
                  title={`Show ${size} rows per page`}
                  className={`focusable h-6 rounded-md px-2 text-[11.5px] font-semibold tabular-nums transition-colors ${
                    pageSize === size
                      ? "bg-white text-ink-900 shadow-xs"
                      : "text-ink-500 hover:text-brand-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={safePage === 0}
          aria-label="First page"
          title="First page"
          className={navBtn}
        >
          «
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          disabled={safePage === 0}
          aria-label="Previous page"
          className={navBtn}
        >
          Prev
        </button>

        <span className="flex items-center gap-1 px-0.5 text-ink-500">
          <input
            key={`page-${safePage}`}
            type="number"
            min={1}
            max={pageCount}
            defaultValue={safePage + 1}
            onBlur={(e) => commitValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitValue(e.currentTarget.value);
              }
            }}
            aria-label="Page number"
            className="focusable h-7 w-12 rounded-lg bg-canvas px-1.5 text-center text-[11.5px] font-semibold tabular-nums text-ink-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="tabular-nums">
            / {pageCount.toLocaleString("en-US")}
          </span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount - 1, safePage + 1))}
          disabled={safePage >= pageCount - 1}
          aria-label="Next page"
          className={navBtn}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pageCount - 1)}
          disabled={safePage >= pageCount - 1}
          aria-label="Last page"
          title="Last page"
          className={navBtn}
        >
          »
        </button>
      </div>
    </div>
  );
}



