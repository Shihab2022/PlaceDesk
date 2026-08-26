"use client";

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

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFullscreen: () => void;
  onOpenFilters?: () => void;
  onOpenLayers?: () => void;
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
}: MapControlsProps) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex flex-col items-center gap-2.5">
      {/* toolbar */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl bg-white/90 p-1.5 shadow-lg shadow-ink-900/5 ring-1 ring-black/5 backdrop-blur">
        <Btn label="Layers" onClick={() => onOpenLayers?.()}>
          <FiLayers className="h-4 w-4" />
        </Btn>
        <Btn label="Map style" onClick={() => {}}>
          <FiMoon className="h-4 w-4" />
        </Btn>
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