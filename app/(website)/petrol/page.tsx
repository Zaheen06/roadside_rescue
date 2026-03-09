"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Fuel, Car, Bike, CheckCircle, Zap } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { loadRazorpayScript } from "@/lib/razorpay";
import PaymentButton from "@/components/PaymentButton";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const fuelPrices = { petrol: 102.95, diesel: 91.05 };
const quantities = ["1", "5", "10", "15", "20"];
const fuelTypes = [
  { value: "petrol", label: "Petrol", price: fuelPrices.petrol, color: "text-amber-600", bg: "bg-amber-50", activeBg: "bg-amber-500" },
  { value: "diesel", label: "Diesel", price: fuelPrices.diesel, color: "text-blue-600", bg: "bg-blue-50", activeBg: "bg-blue-500" },
];
const vehicles = [
  { value: "car", label: "Car", icon: Car },
  { value: "two_wheeler", label: "Two Wheeler", icon: Bike },
];

export default function PetrolPage() {
  const [fuelType, setFuelType] = useState("petrol");
  const [vehicle, setVehicle] = useState("car");
  const [quantity, setQuantity] = useState("5");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const deliveryFee = 50;
  const fuelCost = parseInt(quantity) * fuelPrices[fuelType as keyof typeof fuelPrices];
  const totalCost = Math.round(fuelCost + deliveryFee);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    loadRazorpayScript().then(setScriptLoaded);
  }, []);

  const handleFuelTypeChange = (fuel: string) => {
    setFuelType(fuel);
    if (fuel === "diesel" && vehicle === "two_wheeler") setVehicle("car");
  };

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(String(pos.coords.latitude));
      setLon(String(pos.coords.longitude));
    });
  }

  const handlePayNow = async () => {
    if (!scriptLoaded) { setMsg("Payment gateway loading. Please try again."); return; }
    if (!lat || !lon) { setMsg("Please use your location first."); return; }
    setLoading(true);
    setMsg("");
    try {
      const { data: svcData, error: svcError } = await supabase.from("services").select("*").eq("key", "fuel_delivery").single();
      if (svcError || !svcData) throw new Error("Service unavailable.");
      const { data: { user } } = await supabase.auth.getUser();
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const { data: requestData, error: requestError } = await supabase.from("requests").insert([{
        user_id: user?.id || null,
        service_id: svcData.id,
        vehicle_type: vehicle,
        description: `${quantity}L ${fuelType} delivery for ${vehicle}`,
        lat: parseFloat(lat), lon: parseFloat(lon), address,
        status: "pending", estimated_price: totalCost, price: totalCost, otp,
      }]).select().single();
      if (requestError) throw new Error("Error creating request: " + requestError.message);
      await supabase.from("fuel_requests").insert([{
        request_id: requestData.id,
        fuel_type: fuelType, litres: parseFloat(quantity),
        price_per_litre: fuelPrices[fuelType as keyof typeof fuelPrices], delivered: false,
      }]);
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestData.id, amount: totalCost }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error);
      const options = {
        key: orderData.key, amount: Math.round(totalCost * 100), currency: "INR",
        name: "Roadside Rescue", description: `${quantity}L ${fuelType} delivery`,
        order_id: orderData.order_id,
        prefill: { name: user?.user_metadata?.name, email: user?.email },
        theme: { color: "#2563eb" },
        handler: async (response: any) => {
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, request_id: requestData.id }),
          });
          if (verifyResponse.ok) {
            setMsg("Payment successful! Redirecting...");
            setTimeout(() => window.location.href = "/dashboard", 2000);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setMsg(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
              <Fuel size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Fuel Delivery</h1>
            <p className="text-gray-500">Emergency petrol & diesel delivered to your location.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-5">

            {/* Fuel Type */}
            <div className="card" style={{ borderRadius: 20 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Select Fuel Type</p>
              <div className="grid grid-cols-2 gap-3">
                {fuelTypes.map((fuel) => {
                  const active = fuelType === fuel.value;
                  return (
                    <button key={fuel.value} onClick={() => handleFuelTypeChange(fuel.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${active ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-blue-600" : fuel.bg}`}>
                        <Fuel size={18} className={active ? "text-white" : fuel.color} />
                      </div>
                      <p className={`font-bold text-sm ${active ? "text-blue-700" : "text-gray-800"}`}>{fuel.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">₹{fuel.price}/litre</p>
                      {active && <CheckCircle size={14} className="text-blue-600 mt-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle */}
            <div className="card" style={{ borderRadius: 20 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Vehicle Type</p>
              <div className="grid grid-cols-2 gap-3">
                {vehicles.filter(v => fuelType === "diesel" ? v.value === "car" : true).map((v) => {
                  const Icon = v.icon;
                  const active = vehicle === v.value;
                  return (
                    <button key={v.value} onClick={() => setVehicle(v.value)}
                      className={`p-4 rounded-2xl flex items-center gap-3 border-2 transition-all ${active ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? "bg-blue-600" : "bg-gray-100"}`}>
                        <Icon size={18} className={active ? "text-white" : "text-gray-500"} />
                      </div>
                      <p className={`font-bold text-sm ${active ? "text-blue-700" : "text-gray-800"}`}>{v.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="card" style={{ borderRadius: 20 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quantity (Litres)</p>
              <div className="grid grid-cols-5 gap-2">
                {quantities.map((q) => {
                  const active = quantity === q;
                  return (
                    <button key={q} onClick={() => setQuantity(q)}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${active ? "border-blue-500 bg-blue-600 text-white" : "border-gray-100 bg-white text-gray-700 hover:border-blue-200"}`}>
                      {q}L
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div className="card" style={{ borderRadius: 20 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Your Location</p>
              <button onClick={useMyLocation}
                className="w-full btn-primary mb-3">
                <MapPin size={18} /> Use My Current Location
              </button>
              {lat && lon && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl overflow-hidden h-48 mb-3">
                  <Map lat={parseFloat(lat)} lon={parseFloat(lon)} />
                </motion.div>
              )}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors"
                placeholder="Address or nearest landmark (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {lat && lon && (
                <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1.5">
                  <CheckCircle size={12} /> Location detected
                </p>
              )}
            </div>

            {/* Cost Summary */}
            <div className="card overflow-hidden" style={{ borderRadius: 20, background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)", border: "1.5px solid #FDE68A" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-gray-900 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Order Summary</p>
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">
                  {quantity}L {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fuel Cost ({quantity}L × ₹{fuelPrices[fuelType as keyof typeof fuelPrices]})</span>
                  <span className="font-semibold">₹{fuelCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">₹{deliveryFee}</span>
                </div>
              </div>
              <div className="border-t border-amber-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-2xl font-extrabold text-amber-600">₹{totalCost}</span>
              </div>
            </div>

            {/* Pay Button */}
            {lat && lon && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full py-4 font-bold text-base text-white rounded-2xl transition-all shadow-lg"
                  style={{ background: loading ? "#9CA3AF" : "linear-gradient(135deg, #16A34A, #15803D)", boxShadow: "0 8px 24px rgba(22,163,74,0.3)" }}
                >
                  {loading ? "Processing..." : `Pay Now — ₹${totalCost}`}
                </button>
              </motion.div>
            )}

            {msg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-center text-sm font-semibold px-4 py-3 rounded-xl ${msg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {msg}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}