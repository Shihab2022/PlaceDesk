"use client";

/**
 * Single source of truth for every report section: label, blurb, icon and the
 * colour tokens used by the navigation cards, the section shells and the URL
 * anchors (`?section=<id>`).
 *
 * The report workspace renders **all** sections on one continuously scrollable
 * page — the cards below are anchors/links into that page, not tabs.
 */

import type { ReactNode } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCompass,
  FiDatabase,
  FiGrid,
  FiMap,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import type { ReportTabId } from "./types";

/** Colour schemes shared by `StatTile` and the navigation cards. */
export type SectionScheme =
  | "brand"
  | "blue"
  | "emerald"
  | "amber"
  | "violet"
  | "rose"
  | "teal";

export interface ReportSectionMeta {
  id: ReportSectionKey;
  label: string;
  blurb: string;
  icon: ReactNode;
  scheme: SectionScheme;
}

/** Reuse the canonical union declared in `types.ts` (no duplication). */
export type ReportSectionKey = ReportTabId;

/** CSS classes for each scheme (kept static so Tailwind can see them). */
export const SCHEME_CLASSES: Record<
  SectionScheme,
  { card: string; icon: string; chip: string; ring: string; text: string }
> = {
  brand: {
    card: "hover:border-brand-300 bg-linear-to-br from-brand-50/70 via-white to-white",
    icon: "bg-brand-100 text-brand-700",
    chip: "bg-brand-50 text-brand-700 border-brand-200",
    ring: "group-hover:ring-brand-200",
    text: "text-brand-700",
  },
  blue: {
    card: "hover:border-blue-300 bg-linear-to-br from-blue-50/70 via-white to-white",
    icon: "bg-blue-100 text-blue-700",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
    ring: "group-hover:ring-blue-200",
    text: "text-blue-700",
  },
  emerald: {
    card: "hover:border-emerald-300 bg-linear-to-br from-emerald-50/70 via-white to-white",
    icon: "bg-emerald-100 text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "group-hover:ring-emerald-200",
    text: "text-emerald-700",
  },
  amber: {
    card: "hover:border-amber-300 bg-linear-to-br from-amber-50/70 via-white to-white",
    icon: "bg-amber-100 text-amber-700",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "group-hover:ring-amber-200",
    text: "text-amber-700",
  },
  violet: {
    card: "hover:border-purple-300 bg-linear-to-br from-purple-50/70 via-white to-white",
    icon: "bg-purple-100 text-purple-700",
    chip: "bg-purple-50 text-purple-700 border-purple-200",
    ring: "group-hover:ring-purple-200",
    text: "text-purple-700",
  },
  rose: {
    card: "hover:border-rose-300 bg-linear-to-br from-rose-50/70 via-white to-white",
    icon: "bg-rose-100 text-rose-700",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "group-hover:ring-rose-200",
    text: "text-rose-700",
  },
  teal: {
    card: "hover:border-teal-300 bg-linear-to-br from-teal-50/70 via-white to-white",
    icon: "bg-teal-100 text-teal-700",
    chip: "bg-teal-50 text-teal-700 border-teal-200",
    ring: "group-hover:ring-teal-200",
    text: "text-teal-700",
  },
};

export const REPORT_SECTIONS: ReportSectionMeta[] = [
  {
    id: "overview",
    label: "Overview",
    blurb: "Site identity, catchment facts, high streets and projects",
    icon: <FiGrid className="h-5 w-5" />,
    scheme: "brand",
  },
  {
    id: "map",
    label: "Map",
    blurb: "Catchment polygon, POIs, competitors and anchors",
    icon: <FiMap className="h-5 w-5" />,
    scheme: "violet",
  },
  {
    id: "market",
    label: "Market",
    blurb: "Scores, spend, apartments and companies",
    icon: <FiTrendingUp className="h-5 w-5" />,
    scheme: "blue",
  },
  {
    id: "demographics",
    label: "Demographics",
    blurb: "Population bands, households and income",
    icon: <FiUsers className="h-5 w-5" />,
    scheme: "teal",
  },
  {
    id: "pois",
    label: "POIs",
    blurb: "Category mix, review velocity and highlights",
    icon: <FiShoppingBag className="h-5 w-5" />,
    scheme: "amber",
  },
  {
    id: "competitors",
    label: "Competition",
    blurb: "Direct competitors, anchors and malls",
    icon: <FiActivity className="h-5 w-5" />,
    scheme: "rose",
  },
  {
    id: "brands",
    label: "Brands",
    blurb: "Ranked brand performance and footprint",
    icon: <FiBarChart2 className="h-5 w-5" />,
    scheme: "emerald",
  },
  {
    id: "indexes",
    label: "Indexes",
    blurb: "Grouped scores, weights and derived counts",
    icon: <FiCompass className="h-5 w-5" />,
    scheme: "brand",
  },
  {
    id: "data",
    label: "Data explorer",
    blurb: "Raw rows from every dataset in the report",
    icon: <FiDatabase className="h-5 w-5" />,
    scheme: "blue",
  },
];

export function sectionMeta(id: ReportSectionKey): ReportSectionMeta {
  return REPORT_SECTIONS.find((s) => s.id === id) ?? REPORT_SECTIONS[0];
}

/** DOM id used as the scroll anchor for a section. */
export function sectionAnchor(id: ReportSectionKey): string {
  return `report-section-${id}`;
}
