import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";
import { PhotonPlace } from "@/types/common";
import { Loader2, SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "./command";
import { SearchLocationItem } from "./search-location-item";

interface SearchLocationProps {
  onSelect: (place: PhotonPlace) => void;
  selectedValue?: PhotonPlace;
  mapId?: string;
  initialOptions?: PhotonPlace[] | null;
  isLoadingInitialOptions?: boolean;
}

export function SearchLocation({
  onSelect,
  selectedValue,
  mapId,
  initialOptions,
  isLoadingInitialOptions,
}: SearchLocationProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400); // ⏳

  const { data: searchData, isLoading: isLoadingSearch } =
    api.photon.search.useQuery(
      { query: debouncedQuery },
      { enabled: debouncedQuery.length >= 2, staleTime: 1000 * 60 * 5 }
    );

  const isPlaceSelected = (place: PhotonPlace) =>
    selectedValue?.osm_type === place.osm_type &&
    selectedValue?.osm_id === place.osm_id;

  const showInitialOptions = !debouncedQuery && !!initialOptions?.length;
  const showSearchResults = debouncedQuery.length >= 2;

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a place"
        value={query}
        onValueChange={setQuery}
        customIcon={
          isLoadingSearch || (isLoadingInitialOptions && !query) ? (
            <Loader2 className="size-4 shrink-0 opacity-50 animate-spin" />
          ) : (
            <SearchIcon className="size-4 shrink-0 opacity-50" />
          )
        }
      />
      <CommandList>
        <CommandEmpty>
          {isLoadingSearch || isLoadingInitialOptions
            ? "Loading..."
            : "No place found."}
        </CommandEmpty>
        {showInitialOptions && !isLoadingInitialOptions && (
          <CommandGroup heading="Nearby Suggestions">
            {initialOptions.map((place) => (
              <SearchLocationItem
                key={`${place.osm_type}-${place.osm_id}`}
                place={place}
                mapId={mapId}
                isSelected={isPlaceSelected(place)}
                onSelect={onSelect}
              />
            ))}
          </CommandGroup>
        )}
        {showSearchResults && (
          <CommandGroup>
            {searchData?.results?.map((place) => (
              <SearchLocationItem // Use the new component
                key={`${place.osm_type}-${place.osm_id}`}
                place={place}
                mapId={mapId}
                isSelected={isPlaceSelected(place)} // Pass isSelected
                onSelect={onSelect} // Pass onSelect handler
              />
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
