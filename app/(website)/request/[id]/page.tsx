"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Clock, MapPin, CheckCircle, XCircle, Loader, Car, Fuel, Wrench,
  Phone, Navigation, Timer, ArrowLeft, Star
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import PaymentSection from "@/components/PaymentSection";
import { calculateETA, ETAResult } from "@/lib/eta";
import { subscribeToPush, sendPushNotification } from "@/lib/pushNotification";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Request {
  id: string; service_id: number; vehicle_type: string; description: string;
  status: string; lat: number; lon: number; address: string;
  assigned_technician: string | null; estimated_price: number | null;
  price: number | null; payment_status: string; created_at: string; updated_at: string;
  services?: { title: string; key: string; base_price: number; estimated_time_minutes: number };
  technicians?: { name: string; phone: string; rating: number; current_lat: number; current_lon: number };
  fuel_requests?: { fuel_type: string; litres: number; price_per_litre: number; delivered: boolean }[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
  pending: { label: "Pending", icon: Clock, bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  accepted: { label: "Accepted", icon: CheckCircle, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  in_progress: { label: "In Progress", icon: Loader, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  completed: { label: "Completed", icon: CheckCircle, bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  cancelled: { label: "Cancelled", icon: XCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function ServiceIcon({ k }: { k: string }) {
  if (k === "fuel_delivery") return <Fuel size={20} className="text-amber-600" />;
  return <Wrench size={20} className="text-blue-600" />;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [techLocation, setTechLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [eta, setEta] = useState<ETAResult | null>(null);
  const [failedTechs, setFailedTechs] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.id) subscribeToPush(user.id).catch(() => { });
    });
    if (requestId) {
      fetchRequest();
      const subscription = supabase.channel(`request:${requestId}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests", filter: `id=eq.${requestId}` },
          async (payload: any) => {
            const newStatus = payload?.new?.status;
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (userId && newStatus === "accepted") sendPushNotification(userId, "🔧 Mechanic Assigned!", "A mechanic has accepted your request.", `/request/${requestId}`);
            else if (userId && newStatus === "completed") sendPushNotification(userId, "✅ Service Completed", "Your service has been completed!", `/request/${requestId}`);
            fetchRequest();
          }).subscribe();
      return () => { subscription.unsubscribe(); };
    }
  }, [requestId]);

  async function fetchRequest() {
    setLoading(true);
    const { data } = await supabase.from("requests").select(`
      *, services:service_id(title,key,base_price,estimated_time_minutes),
      technicians:assigned_technician(name,phone,rating,current_lat,current_lon),
      fuel_requests(fuel_type,litres,price_per_litre,delivered)
    `).eq("id", requestId).single();
    if (data) {
      setRequest(data as any);
      if (data.technicians?.current_lat && data.technicians?.current_lon) {
        const techLoc = { lat: data.technicians.current_lat, lon: data.technicians.current_lon };
        setTechLocation(techLoc);
        setEta(calculateETA(data.lat, data.lon, techLoc.lat, techLoc.lon));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (request?.status === "pending" && request?.assigned_technician) setCountdown(30);
    else setCountdown(null);
  }, [request?.status, request?.assigned_technician]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { reassignTechnician(); return; }
    const timer = setTimeout(() => setCountdown((c) => (c ? c - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function reassignTechnician() {
    if (!request?.assigned_technician) return;
    setCountdown(null);
    const newFailed = [...failedTechs, request.assigned_technician];
    setFailedTechs(newFailed);
    try {
      await fetch("/api/technicians/match", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: request.lat, lon: request.lon, vehicle_type: request.vehicle_type, request_id: request.id, excluded_techs: newFailed }),
      });
      fetchRequest();
    } catch (err) { console.error("Reassignment failed:", err); }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <Loader className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-400 text-sm">Loading request details...</p>
        </div>
      </AuthGuard>
    );
  }

  if (!request) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="card text-center max-w-sm w-full py-12" style={{ borderRadius: 24 }}>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Request not found</h2>
            <Link href="/dashboard"><button className="btn-primary">Back to Dashboard</button></Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const amount = request.price || request.estimated_price || 0;
  const statusCfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <AuthGuard>
      <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-3xl mx-auto">

          {/* Back */}
          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition mb-6">
            <ArrowLeft size={16} /> Back to Dashboard
          </motion.button>

          {/* Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card mb-5" style={{ borderRadius: 24 }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <ServiceIcon k={request.services?.key || ""} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                    {request.services?.title || request.description}
                  </h1>
                  <p className="text-gray-400 text-xs font-mono mt-1">ID: {request.id.slice(0, 16)}...</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                <StatusIcon size={14} className={request.status === "in_progress" ? "animate-spin" : ""} />
                {statusCfg.label}
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Vehicle Type", value: request.vehicle_type, capitalize: true },
                { label: "Created", value: new Date(request.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                { label: "Est. Time", value: request.services?.estimated_time_minutes ? `${request.services.estimated_time_minutes} min` : "—" },
                { label: "Payment", value: request.payment_status || "pending", capitalize: true },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold mb-1">{label}</p>
                  <p className={`text-sm font-bold text-gray-900 ${capitalize ? "capitalize" : ""}`}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          {request.address && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card mb-5" style={{ borderRadius: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">Location</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{request.address}</p>
              <div className="h-56 rounded-2xl overflow-hidden">
                <Map lat={request.lat} lon={request.lon} />
              </div>
            </motion.div>
          )}

          {/* Technician */}
          {request.technicians && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mb-5 rounded-3xl border-2 border-blue-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" }}>

              {/* ETA Banner */}
              {eta && (
                <div className="flex items-center gap-3 px-6 py-4 text-white"
                  style={{ background: "linear-gradient(135deg, #1E3A8A, #2563EB)" }}>
                  <Timer size={20} className="shrink-0" />
                  <div>
                    <p className="font-bold">Technician arriving in {eta.etaText}</p>
                    <p className="text-blue-200 text-xs">{eta.distanceKm} km away · updates live</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    {request.status === "pending" ? "Contacting Mechanic..." : "Assigned Mechanic"}
                  </p>
                  {countdown !== null && (
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full animate-pulse">
                      Waiting {countdown}s
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xl font-extrabold text-blue-900">{request.technicians.name}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {request.technicians.phone && (
                        <a href={`tel:${request.technicians.phone}`}
                          className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold hover:text-blue-900">
                          <Phone size={14} /> {request.technicians.phone}
                        </a>
                      )}
                      {request.technicians.rating && (
                        <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                          <Star size={13} className="fill-amber-400 text-amber-400" /> {request.technicians.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  {techLocation && (
                    <Link href={`/tracking/${request.id}`} target="_blank">
                      <button className="btn-primary text-xs px-4 py-2">
                        <Navigation size={14} /> Live Track
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Fuel Details */}
          {request.fuel_requests && request.fuel_requests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card mb-5" style={{ borderRadius: 24 }}>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Fuel size={16} className="text-amber-500" /> Fuel Details
              </h3>
              {request.fuel_requests.map((fuel, i) => (
                <div key={i} className="bg-amber-50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{fuel.fuel_type}</p>
                    <p className="text-sm text-gray-500">{fuel.litres}L @ ₹{fuel.price_per_litre}/L</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-amber-600 text-lg">₹{(fuel.litres * fuel.price_per_litre).toFixed(0)}</p>
                    <span className={`text-xs font-bold ${fuel.delivered ? "text-green-600" : "text-yellow-600"}`}>
                      {fuel.delivered ? "✓ Delivered" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Payment */}
          {(request.price || request.estimated_price) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="card" style={{ borderRadius: 24 }}>
              <PaymentSection
                amount={amount}
                requestId={request.id}
                description={request.services?.title || request.description}
                paymentStatus={request.payment_status || "pending"}
                onSuccess={() => { alert("Payment successful!"); fetchRequest(); }}
                onError={(error) => alert(`Payment error: ${error}`)}
                userEmail={user?.email}
                userName={user?.user_metadata?.name}
                userPhone={user?.phone}
              />
            </motion.div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
