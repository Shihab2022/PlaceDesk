"use client";

/**
 * Report index — one card per configured report data source.
 *
 * Cards are entry points to the full report route (`/report/<reportId>`): each
 * one shows the data source name plus the headline facts of the report behind
 * it (site, catchment, area, distance, growth, counts). Details are fetched
 * with a trimmed API projection (see `useReportCards`), so the index stays fast
 * even though every report file is multi-MB.
 */

import Link from "next/link";
import {
  FiArrowRight,
  FiCalendar,
  FiExternalLink,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { useReportCards, type ReportCardSummary } from "./useReportCards";
import {
  formatArea,
  formatCompact,
  formatDate,
  formatDecimal,
  formatDistanceKm,
  formatInt,
} from "./parse";

/** One headline stat on a card. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 flex-col rounded-lg border border-line/70 bg-canvas/60 px-2.5 py-1.5">
      <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <span className="mt-0.5 truncate text-[13.5px] font-semibold tabular-nums text-ink-900">
        {value}
      </span>
    </span>
  );
}

/** Shimmer shown while a card's details are still being fetched. */
function CardSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <div className="skeleton h-11 rounded-lg" />
        <div className="skeleton h-11 rounded-lg" />
        <div className="skeleton h-11 rounded-lg" />
      </div>
    </div>
  );
}

/** `12.4` -> `+12.40%`, `null` -> `null`. */
function growthLabel(value: number | null): string | null {
  if (value === null) return null;
  return `${value >= 0 ? "+" : ""}${formatDecimal(value, 2)}%`;
}

/** A single label/value row in the card's fact list. */
function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-400">{label}</dt>
      <dd className={`truncate font-medium ${tone ?? "text-ink-800"}`}>{value}</dd>
    </div>
  );
}

function ReportCard({
  card,
  onRetry,
}: {
  card: ReportCardSummary;
  onRetry: () => void;
}) {
  const ready = card.status === "ready";
  const failed = card.status === "error";
  const growth = growthLabel(card.clusterGrowthRate);

  return (
    <div className="group relative flex flex-col rounded-xl border border-line bg-white p-4 transition-all focus-within:border-brand-400 hover:-translate-y-px hover:border-brand-300 hover:shadow-md">
      <span className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
          style={{ backgroundColor: `${card.color}1A`, color: card.color }}
          aria-hidden
        >
          {card.name.replace(/[^0-9]/g, "").slice(-1) || "R"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-ink-900">
            {card.name}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">
            {ready
              ? (card.siteName ?? "Site unavailable")
              : failed
                ? "Details unavailable"
                : "Loading details…"}
          </span>
        </span>
        <FiExternalLink
          className="mt-0.5 h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-600"
          aria-hidden
        />
      </span>

      <div className="mt-3 flex-1">
        {failed ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2.5">
            <p className="text-[11.5px] font-medium text-rose-700">
              {card.error ?? "Could not load this report's details."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="focusable mt-2 inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-rose-700 transition-colors hover:bg-rose-50"
            >
              <FiRefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        ) : !ready ? (
          <CardSkeleton />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              {card.catchmentLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10.5px] font-medium text-brand-700">
                  {card.catchmentLabel}
                </span>
              )}
              {card.location && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[10.5px] font-medium text-ink-500">
                  <FiMapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{card.location}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[10.5px] font-medium text-ink-500">
                <FiCalendar className="h-3 w-3" />
                {formatDate(card.createdAt)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <Stat label="Brands" value={formatInt(card.brands)} />
              <Stat label="POIs" value={formatCompact(card.pois)} />
              <Stat label="Rivals" value={formatInt(card.competitors)} />
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-[11.5px] sm:grid-cols-2">
              <Fact label="Catchment area" value={formatArea(card.areaM2)} />
              <Fact
                label="From centre"
                value={formatDistanceKm(card.distanceFromCityCenterKm)}
              />
              <Fact label="High streets" value={formatInt(card.highStreets)} />
              <Fact
                label="Growth"
                value={growth ?? "N/A"}
                tone={
                  growth === null
                    ? undefined
                    : card.clusterGrowthRate! >= 0
                      ? "text-emerald-600 font-semibold"
                      : "text-rose-600 font-semibold"
                }
              />
              <Fact label="Population" value={formatCompact(card.population)} />
              <Fact
                label="Performance"
                value={formatDecimal(card.performanceScore, 2)}
              />
            </dl>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
        <span
          className="truncate font-mono text-[10.5px] text-ink-400"
          title={card.path}
        >
          {card.id}
        </span>
        <Link
          href={`/report/${encodeURIComponent(card.id)}`}
          aria-label={`Open the full report for ${card.name}`}
          className="focusable inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Open report
          <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ReportCardGrid() {
  const { cards, loading, reload } = useReportCards();

  if (!cards.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-line bg-white p-6 text-center text-[13px] text-ink-500">
        No reports are configured yet.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-ink-500" role="status">
          {loading
            ? "Loading report details…"
            : `${cards.length} report${cards.length === 1 ? "" : "s"} ready · open one for the full analysis`}
        </p>
        <button
          type="button"
          onClick={reload}
          className="focusable inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <ReportCard key={card.id} card={card} onRetry={reload} />
        ))}
      </div>
    </>
  );
}
