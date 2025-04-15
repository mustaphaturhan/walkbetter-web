import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface RoutePlace {
  lat: number;
  lon: number;
  name?: string;
}

interface RouteStoreState {
  locations: RoutePlace[];
  addLocation: (place: RoutePlace) => void;
  removeLocation: (index: number) => void;
  clearLocations: () => void;
  setLocations: (places: RoutePlace[]) => void;
}

export const useRouteStore = create<RouteStoreState>()(
  devtools(
    immer((set) => ({
      locations: [],
      addLocation: (place) =>
        set((state) => {
          state.locations.push(place);
        }),
      removeLocation: (index) =>
        set((state) => {
          state.locations.splice(index, 1);
        }),
      clearLocations: () =>
        set((state) => {
          state.locations = [];
        }),
      setLocations: (places) =>
        set((state) => {
          state.locations = places;
        }),
    })),
    { name: "RouteStore" }
  )
);
