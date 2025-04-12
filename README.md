# 🥾 WalkBetter (WIP)

**WalkBetter** helps tourists discover and plan the most efficient walking routes through cities.
Avoid retracing your steps, hit every must-see spot — and explore smarter.

> ⚠️ This project is currently a **Work In Progress**. Expect breaking changes and missing features.

---

## 🚀 Features

- 🧭 Reverse geocoding with [Nominatim](https://nominatim.org)
- 🖼️ Street-level imagery from [Mapillary](https://www.mapillary.com)
- 🗺️ Interactive maps using [MapLibre GL JS](https://maplibre.org)
- 🧠 Optimized walking route calculation
- ⚡ Built with Next.js (App Router), tRPC, Tailwind CSS, Zustand

---

## 🛠️ Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Create `.env.local`

```env
NOMINATIM=https://nominatim.openstreetmap.org
PHOTON=https://photon.komoot.io
USER_AGENT="AppName (you@example.com)"
MAPILLARY_TOKEN="your_mapillary_token_here"
```

> Don't forget to grab a token from [Mapillary](https://mapillary.com/dashboard/developer)

### 3. Run the app

```bash
yarn dev
```

---

## 🌍 About the Map

This project uses a custom vector style with MapLibre and OpenMapTiles.
POI visibility (like landmarks vs. shops) is handled based on zoom levels for a cleaner user experience.

---

## 📦 Tech Stack

- **Frontend**: Next.js 15+, App Router, React 19, TypeScript
- **Map**: MapLibre, OpenMapTiles, OpenStreetMap
- **API**: tRPC (server actions)
- **State**: Zustand (with `immer` & `devtools`)
- **Reverse Geocode**: OpenStreetMap Nominatim
- **Street Images**: Mapillary Graph API

---

## 📄 License

GPL – see [LICENSE](./LICENSE)

---

## 💸 Pricing

WalkBetter will always be **completely free** for everyone to use.

---

## 💼 Hire Me

If you're looking for a developer to bring ideas like this to life,
feel free to reach out: **mustaphaturhan@gmail.com**
