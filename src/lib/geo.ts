import type { LatLng } from '../types';

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function haversineKm(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function interpolateLine(from: LatLng, to: LatLng, segments: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i += 1) {
    const ratio = i / segments;
    points.push([
      from.lat + (to.lat - from.lat) * ratio,
      from.lng + (to.lng - from.lng) * ratio,
    ]);
  }
  return points;
}
