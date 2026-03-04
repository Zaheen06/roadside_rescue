"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Custom icon for the delivery partner
const bikeIcon = L.divIcon({
    html: `<div class="bg-blue-600 p-1 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>`,
    className: "bg-transparent",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

interface TrackingMapProps {
    lat: number;
    lng: number;
    pathHistory: [number, number][];
}

export default function TrackingMap({ lat, lng, pathHistory }: TrackingMapProps) {
    // Prevent map crash when lat/lng missing
    if (!lat || !lng) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200">
                <div className="text-center text-slate-500">
                    <MapPin className="mx-auto mb-2 opacity-50" size={32} />
                    <p>Waiting for location updates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Helper to center map on new location */}
                <MapUpdater center={[lat, lng]} />

                {/* Path History */}
                <Polyline
                    positions={pathHistory}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                />

                {/* Current Location Marker */}
                <Marker position={[lat, lng]} icon={bikeIcon}>
                    <Popup>
                        <div className="text-center">
                            <div className="font-bold text-blue-600">Delivery Partner</div>
                            <div className="text-xs text-slate-500">On the way</div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
