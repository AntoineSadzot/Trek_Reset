import { haversineKm } from './geo';
import type { Bivouac, LatLng } from '../types';

export const START_POINT: LatLng = { lat: 50.1833, lng: 5.5786 };

const TERRAIN_FACTOR = 1.4;
const TOLERANCE_KM = 3;
const MAX_CANDIDATES = 5;

interface Candidate {
  bivouac: Bivouac;
  distToIdeal: number;
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickBestCandidate(candidates: Candidate[]): Bivouac {
  const sorted = [...candidates].sort((a, b) => a.distToIdeal - b.distToIdeal);
  const pool = sorted.slice(0, Math.min(MAX_CANDIDATES, sorted.length));
  return pool[randomInt(pool.length)].bivouac;
}

function idealPointForStop(index: number, legs: number, radiusKm: number): LatLng {
  const centerLat = START_POINT.lat - radiusKm / 111.32;
  const centerLng = START_POINT.lng;
  const centerLatRad = (centerLat * Math.PI) / 180;
  const bearing = (index * 360) / legs;
  const bearingRad = (bearing * Math.PI) / 180;

  return {
    lat: centerLat + (radiusKm / 111.32) * Math.cos(bearingRad),
    lng:
      centerLng +
      (radiusKm / (111.32 * Math.cos(centerLatRad))) * Math.sin(bearingRad),
  };
}

export function selectStops(
  bivouacs: Bivouac[],
  nights: number,
  distancePerDay: number,
): Bivouac[] {
  if (nights < 1 || nights > 4) {
    throw new Error('nights must be between 1 and 4');
  }
  if (nights > bivouacs.length) {
    throw new Error('not enough bivouacs in database');
  }

  const legs = nights + 1;
  const chordKm = distancePerDay / TERRAIN_FACTOR;
  const radiusKm = chordKm / (2 * Math.sin(Math.PI / legs));

  const result: Bivouac[] = [];
  const usedIds = new Set<number>();
  let previousPoint = START_POINT;

  for (let stopNumber = 1; stopNumber <= nights; stopNumber += 1) {
    const ideal = idealPointForStop(stopNumber, legs, radiusKm);

    const withinTolerance: Candidate[] = [];
    const allUnused: Candidate[] = [];

    for (const bivouac of bivouacs) {
      if (usedIds.has(bivouac.id)) {
        continue;
      }

      const point = { lat: bivouac.lat, lng: bivouac.lng };
      const approxHikingKm = haversineKm(previousPoint, point) * TERRAIN_FACTOR;
      const distToIdeal = haversineKm(ideal, point);
      const candidate = { bivouac, distToIdeal };
      allUnused.push(candidate);

      if (Math.abs(approxHikingKm - distancePerDay) <= TOLERANCE_KM) {
        withinTolerance.push(candidate);
      }
    }

    const source = withinTolerance.length > 0 ? withinTolerance : allUnused;
    if (source.length === 0) {
      throw new Error('no bivouac available for stop');
    }

    const chosen = pickBestCandidate(source);
    usedIds.add(chosen.id);
    result.push(chosen);
    previousPoint = { lat: chosen.lat, lng: chosen.lng };
  }

  return result;
}
