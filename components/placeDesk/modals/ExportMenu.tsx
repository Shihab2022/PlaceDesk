"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiDownload, FiImage, FiAlertTriangle } from "react-icons/fi";

type ExportFormat = "png" | "jpg";
type Resolution = "current" | "2x" | "4x";

function downloadBlob(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Composite the Mapbox basemap with the deck.gl overlay canvas into a single
 * image. Returns a data: URL streamable straight to a download link.
 */
function renderMapBlob(opts: {
  format: ExportFormat;
  resolution: Resolution;
  container: HTMLElement;
}): string {
  const { format, resolution, container } = opts;
  const mapCanvas = container.querySelector<HTMLCanvasElement>(".mapboxgl-canvas");
  const overlayCanvas = Array.from(
    container.querySelectorAll<HTMLCanvasElement>("canvas"),
  ).find((c) => c !== mapCanvas && c.width > 0);

  if (!mapCanvas || !mapCanvas.width || !mapCanvas.height)
    throw new Error("Map has no size");
  const width = mapCanvas.width;
  const height = mapCanvas.height;
  const scale = resolution === "2x" ? 2 : resolution === "4x" ? 4 : 1;

  const out = document.createElement("canvas");
  out.width = width * scale;
  out.height = height * scale;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.scale(scale, scale);
  ctx.drawImage(mapCanvas, 0, 0, width, height);
  if (overlayCanvas && overlayCanvas.width && overlayCanvas.height) {
    ctx.drawImage(overlayCanvas, 0, 0, width, height);
  }

  return out.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92);
}

/**
 * Export Map — captures the current map visualization (basemap + deck.gl
 * layers) as an image. PNG or JPG at 1x/2x/4x. Does NOT export raw records;
 * that belongs to a future dedicated data-export feature.
 */
export default function ExportMenu({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [resolution, setResolution] = useState<Resolution>("current");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const capture = () => {
    setStatus("working");
    setTimeout(() => {
      try {
        const container = document.getElementById("placedesk-map");
        if (!container) throw new Error("Map container not found");
        const dataUrl = renderMapBlob({ format, resolution, container });
        downloadBlob(dataUrl, `placedesk-map.${format}`);
        setStatus("done");
        setTimeout(() => {
          setStatus("idle");
          onClose();
        }, 1200);
      } catch {
        setStatus("error");
      }
    }, 60);
  };

  return (
    <div
      ref={ref}
      className="anim-fade-scale w-72 rounded-2xl border border-line bg-white p-3 shadow-xl shadow-ink-900/10"
      role="dialog"
      aria-label="Export map as image"
    >
      <div className="px-1 pb-2">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <FiImage className="h-4 w-4" />
          </span>
          Export Map
        </div>
        <p className="mt-1 text-[11px] text-ink-400">
          Captures the current map view, layers and styling as an image.
        </p>
      </div>

      <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        Format
      </div>
      <div className="grid grid-cols-2 gap-1.5 px-1">
        {(["png", "jpg"] as ExportFormat[]).map((f) => {
          const on = format === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFormat(f)}
              className={`focusable flex items-center justify-center gap-1 rounded-lg border py-1.5 text-[12px] font-semibold uppercase transition-colors ${
                on
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-line text-ink-500 hover:border-brand-300"
              }`}
            >
              {on && <FiCheck className="h-3 w-3" />}
              {f}
            </button>
          );
        })}
      </div>

      <div className="mt-3 px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        Resolution
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-1">
        {(["current", "2x", "4x"] as Resolution[]).map((r) => {
          const on = resolution === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => setResolution(r)}
              className={`focusable rounded-lg border py-1.5 text-[12px] font-medium transition-colors ${
                on
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-line text-ink-500 hover:border-brand-300"
              }`}
            >
              {r === "current" ? "Current" : r.replace("x", "×")}
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-line" />

      {status === "working" && (
        <p className="flex items-center gap-1.5 px-1 pt-2 text-[11px] font-medium text-brand-700">
          <FiDownload className="h-3.5 w-3.5 animate-pulse" /> Preparing map…
        </p>
      )}
      {status === "done" && (
        <p className="flex items-center gap-1.5 px-1 pt-2 text-[11px] font-medium text-emerald-600">
          <FiCheck className="h-3.5 w-3.5" /> Map exported
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 px-1 pt-2 text-[11px] font-medium text-red-600">
          <FiAlertTriangle className="h-3.5 w-3.5" /> Unable to export map.
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="focusable rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={capture}
          disabled={status === "working"}
          className="focusable flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm shadow-brand-600/30 transition-all hover:-translate-y-px hover:brightness-110 disabled:opacity-60"
        >
          <FiDownload className="h-3.5 w-3.5" />
          {status === "working" ? "Exporting…" : "Export"}
        </button>
      </div>
    </div>
  );
}