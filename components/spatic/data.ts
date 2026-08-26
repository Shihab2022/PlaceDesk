import {
  FiActivity,
  FiBookOpen,
  FiBox,
  FiCoffee,
  FiCpu,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CategoryId =
  | "electronics"
  | "fashion"
  | "food"
  | "fitness"
  | "furniture"
  | "healthcare"
  | "education";

export interface Category {
  id: CategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  records: string;
  count: number;
  description: string;
}

export interface BusinessPoint {
  id: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  district: string;
  lat: number;
  lng: number;
  revenue: number; // ₹ millions
  employees: number;
  rating: number;
  established: number;
  stores: number;
  brandType: string;
  storeType: string;
  size: string;
}

export interface MapTheme {
  id: string;
  label: string;
  style: string;
}

/* ------------------------------------------------------------------ */
/* Seedable PRNG so the map renders identically on every load          */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: T[], r: () => number) =>
  arr[Math.floor(r() * arr.length)];

/* ------------------------------------------------------------------ */
/* Bengaluru districts + geographic spread                             */
/* ------------------------------------------------------------------ */

const DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: "Indiranagar", lat: 12.9719, lng: 77.6412 },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "Jayanagar", lat: 12.9308, lng: 77.5837 },
  { name: "Whitefield", lat: 12.9698, lng: 77.75 },
  { name: "HSR Layout", lat: 12.9116, lng: 77.6414 },
  { name: "MG Road", lat: 12.9758, lng: 77.6067 },
  { name: "Marathahalli", lat: 12.9591, lng: 77.7154 },
  { name: "BTM Layout", lat: 12.9106, lng: 77.6101 },
  { name: "Malleshwaram", lat: 13.0064, lng: 77.571 },
  { name: "Hebbal", lat: 13.036, lng: 77.595 },
  { name: "Basavanagudi", lat: 12.9448, lng: 77.5717 },
  { name: "JP Nagar", lat: 12.9101, lng: 77.5846 },
  { name: "Yelahanka", lat: 13.1001, lng: 77.5963 },
  { name: "Electronic City", lat: 12.8454, lng: 77.6602 },
  { name: "Banashankari", lat: 12.9259, lng: 77.5491 },
  { name: "Rajaji Nagar", lat: 12.9863, lng: 77.5516 },
  { name: "C V Raman Nagar", lat: 12.982, lng: 77.696 },
  { name: "Frazer Town", lat: 13.0027, lng: 77.6179 },
  { name: "Electronic City-1", lat: 12.8585, lng: 77.6722 },
];

const NAME_ROOTS: Record<CategoryId, string[]> = {
  electronics: [
    "Croma", "Reliance Digital", "Vijay Sales", "TechWorld", "Ampere",
    "iStore", "Nova Gadgets", "Volta", "Zenith", "Circuit City",
  ],
  fashion: [
    "Zudio", "Fabindia", "Trendsetter", "Moda", "Vogue Lane",
    "Ritzi", "Global Desi", "Anokhi", "StyleVerse", "Couture House",
  ],
  food: [
    "Truffles", "Kosy", "The Vine", "Palate House", "Sattvick",
    "Bhojanam", "Cinnamon", "The Bowl", "Seasonal", "Grain & Green",
  ],
  fitness: [
    "FlexFit", "IronPulse", "Core Studio", "PulseActive", "Elevate",
    "ZenMotion", "ToneLab", "Fitways", "Barre & Blend", "Endurance",
  ],
  furniture: [
    "Echo Living", "Nook & Vault", "SofaLand", "Oakleaf", "Mond",
    "Keop", "Stilhaus", "CasaMob", "Timber & Twine", "Urban Nest",
  ],
  healthcare: [
    "WellCare", "Nova Health", "Swasthya", "PulsePoint",
    "LifeBridge", "CureWorks", "MedPoint", "Sanctuary", "Clarity",
  ],
  education: [
    "Meridian", "Athena Learning", "Brightfields", "CurioCity",
    "PeakPrep", "Nimbus", "Sage Path", "Lakeview", "Birchwood",
  ],
};

const BRAND_TYPES = ["Flagship", "Chain", "Local", "Premium"];
const STORE_TYPES = ["Retail", "Showroom", "Counter", "Mall"];
const SIZES = ["Compact", "Medium", "Large", "Expanded"];
const SUFFIX = ["Store", "Zone", "Outlet", "Mart", "Plus", "Square", "Pro", "Lane"];

export const CATEGORIES: Category[] = [
  { id: "electronics", label: "Electronics", icon: FiCpu, records: "2,481", count: 640, description: "Consumer electronics & appliance retailers" },
  { id: "fashion", label: "Fashion", icon: FiShoppingBag, records: "1,834", count: 470, description: "Apparel, footwear & accessories brands" },
  { id: "food", label: "Food & Beverage", icon: FiCoffee, records: "3,102", count: 540, description: "Restaurants, cafés & quick-service outlets" },
  { id: "fitness", label: "Fitness", icon: FiActivity, records: "762", count: 245, description: "Gyms, studios & wellness centres" },
  { id: "furniture", label: "Furniture", icon: FiBox, records: "526", count: 215, description: "Home furnishing & office furniture" },
  { id: "healthcare", label: "Healthcare", icon: FiHeart, records: "1,210", count: 330, description: "Clinics, pharmacies & care providers" },
  { id: "education", label: "Education", icon: FiBookOpen, records: "1,477", count: 360, description: "Schools, tuition & academies" },
];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export const selectIcon = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)?.icon ?? FiCpu;

/* ------------------------------------------------------------------ */
/* Deterministic business generation                                   */
/* ------------------------------------------------------------------ */

export function generateBusinesses(
  category: CategoryId,
  seed: number,
): BusinessPoint[] {
  const rng = mulberry32(seed);
  const roots = NAME_ROOTS[category];
  const cat = CATEGORIES.find((c) => c.id === category)!;

  return Array.from({ length: cat.count }, (_, i) => {
    const area = pick(DISTRICTS, rng);
    const jitter = 0.012;
    const lat = area.lat + (rng() - 0.5) * jitter * 5;
    const lng = area.lng + (rng() - 0.5) * jitter * 5;
    return {
      id: `${category}-${i}`,
      name: `${pick(roots, rng)} ${pick(SUFFIX, rng)}`,
      category,
      categoryLabel: cat.label,
      district: area.name,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      revenue: Number((0.6 + rng() * 11).toFixed(1)),
      employees: Math.max(3, Math.floor(rng() * 200) + 3),
      rating: Number((3.2 + rng() * 1.8).toFixed(1)),
      established: Math.floor(1996 + rng() * 29),
      stores: Math.max(1, Math.floor(rng() * 4)),
      brandType: pick(BRAND_TYPES, rng),
      storeType: pick(STORE_TYPES, rng),
      size: pick(SIZES, rng),
    };
  });
}

const RENDER_SEED: Record<CategoryId, number> = {
  electronics: 2481,
  fashion: 1834,
  food: 3102,
  fitness: 762,
  furniture: 526,
  healthcare: 1210,
  education: 1477,
};

export const BUSINESSES: Record<CategoryId, BusinessPoint[]> = CATEGORY_IDS.reduce(
  (acc, id) => {
    acc[id] = generateBusinesses(id, RENDER_SEED[id]);
    return acc;
  },
  {} as Record<CategoryId, BusinessPoint[]>,
);

/* ------------------------------------------------------------------ */
/* Formatters & static config                                          */
/* ------------------------------------------------------------------ */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatCurrency(m: number): string {
  return `₹${m.toFixed(1)}M`;
}

export const MAP_THEMES: MapTheme[] = [
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-v9" },
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
];

export const VISUALIZATIONS: string[] = [
  "Point",
  "Cluster",
  "Density",
  "Heatmap",
  "Hexagon",
  "Bubble",
];

export const FILTER_OPTIONS: Record<string, string[]> = {
  subcategory: [
    "All Subcategories",
    "Consumer Electronics",
    "Appliances",
    "Mobile & Accessories",
    "Computing",
    "Audio & Sound",
  ],
  brandType: ["All Brands", ...BRAND_TYPES],
  storeType: ["All Store Types", ...STORE_TYPES],
  size: ["Any Size", ...SIZES],
};

export const SWATCHES: string[] = [
  "#7C4DFF",
  "#8B5CF6",
  "#5B2FBF",
  "#6D3FE8",
  "#A78BFA",
  "#6B7280",
  "#EF4444",
  "#10B981",
  "#F59E0B",
];