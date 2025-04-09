export interface OptimizedRouteResponse {
  trip: Trip;
}

export interface Trip {
  locations: Location[];
  legs: Leg[];
  summary: Summary2;
  status_message: string;
  status: number;
  units: string;
  language: string;
}

export interface Location {
  type: string;
  lat: number;
  lon: number;
  original_index: number;
  side_of_street?: string;
}

export interface Leg {
  maneuvers: Maneuver[];
  summary: Summary;
  shape: string;
}

export interface Maneuver {
  type: number;
  instruction: string;
  verbal_succinct_transition_instruction?: string;
  verbal_pre_transition_instruction?: string;
  verbal_post_transition_instruction?: string;
  street_names?: string[];
  bearing_after?: number;
  time: number;
  length: number;
  cost: number;
  begin_shape_index: number;
  end_shape_index: number;
  travel_mode: string;
  travel_type: string;
  verbal_transition_alert_instruction?: string;
  bearing_before?: number;
  verbal_multi_cue?: boolean;
  rough?: boolean;
  begin_street_names?: string[];
}

export interface Summary {
  has_time_restrictions: boolean;
  has_toll: boolean;
  has_highway: boolean;
  has_ferry: boolean;
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
  time: number;
  length: number;
  cost: number;
  level_changes?: number[][];
}

export interface Summary2 {
  has_time_restrictions: boolean;
  has_toll: boolean;
  has_highway: boolean;
  has_ferry: boolean;
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
  time: number;
  length: number;
  cost: number;
}
