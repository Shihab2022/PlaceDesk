import type { CategoryConfig, CityDef, LocationData } from "../data";

/**
 * Load a city's dataset for a category.
 *
 * - For cities backed by the real API (Delhi) it preserves the existing
 *   `/api/pois?path=<targetPath>` behaviour.
 * - For other cities it returns schema-identical generated data.
 */
export async function loadLayerData(
  city: CityDef,
  category: CategoryConfig,
): Promise<LocationData[]> {
  if (city.useApi && category.targetPath) {
    return fetchRealDataset(category.targetPath);
  }
  // Lazy-load mock generator to keep main bundle smaller.
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