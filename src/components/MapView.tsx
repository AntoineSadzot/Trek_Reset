import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import type { Bivouac, RouteResponse } from '../types';
import { LEG_COLORS } from '../lib/colors';

// Fixed start / end coordinates
const START_LAT = 50.1833;
const START_LNG = 5.5786;

// Custom DivIcon for the start / end marker (no image dependency)
const startIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px;
    background: #2d5a27;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.45);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Helper component: fits the map to the full route geometry when it changes.
function FitBounds({ route }: { route: RouteResponse | null }) {
  const map = useMap();
  useEffect(() => {
    if (!route || route.legs.length === 0) return;
    const allPoints: [number, number][] = [];
    for (const leg of route.legs) {
      allPoints.push(...leg.geometry);
    }
    if (allPoints.length > 0) {
      map.fitBounds(allPoints as L.LatLngBoundsLiteral, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

interface Props {
  bivouacs: Bivouac[];
  route: RouteResponse | null;
}

export function MapView({ bivouacs, route }: Props) {
  // Set of bivouac IDs that are overnight stops in the current route
  const stopIds = new Set(route ? route.stops.map((s) => s.id) : []);

  return (
    <MapContainer
      center={[START_LAT, START_LNG]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds route={route} />

      {/* Start / end marker */}
      <Marker position={[START_LAT, START_LNG]} icon={startIcon}>
        <Popup>
          <strong>La Roche en Ardenne</strong>
          <br />
          Start &amp; End of trip
        </Popup>
      </Marker>

      {/* All bivouac sites */}
      {bivouacs.map((b) => {
        const isStop = stopIds.has(b.id);
        return (
          <CircleMarker
            key={b.id}
            center={[b.lat, b.lng]}
            radius={isStop ? 10 : 7}
            pathOptions={{
              fillColor: isStop ? '#e63946' : '#6b7280',
              fillOpacity: isStop ? 1 : 0.7,
              color: '#fff',
              weight: 2,
            }}
          >
            <Popup>
              <strong>{b.name}</strong>
              <br />
              <em style={{ fontSize: '0.85em', color: '#555' }}>{b.description}</em>
              <br />
              <br />
              👥 Capacity: {b.capacity} people
              <br />
              {b.water ? '💧 Water available' : '🚫 No water source'}
              <br />
              {b.shelter ? '🏕️ Shelter available' : '⛺ No shelter (open bivouac)'}
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Route legs – one coloured polyline per day */}
      {route &&
        route.legs.map((leg, i) => (
          <Polyline
            key={i}
            positions={leg.geometry as [number, number][]}
            pathOptions={{
              color: LEG_COLORS[i % LEG_COLORS.length],
              weight: 5,
              opacity: 0.85,
            }}
          />
        ))}
    </MapContainer>
  );
}
