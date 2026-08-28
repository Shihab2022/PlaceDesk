"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCopy,
  FiExternalLink,
  FiNavigation,
  FiStar,
  FiX,
} from "react-icons/fi";
import { parseTextArray, getRating } from "../data";
import type { LocationData } from "../data";
import { useAppStore } from "../app/AppStoreContext";

interface Props {
  location: LocationData;
  layerLabel: string;
  accent: string;
  layerId?: string;
  onClose: () => void;
}

function formatCurrency(v: number): string {
  if (v <= 0) return "N/A";
  if (v >= 100000) return `\u09F3${(v / 100000).toFixed(1)}L`;
  return `\u09F3${Math.round(v)}`;
}

function formatVotes(v: number): string {
  if (v <= 0) return "0";
  return v.toLocaleString("en-US");
}

/* ----------------------------------------------------------------- */
/* Category-aware field selection                                      */
/* ----------------------------------------------------------------- */

interface Field {
  label: string;
  value: string;
  emphasize?: boolean;
}

function fieldsForCategory(loc: LocationData): Field[] {
  const subs = parseTextArray(loc.sub_categories).filter(
    (x) => x && x !== "N_A",
  );
  const services = parseTextArray(loc.service_options).filter(
    (x) => x && x !== "N_A",
  );
  const rating = getRating(loc);
  const ratingTxt = loc.number_of_votes > 0 ? rating.toFixed(1) : "N/A";

  const address = loc.address?.trim();
  const town = loc.town_name && loc.town_name !== "n/a" ? loc.town_name : null;
  const pincode = loc.pincode;

  const cat = (loc.category || "").toLowerCase();

  const base: Field[] = [];
  const push = (f: Field) => base.push(f);

  // Always show address (if available)
  if (address) push({ label: "Address", value: address, emphasize: true });
  if (town) push({ label: "Town / District", value: capitalize(town) });

  // Category-specific fields
  if (cat === "food" || subs.some((s) => /biryani|cafe|restaurant|bakery|street/i.test(s))) {
    push({ label: "Cuisine / Subcategory", value: subs[0] ?? "N/A" });
    push({ label: "Restaurant Type", value: humanizeType(loc.type) });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Cost for Two", value: formatCurrency(loc.cost_for_two) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
    push({ label: "Rating", value: ratingTxt });
    if (services.length) push({ label: "Dining Options", value: services.join(", ") });
  } else if (cat === "furniture") {
    push({ label: "Type", value: humanizeType(loc.type) });
    push({ label: "Subcategory", value: subs[0] ?? "N/A" });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Price Range", value: formatCurrency(loc.cost_for_two) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "medical") {
    push({ label: "Medical Type", value: subs[0] ?? humanizeType(loc.type) });
    push({ label: "Facility Type", value: humanizeType(loc.type) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
    push({ label: "Rating", value: ratingTxt });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "electronics") {
    push({ label: "Subcategory", value: subs[0] ?? "N/A" });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Store Type", value: humanizeType(loc.type) });
    push({ label: "Price Range", value: formatCurrency(loc.cost_for_two) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "education") {
    push({ label: "Education Level", value: subs[0] ?? "N/A" });
    push({ label: "Institution Type", value: humanizeType(loc.type) });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Board / Brand", value: loc.brand_name });
    push({ label: "Rating", value: ratingTxt });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
  } else if (cat === "fashion") {
    push({ label: "Category", value: subs[0] ?? "N/A" });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Store Type", value: humanizeType(loc.type) });
    push({ label: "Price Range", value: formatCurrency(loc.cost_for_two) });
    push({ label: "Rating", value: ratingTxt });
  } else if (cat === "fitness") {
    push({ label: "Discipline", value: subs[0] ?? "N/A" });
    push({ label: "Brand", value: loc.brand_name !== "N_A" ? loc.brand_name : "Independent" });
    push({ label: "Membership Range", value: formatCurrency(loc.cost_for_two) });
    push({ label: "Rating", value: ratingTxt });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "malls") {
    push({ label: "Mall Type", value: subs[0] ?? humanizeType(loc.type) });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Operator", value: loc.brand_name });
    push({ label: "Spend Range", value: formatCurrency(loc.cost_for_two) });
    if (services.length) push({ label: "Amenities", value: services.join(", ") });
  } else if (cat === "transport") {
    push({ label: "Mode", value: subs[0] ?? "N/A" });
    push({ label: "Provider", value: loc.brand_name !== "N_A" ? loc.brand_name : "Independent" });
    push({ label: "Facility Type", value: humanizeType(loc.type) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "companies") {
    push({ label: "Service Line", value: subs[0] ?? "N/A" });
    push({ label: "Company", value: loc.brand_name !== "N_A" ? loc.brand_name : "Independent" });
    push({ label: "Segment", value: humanizeType(loc.type) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
  } else if (cat === "leisure") {
    push({ label: "Leisure Category", value: subs[0] ?? humanizeType(loc.type) });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Venue Type", value: humanizeType(loc.type) });
    push({ label: "Price Range", value: formatCurrency(loc.cost_for_two) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "supermarket") {
    push({ label: "Section", value: subs[0] ?? "N/A" });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Store Type", value: humanizeType(loc.type) });
    push({ label: "Basket Range", value: formatCurrency(loc.cost_for_two) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  } else if (cat === "others") {
    push({ label: "Category", value: subs[0] ?? "N/A" });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Type", value: humanizeType(loc.type) });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
  } else {
    // Generic fallback
    if (subs.length) push({ label: "Subcategory", value: subs[0] });
    if (loc.brand_name && loc.brand_name !== "N_A") push({ label: "Brand", value: loc.brand_name });
    push({ label: "Type", value: humanizeType(loc.type) });
    push({ label: "Rating", value: ratingTxt });
    push({ label: "Votes", value: formatVotes(loc.number_of_votes) });
    if (services.length) push({ label: "Service Options", value: services.join(", ") });
  }

  if (pincode) push({ label: "Pincode", value: pincode });

  return base;
}

function humanizeType(t?: string): string {
  if (!t) return "N/A";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ----------------------------------------------------------------- */
/* Inspector                                                          */
/* ----------------------------------------------------------------- */

export default function LocationDetails({
  location,
  layerLabel,
  accent,
  layerId,
  onClose,
}: Props) {
  const store = useAppStore();
  const [copied, setCopied] = useState(false);

  const fields = useMemo(() => fieldsForCategory(location), [location]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(location.address || location.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const onViewOnMap = () => {
    store.setViewport({
      longitude: location.lng,
      latitude: location.lat,
      zoom: Math.max(store.viewState.zoom, 14),
    });
    onClose();
  };

  const onStreetView = () => {
    store.openStreetView({
      lat: location.lat,
      lng: location.lng,
      name: location.name,
      address: location.address,
      layerId,
      layerLabel,
      categoryKey: (location.category as never) || undefined,
    });
  };

  const onDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const subs = parseTextArray(location.sub_categories);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Location inspector"
        className="anim-fade-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-line bg-white shadow-2xl"
      >
        {/* ---- Header ---- */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Location Inspector
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Save to favorites"
              title="Save to favorites"
              className="focusable flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiStar className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              title="Close"
              className="focusable flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---- Scrollable content ---- */}
        <div className="flex-1 overflow-y-auto">
          {/* Title block */}
          <div className="px-4 pb-3 pt-4">
            <span
              className="mb-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              {layerLabel}
            </span>
            <h2 className="text-[18px] font-semibold leading-tight text-ink-900">
              {location.name}
            </h2>
            {subs.length > 0 && (
              <p className="mt-1 text-[12px] text-ink-500">
                {subs.slice(0, 3).join(" \u00B7 ")}
              </p>
            )}
            {(location.town_name || location.pincode) && (
              <p className="mt-1 text-[12px] font-medium text-ink-600">
                {capitalize(location.town_name || "")}
                {location.pincode ? ` \u2014 ${location.pincode}` : ""}
              </p>
            )}
          </div>

          {/* Field list */}
          <div className="border-t border-line px-4 py-3">
            <dl className="divide-y divide-line/70">
              {fields.map((f) => (
                <div key={f.label} className="flex items-start justify-between gap-3 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                    {f.label}
                  </dt>
                  <dd
                    className={`max-w-[60%] text-right text-[12px] ${
                      f.emphasize ? "font-medium text-ink-900" : "text-ink-700"
                    }`}
                  >
                    {f.value || "N/A"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Coordinates */}
          <div className="border-t border-line px-4 py-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Coordinates
            </div>
            <div className="font-mono text-[11.5px] text-ink-700">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          </div>
        </div>

        {/* ---- Action footer ---- */}
        <div className="shrink-0 space-y-2 border-t border-line bg-white px-4 py-3">
          <button
            type="button"
            onClick={onStreetView}
            className="btn-primary w-full justify-center"
          >
            <FiNavigation className="h-3.5 w-3.5" /> Street View
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onViewOnMap}
              className="focusable flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <FiExternalLink className="h-3.5 w-3.5" /> View on Map
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="focusable flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <FiCopy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy Address"}
            </button>
          </div>
          <button
            type="button"
            onClick={onDirections}
            className="focusable flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-2 text-[12px] font-medium text-ink-600 transition-colors hover:text-brand-700"
          >
            Get directions in Maps
          </button>
        </div>
      </div>
    </>
  );
}
