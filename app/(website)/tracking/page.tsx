"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Package, Clock, ArrowRight, Navigation } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: MapPin, title: "Live Location", desc: "Real-time technician tracking on map", bg: "bg-blue-50", color: "text-blue-600" },
  { icon: Package, title: "Status Updates", desc: "Instant status change notifications", bg: "bg-emerald-50", color: "text-emerald-600" },
  { icon: Clock, title: "ETA Estimates", desc: "Accurate live arrival time calculation", bg: "bg-violet-50", color: "text-violet-600" },
];

export default function TrackingIndexPage() {
  const [orderId, setOrderId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      window.location.href = `/tracking/${orderId.trim()}`;
    }
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-blue-100">
            <Navigation size={12} />
            Live Tracking
          </div>
          <h1 className="font-extrabold text-gray-900 mb-3 tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
            Track Your Request
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Enter your request ID to see your mechanic's live location and get real-time updates.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card mb-8" style={{ borderRadius: 24 }}>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Request ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="tracking-order-id"
                  name="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. eb024677-3391-4681-971b..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm font-mono"
                />
              </div>
            </div>
            <button type="submit" disabled={!orderId.trim()} className="btn-primary w-full py-4">
              Track Request <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card text-center !p-5" style={{ borderRadius: 20 }}>
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={22} className={f.color} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            );
          })}
        </motion.div>

        {/* How to find ID */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card" style={{ borderRadius: 20 }}>
          <h3 className="font-bold text-gray-900 mb-4 text-sm">How to find your Request ID</h3>
          <ol className="space-y-3">
            {[
              "Your request ID appears on your dashboard under 'My Requests'.",
              "It was also sent to your registered email after booking.",
              "Enter the full ID in the search field above to track live.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <Link href="/dashboard" className="text-sm font-bold text-blue-600 hover:underline">
              View My Requests →
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
