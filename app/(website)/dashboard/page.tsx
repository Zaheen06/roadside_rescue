"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, MapPin, CheckCircle, XCircle, Loader, Car, Fuel,
  Wrench, Navigation, Plus, Phone, ArrowRight, Truck,
  CreditCard, Zap, Star, ChevronRight, Sparkles
} from "lucide-react";
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

/* ─── Config ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; text: string; border: string;
  icon: any; barColor: string; step: number;
}> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, barColor: "#F59E0B", step: 1 },
  accepted: { label: "Accepted", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", icon: CheckCircle, barColor: "#7C3AED", step: 2 },
  in_progress: { label: "In Progress", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Loader, barColor: "#2563EB", step: 3 },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle, barColor: "#16A34A", step: 4 },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, barColor: "#DC2626", step: 0 },
};

const STEPS_ORDER = ["pending", "accepted", "in_progress", "completed"];

const SVC: Record<string, { bg: string; gradient: string; icon: any; color: string; accent: string; lightBg: string }> = {
  fuel_delivery: { bg: "bg-amber-100", gradient: "linear-gradient(135deg,#F59E0B,#D97706)", icon: Fuel, color: "text-amber-700", accent: "#F59E0B", lightBg: "#FFFBEB" },
  puncture_repair: { bg: "bg-blue-100", gradient: "linear-gradient(135deg,#2563EB,#1D4ED8)", icon: Wrench, color: "text-blue-700", accent: "#2563EB", lightBg: "#EFF6FF" },
  stepney_change: { bg: "bg-violet-100", gradient: "linear-gradient(135deg,#7C3AED,#6D28D9)", icon: Car, color: "text-violet-700", accent: "#7C3AED", lightBg: "#F5F3FF" },
  tube_replacement: { bg: "bg-emerald-100", gradient: "linear-gradient(135deg,#059669,#047857)", icon: Wrench, color: "text-emerald-700", accent: "#059669", lightBg: "#ECFDF5" },
  car_tow: { bg: "bg-orange-100", gradient: "linear-gradient(135deg,#EA580C,#DC2626)", icon: Truck, color: "text-orange-700", accent: "#EA580C", lightBg: "#FFF7ED" },
};

function getSvc(key = "") { return SVC[key] || { bg: "bg-gray-100", gradient: "linear-gradient(135deg,#6B7280,#4B5563)", icon: Car, color: "text-gray-700", accent: "#6B7280", lightBg: "#F9FAFB" }; }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Main Page ──────────────────────────────────────────────── */

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      if (session?.user) { setUser(session.user); await fetchRequests(session.user.id); }
      else { setUser(null); setRequests([]); setLoading(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function fetchRequests(userId: string) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("requests")
        .select(`*, services:service_id(title,key), technicians:assigned_technician(name,phone)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setRequests((data as any) || []);
    } finally { setLoading(false); }
  }

  const active = requests.filter(r => !["completed", "cancelled"].includes(r.status));
  const past = requests.filter(r => ["completed", "cancelled"].includes(r.status));
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#EFF6FF 0%,#F8FAFC 300px)" }}>
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">

          {/* ── Hero Banner ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="relative rounded-3xl overflow-hidden p-7"
              style={{ background: "linear-gradient(135deg,#0F1B4D 0%,#1E3A8A 55%,#3B82F6 100%)" }}>
              {/* Decorative blobs */}
              <div style={{ position: "absolute", top: -50, right: -30, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(147,197,253,0.18) 0%,transparent 70%)" }} />
              <div style={{ position: "absolute", bottom: -40, left: 80, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.13) 0%,transparent 70%)" }} />
              <div style={{ position: "absolute", top: 20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.1) 0%,transparent 70%)" }} />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-blue-300" />
                    <p className="text-blue-300 text-sm font-semibold">Welcome back</p>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white capitalize tracking-tight mb-4">{userName} 👋</h1>

                  {/* Stat Pills */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "Total", val: requests.length, color: "bg-white/15" },
                      { label: "Active", val: active.length, color: active.length > 0 ? "bg-green-400/25 text-green-200" : "bg-white/15" },
                      { label: "Completed", val: past.filter(r => r.status === "completed").length, color: "bg-white/15" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className={`flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-2xl backdrop-blur-sm ${color || "bg-white/15"}`}>
                        <span className="opacity-70">{label}</span>
                        <span className="text-base font-black">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/request" className="relative z-10 shrink-0">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 bg-white text-blue-700 font-extrabold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all text-sm">
                    <Plus size={16} /> New Request
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Quick Nav ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="grid grid-cols-4 gap-2.5 mb-8">
            {[
              { href: "/request", label: "Services", icon: Wrench, grad: "linear-gradient(135deg,#2563EB,#1D4ED8)" },
              { href: "/petrol", label: "Fuel", icon: Fuel, grad: "linear-gradient(135deg,#F59E0B,#D97706)" },
              { href: "/tow", label: "Tow", icon: Truck, grad: "linear-gradient(135deg,#EA580C,#DC2626)" },
              { href: "/tracking", label: "Track", icon: Navigation, grad: "linear-gradient(135deg,#059669,#047857)" },
            ].map(({ href, label, icon: Icon, grad }) => (
              <Link key={href} href={href}>
                <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100 hover:border-transparent hover:shadow-lg transition-all cursor-pointer"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: grad }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={24} />
              </div>
              <p className="text-gray-400 text-sm font-medium">Loading your requests...</p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && requests.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-gray-100 py-20 px-8 text-center"
              style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "linear-gradient(135deg,#DBEAFE,#EFF6FF)" }}>
                <Car className="text-blue-500" size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Get a verified mechanic at your location within minutes, 24/7.
              </p>
              <Link href="/request">
                <button className="btn-primary px-10 py-3.5 text-base">
                  <Zap size={16} /> Get Help Now
                </button>
              </Link>
            </motion.div>
          )}

          {/* ── Active Requests ── */}
          <AnimatePresence>
            {!loading && active.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
                <SectionHeader title="Active" count={active.length} dot="bg-green-500 animate-pulse" />
                <div className="space-y-5">
                  {active.map((req, i) => (
                    <ActiveCard key={req.id} req={req} index={i} user={user} onPaySuccess={() => fetchRequests(user?.id)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── History ── */}
          <AnimatePresence>
            {!loading && past.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SectionHeader title="History" count={past.length} />
                <div className="space-y-2.5">
                  {past.map((req, i) => (
                    <HistoryCard key={req.id} req={req} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthGuard>
  );
}

/* ─── Section Header ─────────────────────────────────────────── */
function SectionHeader({ title, count, dot }: { title: string; count: number; dot?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {dot && <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />}
      <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{count}</span>
    </div>
  );
}

/* ─── Active Card ────────────────────────────────────────────── */
function ActiveCard({ req, index, user, onPaySuccess }: {
  req: Request; index: number; user: any; onPaySuccess: () => void;
}) {
  const amount = req.price || req.estimated_price || 0;
  const isPaymentPending = req.payment_status === "pending" && amount > 0;
  const isPaid = req.payment_status === "paid" || req.payment_status === "completed";
  const svc = getSvc(req.services?.key);
  const SvcIcon = svc.icon;
  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG["pending"];
  const StatusIcon = statusCfg.icon;
  const currentStep = statusCfg.step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className="rounded-3xl overflow-hidden transition-shadow hover:shadow-xl"
      style={{ background: "#FFFFFF", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: `2px solid ${svc.accent}18` }}
    >
      {/* ── Gradient Top Bar with service info ── */}
      <div className="relative px-6 pt-5 pb-5" style={{ background: svc.lightBg }}>
        {/* Faint watermark icon */}
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.07 }}>
          <SvcIcon size={80} />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            {/* Service icon bubble */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ background: svc.gradient, boxShadow: `0 6px 18px ${svc.accent}40` }}>
              <SvcIcon size={26} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">{req.services?.title || req.description}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs font-bold capitalize text-gray-500 bg-white/80 px-2.5 py-0.5 rounded-lg border border-gray-200">
                  {req.vehicle_type}
                </span>
                <span className="text-xs text-gray-400 font-medium">{timeAgo(req.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            <StatusIcon size={12} className={req.status === "in_progress" ? "animate-spin" : ""} />
            {statusCfg.label}
          </div>
        </div>

        {/* ── Progress Stepper ── */}
        {req.status !== "cancelled" && (
          <div className="flex items-center gap-0 mt-5 relative z-10">
            {STEPS_ORDER.map((s, i) => {
              const done = i < currentStep - 1;
              const cur = i === currentStep - 1;
              const label = STATUS_CONFIG[s]?.label;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: done || cur ? svc.accent : "#E2E8F0",
                        boxShadow: cur ? `0 0 0 4px ${svc.accent}28` : "none",
                      }}>
                      {done ? <CheckCircle size={12} className="text-white" />
                        : cur ? <div className="w-2 h-2 bg-white rounded-full" />
                          : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${cur ? "text-gray-700" : done ? "text-gray-400" : "text-gray-300"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS_ORDER.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 mb-3 rounded-full transition-all"
                      style={{ background: done ? svc.accent : "#E2E8F0" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="px-6 py-5 space-y-4">

        {/* Address */}
        {req.address && (
          <div className="flex items-start gap-2.5 bg-gray-50 rounded-2xl px-4 py-3 text-sm">
            <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="text-gray-600 text-xs leading-relaxed">{req.address}</span>
          </div>
        )}

        {/* Technician Panel */}
        {req.technicians && (
          <div className="flex items-center justify-between rounded-2xl px-4 py-3.5 border"
            style={{ background: `${svc.accent}08`, borderColor: `${svc.accent}20` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                style={{ background: svc.gradient }}>
                {req.technicians.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-0.5">Assigned Mechanic</p>
                <p className="font-extrabold text-gray-900 text-sm">{req.technicians.name}</p>
              </div>
            </div>
            {req.technicians.phone && (
              <a href={`tel:${req.technicians.phone}`}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: svc.gradient }}>
                <Phone size={12} /> Call
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          {/* Price */}
          <div className="flex items-center gap-2">
            {amount > 0 ? (
              <>
                <span className="text-2xl font-black text-gray-900">₹{amount}</span>
                {isPaid ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-xl">
                    <CheckCircle size={11} /> Paid
                  </span>
                ) : isPaymentPending ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl animate-pulse">
                    <CreditCard size={11} /> Due
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">Calculating price...</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href={`/tracking/${req.id}`}>
              <button className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: svc.gradient }}>
                <Navigation size={13} /> Track Live
              </button>
            </Link>
            <Link href={`/request/${req.id}`}>
              <button className="btn-secondary text-xs px-4 py-2.5">Details</button>
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
      </div>
    </motion.div>
  );
}

/* ─── History Card ───────────────────────────────────────────── */
function HistoryCard({ req, index }: { req: Request; index: number }) {
  const svc = getSvc(req.services?.key);
  const SvcIcon = svc.icon;
  const isDone = req.status === "completed";
  const amount = req.price || req.estimated_price || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 4 }}
    >
      <Link href={`/request/${req.id}`}>
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group cursor-pointer">
          {/* Icon */}
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: isDone ? svc.lightBg : "#FEF2F2" }}>
            <SvcIcon size={20} className={isDone ? svc.color : "text-red-400"} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{req.services?.title || req.description}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 capitalize">{req.vehicle_type}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">{timeAgo(req.created_at)}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {amount > 0 && <span className="font-extrabold text-gray-700 text-sm">₹{amount}</span>}
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isDone
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
              }`}>
              {isDone ? "✓ Done" : "✕ Cancelled"}
            </span>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
