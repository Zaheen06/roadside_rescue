"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet default icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Component to update map center when props change
function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  const [isClient, setIsClient] = useState(false);
  const mapIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const prevCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Wait for client-side hydration and ensure DOM is ready
  useEffect(() => {
    // Check if window and document are ready
    if (typeof window !== 'undefined' && document.getElementById(mapIdRef.current)) {
      setIsClient(true);
    } else {
      // Try again after a delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsClient(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Force new map instance when coordinates change significantly
  useEffect(() => {
    if (prevCoordsRef.current && 
        (Math.abs(prevCoordsRef.current.lat - lat) > 0.0001 || 
         Math.abs(prevCoordsRef.current.lon - lon) > 0.0001)) {
      // Coordinates changed significantly, force new map
      mapIdRef.current = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    prevCoordsRef.current = { lat, lon };
  }, [lat, lon]);

  // Prevent map crash when lat/lon missing or not client
  if (!lat || !lon || !isClient) {
    return (
      <div className="w-full p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 text-center">
        <MapPin className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600 font-medium">Location not detected yet</p>
        <p className="text-gray-500 text-sm mt-1">Click "Use My Location" to show map</p>
      </div>
    );
  }

  return (
    <div 
      id={mapIdRef.current}
      key={mapIdRef.current}
      className="w-full h-[300px] rounded-2xl overflow-hidden shadow-lg border border-white/30 animate-fade-in"
    >
      <MapContainer
        key={`container-${mapIdRef.current}`}
        center={[lat, lon] as [number, number]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="rounded-2xl"
        whenCreated={() => {}}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={[lat, lon] as [number, number]}>
          <Popup>
            <div className="text-center font-semibold">
              <MapPin className="mx-auto mb-1 text-blue-600" size={20} />
              <div>Your Location</div>
              <div className="text-xs text-gray-600 mt-1">
                {lat.toFixed(6)}, {lon.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
        
        <MapUpdater lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}
