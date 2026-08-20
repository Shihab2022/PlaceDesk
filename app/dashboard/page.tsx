/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { mapLayerDetailConfig } from "@/constant/mapConfilg";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
      Loading deck.gl map...
    </div>
  ),
});

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoi, setSelectedPoi] = useState<any | null>(
    mapLayerDetailConfig[0] || null,
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          // pois={filteredPois}
          selectedPoi={selectedPoi}
          onSelectPoi={setSelectedPoi}
        />
        <main className="flex-1 h-full relative">
          <DynamicMap
            // pois={filteredPois}
            selectedPoi={selectedPoi}
            onSelectPoi={setSelectedPoi}
          />
        </main>
      </div>
    </div>
  );
}
