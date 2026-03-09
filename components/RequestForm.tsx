"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, Bike, Wrench, CheckCircle, ArrowRight, ArrowLeft, Zap, Shield } from "lucide-react";
import PaymentButton from "@/components/PaymentButton";
import Link from "next/link";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const SERVICES = [
  { value: "puncture_repair", label: "Puncture Repair", icon: Wrench, costs: { car: 200, two_wheeler: 100 }, desc: "Fast on-site tyre repair" },
  { value: "stepney_change", label: "Stepney Change", icon: Car, costs: { car: 200 }, desc: "Professional spare tyre replacement" },
  { value: "tube_replacement", label: "Tube Replacement", icon: Wrench, costs: { car: 600, two_wheeler: 500 }, desc: "New tube fitted at your spot" },
];

const VEHICLES = [
  { value: "car", label: "Car", icon: Car, desc: "Sedan, SUV, Hatchback" },
  { value: "two_wheeler", label: "Two Wheeler", icon: Bike, desc: "Bike, Scooter, Moped" },
];

function getAvailableServices(vehicleType: string) {
  return SERVICES.filter((s) => String(s.costs[vehicleType as keyof typeof s.costs] ?? "") !== "");
}

function getCost(serviceValue: string, vehicleType: string): number {
  const s = SERVICES.find((s) => s.value === serviceValue);
  return s?.costs[vehicleType as keyof typeof s.costs] ?? 0;
}

const STEPS = ["Vehicle", "Service", "Location", "Confirm"];

export default function RequestForm() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("puncture_repair");
  const [vehicle, setVehicle] = useState("car");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const cost = getCost(service, vehicle);
  const availableServices = getAvailableServices(vehicle);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (vehicle === "two_wheeler" && service === "stepney_change") setService("puncture_repair");
  }, [vehicle]);

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(String(pos.coords.latitude));
      setLon(String(pos.coords.longitude));
    });
  }

  const canProceed = () => {
    if (step === 0) return !!vehicle;
    if (step === 1) return !!service;
    if (step === 2) return !!lat && !!lon;
    return true;
  };

  async function handleSubmit() {
    setLoading(true);
    setMsg("");
    try {
      const { data: svcData } = await supabase.from("services").select("id").eq("key", service).single();
      if (!svcData) throw new Error("Service unavailable.");
      const { data: { user } } = await supabase.auth.getUser();
      const selectedService = SERVICES.find((s) => s.value === service);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const { data: requestData, error } = await supabase.from("requests").insert([{
        user_id: user?.id || null, service_id: svcData.id, vehicle_type: vehicle,
        description: `${selectedService?.label} for ${vehicle}`,
        lat: parseFloat(lat), lon: parseFloat(lon), address,
        status: "pending", estimated_price: cost, price: cost, otp,
      }]).select().single();
      if (error) throw new Error(error.message);
      setRequestId(requestData.id);
      try {
        const res = await fetch("/api/technicians/match", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon), vehicle_type: vehicle, request_id: requestData.id }),
        });
        const data = await res.json();
        setMsg(data.matched
          ? `✅ Mechanic ${data.technician.name} is on the way! (${data.technician.distanceKm} km)`
          : "⚠️ Request saved. We'll find a mechanic shortly."
        );
      } catch { setMsg("Request created. Finding a mechanic..."); }
      setSubmitted(true);
    } catch (err: any) {
      setMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const stepContent = [
    // STEP 0: Vehicle
    <div key="vehicle" className="space-y-3">
      <p className="text-sm text-gray-500 mb-5">What type of vehicle are you driving?</p>
      {VEHICLES.map((v) => {
        const Icon = v.icon;
        const active = vehicle === v.value;
        return (
          <button key={v.value} onClick={() => setVehicle(v.value)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${active ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${active ? "bg-blue-600" : "bg-gray-100"}`}>
              <Icon size={22} className={active ? "text-white" : "text-gray-500"} />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${active ? "text-blue-700" : "text-gray-800"}`}>{v.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.desc}</p>
            </div>
            {active && <CheckCircle size={20} className="text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>,

    // STEP 1: Service
    <div key="service" className="space-y-3">
      <p className="text-sm text-gray-500 mb-5">What do you need help with?</p>
      {availableServices.map((s) => {
        const Icon = s.icon;
        const price = s.costs[vehicle as keyof typeof s.costs] ?? 0;
        const active = service === s.value;
        return (
          <button key={s.value} onClick={() => setService(s.value)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${active ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${active ? "bg-blue-600" : "bg-gray-100"}`}>
              <Icon size={22} className={active ? "text-white" : "text-gray-500"} />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${active ? "text-blue-700" : "text-gray-800"}`}>{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
            </div>
            <div className={`font-extrabold text-sm shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`}>₹{price}</div>
            {active && <CheckCircle size={20} className="text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>,

    // STEP 2: Location
    <div key="location" className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">Where are you right now?</p>
      <button onClick={useMyLocation} className="btn-primary w-full py-4 text-sm">
        <MapPin size={18} /> Use My Current Location
      </button>
      {lat && lon && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden h-52">
          <Map lat={parseFloat(lat)} lon={parseFloat(lon)} />
        </motion.div>
      )}
      <input
        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
        placeholder="Address or nearest landmark (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      {lat && lon && (
        <p className="text-xs text-green-600 font-bold flex items-center gap-1.5">
          <CheckCircle size={14} /> Location captured successfully
        </p>
      )}
    </div>,

    // STEP 3: Confirm
    <div key="confirm" className="space-y-5">
      <p className="text-sm text-gray-500">Review your request before we find you a mechanic.</p>

      <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
        {[
          { label: "Service", value: SERVICES.find(s => s.value === service)?.label },
          { label: "Vehicle", value: VEHICLES.find(v => v.value === vehicle)?.label },
          { label: "Location", value: address || "GPS location captured" },
        ].map(({ label, value }, i) => (
          <div key={label} className={`flex justify-between items-center px-5 py-3.5 text-sm ${i < 2 ? "border-b border-gray-100" : ""}`}>
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="font-bold text-gray-900">{value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center px-5 py-4 bg-blue-50">
          <span className="font-bold text-blue-700">Total Amount</span>
          <span className="text-2xl font-extrabold text-blue-700">₹{cost}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
        <Shield size={14} className="shrink-0 mt-0.5" />
        <span>A verified mechanic will be dispatched immediately. OTP verification keeps you safe.</span>
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? "Finding mechanic..." : <><Zap size={16} /> Request Mechanic Now</>}
        </button>
      ) : (
        requestId && cost > 0 && (
          <div className="space-y-3">
            {msg && (
              <div className={`text-sm text-center px-4 py-3 rounded-xl font-semibold ${msg.includes("✅") ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {msg}
              </div>
            )}
            <PaymentButton
              amount={cost}
              requestId={requestId}
              description={`${SERVICES.find(s => s.value === service)?.label} service`}
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
      {msg && !submitted && <p className="text-sm text-center text-gray-600">{msg}</p>}
    </div>,
  ];

  return (
    <div>
      {/* Outer page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          <Zap size={12} /> Emergency Service
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Request a Mechanic</h1>
        <p className="text-gray-500 text-sm">Get help in 4 quick steps</p>
      </div>

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

        {/* Nav */}
        {!submitted && (
          <div className="flex justify-between mt-8 gap-3">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                <ArrowLeft size={16} /> Back
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
  );
}
