"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, Bike, Wrench, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import PaymentButton from "@/components/PaymentButton";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const SERVICES = [
  { value: "puncture_repair", label: "Puncture Repair", icon: Wrench, costs: { car: 200, two_wheeler: 100 } },
  { value: "stepney_change", label: "Stepney Change", icon: Car, costs: { car: 200 } },
  { value: "tube_replacement", label: "Tube Replacement", icon: Wrench, costs: { car: 600, two_wheeler: 500 } },
];

const VEHICLES = [
  { value: "car", label: "Car", icon: Car },
  { value: "two_wheeler", label: "Two Wheeler", icon: Bike },
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

  // Reset service if switching to two_wheeler and stepney_change selected
  useEffect(() => {
    if (vehicle === "two_wheeler" && service === "stepney_change") {
      setService("puncture_repair");
    }
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

      const { data: requestData, error } = await supabase
        .from("requests")
        .insert([{
          user_id: user?.id || null,
          service_id: svcData.id,
          vehicle_type: vehicle,
          description: `${selectedService?.label} for ${vehicle}`,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          address,
          status: "pending",
          estimated_price: cost,
          price: cost,
          otp,
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      setRequestId(requestData.id);

      // Auto-match technician
      try {
        const res = await fetch("/api/technicians/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon), vehicle_type: vehicle, request_id: requestData.id }),
        });
        const data = await res.json();
        setMsg(data.matched
          ? `✅ Mechanic ${data.technician.name} is on the way! (${data.technician.distanceKm} km)`
          : "⚠️ Request saved. We'll find a mechanic shortly."
        );
      } catch {
        setMsg("Request created. Finding a mechanic...");
      }
      setSubmitted(true);
    } catch (err: any) {
      setMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step Panels ──────────────────────────────────────────
  const stepContent = [

    // STEP 0: Select Vehicle
    <div key="vehicle" className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">What type of vehicle?</p>
      {VEHICLES.map((v) => {
        const Icon = v.icon;
        const active = vehicle === v.value;
        return (
          <button
            key={v.value}
            onClick={() => setVehicle(v.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${active ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-blue-600" : "bg-gray-100"}`}>
              <Icon size={20} className={active ? "text-white" : "text-gray-500"} />
            </div>
            <p className={`font-semibold text-sm flex-1 text-left ${active ? "text-blue-700" : "text-gray-800"}`}>{v.label}</p>
            {active && <CheckCircle size={18} className="text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>,

    // STEP 1: Select Service
    <div key="service" className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">What do you need help with?</p>
      {availableServices.map((s) => {
        const Icon = s.icon;
        const price = s.costs[vehicle as keyof typeof s.costs] ?? 0;
        const active = service === s.value;
        return (
          <button
            key={s.value}
            onClick={() => setService(s.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${active ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-blue-600" : "bg-gray-100"}`}>
              <Icon size={20} className={active ? "text-white" : "text-gray-500"} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${active ? "text-blue-700" : "text-gray-800"}`}>{s.label}</p>
            </div>
            <div className={`font-bold text-sm ${active ? "text-blue-700" : "text-gray-400"}`}>
              ₹{price}
            </div>
            {active && <CheckCircle size={18} className="text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>,

    // STEP 2: Location
    <div key="location" className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">Where are you right now?</p>
      <button
        onClick={useMyLocation}
        className="btn-primary w-full py-3"
      >
        <MapPin size={18} />
        Use My Current Location
      </button>
      {lat && lon && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden h-48">
          <Map lat={parseFloat(lat)} lon={parseFloat(lon)} />
        </motion.div>
      )}
      <input
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Address or nearest landmark (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      {lat && lon && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle size={14} /> Location detected
        </p>
      )}
    </div>,

    // STEP 3: Confirm
    <div key="confirm" className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">Review your request before submitting.</p>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        {[
          { label: "Service", value: SERVICES.find(s => s.value === service)?.label },
          { label: "Vehicle", value: VEHICLES.find(v => v.value === vehicle)?.label },
          { label: "Address", value: address || "GPS location detected" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total</span>
          <span className="text-2xl font-bold text-blue-600">₹{cost}</span>
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? "Finding mechanic..." : "Request Mechanic →"}
        </button>
      ) : (
        requestId && cost > 0 && (
          <div className="space-y-3">
            {msg && <p className="text-sm text-center text-green-700 font-medium">{msg}</p>}
            <PaymentButton
              amount={cost}
              requestId={requestId}
              description={`${SERVICES.find(s => s.value === service)?.label} service`}
              onSuccess={() => { window.location.href = "/dashboard"; }}
              onError={(e) => setMsg(`Payment error: ${e}`)}
              userEmail={user?.email}
              userName={user?.user_metadata?.name}
            />
          </div>
        )
      )}
      {msg && !submitted && <p className="text-sm text-center text-gray-600">{msg}</p>}
    </div>,
  ];

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "32px 28px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-blue-600 text-white" :
              i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                "bg-gray-100 text-gray-400"
              }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-blue-700" : "text-gray-400"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 w-4 mx-1 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Step {step + 1} — {STEPS[step]}</h2>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!submitted && (
        <div className="flex justify-between mt-8 gap-3">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
