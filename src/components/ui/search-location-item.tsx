import { getTypeIcon } from "@/lib/utils";
import { CommandItem } from "./command";
import { PhotonPlace } from "@/types/common";

interface SearchLocationItemProps {
  place: PhotonPlace;
  mapId?: string;
  isSelected: boolean;
  onSelect: (place: PhotonPlace) => void;
}

export const SearchLocationItem = ({
  place,
  onSelect,
}: SearchLocationItemProps) => {
  const Icon = getTypeIcon(place.type);

  return (
    <CommandItem
      value={`${place.name}-${place.osm_type}-${place.osm_id}`}
      key={`${place.osm_type}-${place.osm_id}`}
      onSelect={() => onSelect(place)}
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
