import { cn, getTypeIcon } from "@/lib/utils";
import { Check, Eye } from "lucide-react";
import { Button } from "./button";
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
  isSelected,
  onSelect,
}: SearchLocationItemProps) => {
  const flyTo = useMapStore((s) => s.flyTo);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const Icon = getTypeIcon(place.type);

  const handleSelect = () => {
    onSelect(place);
    if (mapId) {
      flyTo(mapId, { lat: place.lat, lon: place.lon, zoom: 15 });
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item selection
    if (mapId) {
      flyTo(mapId, { lat: place.lat, lon: place.lon, zoom: 14 });
      // todo: make this type safe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPreviewPlace(mapId, place as any);
    }
  };

  return (
    <CommandItem
      value={`${place.name}-${place.osm_type}-${place.osm_id}`}
      key={`${place.osm_type}-${place.osm_id}`}
      onSelect={handleSelect}
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
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <Check
          className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")}
        />
        {mapId && (
          <Button
            variant="outline"
            className="ml-auto hover:bg-border"
            onClick={handlePreview}
            size="icon-sm"
            aria-label="Preview on map"
          >
            <Eye />
          </Button>
        )}
      </div>
    </CommandItem>
  );
};
