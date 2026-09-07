<div align="center">

# 🗺️ PlaceDesk — Retail GIS Intelligence

**Location Analytics & Spatial Advisory Platform**

Spatial GIS • Location Analytics & Heatmaps

_Spatial analytics engine providing territory mapping, catchment-area calculations, competitor-density heat maps, and dynamic ROI forecasts for commercial site selection._

</div>

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🗺️ Map Layers & Visualizations](#️-map-layers--visualizations)
- [🏙️ City & Region Coverage](#-city--region-coverage)
- [📊 Analytics & Insights](#-analytics--insights)
- [🔐 Authentication](#-authentication)
- [🧱 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#-architecture)
- [🔌 API Endpoints](#-api-endpoints)
- [🎯 Use Cases](#-use-cases)

---

## ✨ Features

PlaceDesk is an end-to-end **location-intelligence GIS workspace** that turns raw geographic data into market insight. Everything below is implemented in this app.

**Platform & pipeline**

- Product pipeline: **Data → Layers → Filter → Visualize → Explore → Insight** — every stage connects to a real dataset.
- One unified state model: `City → Division → Layers → Layer Data → Layer Filters → Search Query → Map`.
- Switch cities/regions instantly; the market, cluster and category distribution re-renders with the location.

**Multi-layer GIS workspace (`/dashboard`)**

- **13 POI layers / categories**: Malls, Furniture, Electronics, Leisure, Medical, Transport, Companies, Education, Fashion, Fitness, Food, Others, and Supermarket — each with its own color scheme, icon, and controls.
- **6 Deck.gl GPU-accelerated visualizations** — Scatter, Icon, Heatmap, Cluster, Hexagon, and Density (with gradients: Purple, Viridis, Warm, Cool).
- **6 Mapbox GL base-map themes** — Streets, Light, Dark, Satellite, Satellite Streets, Outdoors.
- Per-layer **filters** — sub-category, brand, store type, price / cost-for-two range, rating, votes, and service options (select, multi-select, and range controls).
- **Map legend**, zoom in/out, recenter/locate, fullscreen, and map-theme switcher floating controls.
- **Custom Deck.gl vector overlay layers & demographic heatmaps** on top of Mapbox GL tile maps.
- Smooth interactive **tooltips** (brand, cost-for-two, votes, town) and **click-to-select** locations with a rich location-details side panel.
- **Street-View integration** (Google Maps provider) for selected locations.

**Search ("⌘K")**

- Global command-palette search across all layers — results grouped **by category, by brand, and by town** with matching locations highlighted/muted on the map.

**Analytics & market insights**

- Bottom **analytics / market-overview drawer** — total visible locations per layer, per-layer breakdown, top districts covered, market delta.
- **Market overview** with distribution metrics; district-level insights derived live from visible data.

**Data ingestion & sources**

- **Add Dataset** modal: import **CSV, Excel, GeoJSON, JSON** (drag & drop) or connect **PostgreSQL, MySQL, MongoDB, API, Cloud Storage**.
- Built-in **data sources** registry: GitHub-backed Delhi POI API, Bangladesh generated dataset, Indian-metro mocks, Mapbox tiles (Connected), plus PostgreSQL/MongoDB/CSV/GeoJSON as available options.
- Exports: **map-to-image (PNG / JPG @ 1×, 2×, 4×)** and location tables as **CSV / JSON / GeoJSON**.

**Sharing & collaboration**

- **Share maps via encoded URLs** — captures city, map style, active layers, layer visibility, viewport (zoom/lat/lng), division, and search query; restored on open.
- **Saved projects** (favorites, per-city layer configs, map style, theme).
- Collapsible sidebar (Overview, Maps, Layers, Data Sources, Analytics, Locations, Reports, Saved Projects, Help & Support, Settings) with **Light / Dark / System theming** (persisted to `localStorage`).

---

## 🗺️ Map Layers & Visualizations

| Layer                                   | Color        | Data               |
| --------------------------------------- | ------------ | ------------------ |
| Malls                                   | 🟣 `#5B2FBF` | Real Delhi dataset |
| Food                                    | 🟠 `#F97316` | Real / mock        |
| Electronics                             | 🟣 `#7C4DFF` | Real / mock        |
| Medical                                 | 🔴 `#EF4444` | Real / mock        |
| Transport                               | 🟢 `#10B981` | Real / mock        |
| Companies                               | 🔵 `#6366F1` | Real / mock        |
| Education                               | 🟢 `#22C55E` | Real / mock        |
| Fashion                                 | 🩷 `#EC4899` | Real / mock        |
| Fitness                                 | 🟡 `#84CC16` | Real / mock        |
| Leisure, Furniture, Others, Supermarket | …            | Real / mock        |

**Deck.gl rendering:** `ScatterplotLayer`, `TextLayer` (icon), `HeatmapLayer`, `HexagonLayer` + density/cluster overlays, rendered on a GPU-accelerated canvas over the Mapbox GL basemap — smooth pan/zoom with tens of thousands of points.

---

## 🏙️ City & Region Coverage

| City                                                                                                          | Data source                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Delhi** (NCR)                                                                                               | 🎯 **Real dataset** — fetched live via (GitHub-backed, auto-refreshed hourly) |
| **Mumbai, Bengaluru, Hyderabad**                                                                              | Schema-identical deterministic mock data                                      |
| **Bangladesh** — all 8 divisions (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh) | Deterministic generated POI data                                              |

## 📊 Analytics & Insights

- Market Overview & **competitor-density heatmaps**.
- Top districts / towns with % distribution, computed on the fly from visible data.
- Per-layer location counts, category funnels and filters; dynamic **ROI / site-choice forecasting** for commercial site selection.
- Demographic **catchment area & drive-time spatial calculations** (advisory).

---

---

## 🧱 Tech Stack

**Frontend**

- Next.js (App Router) · React · TypeScript
- Deck.gl Canvas · Mapbox GL (`react-map-gl`, `maplibre-gl`)
- Tailwind CSS v4 · react-icons

**Backend & Data**

- Node.js API routes (Next.js)
- PostGIS Spatial Engine · Coordinate Extractor · Spatial Indexing
- PostgreSQL / PostGIS · Prisma (schema-ready) · Docker

**`allTech`:** Next.js · React · TypeScript · Deck.gl · Mapbox GL · PostgreSQL / PostGIS

---

## 🏗️ Architecture

- **Deck.gl GPU-accelerated canvas overlays** are stacked on top of **Mapbox GL tile maps**; spatial boundary calculations are computed via PostGIS-backed spatial indices.
- **Data resolution order:** Bangladesh divisions → deterministic generator; Delhi → real GitHub-backed dataset via `/api/pois`; all other cities → schema-identical deterministic mock generator (works fully offline).
- **Global state:** React Context store (`AppStoreContext`) owns city → division → layers → filters → search → viewport, keeping map, panels and analytics in sync.
- **Scaling:** processing and rendering multi-layered vector spatial datasets and dynamic canvas overlays in real time without browser memory spikes — the optimized client canvas streams **100,000+ spatial points smoothly**.

---

---

## 🎯 Use Cases

PlaceDesk is built for decisions that depend on **where**:

- **Retail** — store placement, competitor mapping, catchment analysis, market density & expansion
- **Real Estate** — area analysis, amenity proximity, commercial clusters, development opportunity
- **Logistics** — service coverage, delivery zones & distribution planning
- **Healthcare** — facility mapping, coverage/accessibility & underserved regions
- **Market Research** — competitor analysis, category distribution, regional comparison & segmentation

---

## 🎯 Url

- [Live demo:](https://github.com/Shihab2022/PlaceDesk)
- [Workspace:](/dashboard)
- [GitHub:](https://place-desk-xi.vercel.app/)
