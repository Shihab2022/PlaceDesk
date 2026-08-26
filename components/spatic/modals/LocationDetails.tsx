"use client";

import {
  FiCompass,
  FiMapPin,
  FiPlus,
  FiStar,
  FiX,
} from "react-icons/fi";
import type { BusinessPoint } from "../../spatic/data";

interface LocationDetailsProps {
  business: BusinessPoint | null;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas px-3 py-2">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink-900">
        {value}
      </div>
    </div>
  );
}

export default function LocationDetails({
  business,
  onClose,
}: LocationDetailsProps) {
  if (!business) return null;

  return (
    <div className="anim-fade-right pointer-events-auto absolute right-3 top-3 z-30 w-[300px] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-ink-900/15">
      {/* Header band */}
      <div className="relative h-20 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="coordinate-grid absolute inset-0 opacity-60" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close location details"
          className="focusable absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-ink-500 backdrop-blur hover:text-ink-900"
        >
          <FiX className="h-4 w-4" />
        </button>
        <div className="absolute left-4 top-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <FiMapPin className="h-5 w-5" />
        </div>
      </div>

      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          {business.categoryLabel}
        </span>
        <h3 className="mt-0.5 text-[17px] font-semibold text-ink-900">{business.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-[12px] text-ink-500">
          <FiMapPin className="h-3.5 w-3.5" />
          {business.district}, Bengaluru
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Revenue" value={`₹${business.revenue}M`} />
          <Stat label="Employees" value={`${business.employees}`} />
          <Stat label="Rating" value={`${business.rating} ★`} />
          <Stat label="Stores" value={`${business.stores}`} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
          <span className="rounded-md bg-canvas px-2 py-1">Est. {business.established}</span>
          <span className="rounded-md bg-canvas px-2 py-1">{business.size}</span>
          <span className="rounded-md bg-canvas px-2 py-1">{business.brandType}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="focusable rounded-lg bg-brand-600 px-2 py-2 text-[12px] font-semibold text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110"
          >
            View Details
          </button>
          <button
            type="button"
            aria-label="Add to collection"
            title="Add to collection"
            className="focusable flex items-center justify-center gap-1 rounded-lg border border-line px-2 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <FiPlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="focusable flex items-center justify-center gap-1 rounded-lg border border-line px-2 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <FiCompass className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
          <FiStar className="h-3 w-3 text-amber-500" />
          Established {business.established} · {business.storeType} store
        </div>
      </div>
    </div>
  );
}