'use client';

import { FiSearch, FiMapPin, FiSliders } from 'react-icons/fi';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 flex items-center justify-between z-20 shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <FiMapPin className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">GeoScope</span>
      </div>

      <div className="relative w-full max-w-md mx-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search places, categories, or towns..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
        />
      </div>

      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
        <FiSliders className="w-4 h-4" />
        <span>Filters</span>
      </button>
    </header>
  );
}