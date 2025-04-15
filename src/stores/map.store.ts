import { PreviewPlace } from "@/types/common";
import { MapRef } from "react-map-gl/maplibre";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface MapState {
  mapRefs: Record<string, MapRef>;
  setMapRef: (id: string, ref: MapRef | null) => void;

  previewPlaces: Record<string, PreviewPlace | null>;
  setPreviewPlace: (id: string, place: PreviewPlace | null) => void;

  flyTo: (
    id: string,
    coords: { lat: number; lon: number; zoom?: number }
  ) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    immer((set, get) => ({
      mapRefs: {},
      setMapRef: (id, ref) =>
        set((state) => ({
          mapRefs: {
            ...state.mapRefs,
            [id]: ref!,
          },
        })),
      previewPlaces: {},
      setPreviewPlace: (id, place) =>
        set((state) => {
          state.previewPlaces[id] = place;
        }),

      flyTo: (id, { lat, lon, zoom = 16 }) => {
        const ref = get().mapRefs[id];
        if (!ref) return;
        ref.flyTo({ center: [lon, lat], zoom, duration: 1000 });
      },
    })),
    { name: "MapStore" }
  )
);
