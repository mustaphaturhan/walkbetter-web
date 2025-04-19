import { Popup } from "react-map-gl/maplibre";

import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import PlaceInfoCard from "../ui/place-info-card";
import { PreviewPlace } from "@/types/common";

interface PreviewPlaceMarkerProps {
  place: PreviewPlace;
  onClose: () => void;
  onSelectPlace: (place: PreviewPlace) => void;
}

export const PreviewPlaceMarker = ({
  place,
  onClose,
  onSelectPlace,
}: PreviewPlaceMarkerProps) => {
  return (
    <>
      <Marker longitude={place.lon} latitude={place.lat}>
        <MapPin
          className={cn(
            "w-6 h-6 relative bottom-2 rounded-full fill-white stroke-orange-600",
            !place.ready && "animate-pulse stroke-gray-600"
          )}
        />
      </Marker>
      {place.ready && (
        <Popup
          longitude={place.lon}
          latitude={place.lat}
          onClose={onClose}
          closeButton={false}
          anchor="bottom"
          offset={24}
        >
          <PlaceInfoCard
            place={place}
            onClose={onClose}
            onSelect={onSelectPlace}
          />
        </Popup>
      )}
    </>
  );
};
