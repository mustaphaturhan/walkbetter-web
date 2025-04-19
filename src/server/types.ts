export interface PhotonResponse {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: Properties;
}

export interface Geometry {
  coordinates: number[];
  type: string;
}

export interface Properties {
  city?: string;
  country: string;
  name: string;
  postcode?: string;
  osm_id: number;
  countrycode: string;
  locality: string;
  county: string;
  type: string;
  osm_type: string;
  osm_key: string;
  street: string;
  district: string;
  osm_value: string;
  state: string;
}

export interface GeocodeAddress {
  road?: string;
  county?: string;
  city?: string;
  city_district?: string;
  construction?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  house_number?: string;
  neighbourhood?: string;
  postcode?: string;
  public_building?: string;
  state?: string;
  suburb?: string;
  region?: string;
  state_district?: string;
  municipality?: string;
  town?: string;
  village?: string;
  district?: string;
  borough?: string;
  subdivision?: string;
  hamlet?: string;
  croft?: string;
  isolated_dwelling?: string;
  city_block?: string;
  residential?: string;
  farm?: string;
  farmyard?: string;
  industrial?: string;
  commercial?: string;
  retail?: string;
  house_name?: string;
  emergency?: string;
  historic?: string;
}

export interface NominatimResponse {
  address: GeocodeAddress;
  boundingbox: string[];
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  osm_id: string;
  osm_type: string;
  place_id: string;
  svg: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extratags: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}
