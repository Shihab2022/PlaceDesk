import type {
  CategoryKey,
  FilterControlType,
  FilterDef,
  FilterValue,
  LocationData,
} from "./types";
import { extractByAccessor, getRating, parseTextArray } from "./types";

/* ---- common accessors ---- */
const sub = (l: LocationData) => parseTextArray(l.sub_categories);
const brand = (l: LocationData) => (l.brand_name === "N_A" ? "N_A" : l.brand_name || "N_A");
const typeName = (l: LocationData) => String(l.type || "").replace(/_/g, " ");
const price = (l: LocationData) => l.cost_for_two || 0;
const votes = (l: LocationData) => l.number_of_votes || 0;
const rating = (l: LocationData) => getRating(l);
const services = (l: LocationData) => parseTextArray(l.service_options);

const priceFmt = (v: number) =>
  v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${Math.round(v)}`;
const intFmt = (v: number) => Math.round(v).toLocaleString("en-US");
const floatFmt = (v: number) => v.toFixed(1);

/* ---- factories ---- */
function subDef(label = "Sub Category", type: FilterControlType = "multiselect"): FilterDef {
  return {
    key: "sub_category",
    label,
    type,
    accessor: sub,
    options: (d) => extractByAccessor(d, sub),
  };
}
function brandDef(label = "Brand", type: FilterControlType = "select"): FilterDef {
  return {
    key: "brand",
    label,
    type,
    accessor: brand,
    options: (d) => extractByAccessor(d, brand),
  };
}
function typeDef(label = "Store Type", type: FilterControlType = "select"): FilterDef {
  return {
    key: "type",
    label,
    type,
    accessor: typeName,
    options: (d) => extractByAccessor(d, typeName),
  };
}
function votesDef(label = "Votes"): FilterDef {
  return { key: "votes", label, type: "range", accessor: votes, min: 0, step: 10, format: intFmt };
}
function ratingDef(label = "Rating"): FilterDef {
  return {
    key: "rating",
    label,
    type: "range",
    accessor: rating,
    min: 0,
    max: 5,
    step: 0.1,
    format: floatFmt,
  };
}
function priceDef(label: string, max?: number, step = 100): FilterDef {
  return {
    key: "cost",
    label,
    type: "range",
    accessor: price,
    min: 0,
    max,
    step,
    format: priceFmt,
  };
}
function serviceDef(label = "Service Options"): FilterDef {
  return {
    key: "service",
    label,
    type: "multiselect",
    accessor: services,
    options: (d) => extractByAccessor(d, services),
  };
}

/* ---------------------------------------------------------------- */
export const CATEGORY_FILTERS: Record<CategoryKey, FilterDef[]> = {
  malls: [subDef("Sub Category"), brandDef(), typeDef("Store Type"), priceDef("Spend Range", 4000), ratingDef(), serviceDef()],
  furniture: [subDef(), brandDef(), priceDef("Price Range", 80000, 500), ratingDef(), votesDef(), typeDef("Store Type"), serviceDef()],
  electronics: [subDef(), brandDef(), typeDef("Store Type"), priceDef("Price Range", 120000, 500), serviceDef(), ratingDef()],
  leisure: [subDef("Leisure Category"), brandDef(), typeDef("Venue Type"), priceDef("Price Range", 2500), ratingDef(), serviceDef()],
  medical: [subDef("Medical Type"), typeDef("Facility Type"), votesDef(), ratingDef(), serviceDef()],
  transport: [subDef("Mode"), brandDef("Provider"), typeDef("Facility"), votesDef(), serviceDef()],
  companies: [subDef("Service Line"), brandDef("Company"), typeDef("Segment"), votesDef(), ratingDef()],
  education: [subDef("Education Level"), typeDef("Institution Type"), brandDef("Board"), ratingDef(), votesDef()],
  fashion: [subDef("Category"), brandDef(), typeDef("Store Type"), priceDef("Price Range", 6000), ratingDef()],
  fitness: [subDef("Discipline"), brandDef(), priceDef("Membership Range", 12000), ratingDef(), serviceDef()],
  food: [
    subDef("Cuisine", "multiselect"),
    typeDef("Restaurant Type"),
    priceDef("Cost for Two", 1200, 50),
    brandDef(),
    ratingDef(),
    serviceDef("Dining Options"),
  ],
  others: [subDef("Category"), brandDef(), typeDef("Type"), votesDef()],
  supermarket: [subDef("Section"), brandDef(), typeDef("Store Type"), priceDef("Basket Range", 2000), ratingDef(), serviceDef()],
};

/** Count how many filters are actively narrowing the layer. */
export function countActiveFilters(
  defs: FilterDef[],
  filters: Record<string, FilterValue>,
  data: LocationData[],
): number {
  let n = 0;
  for (const def of defs) {
    const v = filters[def.key];
    if (def.type === "select" && v && String(v).length) n++;
    else if (def.type === "multiselect" && Array.isArray(v) && v.length) n++;
    else if (def.type === "range" && Array.isArray(v)) {
      const max = def.max ?? dataMax(def, data);
      if (v[0] !== (def.min ?? 0) || v[1] !== max) n++;
    }
  }
  return n;
}

function dataMax(def: FilterDef, data: LocationData[]): number {
  let m = def.max ?? 0;
  for (const l of data) {
    const v = Number(def.accessor(l));
    if (!Number.isNaN(v) && v > m) m = v;
  }
  return m;
}

/** Apply a layer's filters to its dataset. */
export function applyFilters(
  data: LocationData[],
  filters: Record<string, FilterValue>,
  defs: FilterDef[],
): LocationData[] {
  if (!data.length) return data;
  return data.filter((loc) => {
    for (const def of defs) {
      const val = filters[def.key];
      if (val === undefined || val === null) continue;
      const dv = def.accessor(loc);
      if (def.type === "select") {
        if (String(val).length && String(dv) !== String(val)) return false;
      } else if (def.type === "multiselect") {
        if (Array.isArray(val) && val.length) {
          const list = Array.isArray(dv) ? dv : [String(dv)];
          if (!val.some((x) => list.includes(String(x)))) return false;
        }
      } else if (def.type === "range" && Array.isArray(val)) {
        const n = Number(dv) || 0;
        if (n < (val[0] as number) || n > (val[1] as number)) return false;
      }
    }
    return true;
  });
}