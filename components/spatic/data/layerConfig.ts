import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiCamera,
  FiCoffee,
  FiCpu,
  FiGrid,
  FiHeart,
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiTag,
  FiTruck,
} from "react-icons/fi";
import { mapLayerDetailConfig } from "../../../constant/mapConfilg";
import type { CategoryConfig, CategoryKey } from "./types";

export const CATEGORY_KEYS: CategoryKey[] = [
  "malls",
  "furniture",
  "electronics",
  "leisure",
  "medical",
  "transport",
  "companies",
  "education",
  "fashion",
  "fitness",
  "food",
  "others",
  "supermarket",
];

/** Geography labels used by the (preserved) Delhi layer config. */
const LABEL_BY_KEY: Record<CategoryKey, string> = {
  malls: "Malls",
  furniture: "Furniture",
  electronics: "Electronics",
  leisure: "Leisure",
  medical: "Medical",
  transport: "Transport",
  companies: "Companies",
  education: "Education",
  fashion: "Fashion",
  fitness: "Fitness",
  food: "Food",
  others: "Others",
  supermarket: "Supermarket",
};

/**
 * Resolve the Delhi `targetPath` from the existing mapLayerDetailConfig
 * so the /api/pois?path=... architecture is preserved.
 */
function resolveTargetPath(label: string): string | undefined {
  return mapLayerDetailConfig.find((c) => c.name === label)?.targetPath;
}

interface Def {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  mockCount: number;
  targetPath?: string;
}

const DEFS: Record<CategoryKey, Def> = {
  malls: { label: "Malls", icon: FiShoppingCart, color: "#5B2FBF", mockCount: 520 },
  furniture: { label: "Furniture", icon: FiHome, color: "#2563EB", mockCount: 526 },
  electronics: { label: "Electronics", icon: FiCpu, color: "#7C4DFF", mockCount: 640 },
  leisure: { label: "Leisure", icon: FiCamera, color: "#06B6D4", mockCount: 470 },
  medical: { label: "Medical", icon: FiHeart, color: "#EF4444", mockCount: 610 },
  transport: { label: "Transport", icon: FiTruck, color: "#10B981", mockCount: 900 },
  companies: { label: "Companies", icon: FiBriefcase, color: "#6366F1", mockCount: 720 },
  education: { label: "Education", icon: FiBookOpen, color: "#22C55E", mockCount: 620 },
  fashion: { label: "Fashion", icon: FiShoppingBag, color: "#EC4899", mockCount: 560 },
  fitness: { label: "Fitness", icon: FiActivity, color: "#84CC16", mockCount: 380 },
  food: { label: "Food", icon: FiCoffee, color: "#F97316", mockCount: 920 },
  others: { label: "Others", icon: FiGrid, color: "#64748B", mockCount: 400 },
  supermarket: { label: "Supermarket", icon: FiTag, color: "#14B8A6", mockCount: 540 },
};

export const CATEGORIES: CategoryConfig[] = CATEGORY_KEYS.map((key) => {
  const d = DEFS[key];
  return {
    key,
    label: d.label,
    icon: d.icon,
    color: d.color,
    mockCount: d.mockCount,
    targetPath: d.targetPath ?? resolveTargetPath(d.label),
  };
});

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryConfig> =
  CATEGORIES.reduce(
    (acc, c) => {
      acc[c.key] = c;
      return acc;
    },
    {} as Record<CategoryKey, CategoryConfig>,
  );

export const CATEGORY_LABEL: Record<CategoryKey, string> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = c.label;
    return acc;
  },
  {} as Record<CategoryKey, string>,
);