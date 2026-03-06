"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle, XCircle, Loader, Car, Fuel, Wrench, Navigation, Plus } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import PaymentButton from "@/components/PaymentButton";

interface Request {
  id: string;
  vehicle_type: string;
  description: string;
  status: string;
  lat: number;
  lon: number;
  address: string;
  assigned_technician: string | null;
  price: number | null;
  estimated_price: number | null;
  payment_status: string;
  created_at: string;
  services?: { title: string; key: string };
  technicians?: { name: string; phone: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  accepted: { label: "Accepted", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Loader },
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

function ServiceIcon({ serviceKey }: { serviceKey: string }) {
  if (serviceKey === "fuel_delivery") return <Fuel size={18} className="text-blue-600" />;
  if (["puncture_repair", "stepney_change", "tube_replacement"].includes(serviceKey))
    return <Wrench size={18} className="text-blue-600" />;
  return <Car size={18} className="text-blue-600" />;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["pending"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={12} className={status === "in_progress" ? "animate-spin" : ""} />
      {cfg.label}
    </span>
  );
}

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user);
      if (user) await fetchRequests(user.id);
      else setLoading(false);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return;
        if (session?.user) { setUser(session.user); await fetchRequests(session.user.id); }
        else { setUser(null); setRequests([]); setLoading(false); }
      }
    );

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function fetchRequests(userId: string) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("requests")
        .select(`*, services:service_id(title, key), technicians:assigned_technician(name, phone)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setRequests((data as any) || []);
    } finally {
      setLoading(false);
    }
  }

  const activeRequests = requests.filter(r => !["completed", "cancelled"].includes(r.status));
  const pastRequests = requests.filter(r => ["completed", "cancelled"].includes(r.status));

  return (
    <AuthGuard>
      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-[40px] font-extrabold text-white leading-tight">My Requests</h1>
              <p className="text-white/70 text-sm mt-1">Track your roadside assistance history</p>
            </div>
            <Link href="/request">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
                <Plus size={18} /> New Request
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Quick Nav ── */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {[
              { href: "/request", label: "Services", icon: Wrench },
              { href: "/petrol", label: "Fuel Delivery", icon: Fuel },
              { href: "/tracking", label: "Live Track", icon: Navigation },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50/80 transition shrink-0"
              >
                <Icon size={16} className="text-blue-600" />
                {label}
              </Link>
            ))}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && requests.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-500 text-sm mb-6">Create your first roadside assistance request and we'll find a mechanic near you.</p>
              <Link href="/request">
                <button className="btn-primary">Create Request</button>
              </Link>
            </motion.div>
          )}

          {/* ── Active Requests ── */}
          {!loading && activeRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[28px] font-bold text-white mb-4">Active</h2>
              <div className="space-y-4">
                {activeRequests.map((req, i) => (
                  <RequestCard key={req.id} req={req} index={i} user={user} onPaySuccess={() => fetchRequests(user?.id)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Past Requests ── */}
          {!loading && pastRequests.length > 0 && (
            <div>
              <h2 className="text-[28px] font-bold text-white mb-4">History</h2>
              <div className="space-y-3">
                {pastRequests.map((req, i) => (
                  <RequestCard key={req.id} req={req} index={i} user={user} onPaySuccess={() => fetchRequests(user?.id)} compact />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}

function RequestCard({ req, index, user, onPaySuccess, compact = false }: {
  req: Request; index: number; user: any; onPaySuccess: () => void; compact?: boolean;
}) {
  const amount = req.price || req.estimated_price || 0;
  const isPaymentPending = req.payment_status === "pending" && amount > 0;
  const isActive = !["completed", "cancelled"].includes(req.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`glass rounded-2xl ${compact ? "p-4" : "p-6"} hover:shadow-lg transition-shadow`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <ServiceIcon serviceKey={req.services?.key || ""} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {req.services?.title || req.description}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {req.vehicle_type} · {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Address */}
      {req.address && !compact && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span className="truncate">{req.address}</span>
        </div>
      )}

      {/* Technician */}
      {req.technicians && (
        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium">Assigned Mechanic</p>
            <p className="text-sm font-semibold text-blue-900">{req.technicians.name}</p>
          </div>
          {req.technicians.phone && (
            <a href={`tel:${req.technicians.phone}`} className="text-xs text-blue-600 underline">
              {req.technicians.phone}
            </a>
          )}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Price */}
        <div>
          {amount > 0 ? (
            <p className="font-bold text-gray-900">₹{amount}</p>
          ) : (
            <p className="text-xs text-gray-400">Price pending</p>
          )}
          {req.payment_status === "paid" && (
            <span className="text-xs text-green-600 font-medium">Paid ✓</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isActive && (
            <Link href={`/tracking/${req.id}`}>
              <button className="btn-primary text-xs px-4 py-2">
                <Navigation size={14} /> Track
              </button>
            </Link>
          )}
          <Link href={`/request/${req.id}`}>
            <button className="btn-secondary text-xs px-4 py-2">View Details</button>
          </Link>
          {isPaymentPending && (
            <PaymentButton
              amount={amount}
              requestId={req.id}
              description={req.services?.title || req.description}
              onSuccess={onPaySuccess}
              onError={(e) => console.error(e)}
              userEmail={user?.email}
              userName={user?.user_metadata?.name}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
