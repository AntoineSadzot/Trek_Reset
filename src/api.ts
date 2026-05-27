import { BIVOUACS } from './data/bivouacs';
import generatedRoutesData from './data/generated-routes.json';
import type { Bivouac, RouteResponse } from './types';

interface GeneratedRouteLeg {
  from_name: string;
  to_name: string;
  distance_km: number;
  duration_hours: number;
  geometry: number[][];
}

interface GeneratedRouteResponse {
  stops: Bivouac[];
  legs: GeneratedRouteLeg[];
  total_distance_km: number;
  total_duration_hours: number;
}

interface GeneratedRoutesConfig {
  nights: number;
  distance_per_day_km: number;
  routes: GeneratedRouteResponse[];
}

interface GeneratedRoutesPayload {
  configurations: GeneratedRoutesConfig[];
}

const generatedRoutes = generatedRoutesData as GeneratedRoutesPayload;
const nextVariantIndexByConfig = new Map<string, number>();

function normalizeRoute(route: GeneratedRouteResponse): RouteResponse {
  return {
    ...route,
    legs: route.legs.map((leg) => ({
      ...leg,
      geometry: leg.geometry.map((point) => [point[0], point[1]] as [number, number]),
    })),
  };
}

export async function fetchBivouacs(): Promise<Bivouac[]> {
  return BIVOUACS;
}

function assertRouteInput(nights: number, distancePerDay: number): void {
  if (!Number.isFinite(nights) || nights < 1 || nights > 4) {
    throw new Error('nights must be between 1 and 4');
  }
  if (!Number.isFinite(distancePerDay) || distancePerDay < 5 || distancePerDay > 30) {
    throw new Error('distance_per_day must be between 5 and 30');
  }
}

export async function generateRoute(
  nights: number,
  distancePerDay: number,
): Promise<RouteResponse> {
  assertRouteInput(nights, distancePerDay);

  const config = generatedRoutes.configurations.find(
    (item) => item.nights === nights && item.distance_per_day_km === distancePerDay,
  );

  if (!config || config.routes.length === 0) {
    throw new Error(
      `No pre-generated route found for nights=${nights}, distance_per_day=${distancePerDay}`,
    );
  }

  // Rotate variants for identical parameters across successive generations.
  const configKey = `${nights}-${distancePerDay}`;
  const nextIndex = nextVariantIndexByConfig.get(configKey) ?? 0;
  const selectedRoute = config.routes[nextIndex % config.routes.length];
  nextVariantIndexByConfig.set(configKey, (nextIndex + 1) % config.routes.length);

  return normalizeRoute(selectedRoute);
}
