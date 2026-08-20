'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { BusinessPOI } from '@/types/poi';

const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
      Loading deck.gl map...
    </div>
  ),
});

const mockPois: BusinessPOI[] = [
  {
    id: 'ChIJJ1eQdHD9DDkRnZm8IJxlEgM',
    name: 'Fine furniture',
    lat: 28.66818618774414,
    lng: 77.2581787109375,
    category: 'home_decor',
    sub_categories: '[[Shopping mall]]',
    pincode: '110053',
    type: 'furniture_store',
    address: 'Fine furniture, Shop no-1 G-block gate no-5, Shastri park, Delhi, 110053',
    town_name: 'new delhi',
    brand_name: 'N_A',
    number_of_votes: 398,
    service_options: '[]',
    cost_for_two: 0,
  },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<BusinessPOI | null>(mockPois[0]);

  const filteredPois = mockPois.filter(
    (poi) =>
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.town_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          pois={filteredPois}
          selectedPoi={selectedPoi}
          onSelectPoi={setSelectedPoi}
        />
        <main className="flex-1 h-full relative">
          <DynamicMap
            pois={filteredPois}
            selectedPoi={selectedPoi}
            onSelectPoi={setSelectedPoi}
          />
        </main>
      </div>
    </div>
  );
}