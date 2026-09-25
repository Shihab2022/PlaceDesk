"use client";

/** Slide-over drawer with the full detail of one brand / POI record. */

import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import type { BusinessRecord } from "./types";
import {
  formatCoordinates,
  formatDateTime,
  formatDecimal,
  formatDistanceKm,
  formatInt,
  formatPriceLevel,
  humanizeKey,
} from "./parse";
import { KeyValueList, Pill } from "./ui";

export default function BrandDetailsDrawer({
  brand,
  onClose,
}: {
  brand: BusinessRecord | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!brand) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [brand, onClose]);

  if (!brand) return null;

  const facts = [
    { label: "Brand", value: brand.brand_name ?? brand.name },
    { label: "Category", value: brand.category ? humanizeKey(brand.category) : "N/A" },
    {
      label: "Coordinates",
      value:
        brand.lat != null && brand.lng != null
          ? formatCoordinates(brand.lat, brand.lng, 5)
          : "N/A",
    },
    { label: "Distance", value: formatDistanceKm(brand.distance) },
    { label: "Reviews / day", value: formatDecimal(brand.reviews_per_day, 2) },
    { label: "Number of votes", value: formatInt(brand.number_of_votes) },
    {
      label: "Performance score",
      value: formatDecimal(brand.performance_score, 2),
    },
    { label: "Price level", value: formatPriceLevel(brand.price_level) },
    { label: "Source", value: brand.source ?? "N/A" },
    { label: "Competitor type", value: brand.competitor_type ?? "N/A" },
    {
      label: "First review",
      value: formatDateTime(brand.first_review_timestamp),
    },
    {
      label: "Store perf. (cat · country)",
      value: formatDecimal(brand.store_performance_category_and_country_level, 2),
    },
    {
      label: "Store perf. (cat · city)",
      value: formatDecimal(brand.store_performance_category_and_city_level, 2),
    },
    {
      label: "Store perf. (brand · country)",
      value: formatDecimal(brand.store_performance_brand_and_country_level, 2),
    },
    {
      label: "Store perf. (brand · city)",
      value: formatDecimal(brand.store_performance_brand_and_city_level, 2),
    },
    { label: "Record ID", value: brand.id },
  ];

  const chipSection = (title: string, items?: string[]) =>
    items && items.length ? (
      <div>
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
          {title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close brand details"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink-900/30"
      />
      <aside
        role="dialog"
        aria-label="Brand details"
        className="anim-fade-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-line bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {brand.brand_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.brand_logo}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-ink-900">
                {brand.name}
              </h2>
              <p className="truncate text-[12px] text-ink-500">
                {brand.category ? humanizeKey(brand.category) : "N/A"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focusable rounded-lg border border-line p-1.5 text-ink-500 transition-colors hover:text-brand-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <KeyValueList items={facts} columns={1} />
          {chipSection("Service options", brand.service_options)}
          {chipSection("Tags", brand.tags)}
          {chipSection("Sub-categories", brand.sub_categories)}
          {chipSection("Additional types", brand.additional_types)}
        </div>
      </aside>
    </>
  );
}
