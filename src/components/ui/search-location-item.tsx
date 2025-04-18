import { getTypeIcon } from "@/lib/utils";
import { CommandItem } from "./command";
import { PhotonPlace } from "@/types/common";
import { useMapStore } from "@/stores/map.store";

interface SearchLocationItemProps {
  place: PhotonPlace;
  mapId?: string;
  isSelected: boolean;
  onSelect: (place: PhotonPlace) => void;
}

export const SearchLocationItem = ({
  place,
  mapId,
  onSelect,
}: SearchLocationItemProps) => {
  const flyTo = useMapStore((s) => s.flyTo);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const Icon = getTypeIcon(place.type);

  const handleSelect = () => {
    onSelect(place);
    if (mapId) {
      flyTo(mapId, { lat: place.lat, lon: place.lon, zoom: 15 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPreviewPlace(mapId, place as any);
    }
  };

  return (
    <CommandItem
      value={`${place.name}-${place.osm_type}-${place.osm_id}`}
      key={`${place.osm_type}-${place.osm_id}`}
      onSelect={handleSelect}
      className="cursor-pointer"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="flex flex-col">
          <span className="font-medium">{place.name}</span>
          <span className="text-xs text-muted-foreground">
            {place.city ?? ""} {place.country ? ` (${place.country})` : ""}
          </span>
        </div>
      </div>
    </CommandItem>
  );
};
