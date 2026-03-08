"use client";

import { useEffect, useState, use } from "react";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Package, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [otp, setOtp] = useState<string | null>(null);

    useEffect(() => {
        // Fetch order details for OTP
        const fetchOrderDetails = async () => {
            const { data } = await supabase
                .from("requests")
                .select("otp, status")
                .eq("id", orderId)
                .single();
            if (data?.otp) setOtp(data.otp);
            if (data?.status === "delivered" || data?.status === "completed") {
                setStatus("Delivered");
                setEta("Arrived");
            }
        };
        fetchOrderDetails();

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
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 relative">
            <AnimatePresence>
                {status === "Delivered" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-4"
                        >
                            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">Order Completed!</h2>
                            <p className="text-slate-600 text-lg">Your roadside rescue request has been successfully completed by the technician.</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="mt-8 w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-all"
                            >
                                Back to Home
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Delivery Tracking</h1>
                        <p className="text-slate-500">Order #{orderId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge
                            variant={status === "Delivered" ? "default" : "secondary"}
                            className="text-lg px-4 py-1"
                        >
                            {status}
                        </Badge>
                        {otp && status !== "Delivered" && (
                            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm flex items-center gap-2">
                                <span className="text-sm font-semibold uppercase tracking-wider">OTP PIN</span>
                                <span className="text-xl font-mono font-bold">{otp}</span>
                            </div>
                        )}
                    </div>
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
