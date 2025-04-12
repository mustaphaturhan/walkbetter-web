"use client";

import MapGL, {
  GeolocateControl,
  NavigationControl,
  MapRef,
  MapLayerMouseEvent,
  Marker,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import PlaceInfoCard from "../ui/place-info-card";
import { useMapStore } from "@/stores/map.store";

const initialViewState = { zoom: 5, longitude: 13.388, latitude: 49.517 };

interface MapProps {
  id: string;
}

export const Map = ({ id }: MapProps) => {
  const mapRef = useRef<MapRef>(null);
  const setMapRef = useMapStore((s) => s.setMapRef);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const previewPlace = useMapStore((s) => s.previewPlaces[id] ?? null);
  const [viewState, setViewState] = useState(initialViewState);
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

      {previewPlace && previewPlace.ready && (
        <div className="absolute bottom-4 w-full max-w-[350px] left-1/2 -translate-x-1/2">
          <PlaceInfoCard
            smallImgUrl={previewPlace.image?.thumb_256_url}
            bigImgUrl={previewPlace.image?.thumb_1024_url}
            place={previewPlace}
            onClose={() => setPreviewPlace(id, null)}
          />
        </div>
      )}
    </MapGL>
  );
};
