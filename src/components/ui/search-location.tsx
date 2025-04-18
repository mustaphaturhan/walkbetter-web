import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";
import { PhotonPlace } from "@/types/common";
import { Loader2, SearchIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandList } from "./command";
import { SearchLocationItem } from "./search-location-item";
import { Input } from "./input";

interface SearchLocationProps {
  onSelect: (place: PhotonPlace) => void;
  onFocus?: () => void;
  selectedValue?: PhotonPlace;
  mapId?: string;
  initialOptions?: PhotonPlace[] | null;
  isLoadingInitialOptions?: boolean;
}

export interface SearchLocationRef {
  focus: () => void;
}

export const SearchLocation = forwardRef<
  SearchLocationRef,
  SearchLocationProps
>(
  (
    {
      onSelect,
      onFocus,
      selectedValue,
      mapId,
      initialOptions,
      isLoadingInitialOptions,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
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

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    return (
      <Command className="h-auto" shouldFilter={false}>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Search for a place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onFocus}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoadingSearch || (isLoadingInitialOptions && !query) ? (
              <Loader2 className="size-4 shrink-0 opacity-50 animate-spin" />
            ) : (
              <SearchIcon className="size-4 shrink-0 opacity-50" />
            )}
          </div>
        </div>
        <CommandList className="max-h-full outline-none">
          {query.length > 2 && (
            <CommandEmpty>
              {isLoadingSearch || isLoadingInitialOptions
                ? "Loading..."
                : "No place found."}
            </CommandEmpty>
          )}
          {showInitialOptions && !isLoadingInitialOptions && (
            <CommandGroup heading="Nearby Suggestions" className="p-0">
              {initialOptions.map((place) => (
                <SearchLocationItem
                  key={`${place.osm_type}-${place.osm_id}`}
                  place={place}
                  mapId={mapId}
                  isSelected={isPlaceSelected(place)}
                  onSelect={() => {
                    onSelect(place);
                    setQuery("");
                  }}
                />
              ))}
            </CommandGroup>
          )}
          {showSearchResults && (
            <CommandGroup className="p-0">
              {searchData?.results?.map((place) => (
                <SearchLocationItem // Use the new component
                  key={`${place.osm_type}-${place.osm_id}`}
                  place={place}
                  mapId={mapId}
                  isSelected={isPlaceSelected(place)} // Pass isSelected
                  onSelect={() => {
                    onSelect(place);
                    setQuery("");
                  }} // Pass onSelect handler
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    );
  }
);

SearchLocation.displayName = "SearchLocation";
