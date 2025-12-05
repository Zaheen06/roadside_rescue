"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Fuel, Car, Bike } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function PetrolPage() {
  const [fuelType, setFuelType] = useState("petrol");
  const [vehicle, setVehicle] = useState("car");
  const [quantity, setQuantity] = useState("1");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fuelTypes = [
    { value: "petrol", label: "Petrol", icon: Fuel },
    { value: "diesel", label: "Diesel", icon: Fuel },
  ];

  const vehicles = [
    { value: "car", label: "Car", icon: Car },
    { value: "bike", label: "Bike", icon: Bike },
    { value: "scooter", label: "Scooter", icon: Bike },
  ];

  const quantities = ["1", "5", "10", "15", "20"];

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
      .eq("key", "fuel_delivery")
      .single();

    await supabase.from("requests").insert([
      {
        user_id: null,
        service_id: svcData.id,
        vehicle_type: vehicle,
        description: `${quantity}L ${fuelType} delivery for ${vehicle}`,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        address,
        status: "pending",
      },
    ]);

    setMsg("Fuel delivery request submitted! We'll reach you soon.");
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
        Fuel Delivery Service
      </h2>

      <p className="text-gray-600 text-center mb-6">
        Emergency petrol & diesel delivery to your location.
      </p>

      {/* Fuel Type Selection */}
      <div className="flex gap-3 mb-6">
        {fuelTypes.map((fuel) => {
          const Icon = fuel.icon;
          return (
            <button
              key={fuel.value}
              onClick={() => setFuelType(fuel.value)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                fuelType === fuel.value
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              {fuel.label}
            </button>
          );
        })}
      </div>

      {/* Quantity Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Liters)</label>
        <div className="grid grid-cols-4 gap-2">
          {quantities.map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`p-2 rounded-xl border transition-all ${
                quantity === q
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              {q}L
            </button>
          ))}
        </div>
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
        className="w-full mt-5 bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-orange-700 transition-all"
        disabled={loading}
      >
        {loading ? "Submitting..." : `Order ${quantity}L ${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}`}
      </button>

      {msg && (
        <p className="mt-4 text-center text-green-700 font-medium">
          {msg}
        </p>
      )}
    </motion.div>
  );
}