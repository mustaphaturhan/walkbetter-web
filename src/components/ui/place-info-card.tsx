import { MapPinHouse, X } from "lucide-react";
import { Button } from "./button";
import { PreviewPlace } from "@/types/common";

type Props = {
  place: PreviewPlace;
  onClose: () => void;
  onSelect: (place: PreviewPlace) => void;
};

export default function PlaceInfoCard({ place, onClose, onSelect }: Props) {
  const {
    display_name,
    address,
  } = place;

  const fullAddress = [
    address?.suburb,
    address?.road,
    address?.postcode,
    address?.city || address?.town,
    address?.state,
    address?.country
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="px-2">
      <div className="grid gap-0.5 flex-1">
        <div className="font-bold text-lg line-clamp-1">
          {display_name?.split(",")[0]}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {fullAddress}
        </div>
        <div className="mt-2">
          <div className="grid gap-2">
            <Button
              onClick={() => {
                onSelect(place);
              }}
            >
              <MapPinHouse />
              Select as a starting point
            </Button>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          className="absolute top-2.5 right-2"
          variant="ghost"
          size="icon-xs"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
