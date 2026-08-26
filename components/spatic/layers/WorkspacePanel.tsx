"use client";

import DataExplorer from "./DataExplorer";
import LayerPanel, {
  LayerFiltersState,
  LayerStyleState,
} from "./LayerPanel";

interface WorkspacePanelProps {
  view: "data" | "layer";
  onViewChange: (v: "data" | "layer") => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  visible: Record<string, boolean>;
  onToggleVisible: (id: string) => void;
  onAddDataset: () => void;
  categoryLabel: string;
  style: LayerStyleState;
  onStyle: (s: LayerStyleState) => void;
  filters: LayerFiltersState;
  onFilters: (f: LayerFiltersState) => void;
}

export default function WorkspacePanel({
  view,
  onViewChange,
  selectedCategory,
  onSelectCategory,
  visible,
  onToggleVisible,
  onAddDataset,
  categoryLabel,
  style,
  onStyle,
  filters,
  onFilters,
}: WorkspacePanelProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r border-line bg-white">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line px-3 pt-2.5">
        {(["data", "layer"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            aria-pressed={view === v}
            className={`focusable relative rounded-t-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              view === v ? "text-brand-800" : "text-ink-400 hover:text-ink-700"
            }`}
          >
            {v === "data" ? "Data Explorer" : `${categoryLabel} Layer`}
            {view === v && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {view === "data" ? (
          <DataExplorer
            selected={selectedCategory}
            onSelect={onSelectCategory}
            onOpenLayer={() => onViewChange("layer")}
            onAddDataset={onAddDataset}
            visible={visible}
            onToggleVisible={onToggleVisible}
          />
        ) : (
          <LayerPanel
            categoryLabel={categoryLabel}
            style={style}
            onStyle={onStyle}
            filters={filters}
            onFilters={onFilters}
          />
        )}
      </div>
    </div>
  );
}