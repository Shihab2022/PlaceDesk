/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import Map from "react-map-gl/mapbox";
import { MAP_STYLES } from "@/constant";

interface MapProps {
  pois?: any;
  selectedPoi?: any | null;
  onSelectPoi?: (poi: any) => void;
}

export default function MapComponent({ selectedPoi }: MapProps) {
  // Use nullish coalescing (??) to ensure fallback values when selectedPoi.lng/lat are undefined
  const [viewState, setViewState] = useState({
    longitude: selectedPoi?.lng ?? 77.25817,
    latitude: selectedPoi?.lat ?? 28.66818,
    zoom: 10,
    pitch: 0,
    bearing: 0,
  });

  const [mapData, setMapData] = useState<any[]>([]);
  const [mapStyle] = useState(MAP_STYLES.STREET);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // if (selectedPoi?.lng && selectedPoi?.lat) {
    //   setViewState((prev) => ({
    //     ...prev,
    //     longitude: Number(selectedPoi.lng),
    //     latitude: Number(selectedPoi.lat),
    //     zoom: 15,
    //     transitionDuration: 1000,
    //   }));
    // }
  }, [selectedPoi]);

  useEffect(() => {
    async function fetchPois() {
      try {
        setIsLoading(true);
        const targetPath =
          selectedPoi?.targetPath || "site_analysis_delhi/Malls.json";
        const res = await fetch(
          `/api/pois?path=${encodeURIComponent(targetPath)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          console.error("API error:", data);
          setMapData([]);
          return;
        }
        setMapData(data?.data?.stores || []);
      } catch (error) {
        console.error("Error loading POI data:", error);
        setMapData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPois();
  }, [selectedPoi]);
  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: selectedPoi?.id
          ? `scatterplot-${selectedPoi.id}`
          : "scatterplot-layer",
        data: mapData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 4,
        radiusMaxPixels: 6,
        lineWidthMinPixels: 1,
        getRadius: () => 3,
        // Provide safe RGB fallbacks for color accessors
        getFillColor: () =>
          Array.isArray(selectedPoi?.rgb) ? selectedPoi.rgb : [140, 140, 0],
        getLineColor: () =>
          Array.isArray(selectedPoi?.rgb) ? selectedPoi.rgb : [140, 140, 0],
        // Safely parse position coordinates to valid numbers
        getPosition: (d) => [
          parseFloat(d?.lng) || 0,
          parseFloat(d?.lat) || 0,
          0,
        ],
      }),
    ];
  }, [mapData, selectedPoi]);

  return (
    <div className="relative w-full h-full min-h-125">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-3 bg-white px-5 py-4 rounded-xl shadow-lg border border-slate-100">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-700">
              Loading Map Data...
            </span>
          </div>
        </div>
      )}

      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState as any)}
        controller={true}
        layers={layers}
        getTooltip={({ object }: { object?: any }) =>
          object && {
            html: `<div style="padding: 6px; color: #1e293b; font-family: sans-serif;">
                     <strong style="font-size: 13px;">${object.name || ""}</strong><br/>
                     <span style="font-size: 11px; color: #64748b;">${object.address || ""}</span>
                   </div>`,
            style: {
              backgroundColor: "#ffffff",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
          }
        }
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_ACCESS_TOKEN}
          mapStyle={mapStyle}
          reuseMaps
        />
      </DeckGL>
    </div>
  );
}
