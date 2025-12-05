"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Car, Bike, Fuel, Wrench } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function RequestForm() {
  const [service, setService] = useState("puncture_repair");
  const [vehicle, setVehicle] = useState("car");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const services = [
    { value: "puncture_repair", label: "Puncture Repair", icon: Wrench },
    { value: "stepney_change", label: "Stepney Change", icon: Car },
    { value: "tube_replacement", label: "Tube Replacement", icon: Wrench },
    { value: "air_fill", label: "Air Filling", icon: Bike },
    { value: "fuel_delivery", label: "Fuel Delivery", icon: Fuel },
  ];

  const vehicles = [
    { value: "car", label: "Car", icon: Car },
    { value: "bike", label: "Bike", icon: Bike },
    { value: "scooter", label: "Scooter", icon: Bike },
  ];

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (!lat || !lon) {
      setMsg("Please use your location first.");
      setLoading(false);
      return;
    }

    const { data: svcData } = await supabase
      .from("services")
      .select("*")
      .eq("key", service)
      .single();

    await supabase.from("requests").insert([
      {
        user_id: null,
        service_id: svcData.id,
        vehicle_type: vehicle,
        description: `${svcData.title} request`,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        address,
        status: "pending",
      },
    ]);

    setMsg("Request submitted! A technician will reach you soon.");
    setLoading(false);
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(String(pos.coords.latitude));
      setLon(String(pos.coords.longitude));
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto p-6 backdrop-blur-xl bg-white/40 shadow-2xl rounded-2xl border border-white/30"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Roadside Assistance
      </h2>

      <p className="text-gray-600 text-center mb-6">
        Quick help for tyre, fuel & breakdown issues.
      </p>

      {/* Service Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              onClick={() => setService(s.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                service === s.value
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Vehicle Selection */}
      <div className="flex gap-3 mb-6">
        {vehicles.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.value}
              onClick={() => setVehicle(v.value)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                vehicle === v.value
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Location */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={useMyLocation}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <MapPin size={20} />
          Use My Location
        </button>

        {lat && lon && (
          <Map lat={parseFloat(lat)} lon={parseFloat(lon)} />
        )}
      </div>

      {/* Address */}
      <input
        className="w-full mt-4 p-3 rounded-xl border bg-white/60 backdrop-blur"
        placeholder="Address or nearest landmark"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-5 bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition-all"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Request Help"}
      </button>

      {msg && (
        <p className="mt-4 text-center text-green-700 font-medium">
          {msg}
        </p>
      )}
    </motion.div>
  );
}
