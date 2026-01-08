"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Car, Bike, Wrench } from "lucide-react";
import { loadRazorpayScript } from "@/lib/razorpay";

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
  const [requestId, setRequestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const services = [
    { value: "puncture_repair", label: "Puncture Repair", icon: Wrench },
    { value: "stepney_change", label: "Stepney Change", icon: Car },
    { value: "tube_replacement", label: "Tube Replacement", icon: Wrench },
  ];

  const getServiceCost = (serviceType: string, vehicleType: string): number => {
    const costs: Record<string, Record<string, number>> = {
      puncture_repair: { two_wheeler: 100, car: 200 },
      stepney_change: { car: 200 },
      tube_replacement: { two_wheeler: 500, car: 600 }
    };
    const serviceCosts = costs[serviceType];
    if (!serviceCosts) return 0;
    return serviceCosts[vehicleType] || 0;
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    
    // Load Razorpay script
    loadRazorpayScript().then(setScriptLoaded);
  }, []);

  const handlePaymentSuccess = () => {
    setMsg("Payment successful! Redirecting to dashboard...");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setMsg(`Payment error: ${error}`);
  };

  const handlePayNow = async () => {
    if (!scriptLoaded) {
      setMsg("Payment gateway loading. Please try again.");
      return;
    }

    setLoading(true);
    setMsg("");

    if (!lat || !lon) {
      setMsg("Please use your location first.");
      setLoading(false);
      return;
    }

    // First create the request
    const { data: { user } } = await supabase.auth.getUser();
    const { data: svcData } = await supabase
      .from("services")
      .select("*")
      .eq("key", service)
      .single();

    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .insert([
        {
          user_id: user?.id || null,
          service_id: svcData.id,
          vehicle_type: vehicle,
          description: `${svcData.title} request`,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          address,
          status: "pending",
          estimated_price: cost,
          price: cost,
        },
      ])
      .select()
      .single();

    if (requestError) {
      setMsg("Error creating request: " + requestError.message);
      setLoading(false);
      return;
    }

    // Then trigger payment
    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestData.id, amount: cost }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error);

      const options = {
        key: orderData.key,
        amount: Math.round(cost * 100),
        currency: "INR",
        name: "Roadside Rescue",
        description: `${svcData.title} request`,
        order_id: orderData.order_id,
        prefill: { name: user?.user_metadata?.name, email: user?.email },
        theme: { color: "#2563eb" },
        handler: async (response: any) => {
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              request_id: requestData.id,
            }),
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
      setMsg(`Payment error: ${error.message}`);
      setLoading(false);
    }
  };

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
          const serviceCost = getServiceCost(s.value, vehicle);
          return (
            <div key={s.value} className="relative">
              <button
                onClick={() => handleServiceChange(s.value)}
                className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  service === s.value
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/70 backdrop-blur border-gray-300"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{s.label}</span>
                <span className="text-xs font-bold">₹{serviceCost}</span>
              </button>
              {serviceCost > 0 && lat && lon && (
                <button
                  onClick={() => {
                    setService(s.value);
                    setCost(serviceCost);
                    setTimeout(() => handlePayNow(), 100);
                  }}
                  className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                  disabled={loading}
                >
                  Pay Now - ₹{serviceCost}
                </button>
              )}
            </div>
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

      {/* Total Amount Display */}
      {cost > 0 && (
        <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount to Pay</p>
            <p className="text-4xl font-bold text-green-600 mb-2">₹{cost}</p>
            <p className="text-xs text-gray-500">
              {services.find(s => s.value === service)?.label} for {vehicles.find(v => v.value === vehicle)?.label}
            </p>
          </div>
        </div>
      )}

      {/* Payment Button - Show after request is created */}
      {requestId && cost > 0 && (
        <div className="mt-4">
          <PaymentButton
            amount={cost}
            requestId={requestId}
            description={`${services.find(s => s.value === service)?.label || "Service"} request`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            userEmail={user?.email}
            userName={user?.user_metadata?.name}
          />
        </div>
      )}

      {/* Submit Buttons */}
      {!requestId && cost > 0 && lat && lon && (
        <div className="mt-4 space-y-3">
          {/* Pay Now Button - Primary */}
          <button
            onClick={handlePayNow}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all"
            disabled={loading}
          >
            {loading ? "Processing Payment..." : `Pay Now - ₹${cost}`}
          </button>
        </div>
      )}

      {msg && (
        <p className="mt-4 text-center text-green-700 font-medium">
          {msg}
        </p>
      )}
    </motion.div>
  );
}
