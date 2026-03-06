"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, Users, TrendingUp, Clock, CheckCircle,
    XCircle, Loader, ToggleLeft, ToggleRight, Star, AlertTriangle
} from "lucide-react";

interface Stats {
    totalRequests: number;
    statusCounts: Record<string, number>;
    totalRevenue: number;
    activeTechnicians: number;
    totalTechnicians: number;
}

interface Technician {
    id: string;
    name: string;
    phone: string;
    vehicle_type: string;
    rating: number;
    is_available: boolean;
    tech_status: string;
    lat: number;
    lon: number;
    created_at: string;
}

interface Request {
    id: string;
    status: string;
    vehicle_type: string;
    address: string;
    price: number;
    payment_status: string;
    created_at: string;
    description: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-purple-100 text-purple-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "requests" | "technicians">("overview");

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        const [statsRes, techRes] = await Promise.all([
            fetch("/api/admin/stats"),
            fetch("/api/admin/technicians"),
        ]);
        const statsData = await statsRes.json();
        const techData = await techRes.json();
        setStats(statsData);
        setTechnicians(techData.technicians || []);

        // Fetch requests using existing API
        const reqRes = await fetch("/api/requests");
        const reqData = await reqRes.json();
        setRequests(reqData.requests || reqData || []);

        setLoading(false);
    }

    async function toggleTechnician(id: string, current: boolean) {
        await fetch("/api/admin/technicians", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_available: !current }),
        });
        setTechnicians((prev) =>
            prev.map((t) => (t.id === id ? { ...t, is_available: !current } : t))
        );
    }

    const filteredRequests = statusFilter === "all"
        ? requests
        : requests.filter((r) => r.status === statusFilter);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <Loader className="animate-spin text-white" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">🛠️ Roadside Rescue Admin</h1>
                    <p className="text-slate-400 text-sm">Manage requests, technicians & revenue</p>
                </div>
                <button
                    onClick={fetchAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all"
                >
                    Refresh
                </button>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 px-6 pt-6">
                {(["overview", "requests", "technicians"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`capitalize px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="p-6 space-y-6">
                {/* ── OVERVIEW TAB ── */}
                {tab === "overview" && stats && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Requests", value: stats.totalRequests, icon: BarChart3, color: "from-blue-500 to-blue-700" },
                                { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "from-green-500 to-green-700" },
                                { label: "Active Technicians", value: `${stats.activeTechnicians}/${stats.totalTechnicians}`, icon: Users, color: "from-purple-500 to-purple-700" },
                                { label: "Completed", value: stats.statusCounts.completed || 0, icon: CheckCircle, color: "from-teal-500 to-teal-700" },
                            ].map((card) => (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-gradient-to-br ${card.color} rounded-2xl p-5`}
                                >
                                    <card.icon size={28} className="mb-3 opacity-80" />
                                    <p className="text-3xl font-bold">{card.value}</p>
                                    <p className="text-white/70 text-sm mt-1">{card.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Status breakdown */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Request Status Breakdown</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {Object.entries(stats.statusCounts).map(([status, count]) => (
                                    <div key={status} className="bg-white/10 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className={`text-xs mt-1 capitalize font-semibold px-2 py-1 rounded-full inline-block ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>
                                            {status.replace("_", " ")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {technicians.length === 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3 text-yellow-300">
                                <AlertTriangle size={20} />
                                <p className="text-sm">No technicians registered yet. Add technicians in your Supabase dashboard.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── REQUESTS TAB ── */}
                {tab === "requests" && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-lg font-semibold">All Requests ({filteredRequests.length})</h2>
                            <div className="flex gap-2 flex-wrap">
                                {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`capitalize px-3 py-1 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
                                            }`}
                                    >
                                        {s.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-white/10">
                                        <th className="text-left py-3 pr-4">ID</th>
                                        <th className="text-left py-3 pr-4">Description</th>
                                        <th className="text-left py-3 pr-4">Vehicle</th>
                                        <th className="text-left py-3 pr-4">Status</th>
                                        <th className="text-left py-3 pr-4">Payment</th>
                                        <th className="text-left py-3 pr-4">Price</th>
                                        <th className="text-left py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length === 0 ? (
                                        <tr><td colSpan={7} className="py-10 text-center text-slate-400">No requests found</td></tr>
                                    ) : filteredRequests.map((r) => (
                                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                            <td className="py-3 pr-4 font-mono text-xs text-slate-400">{r.id.slice(0, 8)}…</td>
                                            <td className="py-3 pr-4 max-w-[180px] truncate">{r.description || "—"}</td>
                                            <td className="py-3 pr-4 capitalize">{r.vehicle_type || "—"}</td>
                                            <td className="py-3 pr-4">
                                                <span className={`capitalize px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-700"}`}>
                                                    {r.status?.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`capitalize px-2 py-1 rounded-full text-xs ${r.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                    {r.payment_status || "pending"}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 font-semibold">₹{r.price || "—"}</td>
                                            <td className="py-3 text-slate-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TECHNICIANS TAB ── */}
                {tab === "technicians" && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">All Technicians ({technicians.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-white/10">
                                        <th className="text-left py-3 pr-4">Name</th>
                                        <th className="text-left py-3 pr-4">Phone</th>
                                        <th className="text-left py-3 pr-4">Vehicle</th>
                                        <th className="text-left py-3 pr-4">Rating</th>
                                        <th className="text-left py-3 pr-4">Status</th>
                                        <th className="text-left py-3">Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {technicians.length === 0 ? (
                                        <tr><td colSpan={6} className="py-10 text-center text-slate-400">No technicians found</td></tr>
                                    ) : technicians.map((t) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                            <td className="py-3 pr-4 font-semibold">{t.name}</td>
                                            <td className="py-3 pr-4 text-slate-300">{t.phone || "—"}</td>
                                            <td className="py-3 pr-4 capitalize">{t.vehicle_type || "—"}</td>
                                            <td className="py-3 pr-4">
                                                <span className="flex items-center gap-1">
                                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                    {t.rating || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`capitalize px-2 py-1 rounded-full text-xs ${t.tech_status === "busy" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-700"}`}>
                                                    {t.tech_status || "idle"}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => toggleTechnician(t.id, t.is_available)}
                                                    className="flex items-center gap-2 hover:opacity-80 transition-all"
                                                    title={t.is_available ? "Click to disable" : "Click to enable"}
                                                >
                                                    {t.is_available
                                                        ? <ToggleRight size={28} className="text-green-400" />
                                                        : <ToggleLeft size={28} className="text-slate-500" />
                                                    }
                                                    <span className={`text-xs font-semibold ${t.is_available ? "text-green-400" : "text-slate-400"}`}>
                                                        {t.is_available ? "Online" : "Offline"}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
