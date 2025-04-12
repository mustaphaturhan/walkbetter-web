"use client";

import { MapProvider } from "react-map-gl/maplibre";

export function ClientMapProvider({ children }: { children: React.ReactNode }) {
  return <MapProvider>{children}</MapProvider>;
}
