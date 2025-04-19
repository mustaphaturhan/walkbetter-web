import { NominatimResponse } from "@/server/types";

export interface PhotonPlace {
  name: string;
  city?: string;
  country?: string;
  state?: string;
  lat: number;
  lon: number;
  osm_id: number;
  osm_type: string;
  type: string;
}

export interface PreviewPlace
  extends Partial<PhotonPlace>,
    Partial<NominatimResponse> {
  corrected_lat?: string;
  corrected_lon?: string;
  lat: number;
  lon: number;
  image?: {
    thumb_256_url?: string | null;
    thumb_1024_url?: string | null;
  };
  ready?: boolean;
}
