import { Check, Eye, Loader2, SearchIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, getTypeIcon } from "@/lib/utils";
import { Button } from "./button";
import { useMapStore } from "@/stores/map.store";
import { PhotonPlace } from "@/types/common";

interface SearchLocationProps {
  onSelect: (place: PhotonPlace) => void;
  selectedValue?: PhotonPlace;
  mapId?: string;
}

export function SearchLocation({
  onSelect,
  selectedValue,
  mapId,
}: SearchLocationProps) {
  const flyTo = useMapStore((s) => s.flyTo);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400); // ⏳

  const { data, isLoading } = api.photon.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2, staleTime: 1000 * 60 * 5 }
  );

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a place"
        value={query}
        onValueChange={setQuery}
        customIcon={
          isLoading ? (
            <Loader2 className="size-4 shrink-0 opacity-50 animate-spin" />
          ) : (
            <SearchIcon className="size-4 shrink-0 opacity-50" />
          )
        }
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Loading..." : "No place found."}
        </CommandEmpty>
        <CommandGroup>
          {data?.results?.map((place) => {
            const Icon = getTypeIcon(place.type);

            return (
              <CommandItem
                value={`${place.name}-${place.osm_type}-${place.osm_id}`}
                key={`${place.osm_type}-${place.osm_id}`}
                onSelect={() => {
                  onSelect(place);
                  if (mapId) {
                    flyTo(mapId, { lat: place.lat, lon: place.lon, zoom: 15 });
                  }
                }}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex flex-col">
                    <span className="font-medium">{place.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {place.city ?? ""}{" "}
                      {place.country ? `(${place.country})` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Check
                    className={cn(
                      "ml-auto",
                      `${selectedValue?.osm_type}-${selectedValue?.osm_id}` ===
                        `${place.osm_type}-${place.osm_id}`
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {mapId && (
                    <Button
                      variant="outline"
                      className="ml-auto hover:bg-border"
                      onClick={(e) => {
                        e.stopPropagation();
                        flyTo(mapId, { lat: place.lat, lon: place.lon });
                        // todo: make this type safe
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setPreviewPlace(mapId, place as any);
                      }}
                      size="icon-sm"
                    >
                      <Eye />
                    </Button>
                  )}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
