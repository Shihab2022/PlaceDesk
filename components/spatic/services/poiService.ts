import type { CategoryConfig, CityDef, LocationData } from "../data";
import { isBangladeshDivisionCity } from "../data/bd/divisions";

/**
 * Load a city's dataset for a category.
 *
 * Resolution order:
 *  1. Bangladesh divisions (bd-*) -> deterministic generator
 *  2. Delhi -> real /api/pois GitHub backend
 *  3. Other cities -> schema-identical deterministic mock generator
 */
export async function loadLayerData(
  city: CityDef,
  category: CategoryConfig,
): Promise<LocationData[]> {
  if (isBangladeshDivisionCity(city.id)) {
    const { generateBangladeshLocations } = await import("../data/bd/divisions");
    return generateBangladeshLocations(city.id, category.key);
  }

  if (city.useApi && category.targetPath) {
    return fetchRealDataset(category.targetPath);
  }

  const { generateMockLocations } = await import("../data/mockGenerator");
  return generateMockLocations(city, category);
}

async function fetchRealDataset(targetPath: string): Promise<LocationData[]> {
  const res = await fetch(`/api/pois?path=${encodeURIComponent(targetPath)}`);
  if (!res.ok) {
    throw new Error(`Failed to load dataset (${res.status})`);
  }
  const json = await res.json();
  const stores: LocationData[] | undefined = json?.data?.stores;
  if (!Array.isArray(stores)) {
    throw new Error("Dataset did not contain a stores array");
  }
  return stores;
}
