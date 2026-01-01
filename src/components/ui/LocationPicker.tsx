"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Label } from './label';
import { Input } from './input';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icon paths
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  label?: string;
}

function LocationMarker({ position, onChange }: { 
  position: [number, number] | null; 
  onChange: (lat: number, lng: number) => void;
}) {
  return position ? <Marker position={position} /> : null;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ 
  latitude, 
  longitude, 
  onChange,
  label = "Location"
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );

  // Hong Kong Convention Centre as default center
  const defaultCenter: [number, number] = [22.2823, 114.1742];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  const handleLatChange = (value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat) && position) {
      handleLocationChange(lat, position[1]);
    } else if (!isNaN(lat)) {
      handleLocationChange(lat, defaultCenter[1]);
    }
  };

  const handleLngChange = (value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng) && position) {
      handleLocationChange(position[0], lng);
    } else if (!isNaN(lng)) {
      handleLocationChange(defaultCenter[0], lng);
    }
  };

  const handleClear = () => {
    setPosition(null);
    onChange(null, null);
  };

  if (!mounted) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {position && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear location
          </button>
        )}
      </div>
      
      {/* Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-xs">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={position?.[0] ?? ''}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder="22.282300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-xs">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={position?.[1] ?? ''}
            onChange={(e) => handleLngChange(e.target.value)}
            placeholder="114.174200"
          />
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-[300px] rounded-md overflow-hidden border">
        <MapContainer
          center={position || defaultCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={handleLocationChange} />
          <LocationMarker 
            position={position} 
            onChange={handleLocationChange}
          />
        </MapContainer>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Click on the map to set the location or enter coordinates manually
      </p>
    </div>
  );
}
