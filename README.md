# sustAIn

**Balancing Grid and Green** — Where renewable potential, infrastructure, and connectivity quietly align.

sustAIn helps evaluate locations for sustainable AI data center siting by combining **grid (transmission) proximity**, **renewable energy potential**, **fiber connectivity**, and **existing data center ecosystem** into a single **sustAIn Score** (0–100).

---

## What it does

- **Interactive map** — Explore transmission lines, fiber corridors, renewable sites (solar/wind/hydro), existing data centers, and potential siting locations across the US.
- **SustAIn Score** — Each location gets a weighted score from four factors:
  - **Grid (30%)** — Proximity to high-voltage transmission.
  - **Renewable (40%)** — Local solar, wind, or hydro capacity.
  - **Fiber (20%)** — Distance to fiber-optic corridors.
  - **Ecosystem (10%)** — Proximity to existing data centers.
- **Location dashboards** — Click a potential site on the map to open a dashboard with subscores, metrics, and a focused map view.

---

## Project structure

```
sustAIn/
├── sustain-front/     # Next.js 14 app (map, scoring, dashboards)
│   ├── app/           # Routes: home, dashboard/[id]
│   ├── components/    # Map (Mapbox), etc.
│   ├── lib/           # Scoring logic (computeSustainScore, stubs)
│   └── public/        # GeoJSON: potential-sites, data-centers, power-plants, etc.
└── README.md
```

---

## Quick start

### Prerequisites

- **Node.js** 18+
- A **Mapbox** account and [access token](https://account.mapbox.com/access-tokens/) (free tier is enough)

### Setup

1. **Clone and install**

   ```bash
   cd sustain-front
   npm install
   ```

2. **Environment**

   Create `sustain-front/.env.local` with your Mapbox token:

   ```env
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
   ```

   The map will not load without this variable.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use the map to click a potential site, then open its dashboard via the popup link.

---

## Scripts (sustain-front)

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build        |
| `npm run start`| Start production server |
| `npm run lint` | Run ESLint              |

---

## Data and scoring

- **Map layers** use GeoJSON from `sustain-front/public/` (e.g. `potential-sites.geojson`, `data-centers.geojson`, `power-plants.geojson`). Transmission and fiber are derived from Mapbox composite data.
- **SustAIn Score** is computed in `sustain-front/lib/scoring.ts`. Inputs are distances (transmission, fiber, nearest data center) and renewable potential (numeric or category). The dashboard currently uses **stub inputs** per site (deterministic from site name); these can be replaced with real APIs or datasets.

---

## Tech stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**
- **Mapbox GL JS** for the map
- **Google Fonts**: Abhaya Libre, Ribeye Marrow, Bebas Neue

---

## License

Private / use as needed for the project.
