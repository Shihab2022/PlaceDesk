/**
 * POI category -> map-layer grouping.
 *
 * Mirrors the legend the brief calls for: *Catchment Area, Report Location,
 * Restaurants, Retail, Electronics, Supermarkets, Healthcare, Education,
 * Home Decor, Other POIs*. Any category the feed adds in the future that is
 * not listed here falls back to `others`, so nothing is ever dropped.
 *
 * Colours intentionally stay close to `components/placeDesk/data/layerConfig.ts`
 * so the map and the rest of PlaceDesk stay visually consistent.
 */

export type PoiGroupKey =
  | "restaurants"
  | "retail"
  | "electronics"
  | "supermarkets"
  | "healthcare"
  | "education"
  | "home_decor"
  | "others";

export interface PoiGroup {
  key: PoiGroupKey;
  label: string;
  color: string;
  /** `outline` renders as a hollow ring (competitors / anchors). */
  kind: "solid" | "outline";
}

export const POI_GROUPS: readonly PoiGroup[] = [
  { key: "restaurants", label: "Restaurants", color: "#F97316", kind: "solid" },
  { key: "retail", label: "Retail", color: "#EC4899", kind: "solid" },
  { key: "electronics", label: "Electronics", color: "#7C4DFF", kind: "solid" },
  { key: "supermarkets", label: "Supermarkets", color: "#14B8A6", kind: "solid" },
  { key: "healthcare", label: "Healthcare", color: "#EF4444", kind: "solid" },
  { key: "education", label: "Education", color: "#22C55E", kind: "solid" },
  { key: "home_decor", label: "Home Decor", color: "#2563EB", kind: "solid" },
  { key: "others", label: "Other POIs", color: "#64748B", kind: "solid" },
] as const;

export const POI_GROUP_BY_KEY: Record<PoiGroupKey, PoiGroup> = POI_GROUPS.reduce(
  (acc, group) => {
    acc[group.key] = group;
    return acc;
  },
  {} as Record<PoiGroupKey, PoiGroup>,
);

/** category token -> group. Tokens are matched on substrings of the slug. */
const CATEGORY_TOKENS: { token: string; group: PoiGroupKey }[] = [
  { token: "restaurant", group: "restaurants" },
  { token: "food", group: "restaurants" },
  { token: "cafe", group: "restaurants" },
  { token: "bakery", group: "restaurants" },
  { token: "bar", group: "restaurants" },
  { token: "pub", group: "restaurants" },
  { token: "canteen", group: "restaurants" },
  { token: "club", group: "restaurants" },
  { token: "clothing", group: "retail" },
  { token: "fashion", group: "retail" },
  { token: "shoe", group: "retail" },
  { token: "jewel", group: "retail" },
  { token: "cosmetic", group: "retail" },
  { token: "salon", group: "retail" },
  { token: "boutique", group: "retail" },
  { token: "store", group: "retail" },
  { token: "shopping", group: "retail" },
  { token: "mall", group: "retail" },
  { token: "electronic", group: "electronics" },
  { token: "mobile", group: "electronics" },
  { token: "appliance", group: "electronics" },
  { token: "supermarket", group: "supermarkets" },
  { token: "grocery", group: "supermarkets" },
  { token: "kirana", group: "supermarkets" },
  { token: "hypermarket", group: "supermarkets" },
  { token: "clinic", group: "healthcare" },
  { token: "hospital", group: "healthcare" },
  { token: "pharmacy", group: "healthcare" },
  { token: "medical", group: "healthcare" },
  { token: "doctor", group: "healthcare" },
  { token: "dentist", group: "healthcare" },
  { token: "school", group: "education" },
  { token: "college", group: "education" },
  { token: "university", group: "education" },
  { token: "tuition", group: "education" },
  { token: "coaching", group: "education" },
  { token: "kindergarten", group: "education" },
  { token: "home_decor", group: "home_decor" },
  { token: "furniture", group: "home_decor" },
  { token: "interior", group: "home_decor" },
  { token: "hardware", group: "home_decor" },
];

/** Best-effort group for a POI category string. */
export function groupForCategory(category: string | null | undefined): PoiGroupKey {
  const slug = (category ?? "").toLowerCase().replace(/[\s/-]+/g, "_");
  if (!slug) return "others";
  if (slug === "gym_fitness" || slug === "park" || slug === "atm") return "others";
  for (const { token, group } of CATEGORY_TOKENS) {
    if (slug.includes(token)) return group;
  }
  return "others";
}
