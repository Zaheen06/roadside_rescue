"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  // Prevent map crash when lat/lon missing
  if (!lat || !lon) {
    return (
      <div className="w-full p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 text-center">
        <MapPin className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600 font-medium">Location not detected yet</p>
        <p className="text-gray-500 text-sm mt-1">Click "Use My Location" to show map</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden shadow-lg border border-white/30 animate-fade-in">
      <MapContainer
        center={[lat, lon]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="rounded-2xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <Marker position={[lat, lon]}>
          <Popup className="font-semibold">
            <div className="text-center">
              <MapPin className="mx-auto mb-1 text-blue-600" size={20} />
              <div>Your Location</div>
              <div className="text-xs text-gray-600 mt-1">
                {lat.toFixed(6)}, {lon.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
