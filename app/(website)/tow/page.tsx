"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Car, CheckCircle, ArrowRight, Truck, Navigation,
    Loader, Zap, Shield, AlertCircle
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import PaymentButton from "@/components/PaymentButton";
import Link from "next/link";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// Haversine formula to calculate km between two lat/lon points
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RATE_PER_KM = 25;
const SERVICE_CHARGE = 50;

const STEPS = ["Pickup", "Destination", "Confirm"];

export default function TowServicePage() {
    const [step, setStep] = useState(0);

    // Pickup
    const [pickupLat, setPickupLat] = useState("");
    const [pickupLon, setPickupLon] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");

    // Destination
    const [destLat, setDestLat] = useState("");
    const [destLon, setDestLon] = useState("");
    const [destAddress, setDestAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [requestId, setRequestId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    // Calculate distance & cost
    const distanceKm =
        pickupLat && pickupLon && destLat && destLon
            ? parseFloat(getDistanceKm(
                parseFloat(pickupLat), parseFloat(pickupLon),
                parseFloat(destLat), parseFloat(destLon)
            ).toFixed(2))
            : 0;

    const totalCost = distanceKm > 0 ? Math.round(distanceKm * RATE_PER_KM + SERVICE_CHARGE) : 0;
    const [destSearchQuery, setDestSearchQuery] = useState("");
    const [destSearching, setDestSearching] = useState(false);
    const [destSearchError, setDestSearchError] = useState("");

    function getPickupLocation() {
        navigator.geolocation.getCurrentPosition((pos) => {
            setPickupLat(String(pos.coords.latitude));
            setPickupLon(String(pos.coords.longitude));
        });
    }

    async function searchDestination() {
        if (!destSearchQuery.trim()) return;
        setDestSearching(true);
        setDestSearchError("");
        setDestLat("");
        setDestLon("");
        try {
            const encoded = encodeURIComponent(destSearchQuery.trim());
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const results = await res.json();
            if (!results || results.length === 0) {
                setDestSearchError("No location found. Try a more specific address.");
                return;
            }
            const place = results[0];
            setDestLat(place.lat);
            setDestLon(place.lon);
            setDestAddress(place.display_name.split(",").slice(0, 3).join(", "));
        } catch {
            setDestSearchError("Search failed. Check your internet connection.");
        } finally {
            setDestSearching(false);
        }
    }

    const canProceed = () => {
        if (step === 0) return !!pickupLat && !!pickupLon;
        if (step === 1) return !!destLat && !!destLon && distanceKm > 0;
        return true;
    };

    async function handleSubmit() {
        if (!pickupLat || !pickupLon || !destLat || !destLon) {
            setMsg("Please provide both pickup and destination locations.");
            return;
        }
        setLoading(true);
        setMsg("");
        try {
            const { data: svcData } = await supabase.from("services").select("id").eq("key", "car_tow").single();
            if (!svcData) throw new Error("Tow service not available right now.");

            const { data: { user } } = await supabase.auth.getUser();
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            const { data: requestData, error } = await supabase.from("requests").insert([{
                user_id: user?.id || null,
                service_id: svcData.id,
                vehicle_type: "car",
                description: `Car Tow — ${distanceKm} km to ${destAddress || "destination"}`,
                lat: parseFloat(pickupLat),
                lon: parseFloat(pickupLon),
                address: pickupAddress || "Pickup location",
                dest_lat: parseFloat(destLat),
                dest_lon: parseFloat(destLon),
                dest_address: destAddress || "Destination",
                distance_km: distanceKm,
                status: "pending",
                estimated_price: totalCost,
                price: totalCost,
                otp,
            }]).select().single();

            if (error) throw new Error(error.message);
            setRequestId(requestData.id);

            // Auto-match technician
            try {
                const res = await fetch("/api/technicians/match", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lat: parseFloat(pickupLat), lon: parseFloat(pickupLon),
                        vehicle_type: "car", request_id: requestData.id,
                    }),
                });
                const data = await res.json();
                setMsg(data.matched
                    ? `✅ Mechanic ${data.technician.name} is dispatching your tow truck! (${data.technician.distanceKm} km away)`
                    : "⚠️ Request placed. Finding a tow truck near you..."
                );
            } catch { setMsg("Tow request created. Finding nearest tow truck..."); }
            setSubmitted(true);
        } catch (err: any) {
            setMsg(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    const stepContent = [
        // STEP 0 — Pickup Location
        <div key="pickup" className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Where is your vehicle right now?</p>
            <button onClick={getPickupLocation} className="btn-primary w-full py-4">
                <MapPin size={18} /> Use My Current Location
            </button>
            {pickupLat && pickupLon && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden h-52">
                    <Map lat={parseFloat(pickupLat)} lon={parseFloat(pickupLon)} />
                </motion.div>
            )}
            <input
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Pickup address or nearest landmark"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
            />
            {pickupLat && pickupLon && (
                <p className="text-xs text-green-600 font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} /> Pickup location set
                </p>
            )}
        </div>,

        // STEP 1 — Destination Location
        <div key="destination" className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Where do you want your car towed to?</p>

            {/* Address Search */}
            <div className="flex gap-2">
                <input
                    className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Search: garage name, address, city..."
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchDestination()}
                />
                <button
                    onClick={searchDestination}
                    disabled={destSearching || !destSearchQuery.trim()}
                    className="btn-primary px-5 shrink-0 disabled:opacity-50"
                >
                    {destSearching
                        ? <Loader size={16} className="animate-spin" />
                        : <Navigation size={16} />}
                </button>
            </div>

            {destSearchError && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} /> {destSearchError}
                </p>
            )}

            {destLat && destLon && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden h-52">
                    <Map lat={parseFloat(destLat)} lon={parseFloat(destLon)} />
                </motion.div>
            )}

            {destLat && destLon && destAddress && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-emerald-700">Destination set</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{destAddress}</p>
                    </div>
                </div>
            )}

            {distanceKm > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Truck size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-blue-800 text-sm">Distance Calculated</p>
                        <p className="text-blue-600 text-sm">{distanceKm} km · Estimated ₹{totalCost}</p>
                    </div>
                </motion.div>
            )}
        </div>,

        // STEP 2 — Confirm
        <div key="confirm" className="space-y-5">
            <p className="text-sm text-gray-500">Review your tow request.</p>

            <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
                {[
                    { label: "Service", value: "Car Tow Service" },
                    { label: "Pickup", value: pickupAddress || "GPS location" },
                    { label: "Destination", value: destAddress || "GPS location" },
                    { label: "Distance", value: `${distanceKm} km` },
                ].map(({ label, value }, i) => (
                    <div key={label} className={`flex justify-between items-center px-5 py-3.5 text-sm ${i < 3 ? "border-b border-gray-100" : ""}`}>
                        <span className="text-gray-500 font-medium">{label}</span>
                        <span className="font-bold text-gray-900 text-right max-w-[60%] truncate">{value}</span>
                    </div>
                ))}
                {/* Pricing Breakdown */}
                <div className="border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center px-5 py-2.5 text-sm border-b border-gray-100">
                        <span className="text-gray-500">Distance charge ({distanceKm} km × ₹{RATE_PER_KM})</span>
                        <span className="font-semibold text-gray-800">₹{Math.round(distanceKm * RATE_PER_KM)}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-2.5 text-sm border-b border-gray-100">
                        <span className="text-gray-500">Service charge</span>
                        <span className="font-semibold text-gray-800">₹{SERVICE_CHARGE}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4 bg-blue-50">
                        <span className="font-bold text-blue-700">Total</span>
                        <span className="text-2xl font-extrabold text-blue-700">₹{totalCost}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                <Shield size={14} className="shrink-0 mt-0.5" />
                <span>Rate: ₹{RATE_PER_KM}/km + ₹{SERVICE_CHARGE} service charge. OTP verification ensures safe handover.</span>
            </div>

            {!submitted ? (
                <button onClick={handleSubmit} disabled={loading || !distanceKm} className="btn-primary w-full py-4 text-base">
                    {loading ? "Dispatching tow truck..." : <><Zap size={16} /> Request Tow Truck — ₹{totalCost}</>}
                </button>
            ) : (
                requestId && totalCost > 0 && (
                    <div className="space-y-3">
                        {msg && (
                            <div className={`text-sm text-center px-4 py-3 rounded-xl font-semibold ${msg.includes("✅") ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                {msg}
                            </div>
                        )}
                        <PaymentButton
                            amount={totalCost}
                            requestId={requestId}
                            description={`Car Tow — ${distanceKm} km`}
                            onSuccess={() => { window.location.href = "/dashboard"; }}
                            onError={(e) => setMsg(`Payment error: ${e}`)}
                            userEmail={user?.email}
                            userName={user?.user_metadata?.name}
                        />
                        <Link href={`/request/${requestId}`}>
                            <button className="btn-secondary w-full text-sm">View Request Details</button>
                        </Link>
                    </div>
                )
            )}
            {msg && !submitted && <p className="text-sm text-center text-red-600">{msg}</p>}
        </div>,
    ];

    return (
        <AuthGuard>
            <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "60px 16px 80px" }}>
                <div style={{ maxWidth: 560, margin: "0 auto" }}>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-18 h-18 rounded-3xl flex items-center justify-center mx-auto mb-5 w-20 h-20"
                            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
                            <Truck size={32} className="text-white" />
                        </div>
                        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                            <Zap size={12} /> Emergency Towing
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Car Tow Service</h1>
                        <p className="text-gray-500 text-sm">₹{RATE_PER_KM}/km + ₹{SERVICE_CHARGE} service charge</p>
                    </div>

                    {/* Rate Info Banner */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 rounded-2xl p-4 mb-6 border-2 border-amber-100"
                        style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF9C3)" }}>
                        <AlertCircle size={20} className="text-amber-500 shrink-0" />
                        <div className="text-sm">
                            <p className="font-bold text-amber-800">Transparent Pricing</p>
                            <p className="text-amber-700">₹{RATE_PER_KM} per km from pickup to destination + ₹{SERVICE_CHARGE} base service charge</p>
                        </div>
                    </motion.div>

                    {/* Card */}
                    <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "32px 28px", border: "1.5px solid #E2E8F0", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>

                        {/* Step Progress */}
                        <div className="flex items-center mb-8">
                            {STEPS.map((label, i) => (
                                <div key={i} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
                                            {i < step ? <CheckCircle size={14} /> : i + 1}
                                        </div>
                                        <span className={`text-xs font-bold hidden sm:block ${i === step ? "text-blue-700" : i < step ? "text-gray-600" : "text-gray-300"}`}>{label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < step ? "bg-blue-500" : "bg-gray-100"}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Title */}
                        <div className="mb-5">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                {step + 1}. {STEPS[step]}
                            </h2>
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
                                {stepContent[step]}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        {!submitted && (
                            <div className="flex justify-between mt-8 gap-3">
                                {step > 0 ? (
                                    <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                                        ← Back
                                    </button>
                                ) : <div />}
                                {step < STEPS.length - 1 && (
                                    <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="btn-primary flex items-center gap-2">
                                        Continue <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
