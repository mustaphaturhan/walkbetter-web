"use client";

import MapGL, {
  GeolocateControl,
  NavigationControl,
  MapRef,
  MapLayerMouseEvent,
  Marker,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import PlaceInfoCard from "../ui/place-info-card";
import { useMapStore } from "@/stores/map.store";
import { useRouteStore } from "@/stores/route.store";
import { useRouter, useSearchParams } from "next/navigation";

const initialViewState = { zoom: 5, longitude: 13.388, latitude: 49.517 };

interface MapProps {
  id: string;
}

export const Map = ({ id }: MapProps) => {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const setMapRef = useMapStore((s) => s.setMapRef);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const previewPlace = useMapStore((s) => s.previewPlaces[id] ?? null);
  const locations = useRouteStore((s) => s.locations);
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState({
    zoom: Number(searchParams.get("zoom")) || initialViewState.zoom,
    longitude: Number(searchParams.get("lon")) || initialViewState.longitude,
    latitude: Number(searchParams.get("lat")) || initialViewState.latitude,
  });
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const input = useMemo(() => {
    if (!previewPlace) return undefined;
    return { lat: previewPlace.lat, lng: previewPlace.lon } as const;
  }, [previewPlace]);

  const reverseQuery = api.reverse.byCoords.useQuery(input!, {
    enabled: !!input,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (reverseQuery.data && !reverseQuery.isFetching) {
      const newPreviewPlace = {
        ...reverseQuery.data.result,
        lat: previewPlace?.lat,
        lon: previewPlace?.lon,
        ready: true,
      };

      if (JSON.stringify(newPreviewPlace) !== JSON.stringify(previewPlace)) {
        // @ts-expect-error - TODO: fix this after development process is done
        setPreviewPlace(id, newPreviewPlace);
      }
    }
  }, [
    reverseQuery.data,
    reverseQuery.isFetching,
    setPreviewPlace,
    id,
    previewPlace,
  ]);

  const handleMapClick = async (e: MapLayerMouseEvent) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      return;
    }

    // we need to wait a bit to see if the user is double clicking
    clickTimeout.current = setTimeout(() => {
      clickTimeout.current = null;
      const { lng, lat } = e.lngLat;

      if (viewState.zoom > 12) {
        // @ts-expect-error - TODO: fix this after development process is done
        setPreviewPlace(id, { lat, lon: lng });
      } else {
        toast("Can't select the location from this distance.", {
          action: {
            label: "Zoom in",
            onClick: () =>
              mapRef.current?.flyTo({
                zoom: 14.1,
                center: { lng, lat },
                duration: 1000,
              }),
          },
        });
      }
    }, 250);
  };

  return (
    <MapGL
      ref={mapRef}
      id="main"
      style={{ width: "100%", height: "100%" }}
      mapStyle="/assets/default.json"
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onMoveEnd={(e) => {
        router.push(
          `/trip/generate?lat=${e.viewState.latitude}&lon=${e.viewState.longitude}&zoom=${e.viewState.zoom}`
        );
      }}
      minZoom={2.2}
      onClick={handleMapClick}
      onZoomStart={(e) => e.viewState.zoom < 6 && setPreviewPlace(id, null)}
      onLoad={() => {
        if (mapRef.current) {
          setMapRef(id, mapRef.current);
        }
      }}
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        showAccuracyCircle={false}
      />
      <NavigationControl showCompass={false} />

      {previewPlace && (
        <Marker longitude={previewPlace.lon} latitude={previewPlace.lat}>
          <MapPin className="w-6 h-6 relative bottom-2 rounded-full fill-white stroke-orange-600" />
        </Marker>
      )}

      {locations.map((location, i) => (
        <Marker key={i} longitude={location.lon} latitude={location.lat}>
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center border-2 border-white shadow-md">
            {i + 1}
          </div>
        </Marker>
      ))}

      {previewPlace && previewPlace.ready && (
        <Popup
          longitude={previewPlace.lon}
          latitude={previewPlace.lat}
          onClose={() => setPreviewPlace(id, null)}
          closeButton={false}
          // closeOnClick={false}
          anchor="bottom"
          offset={24}
        >
          <PlaceInfoCard place={previewPlace} />
        </Popup>
      )}
    </MapGL>
  );
};
