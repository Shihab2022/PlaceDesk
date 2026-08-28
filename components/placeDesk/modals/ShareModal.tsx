"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiCopy, FiX } from "react-icons/fi";
import { useAppStore } from "../app/AppStoreContext";
import { CITIES, MAP_THEMES } from "../data";
import { encodeMapState } from "../services/mapState";

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const state = {
      city: store.cityId,
      style: store.mapThemeId,
      layers: store.layers.map((l) => l.categoryKey),
      visible: store.layers.filter((l) => l.visible).map((l) => l.id),
      zoom: store.viewState.zoom,
      lat: store.viewState.latitude,
      lng: store.viewState.longitude,
      division: store.division,
      search: store.searchQuery || undefined,
    };
    const qs = encodeMapState(state);
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "";
    setLink(`${base}?${qs}`);
  }, [store.cityId, store.mapThemeId, store.layers, store.viewState, store.division, store.searchQuery]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const city = CITIES.find((c) => c.id === store.cityId);
  const style = MAP_THEMES.find((t) => t.id === store.mapThemeId);
  const activeLayers = store.layers.filter((l) => l.visible);

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share map"
        className="anim-fade-scale w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-ink-900">Share Map</h2>
            <p className="text-[12px] text-ink-400">
              {city?.label ?? "Workspace"} · {style?.label ?? "Map"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focusable flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-canvas hover:text-ink-900"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[12px] font-medium text-ink-600">
            {activeLayers.length} active layer{activeLayers.length === 1 ? "" : "s"} ·{" "}
            {store.totalVisible.toLocaleString("en-US")} visible locations
          </p>

          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-medium text-ink-500">
              Shareable link
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={link}
                aria-label="Shareable link"
                className="focusable w-full truncate rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-ink-600"
              />
              <button
                type="button"
                onClick={copy}
                className="focusable flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-[12px] font-semibold text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110"
              >
                {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-canvas p-3">
            <p className="text-[11px] font-medium text-ink-500">Shared state includes</p>
            <ul className="mt-1.5 space-y-1 text-[11px] text-ink-400">
              <li>• City / region ({city?.label ?? "—"})</li>
              <li>• Map style ({style?.label ?? "—"})</li>
              <li>• Active layers &amp; visibility</li>
              <li>• Viewport (zoom / center)</li>
              {store.division && <li>• Division ({store.division})</li>}
              {store.searchQuery && <li>• Search (“{store.searchQuery}”)</li>}
            </ul>
          </div>
        </div>

        <div className="flex justify-end border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="focusable rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-canvas"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
