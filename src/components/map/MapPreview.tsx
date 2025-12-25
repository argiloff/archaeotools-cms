import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

// Fix default marker icons for Leaflet + Vite
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  meta?: Record<string, unknown>;
  intensity?: number;
};

type Props = {
  points: MapPoint[];
  height?: number;
  onMarkerClick?: (point: MapPoint) => void;
  heat?: boolean;
};

export function MapPreview({ points, height = 320, onMarkerClick, heat = false }: Props) {
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!points.length) return null;
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    return b.pad(0.1);
  }, [points]);

  const center = bounds ? (bounds as any).getCenter() : { lat: 0, lng: 0 };

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <MapContainer
        center={center}
        zoom={bounds ? undefined : 2}
        bounds={bounds ?? undefined}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {heat
          ? points.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={Math.min(28, (p.intensity ?? 1) * 3 + 6)}
                pathOptions={{
                  color: 'rgba(111,227,196,0.8)',
                  fillColor: 'rgba(111,227,196,0.35)',
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              >
                {p.label && <Popup>{p.label}</Popup>}
              </CircleMarker>
            ))
          : points.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                eventHandlers={
                  onMarkerClick
                    ? {
                        click: () => onMarkerClick(p),
                      }
                    : undefined
                }
              >
                {p.label && <Popup>{p.label}</Popup>}
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}
