# 🌍 sustAIn: The Green AI Scouter

**Balancing Grid and Green** — *Where renewable potential, infrastructure, and connectivity quietly align.*

**sustAIn** is a geospatial intelligence platform designed to solve the "Where to Build?" problem for businesses in the AI era. By synthesizing fragmented infrastructure data into a single, actionable **sustAIn Score**, we empower developers to site data centers that are as sustainable as they are powerful.

---

## ⚡ The sustAIn Score (0–100)
Every pixel on our map isn't just a coordinate; it’s a calculation. We evaluate four critical pillars to determine site viability:

* **☀️ Renewable (40%)** — Local solar, wind, or hydro capacity. *The heart of green AI.*
* **🔌 Grid (30%)** — Proximity to high-voltage transmission. *Power at the source.*
* **🛰️ Fiber (20%)** — Distance to fiber-optic "right-of-way" corridors. *Data at light speed.*
* **🏢 Ecosystem (10%)** — Proximity to existing data center hubs. *Leveraging the neighborhood.*

---

## 🚀 Key Features

* **Interactive Infrastructure Map** — A high-fidelity exploration of the US energy grid, fiber paths, and power plants.
* **The Scouter View** — Hover over any potential site to see its real-time telemetry and "squiggles-free" data visualization.
* **Siting Dashboards** — Click any location to trigger a deep-dive analysis, breaking down subscores and localized metrics.
* **Resilience Overlays** — Integrated risk mapping for floodplains and seismic zones to ensure long-term facility survival.

---

## 📊 Data & Scoring Architecture

| Module | Logic |
| :--- | :--- |
| **Map Layers** | Uses GeoJSON from `public/` (e.g. `potential-sites.geojson`, `power-plants.geojson`). |
| **Infrastructure** | Transmission and fiber paths are derived from Mapbox composite vector data. |
| **Scoring Engine** | Computed in `lib/scoring.ts` based on spatial distance and renewable capacity. |
| **Dashboards** | Metric visualization using deterministic site analysis. |

---

## 🛠️ Tech Stack

Built with a modern, performance-first stack:
* **Framework**: Next.js 14 (App Router) + React 18
* **Language**: TypeScript (Strict Mode)
* **Mapping**: Mapbox GL JS (Vector Tiles & Custom GeoJSON)
* **Design**: Custom CSS-in-JS + Google Fonts (*Abhaya Libre, Bebas Neue*)

---

## 🤝 Future Roadmap
- [ ] **Live API Integration**: Replacing stub data with real-time grid capacity.
- [ ] **Water Stress Layer**: Factoring in aquifer health for liquid-cooled facilities.
- [ ] **Multi-Site Comparison**: A "Battle Mode" to compare two locations side-by-side.
