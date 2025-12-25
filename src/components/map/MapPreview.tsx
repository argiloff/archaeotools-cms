import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';

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
};

type Props = {
  points: MapPoint[];
  height?: number;
};

export function MapPreview({ points, height = 320 }: Props) {
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
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            {p.label && <Popup>{p.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
