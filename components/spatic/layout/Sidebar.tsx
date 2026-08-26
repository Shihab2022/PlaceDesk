"use client";

import {
  FiBarChart2,
  FiChevronsLeft,
  FiGrid,
  FiHelpCircle,
  FiLayers,
  FiMap,
  FiMapPin,
  FiSettings,
  FiFileText,
  FiBox,
  FiSave,
} from "react-icons/fi";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "maps", label: "Maps", icon: FiMap },
  { id: "layers", label: "Layers", icon: FiLayers },
  { id: "data-sources", label: "Data Sources", icon: FiBox },
  { id: "analytics", label: "Analytics", icon: FiBarChart2 },
  { id: "locations", label: "Locations", icon: FiMapPin },
  { id: "reports", label: "Reports", icon: FiFileText },
  { id: "saved", label: "Saved Projects", icon: FiSave },
];

const BOTTOM_ITEMS = [
  { id: "support", label: "Help & Support", icon: FiHelpCircle },
  { id: "settings", label: "Settings", icon: FiSettings },
];

interface SidebarProps {
  active: string;
  collapsed: boolean;
  onNavigate: (id: string) => void;
  onToggle: () => void;
}

export default function Sidebar({
  active,
  collapsed,
  onNavigate,
  onToggle,
}: SidebarProps) {
  const renderItem = (item: (typeof NAV_ITEMS)[number]) => {
    const isActive = active === item.id;
    const Icon = item.icon;
    return (
      <li key={item.id} className="group relative">
        <button
          type="button"
          onClick={() => onNavigate(item.id)}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
          className={`focusable relative flex w-full items-center justify-center gap-3 rounded-xl py-2.5 transition-all duration-200 ${
            collapsed ? "px-0" : "px-3"
          } ${
            isActive
              ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
              : "text-ink-400 hover:bg-canvas hover:text-ink-900"
          }`}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left text-[13px] font-medium">
              {item.label}
            </span>
          )}
        </button>
        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full top-1/2 z-40 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
          >
            {item.label}
          </span>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`relative z-20 flex shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-[224px]"
      }`}
    >
      <div className="flex flex-1 flex-col justify-between overflow-hidden py-3">
        <nav aria-label="Primary" className="flex flex-col gap-1 px-2">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(renderItem)}
          </div>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="border-t border-line p-2">
        <ul className="flex flex-col gap-1">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  title={item.label}
                  className="focusable flex w-full items-center justify-center gap-3 rounded-xl py-2.5 px-0 text-ink-400 transition-colors duration-200 hover:bg-canvas hover:text-ink-900"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left text-[13px] font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
                {collapsed && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full top-2 z-40 ml-2 whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="focusable flex w-full items-center justify-center gap-3 rounded-xl py-2.5 px-0 text-ink-400 transition-colors hover:bg-canvas hover:text-ink-900"
            >
              <FiChevronsLeft
                className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
              {!collapsed && (
                <span className="flex-1 text-left text-[13px] font-medium">
                  Collapse
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}