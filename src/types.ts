export interface Bivouac {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  capacity: number;
  water: boolean;
  shelter: boolean;
}

export type Pack = 'sherpa' | 'nomade' | 'explorer';

export interface Options {
  repasLyophilise: boolean;
  kitBivouac: boolean;
  panierTerroir: boolean;
}

export interface RouteRequest {
  nights: number;
  distance_per_day: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteLeg {
  from_name: string;
  to_name: string;
  distance_km: number;
  duration_hours: number;
  geometry: [number, number][]; // [lat, lng] pairs ready for Leaflet
}

export interface RouteResponse {
  stops: Bivouac[];
  legs: RouteLeg[];
  total_distance_km: number;
  total_duration_hours: number;
}
