"use client";

import { useState } from "react";
import {
  FiLayers,
  FiFilter,
  FiMaximize,
  FiMinus,
  FiMoon,
  FiNavigation,
  FiPlus,
} from "react-icons/fi";
import { IconTip } from "../../spatic/ui";
import { MAP_THEMES } from "../data";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFullscreen: () => void;
  onOpenFilters?: () => void;
  onOpenLayers?: () => void;
  mapThemeId?: string;
  onMapThemeChange?: (id: string) => void;
}

function Btn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconTip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="focusable flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink-500 shadow-sm shadow-ink-900/10 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-px hover:text-brand-700 hover:shadow-md"
      >
        {children}
      </button>
    </IconTip>
  );
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onFullscreen,
  onOpenFilters,
  onOpenLayers,
  mapThemeId,
  onMapThemeChange,
}: MapControlsProps) {
  const [styleOpen, setStyleOpen] = useState(false);
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex flex-col items-center gap-2.5">
      {/* toolbar */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl bg-white/90 p-1.5 shadow-lg shadow-ink-900/5 ring-1 ring-black/5 backdrop-blur">
        <Btn label="Layers" onClick={() => onOpenLayers?.()}>
          <FiLayers className="h-4 w-4" />
        </Btn>
        <div className="relative">
          <Btn label="Map style" onClick={() => setStyleOpen((value) => !value)}>
            <FiMoon className="h-4 w-4" />
          </Btn>
          {styleOpen && (
            <div className="absolute right-full top-0 mr-2 w-44 rounded-xl border border-line bg-white p-2 shadow-xl">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                Map Style
              </div>
              {MAP_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onMapThemeChange?.(theme.id);
                    setStyleOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] ${
                    mapThemeId === theme.id
                      ? "bg-brand-50 font-semibold text-brand-800"
                      : "text-ink-700 hover:bg-canvas"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${mapThemeId === theme.id ? "bg-brand-600" : "bg-line"}`} />
                  {theme.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Btn label="Filters" onClick={() => onOpenFilters?.()}>
          <FiFilter className="h-4 w-4" />
        </Btn>
        <Btn label="Locate me" onClick={onLocate}>
          <FiNavigation className="h-4 w-4" />
        </Btn>
      </div>

      {/* zoom stack */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl bg-white/90 p-1.5 shadow-lg shadow-ink-900/5 ring-1 ring-black/5 backdrop-blur">
        <Btn label="Zoom in" onClick={onZoomIn}>
          <FiPlus className="h-4 w-4" />
        </Btn>
        <span className="h-px w-5 bg-line" />
        <Btn label="Zoom out" onClick={onZoomOut}>
          <FiMinus className="h-4 w-4" />
        </Btn>
      </div>

      {/* fullscreen */}
      <div className="pointer-events-auto flex flex-col items-center rounded-2xl bg-white/90 p-1.5 shadow-lg shadow-ink-900/5 ring-1 ring-black/5 backdrop-blur">
        <Btn label="Fullscreen" onClick={onFullscreen}>
          <FiMaximize className="h-4 w-4" />
        </Btn>
      </div>
    </div>
  );
}