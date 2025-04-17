/* eslint-disable @next/next/no-img-element */
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { PreviewPlace } from "@/types/common";

type Props = {
  place: PreviewPlace;
  smallImgUrl?: string | null;
  bigImgUrl?: string | null;
  onClose?: () => void;
  footer?: React.ReactNode;
};

export default function PlaceInfoCard({
  place,
  smallImgUrl,
  bigImgUrl,
  onClose,
  footer,
}: Props) {
  const {
    display_name,
    address: { road, suburb, city, town, postcode, state, country },
  } = place;

  const fullAddress = [suburb, road, postcode, city || town, state, country]
    .filter(Boolean)
    .join(", ");

  const imageSrc = smallImgUrl ?? "/assets/images/no-image.svg";

  const image = (
    <img
      src={imageSrc}
      alt="Street View"
      className="w-24 h-24 rounded-lg object-cover shrink-0"
    />
  );

  return (
    <div className="rounded-md border bg-background p-3 items-center flex gap-4 relative">
      <div className="shrink-0">
        {bigImgUrl ? (
          <Link href={bigImgUrl} target="_blank" rel="noopener noreferrer">
            {image}
          </Link>
        ) : (
          image
        )}
      </div>

      <div className="grid gap-0.5 flex-1">
        <div className="font-semibold line-clamp-1">
          {display_name.split(",")[0]}
        </div>
        <div className="text-sm text-slate-600 line-clamp-2">{fullAddress}</div>
        <div className="flex gap-2 mt-1">{footer}</div>
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
