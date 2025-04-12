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
