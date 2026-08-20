/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { mapLayerDetailConfig } from "@/constant/mapConfilg";
import { FiStar, FiMapPin, FiTag } from "react-icons/fi";

export default function Sidebar({ selectedPoi, onSelectPoi }: any) {
  return (
    <aside className="w-full md:w-96 h-full bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Results ({mapLayerDetailConfig.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {mapLayerDetailConfig.map((poi) => {
          const isSelected = selectedPoi?.id === poi.id;
          return (
            <div
              key={poi.id}
              onClick={() => onSelectPoi(poi)}
              className={`p-4 cursor-pointer transition-colors hover:bg-indigo-50/50 ${
                isSelected ? "bg-indigo-50/80 border-l-4 border-indigo-600" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">
                  {poi.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  <FiStar className="w-3 h-3 fill-amber-400 text-amber-500" />
                  {/* {poi.number_of_votes} */}
                  12
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <FiTag className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize">
                  {/* {poi.category.replace("_", " ")} */}
                  City
                </span>
                <span>•</span>
                {/* <span className="capitalize">{poi.type.replace("_", " ")}</span> */}
              </div>

              <div className="mt-2 flex items-start gap-1 text-xs text-slate-600">
                <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="line-clamp-2">Dehli</p>
                {/* <p className="line-clamp-2">{poi.address}</p> */}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
