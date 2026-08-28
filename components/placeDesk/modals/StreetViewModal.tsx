"use client";

import { useEffect } from "react";
import { FiExternalLink, FiMap, FiX } from "react-icons/fi";
import { useAppStore } from "../app/AppStoreContext";
import { getStreetViewResult } from "../services/streetViewProvider";

export default function StreetViewModal() {
  const store = useAppStore();
  const open = store.streetViewOpen;
  const req = store.streetViewRequest;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && store.closeStreetView();
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, store]);

  if (!open || !req) return null;

  const result = getStreetViewResult({
    lat: req.lat,
    lng: req.lng,
    address: req.address,
    name: req.name,
  });

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm"
      onClick={store.closeStreetView}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Street View"
        className="anim-fade-scale relative w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold text-ink-900">
              {req.name ?? "Street View"}
            </h2>
            <p className="truncate text-[11px] text-ink-400">
              {req.layerLabel ? `${req.layerLabel} \u00B7 ` : ""}
              {req.lat.toFixed(5)}, {req.lng.toFixed(5)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {result.externalUrl && (
              <a
                href={result.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focusable flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                <FiExternalLink className="h-3.5 w-3.5" /> Open
              </a>
            )}
            <button
              type="button"
              onClick={store.closeStreetView}
              aria-label="Close Street View"
              className="focusable flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {result.available && result.iframeUrl ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              title="Street-level imagery"
              src={result.iframeUrl}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <FiMap className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-semibold text-ink-900">
              Street View unavailable
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-500">
              {result.reason ??
                "Street-level imagery is not available for this location. Configure a Street View provider to enable this feature."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <code className="rounded-md bg-canvas px-2 py-1 text-[11px] font-mono text-ink-600">
                NEXT_PUBLIC_STREETVIEW_URL
              </code>
              <span className="text-[12px] text-ink-400">+</span>
              <code className="rounded-md bg-canvas px-2 py-1 text-[11px] font-mono text-ink-600">
                NEXT_PUBLIC_STREETVIEW_API_KEY
              </code>
            </div>
            <p className="mt-3 text-[11px] text-ink-400">
              Or set <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> for Google Street View.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-canvas px-4 py-2.5 text-[11px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            Provider: {result.displayName ?? "None"}
          </span>
          <span>
            Press <kbd className="rounded border border-line bg-white px-1">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
