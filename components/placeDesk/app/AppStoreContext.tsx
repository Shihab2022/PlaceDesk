"use client";

/**
 * Global application state for PlaceDesk.
 *
 * Owns the canonical state model:
 *   City -> Division -> Layers -> Layer Data -> Layer Filters -> Search Query -> Map.
 *
 * Components subscribe via `useAppStore()`. The provider mounts at the page level.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentType, ReactNode } from "react";
import {
  CATEGORIES,
  CATEGORY_FILTERS,
  DEFAULT_CITY,
  applyFilters,
  countActiveFilters,
} from "../data";
import { CITIES as ALL_CITIES } from "../data";
import type {
  Appearance,
  CategoryKey,
  CityDef,
  ComputedLayer,
  FilterValue,
  LayerState,
  LocationData,
  VisualizationType,
} from "../data";
import { loadLayerData } from "../services/poiService";
import {
  BANGLADESH_DIVISIONS,
  isBangladeshDivisionCity,
} from "../data/bd/divisions";
import { resolveStreetViewProvider } from "../services/streetViewProvider";
import {
  DEFAULT_VIZ_SETTINGS,
  VISUALIZATIONS,
} from "./VisualizationSettings";
import type {
  VisualizationId,
  VisualizationSettings,
  ScatterSettings,
  IconSettings,
  HeatmapSettings,
  ClusterSettings,
} from "./VisualizationSettings";

/* re-exports for back-compat with the rest of the app */
export {
  VISUALIZATIONS,
  VISUALIZATION_LABELS,
  VISUALIZATION_PRIORITY,
  DEFAULT_VISUALIZATION,
  DEFAULT_VIZ_SETTINGS,
} from "./VisualizationSettings";

/* ----------------------------------------------------------------- */
/* Saved projects / maps                                              */
/* ----------------------------------------------------------------- */

export interface SavedProject {
  id: string;
  name: string;
  cityId: string;
  mapStyleId: string;
  layers: {
    id: string;
    categoryKey: CategoryKey;
    color: string;
    visualization: VisualizationId;
    visible: boolean;
  }[];
  filterCounts: number;
  theme: "dark" | "light";
  updated: string;
  favorite?: boolean;
}

/* ----------------------------------------------------------------- */
/* Data sources (UI-ready)                                            */
/* ----------------------------------------------------------------- */

export interface DataSource {
  id: string;
  name: string;
  type:
    | "API"
    | "JSON"
    | "CSV"
    | "GeoJSON"
    | "Excel"
    | "PostgreSQL"
    | "MongoDB"
    | "Mapbox";
  status: "Connected" | "Available" | "Disabled";
  regions?: string;
  categories?: number;
  description?: string;
}

/* ----------------------------------------------------------------- */
/* Search                                                             */
/* ----------------------------------------------------------------- */

export interface SearchHit {
  categoryKey: CategoryKey;
  layerId: string;
  location: LocationData;
}

export interface SearchResults {
  byCategory: Map<CategoryKey, SearchHit[]>;
  byBrand: Map<string, SearchHit[]>;
  byTown: Map<string, SearchHit[]>;
  total: number;
  layersTouched: CategoryKey[];
}

/* ----------------------------------------------------------------- */
/* Map                                                                */
/* ----------------------------------------------------------------- */

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export type MapThemeId =
  | "streets"
  | "light"
  | "dark"
  | "satellite"
  | "satellite-streets"
  | "outdoors";

/* ----------------------------------------------------------------- */
/* Street view                                                        */
/* ----------------------------------------------------------------- */

export interface StreetViewRequest {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  layerId?: string;
  layerLabel?: string;
  categoryKey?: CategoryKey;
}

/* ----------------------------------------------------------------- */
/* Store shape                                                        */
/* ----------------------------------------------------------------- */

export interface AppState {
  /* city */
  cityId: string;
  setCityId: (id: string) => void;

  /* division filter (Bangladesh) */
  division: string | null;
  setDivision: (d: string | null) => void;

  /* map */
  mapThemeId: MapThemeId;
  setMapThemeId: (m: MapThemeId) => void;
  viewState: MapViewState;
  setViewState: (v: MapViewState) => void;
  setViewport: (v: { longitude: number; latitude: number; zoom: number }) => void;

  /* layers */
  layers: ComputedLayer[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  addLayer: (key: CategoryKey) => string;
  duplicateLayer: (id: string) => string | undefined;
  removeLayer: (id: string) => void;
  toggleVisible: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  updateVisualization: (id: string, viz: VisualizationId) => void;
  updateAppearance: (id: string, patch: Partial<Appearance>) => void;
  updateVizSettings: (
    id: string,
    patch: Partial<
      ScatterSettings & IconSettings & HeatmapSettings & ClusterSettings
    >,
  ) => void;
  setFilters: (id: string, filters: Record<string, FilterValue>) => void;
  clearFilters: (id: string) => void;
  reloadLayer: (id: string) => void;
  zoomToLayer: (id: string) => void;

  /* selection */
  selectedLocation: LocationData | null;
  selectedLocationLayerId: string | null;
  setSelectedLocation: (loc: LocationData | null, layerId?: string | null) => void;

  /* search */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResults;
  clearSearch: () => void;
  matchingIds: Set<string>;
  hasActiveSearch: boolean;

  /* analytics */
  totalVisible: number;
  totalLoaded: number;

  /* saved */
  savedProjects: SavedProject[];
  saveCurrent: (name: string) => void;
  deleteSaved: (id: string) => void;
  toggleFavorite: (id: string) => void;
  loadSaved: (id: string) => void;

  /* data sources */
  dataSources: DataSource[];

  /* division data */
  isBangladeshView: boolean;
  allDivisions: typeof BANGLADESH_DIVISIONS;

  /* street view */
  streetViewOpen: boolean;
  streetViewRequest: StreetViewRequest | null;
  openStreetView: (req: StreetViewRequest) => void;
  closeStreetView: () => void;
  streetViewAvailable: boolean;
}

const StoreCtx = createContext<AppState | null>(null);

/* ================================================================== */
/* Provider                                                            */
/* ================================================================== */

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityIdState] = useState<string>(DEFAULT_CITY.id);
  const [division, setDivision] = useState<string | null>(null);

  const isBangladeshView = useMemo(
    () => isBangladeshDivisionCity(cityId),
    [cityId],
  );

  const [mapThemeId, setMapThemeId] = useState<MapThemeId>("streets");
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: DEFAULT_CITY.center.lng,
    latitude: DEFAULT_CITY.center.lat,
    zoom: DEFAULT_CITY.zoom,
    pitch: 0,
    bearing: 0,
  });

  const setViewport = useCallback(
    (v: { longitude: number; latitude: number; zoom: number }) =>
      setViewState((p) => ({ ...p, ...v })),
    [],
  );

  /* layers */
  const [layers, setLayers] = useState<LayerState[]>([]);
  const layersRef = useRef<LayerState[]>([]);
  const cityRef = useRef<string>(cityId);
  const seqRef = useRef(1);
  const versionRef = useRef(0);
  const seededRef = useRef(false);

  layersRef.current = layers;

  useEffect(() => {
    cityRef.current = cityId;
  }, [cityId]);

  const patch = useCallback(
    (updater: (ls: LayerState[]) => LayerState[]) => {
      setLayers((prev) => {
        const next = updater(prev);
        layersRef.current = next;
        return next;
      });
    },
    [],
  );

  const loadOne = useCallback(
    async (id: string) => {
      const ver = versionRef.current;
      const layer = layersRef.current.find((l) => l.id === id);
      if (!layer) return;
      patch((ls) =>
        ls.map((l) =>
          l.id === id
            ? { ...l, loading: true, error: undefined, data: [], dataLoaded: false }
            : l,
        ),
      );
      try {
        const city = cityFromId(cityRef.current);
        const cat = CATEGORIES.find((c) => c.key === layer.categoryKey);
        if (!cat) throw new Error("Unknown category");
        const data = await loadLayerData(city, cat);
        if (ver !== versionRef.current) return;
        patch((ls) =>
          ls.map((l) =>
            l.id === id
              ? { ...l, loading: false, data, dataLoaded: true, filteredData: data }
              : l,
          ),
        );
      } catch (e) {
        if (ver !== versionRef.current) return;
        patch((ls) =>
          ls.map((l) =>
            l.id === id
              ? {
                  ...l,
                  loading: false,
                  error: e instanceof Error ? e.message : "Failed to load dataset",
                }
              : l,
          ),
        );
      }
    },
    [patch],
  );

  const pushLayer = useCallback(
    (layer: LayerState) => {
      const next = [...layersRef.current, layer];
      layersRef.current = next;
      setLayers(next);
      void loadOne(layer.id);
    },
    [loadOne],
  );

  /* seed: default layer (malls) */
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const cat = CATEGORIES.find((c) => c.key === "malls")!;
    const city = cityFromId(cityId);
    pushLayer({
      id: `layer-${seqRef.current++}`,
      categoryKey: cat.key,
      label: cat.label,
      color: cat.color,
      targetPath: cat.targetPath,
      name: `${cat.label} \u2014 ${city.label}`,
      data: [],
      dataLoaded: false,
      loading: true,
      visible: true,
      visualizationType: "scatter",
      appearance: { color: cat.color, opacity: 80, radius: 8, lineWidth: 2 },
      filters: {},
      vizSettings: cloneVizSettings(DEFAULT_VIZ_SETTINGS),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!seededRef.current) return;
    versionRef.current += 1;
    const city = cityFromId(cityId);
    patch((ls) =>
      ls.map((l) => ({
        ...l,
        name: `${l.label} \u2014 ${city.label}`,
        data: [],
        filteredData: [],
        dataLoaded: false,
        loading: true,
        error: undefined,
      })),
    );
    layersRef.current.forEach((l) => void loadOne(l.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  const addLayer = useCallback(
    (key: CategoryKey) => {
      const cat = CATEGORIES.find((c) => c.key === key);
      if (!cat) return "";
      const id = `layer-${seqRef.current++}`;
      const city = cityFromId(cityId);
      pushLayer({
        id,
        categoryKey: key,
        label: cat.label,
        color: cat.color,
        targetPath: cat.targetPath,
        name: `${cat.label} \u2014 ${city.label}`,
        data: [],
        dataLoaded: false,
        loading: true,
        visible: true,
        visualizationType: "scatter",
        appearance: { color: cat.color, opacity: 80, radius: 8, lineWidth: 2 },
        filters: {},
        vizSettings: cloneVizSettings(DEFAULT_VIZ_SETTINGS),
      });
      return id;
    },
    [pushLayer, cityId],
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const src = layersRef.current.find((l) => l.id === id);
      if (!src) return undefined;
      const nid = `layer-${seqRef.current++}`;
      const city = cityFromId(cityId);
      pushLayer({
        ...src,
        id: nid,
        name: `${src.label} (Copy) \u2014 ${city.label}`,
        data: [],
        dataLoaded: false,
        loading: true,
        error: undefined,
        visible: true,
      });
      return nid;
    },
    [pushLayer, cityId],
  );

  const removeLayer = useCallback((id: string) => {
    patch((ls) => ls.filter((l) => l.id !== id));
  }, [patch]);

  const toggleVisible = useCallback((id: string) => {
    patch((ls) =>
      ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  }, [patch]);

  const renameLayer = useCallback((id: string, name: string) => {
    patch((ls) => ls.map((l) => (l.id === id ? { ...l, name } : l)));
  }, [patch]);

  const updateVisualization = useCallback(
    (id: string, viz: VisualizationId) => {
      patch((ls) =>
        ls.map((l) => (l.id === id ? { ...l, visualizationType: viz as VisualizationType } : l)),
      );
    },
    [patch],
  );

  const updateAppearance = useCallback(
    (id: string, p: Partial<Appearance>) => {
      patch((ls) =>
        ls.map((l) =>
          l.id === id ? { ...l, appearance: { ...l.appearance, ...p } } : l,
        ),
      );
    },
    [patch],
  );

  const updateVizSettings = useCallback(
    (
      id: string,
      p: Partial<
        ScatterSettings & IconSettings & HeatmapSettings & ClusterSettings
      >,
    ) => {
      patch((ls) =>
        ls.map((l) =>
          l.id === id
            ? {
                ...l,
                vizSettings: { ...(l.vizSettings ?? DEFAULT_VIZ_SETTINGS), ...p } as VisualizationSettings,
              }
            : l,
        ),
      );
    },
    [patch],
  );

  const setFilters = useCallback(
    (id: string, filters: Record<string, FilterValue>) => {
      patch((ls) => ls.map((l) => (l.id === id ? { ...l, filters } : l)));
    },
    [patch],
  );

  const clearFilters = useCallback((id: string) => {
    patch((ls) => ls.map((l) => (l.id === id ? { ...l, filters: {} } : l)));
  }, [patch]);

  const reloadLayer = useCallback((id: string) => void loadOne(id), [loadOne]);

  const zoomToLayer = useCallback((id: string) => {
    const l = layersRef.current.find((x) => x.id === id);
    if (!l) return;
    const defs = CATEGORY_FILTERS[l.categoryKey] ?? [];
    const filteredData = applyFilters(l.data, l.filters, defs);
    if (filteredData.length === 0) return;
    const lats = filteredData.map((d) => d.lat);
    const lngs = filteredData.map((d) => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = Math.max(maxLat - minLat, 0.004);
    const spanLng = Math.max(maxLng - minLng, 0.004);
    const zoom = Math.min(
      15,
      Math.max(4, Math.log2(360 / Math.max(spanLng * 2.4, spanLat * 3))),
    );
    setViewState({
      longitude: (minLng + maxLng) / 2,
      latitude: (minLat + maxLat) / 2,
      zoom,
      pitch: 0,
      bearing: 0,
    });
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!layers.some((l) => l.id === activeId)) {
      setActiveId(layers[0]?.id ?? null);
    }
  }, [layers, activeId]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const { matchingIds, hasActiveSearch } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { matchingIds: new Set<string>(), hasActiveSearch: false };
    const m = new Set<string>();
    for (const l of layers) {
      for (const d of l.data) {
        if (locationMatches(d, q)) m.add(d.id);
      }
    }
    return { matchingIds: m, hasActiveSearch: true };
  }, [layers, searchQuery]);

  const computedLayers: ComputedLayer[] = useMemo(() => {
    return layers.map((l) => {
      const defs = CATEGORY_FILTERS[l.categoryKey] ?? [];
      const filteredData = l.dataLoaded ? applyFilters(l.data, l.filters, defs) : [];
      return { ...l, filteredData };
    });
  }, [layers]);

  const totalVisible = useMemo(
    () =>
      computedLayers.reduce(
        (s, l) => (l.visible ? s + l.filteredData.length : s),
        0,
      ),
    [computedLayers],
  );
  const totalLoaded = useMemo(
    () => computedLayers.reduce((s, l) => s + l.data.length, 0),
    [computedLayers],
  );

  const searchResults: SearchResults = useMemo(() => {
    const byCategory = new Map<CategoryKey, SearchHit[]>();
    const byBrand = new Map<string, SearchHit[]>();
    const byTown = new Map<string, SearchHit[]>();
    const layersTouched = new Set<CategoryKey>();

    if (!hasActiveSearch) {
      return { byCategory, byBrand, byTown, total: 0, layersTouched: [] };
    }
    for (const l of computedLayers) {
      if (!l.dataLoaded) continue;
      for (const d of l.data) {
        if (!matchingIds.has(d.id)) continue;
        layersTouched.add(l.categoryKey);
        pushGrouped(byCategory, l.categoryKey, {
          categoryKey: l.categoryKey,
          layerId: l.id,
          location: d,
        });
        if (d.brand_name && d.brand_name !== "N_A") {
          pushGrouped(byBrand, d.brand_name, {
            categoryKey: l.categoryKey,
            layerId: l.id,
            location: d,
          });
        }
        if (d.town_name) {
          pushGrouped(byTown, d.town_name, {
            categoryKey: l.categoryKey,
            layerId: l.id,
            location: d,
          });
        }
      }
    }
    return {
      byCategory,
      byBrand,
      byTown,
      total: matchingIds.size,
      layersTouched: Array.from(layersTouched),
    };
  }, [computedLayers, matchingIds, hasActiveSearch]);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  const [selectedLocation, setSelectedLocState] = useState<LocationData | null>(null);
  const [selectedLocationLayerId, setSelectedLocationLayerId] = useState<string | null>(null);
  const setSelectedLocation = useCallback(
    (loc: LocationData | null, layerId: string | null = null) => {
      setSelectedLocState(loc);
      setSelectedLocationLayerId(layerId);
    },
    [],
  );

  /* saved */
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => seedSaved());

  const saveCurrent = useCallback(
    (name: string) => {
      const proj: SavedProject = {
        id: `proj-${Date.now()}`,
        name: name || "Untitled Project",
        cityId,
        mapStyleId: mapThemeId,
        layers: layers.map((l) => ({
          id: l.id,
          categoryKey: l.categoryKey,
          color: l.appearance.color,
          visualization: (l.visualizationType as VisualizationId) ?? "scatter",
          visible: l.visible,
        })),
        filterCounts: layers.reduce(
          (s, l) =>
            s +
            (l.dataLoaded
              ? countActiveFilters(CATEGORY_FILTERS[l.categoryKey] ?? [], l.filters, l.data)
              : 0),
          0,
        ),
        theme:
          mapThemeId === "dark" || mapThemeId === "satellite-streets" ? "dark" : "light",
        updated: new Date().toISOString(),
      };
      setSavedProjects((p) => [proj, ...p]);
    },
    [cityId, mapThemeId, layers],
  );

  const deleteSaved = useCallback((id: string) => {
    setSavedProjects((p) => p.filter((s) => s.id !== id));
  }, []);
  const toggleFavorite = useCallback((id: string) => {
    setSavedProjects((p) =>
      p.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)),
    );
  }, []);

  const loadSaved = useCallback(
    (id: string) => {
      const proj = savedProjects.find((p) => p.id === id);
      if (!proj) return;
      setMapThemeId(proj.mapStyleId as MapThemeId);
      setCityIdState(proj.cityId);
      const c = cityFromId(proj.cityId);
      setViewState((v) => ({
        ...v,
        longitude: c.center.lng,
        latitude: c.center.lat,
        zoom: c.zoom,
      }));
      patch(() => []);
      versionRef.current += 1;
      const queue = proj.layers.slice();
      queue.forEach((ls) => {
        const cat = CATEGORIES.find((c2) => c2.key === ls.categoryKey);
        if (!cat) return;
        const id2 = `layer-${seqRef.current++}`;
        pushLayer({
          id: id2,
          categoryKey: ls.categoryKey,
          label: cat.label,
          color: ls.color ?? cat.color,
          targetPath: cat.targetPath,
          name: `${cat.label} \u2014 ${c.label}`,
          data: [],
          dataLoaded: false,
          loading: true,
          visible: ls.visible,
          visualizationType: (ls.visualization as VisualizationType) ?? "scatter",
          appearance: { color: ls.color ?? cat.color, opacity: 80, radius: 8, lineWidth: 2 },
          filters: {},
          vizSettings: cloneVizSettings(DEFAULT_VIZ_SETTINGS),
        });
      });
    },
    [savedProjects, patch, pushLayer],
  );

  const dataSources: DataSource[] = useMemo(() => seedDataSources(), []);

  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewRequest, setStreetViewRequest] = useState<StreetViewRequest | null>(null);
  const streetViewAvailable = useMemo(
    () => resolveStreetViewProvider().result.available,
    [],
  );
  const openStreetView = useCallback((req: StreetViewRequest) => {
    setStreetViewRequest(req);
    setStreetViewOpen(true);
  }, []);
  const closeStreetView = useCallback(() => {
    setStreetViewOpen(false);
    setStreetViewRequest(null);
  }, []);

  const setCityId = useCallback((id: string) => {
    setCityIdState(id);
    const c = cityFromId(id);
    setViewState((v) => ({
      ...v,
      longitude: c.center.lng,
      latitude: c.center.lat,
      zoom: c.zoom,
    }));
    setDivision(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      cityId,
      setCityId,
      division,
      setDivision,
      mapThemeId,
      setMapThemeId,
      viewState,
      setViewState,
      setViewport,
      layers: computedLayers,
      activeId,
      setActiveId,
      addLayer,
      duplicateLayer,
      removeLayer,
      toggleVisible,
      renameLayer,
      updateVisualization,
      updateAppearance,
      updateVizSettings,
      setFilters,
      clearFilters,
      reloadLayer,
      zoomToLayer,
      selectedLocation,
      selectedLocationLayerId,
      setSelectedLocation,
      searchQuery,
      setSearchQuery,
      searchResults,
      clearSearch,
      matchingIds,
      hasActiveSearch,
      totalVisible,
      totalLoaded,
      savedProjects,
      saveCurrent,
      deleteSaved,
      toggleFavorite,
      loadSaved,
      dataSources,
      isBangladeshView,
      allDivisions: BANGLADESH_DIVISIONS,
      streetViewOpen,
      streetViewRequest,
      openStreetView,
      closeStreetView,
      streetViewAvailable,
    }),
    [
      cityId,
      setCityId,
      division,
      mapThemeId,
      viewState,
      computedLayers,
      activeId,
      addLayer,
      duplicateLayer,
      removeLayer,
      toggleVisible,
      renameLayer,
      updateVisualization,
      updateAppearance,
      updateVizSettings,
      setFilters,
      clearFilters,
      reloadLayer,
      zoomToLayer,
      selectedLocation,
      selectedLocationLayerId,
      setSelectedLocation,
      searchQuery,
      searchResults,
      clearSearch,
      matchingIds,
      hasActiveSearch,
      totalVisible,
      totalLoaded,
      savedProjects,
      saveCurrent,
      deleteSaved,
      toggleFavorite,
      loadSaved,
      dataSources,
      isBangladeshView,
      streetViewOpen,
      streetViewRequest,
      openStreetView,
      closeStreetView,
      streetViewAvailable,
    ],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useAppStore(): AppState {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useAppStore must be used within AppStoreProvider");
  return v;
}

/* ================================================================== */
/* helpers                                                             */
/* ================================================================== */

function locationMatches(d: LocationData, q: string): boolean {
  return (
    (d.name?.toLowerCase().includes(q) ?? false) ||
    (d.category?.toLowerCase().includes(q) ?? false) ||
    (d.sub_categories?.toLowerCase().includes(q) ?? false) ||
    (!!d.brand_name && d.brand_name.toLowerCase().includes(q)) ||
    (d.type?.toLowerCase().includes(q) ?? false) ||
    (d.town_name?.toLowerCase().includes(q) ?? false) ||
    (d.address?.toLowerCase().includes(q) ?? false) ||
    (d.pincode?.toLowerCase().includes(q) ?? false)
  );
}

function pushGrouped<K, V>(m: Map<K, V[]>, key: K, value: V) {
  if (!m.has(key)) m.set(key, []);
  m.get(key)!.push(value);
}

function cloneVizSettings(s: VisualizationSettings): VisualizationSettings {
  return {
    scatter: { ...s.scatter },
    icon: { ...s.icon },
    heatmap: { ...s.heatmap },
    cluster: { ...s.cluster },
  };
}

function cityFromId(id: string): CityDef {
  return ALL_CITIES.find((c) => c.id === id) ?? DEFAULT_CITY;
}

function seedSaved(): SavedProject[] {
  const now = new Date();
  const ago = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();
  return [
    {
      id: "proj-seed-1",
      name: "Dhaka Retail Analysis",
      cityId: "dhaka",
      mapStyleId: "dark",
      layers: [
        { id: "x1", categoryKey: "malls", color: "#5B2FBF", visualization: "scatter", visible: true },
        { id: "x2", categoryKey: "food", color: "#F97316", visualization: "heatmap", visible: true },
        { id: "x3", categoryKey: "electronics", color: "#7C4DFF", visualization: "cluster", visible: true },
        { id: "x4", categoryKey: "education", color: "#22C55E", visualization: "scatter", visible: true },
        { id: "x5", categoryKey: "medical", color: "#EF4444", visualization: "icon", visible: true },
        { id: "x6", categoryKey: "fashion", color: "#EC4899", visualization: "scatter", visible: true },
      ],
      filterCounts: 12,
      theme: "dark",
      updated: ago(2),
      favorite: true,
    },
    {
      id: "proj-seed-2",
      name: "Bengaluru Cafe Hunt",
      cityId: "bengaluru",
      mapStyleId: "streets",
      layers: [
        { id: "y1", categoryKey: "food", color: "#F97316", visualization: "cluster", visible: true },
        { id: "y2", categoryKey: "fitness", color: "#84CC16", visualization: "scatter", visible: true },
      ],
      filterCounts: 3,
      theme: "light",
      updated: ago(28),
    },
    {
      id: "proj-seed-3",
      name: "Chattogram Logistics Map",
      cityId: "bd-chattogram",
      mapStyleId: "satellite-streets",
      layers: [
        { id: "z1", categoryKey: "transport", color: "#10B981", visualization: "hexagon", visible: true },
        { id: "z2", categoryKey: "companies", color: "#6366F1", visualization: "scatter", visible: true },
      ],
      filterCounts: 5,
      theme: "dark",
      updated: ago(72),
    },
  ];
}

function seedDataSources(): DataSource[] {
  return [
    {
      id: "ds-delhi",
      name: "Delhi POI Dataset",
      type: "API",
      status: "Connected",
      regions: "Delhi NCR",
      categories: 13,
      description:
        "GitHub-backed real-world POI dataset for Delhi, auto-refreshed hourly.",
    },
    {
      id: "ds-bd",
      name: "Bangladesh Generated Dataset",
      type: "JSON",
      status: "Connected",
      regions: "All 8 divisions",
      categories: 13,
      description:
        "Deterministic generated POI data covering all Bangladesh divisions.",
    },
    {
      id: "ds-india",
      name: "India Generated Dataset",
      type: "JSON",
      status: "Available",
      regions: "8 metro cities",
      categories: 13,
      description: "Deterministic mock data for major Indian metros.",
    },
    {
      id: "ds-pg",
      name: "PostgreSQL Connection",
      type: "PostgreSQL",
      status: "Disabled",
      description: "Connect a PostgreSQL endpoint to ingest your own location data.",
    },
    {
      id: "ds-mongo",
      name: "MongoDB Connection",
      type: "MongoDB",
      status: "Disabled",
      description: "Connect a MongoDB collection as a live layer source.",
    },
    {
      id: "ds-mapbox",
      name: "Mapbox Tiles",
      type: "Mapbox",
      status: "Connected",
      description: "Streets, Satellite, Dark, Light and Outdoors base styles.",
    },
    {
      id: "ds-csv",
      name: "CSV Upload",
      type: "CSV",
      status: "Available",
      description: "Drop a CSV with lat/lng columns to create a new layer on the fly.",
    },
    {
      id: "ds-geojson",
      name: "GeoJSON Import",
      type: "GeoJSON",
      status: "Available",
      description: "Import polygons, points and routes from a GeoJSON file.",
    },
  ];
}
