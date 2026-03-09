"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Clock, MapPin, Navigation, CheckCircle, Loader, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
    ssr: false,
    loading: () => <div className="h-[420px] w-full rounded-2xl animate-pulse" style={{ background: "#E2E8F0" }} />,
});

interface PageProps {
    params: Promise<{ orderId: string }>;
}

const STAT_ITEMS = [
    { label: "Est. Arrival", valueKey: "eta", icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Status", valueKey: "status", icon: Navigation, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Live Tracking", valueKey: "tracking", icon: MapPin, bg: "bg-violet-50", color: "text-violet-600" },
];

export default function TrackingPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const orderId = resolvedParams.orderId;

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [pathHistory, setPathHistory] = useState<[number, number][]>([]);
    const [status, setStatus] = useState("Waiting...");
    const [eta, setEta] = useState("-- mins");
    const [otp, setOtp] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    const isCompleted = status === "Delivered" || status === "Completed";

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const { data } = await supabase.from("requests").select("otp, status").eq("id", orderId).single();
            if (data?.otp) setOtp(data.otp);
            if (data?.status === "completed" || data?.status === "delivered") {
                setStatus("Completed");
                setEta("Arrived");
            }
        };
        fetchOrderDetails();

        const channel = supabase.channel(`tracking_${orderId}`);
        channel
            .on("broadcast", { event: "location_broadcast" }, (payload) => {
                const data = payload.payload;
                const newPoint: [number, number] = [data.lat, data.lng];
                setLocation({ lat: data.lat, lng: data.lng });
                setPathHistory((prev) => [...prev, newPoint]);
                setConnected(true);
                if (data.status === "delivered") { setStatus("Completed"); setEta("Arrived"); }
                else { setStatus("On the way"); setEta("~15 mins"); }
            })
            .on("broadcast", { event: "status_update" }, (payload) => {
                if (payload.payload?.status === "delivered") { setStatus("Completed"); setEta("Arrived"); }
            })
            .subscribe(() => setConnected(true));

        return () => { supabase.removeChannel(channel); };
    }, [orderId]);

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFC" }}>
            <AnimatePresence>
                {isCompleted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                                style={{ background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)" }}>
                                <CheckCircle size={48} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Service Completed! 🎉</h2>
                            <p className="text-gray-500 mb-8">Your roadside rescue request has been successfully completed by the technician.</p>
                            <div className="flex gap-3">
                                <Link href="/dashboard" className="flex-1">
                                    <button className="btn-primary w-full py-3">Go to Dashboard</button>
                                </Link>
                                <Link href="/landing" className="flex-1">
                                    <button className="btn-secondary w-full py-3">Home</button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {connected ? "Live" : "Connecting..."}
                            </span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mechanic Tracking</h1>
                        <p className="text-gray-400 text-xs font-mono mt-0.5">Request #{orderId.slice(0, 16)}...</p>
                    </div>

                    {/* OTP Badge */}
                    {otp && !isCompleted && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl border-2"
                            style={{ background: "linear-gradient(135deg, #FEF9C3, #FEF08A)", borderColor: "#F59E0B" }}>
                            <AlertCircle size={18} className="text-amber-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Share OTP with Mechanic</p>
                                <p className="text-2xl font-black tracking-widest text-amber-800 font-mono">{otp}</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Stats Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4">
                    {[
                        { label: "ETA", value: eta, icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
                        { label: "Status", value: status, icon: Navigation, bg: "bg-emerald-50", color: "text-emerald-600" },
                        { label: "GPS", value: location ? "Active" : "Waiting", icon: MapPin, bg: "bg-violet-50", color: "text-violet-600" },
                    ].map(({ label, value, icon: Icon, bg, color }) => (
                        <div key={label} className="card !p-4" style={{ borderRadius: 18 }}>
                            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={18} className={color} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="font-extrabold text-gray-900 text-sm mt-0.5">{value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Map */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="card overflow-hidden !p-0" style={{ borderRadius: 24 }}>
                    {!location && !isCompleted && (
                        <div className="flex flex-col items-center justify-center h-24 gap-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                <Loader size={16} className="animate-spin" />
                                Waiting for technician to start tracking...
                            </div>
                        </div>
                    )}
                    <TrackingMap
                        lat={location?.lat || 0}
                        lng={location?.lng || 0}
                        pathHistory={pathHistory}
                    />
                </motion.div>

                {/* Status Timeline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card" style={{ borderRadius: 24 }}>
                    <h3 className="font-bold text-gray-900 mb-5 text-sm">Journey Progress</h3>
                    <div className="space-y-4">
                        {[
                            { label: "Request Accepted", done: true },
                            { label: "Mechanic Dispatched", done: connected },
                            { label: "En Route to You", done: status === "On the way" || isCompleted },
                            { label: "Service Completed", done: isCompleted },
                        ].map(({ label, done }, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${done
                                    ? "bg-green-600"
                                    : "bg-gray-100"
                                    }`}>
                                    {done
                                        ? <CheckCircle size={16} className="text-white" />
                                        : <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    }
                                </div>
                                <span className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                                {i === 1 && !done && <Loader size={14} className="text-blue-400 animate-spin ml-auto" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
