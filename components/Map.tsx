/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import Map from "react-map-gl/mapbox";
import { MAP_STYLES } from "@/constant";

interface MapProps {
  pois: any;
  selectedPoi: any | null;
  onSelectPoi: (poi: any) => void;
}

export default function MapComponent({ selectedPoi, onSelectPoi }: any) {
  const [viewState, setViewState] = useState({
    longitude: selectedPoi ? selectedPoi.lng : 77.25817,
    latitude: selectedPoi ? selectedPoi.lat : 28.66818,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  });
  console.log("Selected POI in MapComponent:", selectedPoi);
  const [mapData, setMapData] = useState<any>([]);
  // Default to constant on server render to prevent SSR/Hydration crashes
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.STREET);

  // Safely read localStorage on client mount
  // useEffect(() => {
  //   const savedStyle = window.localStorage.getItem("mapStyle");
  //   if (savedStyle) {
  //     setMapStyle(savedStyle);
  //   }
  // }, []);

  useEffect(() => {
    if (selectedPoi) {
      // setViewState((prev) => ({
      //   ...prev,
      //   longitude: selectedPoi.lng,
      //   latitude: selectedPoi.lat,
      //   zoom: 15,
      //   transitionDuration: 1000,
      // }));
    }
  }, [selectedPoi]);
  // const targetPath = "sample_data_spatic/site_analysis_delhi/Malls.json";
  useEffect(() => {
    async function fetchPois() {
      try {
        const targetPath =
          selectedPoi?.path || "site_analysis_delhi/Malls.json";

        const res = await fetch(
          `/api/pois?path=${encodeURIComponent(targetPath)}`,
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("API error:", data);
          return;
        }
        setMapData(data?.data?.stores);
        console.log("Fetched POI data:", data?.data?.stores);
      } catch (error) {
        console.error("Error loading POI data:", error);
      }
    }

    fetchPois();
  }, [selectedPoi]);
  const layers = [
    new ScatterplotLayer({
      id: selectedPoi?.id || "scatterplot-layer",
      data: mapData,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 4,
      radiusMaxPixels: 6,
      lineWidthMinPixels: 1,
      getRadius: (d) => 3,
      getFillColor: (d) => d.color,
      getLineColor: (d) => d.color,
      getPosition: (d) => [parseFloat(d?.lng), parseFloat(d?.lat), 1],
      getSize: (d) => 10,
      getColor: (d) => [140, 140, 0],
    }),
  ];

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState }) => setViewState(viewState as any)}
      controller={true}
      layers={layers}
      getTooltip={({ object }: { object?: any }) =>
        object && {
          html: `<div style="padding: 6px; color: #1e293b; font-family: sans-serif;">
                   <strong style="font-size: 13px;">${object.name}</strong><br/>
                   <span style="font-size: 11px; color: #64748b;">${object.address}</span>
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
  );
}
