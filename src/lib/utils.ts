import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Landmark,
  Building2,
  MapPin,
  TentTree,
  Castle,
  Mountain,
  LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTypeIcon(type: string): LucideIcon {
  switch (type) {
    case "house":
      return Building2;
    case "neighbourhood":
    case "locality":
    case "village":
    case "suburb":
      return TentTree;
    case "city":
      return Landmark;
    case "district":
      return Castle;
    case "mountain":
    case "peak":
      return Mountain;
    default:
      return MapPin;
  }
}

export const toOsmKey = (p: { osm_type: string; osm_id: number }) =>
  `${p.osm_type}-${p.osm_id}`;

// todo: fix type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildSelectedIdSet = (places: any) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Set(places.filter((p: any) => Boolean(p?.osm_id)).map(toOsmKey));
