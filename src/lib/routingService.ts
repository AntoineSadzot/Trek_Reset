import { haversineKm, interpolateLine } from './geo';
import type { LatLng } from '../types';

const ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-hiking/geojson';
const AVERAGE_HIKING_SPEED_KMH = 4.2;
const FALLBACK_TERRAIN_FACTOR = 1.35;
const FALLBACK_SEGMENTS = 20;

interface OrsFeature {
  geometry: {
    coordinates: [number, number][];
  };
  properties: {
    summary: {
      distance: number;
      duration: number;
    };
  };
}

interface OrsRouteResponse {
  features: OrsFeature[];
}

export interface BuiltLeg {
  distanceKm: number;
  durationHours: number;
  geometry: [number, number][];
}

function buildFallbackLeg(from: LatLng, to: LatLng): BuiltLeg {
  const distanceKm = haversineKm(from, to) * FALLBACK_TERRAIN_FACTOR;
  return {
    distanceKm,
    durationHours: distanceKm / AVERAGE_HIKING_SPEED_KMH,
    geometry: interpolateLine(from, to, FALLBACK_SEGMENTS),
  };
}

async function fetchOrsLeg(from: LatLng, to: LatLng, apiKey: string): Promise<BuiltLeg> {
  const response = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
      instructions: false,
      elevation: false,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `OpenRouteService failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OrsRouteResponse;
  const feature = payload.features?.[0];
  if (!feature || !feature.geometry?.coordinates || !feature.properties?.summary) {
    throw new Error('OpenRouteService returned an unexpected payload');
  }

  return {
    distanceKm: feature.properties.summary.distance / 1000,
    durationHours: feature.properties.summary.duration / 3600,
    geometry: feature.geometry.coordinates.map((coordinate) => [coordinate[1], coordinate[0]]),
  };
}

export async function buildRouteLeg(from: LatLng, to: LatLng): Promise<BuiltLeg> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY;
  if (!apiKey) {
    return buildFallbackLeg(from, to);
  }

  try {
    return await fetchOrsLeg(from, to, apiKey);
  } catch (error) {
    console.warn('Falling back to straight line geometry:', error);
    return buildFallbackLeg(from, to);
  }
}
