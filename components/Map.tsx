/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import Map from "react-map-gl/mapbox";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { BusinessPOI } from "@/types/poi";
import { MAP_STYLES } from "@/constant";

interface MapProps {
  pois: any;
  selectedPoi: any | null;
  onSelectPoi: (poi: any) => void;
}

export default function MapComponent({
  pois,
  selectedPoi,
  onSelectPoi,
}: MapProps) {
  const [viewState, setViewState] = useState({
    longitude: selectedPoi ? selectedPoi.lng : 77.25817,
    latitude: selectedPoi ? selectedPoi.lat : 28.66818,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  });

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
        const targetPath = "site_analysis_delhi/Malls.json";

        const res = await fetch(
          `/api/pois?path=${encodeURIComponent(targetPath)}`,
        );

        console.log("API status:", res.status);

        const data = await res.json();

        if (!res.ok) {
          console.error("API error:", data);
          return;
        }

        console.log("Fetched POIs:", data);

        if (Array.isArray(data)) {
          console.log("POI count:", data.length);

          // setPois(data);

          // if (data.length > 0) {
          //   setSelectedPoi(data[0]);
          // }
        }
      } catch (error) {
        console.error("Error loading POI data:", error);
      }
    }

    fetchPois();
  }, []);
  const layers = [
    new ScatterplotLayer<any>({
      id: "poi-layer",
      data: pois,
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: (d) =>
        selectedPoi?.id === d.id ? [79, 70, 229, 255] : [239, 68, 68, 225],
      getRadius: (d) => (selectedPoi?.id === d.id ? 80 : 50),
      radiusMinPixels: 8,
      radiusMaxPixels: 20,
      pickable: true,
      onClick: (info) => {
        if (info.object) {
          onSelectPoi(info.object as any);
        }
      },
      updateTriggers: {
        getFillColor: [selectedPoi?.id],
        getRadius: [selectedPoi?.id],
      },
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
