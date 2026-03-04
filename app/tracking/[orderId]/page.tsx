"use client";

import { useEffect, useState, use } from "react";
import { socket } from "@/lib/socket";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Package } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl" />
});

interface PageProps {
    params: Promise<{ orderId: string }>;
}

export default function TrackingPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const orderId = resolvedParams.orderId;

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [pathHistory, setPathHistory] = useState<[number, number][]>([]);
    const [status, setStatus] = useState("Waiting for updates...");
    const [eta, setEta] = useState("-- mins");

    useEffect(() => {
        // Join room
        socket.emit("join_track_room", orderId);

        // Listen for updates
        socket.on("location_broadcast", (data) => {
            console.log("Location received:", data);
            const newPoint: [number, number] = [data.lat, data.lng];

            setLocation({ lat: data.lat, lng: data.lng });
            setPathHistory((prev) => [...prev, newPoint]);

            if (data.status === "delivered") {
                setStatus("Delivered");
                setEta("Arrived");
            } else {
                setStatus("On the way");
                setEta("15 mins"); // Mock ETA
            }
        });

        socket.on("status_update", (data) => {
            if (data.status === 'delivered') {
                setStatus("Delivered");
                setEta("Arrived");
            }
        });

        return () => {
            socket.off("location_broadcast");
            socket.off("status_update");
        };
    }, [orderId]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Delivery Tracking</h1>
                        <p className="text-slate-500">Order #{orderId}</p>
                    </div>
                    <Badge
                        variant={status === "Delivered" ? "default" : "secondary"}
                        className="text-lg px-4 py-1"
                    >
                        {status}
                    </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-semibold">Estimated Time</p>
                                <p className="text-xl font-bold">{eta}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-semibold">Order Status</p>
                                <p className="text-xl font-bold">{status}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 uppercase font-semibold">Distance</p>
                                <p className="text-xl font-bold">2.4 km</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map Section */}
                <Card className="overflow-hidden border-0 shadow-xl">
                    <CardContent className="p-0">
                        <TrackingMap
                            lat={location?.lat || 0}
                            lng={location?.lng || 0}
                            pathHistory={pathHistory}
                        />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
