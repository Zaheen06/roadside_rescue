"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Car, Bike, Wrench } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function RequestForm() {
  const [service, setService] = useState("puncture_repair");
  const [vehicle, setVehicle] = useState("car");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cost, setCost] = useState(0);

  const services = [
    { value: "puncture_repair", label: "Puncture Repair", icon: Wrench },
    { value: "stepney_change", label: "Stepney Change", icon: Car },
    { value: "tube_replacement", label: "Tube Replacement", icon: Wrench },
  ];

  const getServiceCost = (serviceType: string, vehicleType: string) => {
    const costs = {
      puncture_repair: { two_wheeler: 100, car: 200 },
      stepney_change: { car: 200 },
      tube_replacement: { two_wheeler: 500, car: 600 }
    };
    return costs[serviceType as keyof typeof costs]?.[vehicleType as keyof typeof costs.puncture_repair] || 0;
  };

  const getAvailableServices = (vehicleType: string) => {
    if (vehicleType === "two_wheeler") {
      return services.filter(s => s.value !== "stepney_change");
    }
    return services;
  };

  const vehicles = [
    { value: "car", label: "Car", icon: Car },
    { value: "two_wheeler", label: "Two Wheeler", icon: Bike },
  ];

  const handleServiceChange = (serviceValue: string) => {
    setService(serviceValue);
    setCost(getServiceCost(serviceValue, vehicle));
  };

  const handleVehicleChange = (vehicleType: string) => {
    setVehicle(vehicleType);
    // Reset service if stepney_change is selected and switching to two_wheeler
    if (vehicleType === "two_wheeler" && service === "stepney_change") {
      setService("puncture_repair");
      setCost(getServiceCost("puncture_repair", vehicleType));
    } else {
      setCost(getServiceCost(service, vehicleType));
    }
  };

  const handlePayment = () => {
    alert(`Redirecting to payment gateway for ₹${cost}`);
    // Here you would integrate with actual payment gateway
  };

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
        {getAvailableServices(vehicle).map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              onClick={() => handleServiceChange(s.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                service === s.value
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{s.label}</span>
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
              onClick={() => handleVehicleChange(v.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                vehicle === v.value
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              <span>{v.label}</span>
              <span className="text-xs font-bold">₹{getServiceCost(service, v.value)}</span>
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

      {/* Cost Display */}
      {cost > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Service Cost:</span>
            <span className="text-2xl font-bold text-green-600">₹{cost}</span>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {cost > 0 && lat && lon && (
        <button
          onClick={handlePayment}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all"
        >
          Proceed to Payment - ₹{cost}
        </button>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-3 bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition-all"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Request Help (Pay Later)"}
      </button>

      {msg && (
        <p className="mt-4 text-center text-green-700 font-medium">
          {msg}
        </p>
      )}
    </motion.div>
  );
}
