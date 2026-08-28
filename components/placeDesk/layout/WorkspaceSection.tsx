"use client";

import type { CityDef } from "../data";
import { useAppStore } from "../app/AppStoreContext";

export default function WorkspaceSection({
  section,
  city,
  onNavigate,
}: {
  section: string;
  city: CityDef;
  onNavigate: (section: string) => void;
}) {
  const store = useAppStore();
  const title = section.replace("-", " ");
  const locations = store.layers
    .filter((layer) => layer.visible && layer.dataLoaded)
    .flatMap((layer) => layer.filteredData.map((location) => ({ location, layer })));

  return (
    <section className="absolute inset-x-0 bottom-0 top-[55px] z-50 overflow-y-auto bg-canvas p-5 sm:p-7">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          PlaceDesk workspace
        </p>
        <h2 className="mt-1 text-2xl font-semibold capitalize text-ink-900">{title}</h2>
        <p className="mt-1 text-[13px] text-ink-500">{city.label} · live workspace data</p>

        {section === "overview" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total Locations" value={store.totalVisible.toLocaleString("en-US")} />
            <Metric label="Active Layers" value={String(store.layers.length)} />
            <Metric label="Available Categories" value="13" />
            <Metric label="Selected City" value={city.label} />
          </div>
        )}

        {section === "layers" && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {store.layers.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  store.setActiveId(layer.id);
                  onNavigate("maps");
                }}
                className="rounded-xl border border-line bg-white p-4 text-left hover:shadow-md"
              >
                <div className="flex items-center justify-between font-semibold text-ink-900">
                  {layer.label}
                  <span className={`h-2.5 w-2.5 rounded-full ${layer.visible ? "bg-emerald-500" : "bg-line"}`} />
                </div>
                <p className="mt-2 text-[12px] text-ink-500">
                  {layer.filteredData.length.toLocaleString("en-US")} visible locations · {layer.visualizationType}
                </p>
              </button>
            ))}
          </div>
        )}

        {section === "data-sources" && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {store.dataSources.map((source) => (
              <div key={source.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-ink-900">{source.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{source.status}</span>
                </div>
                <p className="mt-2 text-[12px] text-ink-500">{source.description ?? `${source.type} source`}</p>
              </div>
            ))}
          </div>
        )}

        {section === "analytics" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Loaded Records" value={store.totalLoaded.toLocaleString("en-US")} />
            <Metric label="Visible Records" value={store.totalVisible.toLocaleString("en-US")} />
            <Metric label="Towns Covered" value={new Set(locations.map(({ location }) => location.town_name)).size.toLocaleString("en-US")} />
            <Metric label="Search Matches" value={store.hasActiveSearch ? store.searchResults.total.toLocaleString("en-US") : "—"} />
          </div>
        )}

        {section === "locations" && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead className="bg-canvas text-[10px] uppercase tracking-wide text-ink-400">
                <tr>{["Name", "Category", "Type", "Town", "Brand", "Votes", "Cost"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {locations.slice(0, 100).map(({ location, layer }) => (
                  <tr key={`${layer.id}-${location.id}`} className="cursor-pointer hover:bg-brand-50/50" onClick={() => { store.setActiveId(layer.id); store.setSelectedLocation(location, layer.id); store.setViewport({ longitude: location.lng, latitude: location.lat, zoom: 14 }); onNavigate("maps"); }}>
                    <td className="px-4 py-3 font-medium">{location.name}</td><td className="px-4 py-3">{layer.label}</td><td className="px-4 py-3 capitalize">{location.type.replace(/_/g, " ")}</td><td className="px-4 py-3">{location.town_name}</td><td className="px-4 py-3">{location.brand_name === "N_A" ? "—" : location.brand_name}</td><td className="px-4 py-3">{location.number_of_votes.toLocaleString("en-US")}</td><td className="px-4 py-3">৳{location.cost_for_two.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(section === "reports" || section === "saved" || section === "settings") && (
          <div className="mt-6 rounded-xl border border-line bg-white p-6">
            <h3 className="font-semibold capitalize text-ink-900">{title} workspace</h3>
            <p className="mt-2 text-[13px] text-ink-500">Connected to the active city, layers, filters, and viewport.</p>
            <button type="button" className="btn-primary mt-4" onClick={() => onNavigate("maps")}>Return to map</button>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
