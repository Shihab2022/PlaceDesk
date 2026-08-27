"use client";

import { FiChevronLeft, FiExternalLink, FiMapPin, FiStar } from "react-icons/fi";
import type { LocationData } from "../data";

interface LocationDetailsProps {
  location: LocationData;
  layerLabel: string;
  accent: string;
  onClose: () => void;
}

function formatCurrency(v: number): string {
  if (v <= 0) return "N/A";
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v)}`;
}

function statRow(label: string, value: string | number) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-[11px] text-ink-500">{label}</span>
      <span className="text-[11px] font-semibold text-ink-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function LocationDetails({
  location,
  layerLabel,
  accent,
  onClose,
}: LocationDetailsProps) {
  const sub = String(location.sub_categories || "").replace(/[\[\]]/g, "");
  const rating = location.number_of_votes
    ? Math.min(5, 3 + (location.number_of_votes % 20) / 10).toFixed(1)
    : "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className="anim-slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-line bg-white shadow-2xl sm:translate-x-0"
        style={{ borderTopLeftRadius: 0 }}
        aria-label="Location details"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            title="Close"
            className="focusable flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add to collection"
              title="Add to collection"
              className="focusable rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiStar className="h-4 w-4" />
            </button>
              <button
              type="button"
              aria-label="Get directions"
              title="Get directions"
              className="focusable rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiMapPin className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Open in new tab"
              title="View on map"
              className="focusable rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 className="text-[17px] font-semibold leading-tight text-ink-900">
                {location.name}
              </h2>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${accent}15`,
                  color: accent,
                }}
              >
                {layerLabel}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-[12px] text-ink-600">{location.address}</p>
              {location.town_name && (
                <p className="mt-0.5 text-[11px] text-ink-400">
                  {location.town_name}
                </p>
              )}
            </div>

            {sub && sub !== "N_A" && sub !== "[]" && (
              <div className="mb-3">
                <span className="inline-block rounded-md bg-canvas px-2 py-1 text-[11px] text-ink-600">
                  {sub.split(",")[0]}
                </span>
              </div>
            )}

            <div className="border-y border-line py-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                Key metrics
              </div>
              {statRow("Rating", rating)}
              {location.number_of_votes > 0 &&
                statRow("Votes", location.number_of_votes.toLocaleString("en-US"))}
              {location.cost_for_two > 0 &&
                statRow("Cost for two", formatCurrency(location.cost_for_two))}
              {location.brand_name && location.brand_name !== "N_A" &&
                statRow("Brand", location.brand_name)}
              {location.pincode && statRow("Pincode", location.pincode)}
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                Location
              </div>
              <div className="text-[12px] text-ink-600">
                Lat: {location.lat.toFixed(6)}
              </div>
              <div className="text-[12px] text-ink-600">
                Lng: {location.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-primary flex items-center gap-1.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
