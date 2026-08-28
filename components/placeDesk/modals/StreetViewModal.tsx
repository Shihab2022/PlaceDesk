"use client";

import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCameraOff,
  FiExternalLink,
  FiMap,
  FiX,
} from "react-icons/fi";
import { useAppStore } from "../app/AppStoreContext";
import { getStreetViewResult } from "../services/streetViewProvider";

/**
 * Imagery pre-check state:
 *  idle       — provider has no checkUrl, render the embed directly
 *  pending    — verifying imagery via the Street View metadata endpoint
 *  ok         — imagery confirmed, render the official embed
 *  no-imagery — Google confirmed no imagery exists at this exact coordinate
 *  denied     — metadata endpoint unavailable (API not activated / network);
 *               fall back to the keyless embed when possible
 */
type CheckState = "idle" | "pending" | "ok" | "no-imagery" | "denied";

export default function StreetViewModal() {
  const store = useAppStore();
  const open = store.streetViewOpen;
  const req = store.streetViewRequest;
  const [check, setCheck] = useState<CheckState>("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && store.closeStreetView();
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, store]);

  /* Verify imagery exists at this coordinate before showing the embed. */
  useEffect(() => {
    if (!open || !req) return;
    const result = getStreetViewResult({
      lat: req.lat,
      lng: req.lng,
      address: req.address,
      name: req.name,
    });
    if (!result.checkUrl) {
      setCheck("idle");
      return;
    }
    let cancelled = false;
    setCheck("pending");
    fetch(result.checkUrl)
      .then((r) => r.json())
      .then((data: { status?: string }) => {
        if (cancelled) return;
        if (data?.status === "OK") setCheck("ok");
        else if (data?.status === "ZERO_RESULTS") setCheck("no-imagery");
        else setCheck("denied");
      })
      .catch(() => {
        if (!cancelled) setCheck("denied");
      });
    return () => {
      cancelled = true;
    };
  }, [open, req]);

  if (!open || !req) return null;

  const result = getStreetViewResult({
    lat: req.lat,
    lng: req.lng,
    address: req.address,
    name: req.name,
  });

  const useFallback = check === "denied";
  const embedUrl = useFallback
    ? result.fallbackUrl ?? result.iframeUrl ?? null
    : result.iframeUrl ?? null;
  const providerLabel = useFallback
    ? "Google Street View (keyless embed)"
    : result.displayName ?? "None";


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
            {result.externalUrl && check !== "pending" && (
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
        {result.available && embedUrl && check !== "no-imagery" ? (
          check === "pending" ? (
            <div className="relative aspect-video w-full bg-canvas" aria-busy="true">
              <div className="skeleton absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-white/90 px-4 py-2 text-[12px] font-medium text-ink-600 shadow-md ring-1 ring-black/5">
                  Checking Street View imagery…
                </span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-black">
              <iframe
                title="Street-level imagery"
                src={embedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )
        ) : check === "no-imagery" ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-ink-500">
              <FiCameraOff className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-semibold text-ink-900">
              No imagery at this location
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-500">
              Google Street View has no coverage at these exact coordinates. The
              imagery may exist nearby — try opening it in Google Maps.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {result.externalUrl && (
                <a
                  href={result.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focusable flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-[12px] font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:-translate-y-px hover:bg-brand-800"
                >
                  <FiExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
              )}
              <button
                type="button"
                onClick={store.closeStreetView}
                className="focusable rounded-lg border border-line px-3.5 py-2 text-[12px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}



        {(!result.available || !embedUrl) && check !== "no-imagery" && (
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
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-canvas px-4 py-2.5 text-[11px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            Provider: {providerLabel}
          </span>
          <span>
            Press <kbd className="rounded border border-line bg-white px-1">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
