"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_BY_KEY,
  CATEGORY_FILTERS,
  applyFilters,
  type Appearance,
  type CategoryKey,
  type CityDef,
  type LayerState,
  type LocationData,
  type VisualizationType,
} from "../data";
import { loadLayerData } from "../services/poiService";

export interface MapLayerApi {
  layers: (LayerState & { filteredData: LocationData[] })[];
  activeKeys: Set<string>;
  addLayer: (key: CategoryKey) => string;
  duplicateLayer: (id: string) => string | undefined;
  removeLayer: (id: string) => void;
  toggleVisible: (id: string) => void;
  updateLayer: (
    id: string,
    patch: {
      name?: string;
      visible?: boolean;
      visualizationType?: VisualizationType;
      appearance?: Partial<Appearance>;
      color?: string;
    },
  ) => void;
  setFilters: (id: string, filters: Record<string, unknown>) => void;
  clearFilters: (id: string) => void;
  reloadLayer: (id: string) => void;
}

type LayerPatch = NonNullable<Parameters<MapLayerApi["updateLayer"]>[1]>;

const makeAppearance = (color: string): Appearance => ({
  color,
  opacity: 80,
  radius: 12,
  lineWidth: 2,
});

export function useMapLayers(city: CityDef): MapLayerApi {
  const [layers, setLayers] = useState<LayerState[]>([]);
  const layersRef = useRef<LayerState[]>([]);
  const cityRef = useRef<CityDef>(city);
  const versionRef = useRef(0);
  const seqRef = useRef(1);
  const seededRef = useRef(false);
  const lastCityRef = useRef(city.id);

  layersRef.current = layers;

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  const patch = useCallback((updater: (ls: LayerState[]) => LayerState[]) => {
    setLayers((prev) => {
      const next = updater(prev);
      layersRef.current = next;
      return next;
    });
  }, []);

  const loadOne = useCallback(
    async (id: string, c: CityDef) => {
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
        const data = await loadLayerData(c, CATEGORY_BY_KEY[layer.categoryKey]);
        if (ver !== versionRef.current) return;
        patch((ls) =>
          ls.map((l) =>
            l.id === id ? { ...l, loading: false, data, dataLoaded: true } : l,
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
      void loadOne(layer.id, cityRef.current);
    },
    [loadOne],
  );

  // Mount: seed a single default Malls layer.
  useEffect(() => {
    if (seededRef.current || layersRef.current.length) return;
    seededRef.current = true;
    const cat = CATEGORY_BY_KEY.malls;
    const c = cityRef.current;
    pushLayer({
      id: `layer-${seqRef.current++}`,
      categoryKey: cat.key,
      label: cat.label,
      color: cat.color,
      targetPath: cat.targetPath,
      name: `${cat.label} — ${c.label}`,
      data: [],
      dataLoaded: false,
      visible: true,
      visualizationType: "point",
      appearance: makeAppearance(cat.color),
      filters: {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // City switch: reload all layers, preserve config, rename, refresh.
  useEffect(() => {
    if (lastCityRef.current === city) return;
    lastCityRef.current = city;
    versionRef.current += 1;
    patch((ls) =>
      ls.map((l) => ({
        ...l,
        name: `${l.label} — ${cityRef.current.label}`,
        data: [],
        dataLoaded: false,
        loading: true,
        error: undefined,
      })),
    );
    layersRef.current.forEach((l) => void loadOne(l.id, cityRef.current));
  }, [city, patch, loadOne]);

  const addLayer = useCallback(
    (key: CategoryKey) => {
      const cat = CATEGORY_BY_KEY[key];
      const id = `layer-${seqRef.current++}`;
      const c = cityRef.current;
      pushLayer({
        id,
        categoryKey: key,
        label: cat.label,
        color: cat.color,
        targetPath: cat.targetPath,
        name: `${cat.label} — ${c.label}`,
        data: [],
        dataLoaded: false,
        visible: true,
        visualizationType: "point",
        appearance: makeAppearance(cat.color),
        filters: {},
      });
      return id;
    },
    [pushLayer],
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const src = layersRef.current.find((l) => l.id === id);
      if (!src) return undefined;
      const nid = `layer-${seqRef.current++}`;
      const c = cityRef.current;
      pushLayer({
        ...src,
        id: nid,
        name: `${src.label} (Copy) — ${c.label}`,
        data: [],
        dataLoaded: false,
        loading: true,
        error: undefined,
        visible: true,
      });
      return nid;
    },
    [pushLayer],
  );

  const removeLayer = useCallback((id: string) => {
    patch((ls) => ls.filter((l) => l.id !== id));
  }, [patch]);

  const toggleVisible = useCallback((id: string) => {
    patch((ls) =>
      ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  }, [patch]);

  const updateLayer = useCallback(
    (id: string, p: NonNullable<Parameters<MapLayerApi["updateLayer"]>[1]>) => {
      patch((ls) =>
        ls.map((l) => {
          if (l.id !== id) return l;
          const next = { ...l };
          if (p.name !== undefined) next.name = p.name;
          if (p.visible !== undefined) next.visible = p.visible;
          if (p.visualizationType !== undefined)
            next.visualizationType = p.visualizationType;
          if (p.color !== undefined) next.color = p.color;
          if (p.appearance) next.appearance = { ...l.appearance, ...p.appearance };
          return next;
        }),
      );
    },
    [patch],
  );

  const setFilters = useCallback((id: string, filters: Record<string, unknown>) => {
    patch((ls) => ls.map((l) => (l.id === id ? { ...l, filters } : l)));
  }, [patch]);

  const clearFilters = useCallback((id: string) => {
    patch((ls) => ls.map((l) => (l.id === id ? { ...l, filters: {} } : l)));
  }, [patch]);

  const reloadLayer = useCallback((id: string) => void loadOne(id, cityRef.current), [
    loadOne,
  ]);

  const computed = useMemo(
    () =>
      layers.map((l) => {
        const defs = CATEGORY_FILTERS[l.categoryKey] ?? [];
        const filteredData = l.dataLoaded ? applyFilters(l.data, l.filters, defs) : [];
        return { ...l, filteredData };
      }),
    [layers],
  );

  const activeKeys = useMemo(
    () => new Set(computed.map((l) => l.categoryKey)),
    [computed],
  );

  return {
    layers: computed,
    activeKeys,
    addLayer,
    duplicateLayer,
    removeLayer,
    toggleVisible,
    updateLayer,
    setFilters,
    clearFilters,
    reloadLayer,
  } satisfies MapLayerApi;
}