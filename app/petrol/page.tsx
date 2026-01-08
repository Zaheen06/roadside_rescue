"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Fuel, Car, Bike } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { loadRazorpayScript } from "@/lib/razorpay";

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
  const [cost, setCost] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const fuelTypes = [
    { value: "petrol", label: "Petrol", icon: Fuel },
    { value: "diesel", label: "Diesel", icon: Fuel },
  ];

  const vehicles = [
    { value: "car", label: "Car", icon: Car },
    { value: "two_wheeler", label: "Two Wheeler", icon: Bike },
  ];

  const getAvailableVehicles = (fuel: string) => {
    if (fuel === "diesel") {
      return vehicles.filter(v => v.value === "car");
    }
    return vehicles;
  };

  const quantities = ["1", "5", "10", "15", "20"];

  const getQuantityPrice = (qty: string, fuel: string) => {
    const price = fuelPrices[fuel as keyof typeof fuelPrices];
    return parseFloat((parseInt(qty) * price).toFixed(2));
  };

  const fuelPrices = {
    petrol: 102.95,
    diesel: 91.05
  };

  const calculateCost = (qty: string, fuel: string) => {
    const basePrice = fuelPrices[fuel as keyof typeof fuelPrices];
    const deliveryFee = 50;
    return (parseInt(qty) * basePrice) + deliveryFee;
  };

  const handleQuantityChange = (qty: string) => {
    setQuantity(qty);
    setCost(calculateCost(qty, fuelType));
  };

  const handleFuelTypeChange = (fuel: string) => {
    setFuelType(fuel);
    // Reset to car if diesel is selected and current vehicle is two_wheeler
    if (fuel === "diesel" && vehicle === "two_wheeler") {
      setVehicle("car");
      setCost(calculateCost(quantity, fuel));
    } else {
      setCost(calculateCost(quantity, fuel));
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
    const { data: svcData } = await supabase
      .from("services")
      .select("*")
      .eq("key", "fuel_delivery")
      .single();

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .insert([
        {
          user_id: user?.id || null,
          service_id: svcData.id,
          vehicle_type: vehicle,
          description: `${quantity}L ${fuelType} delivery for ${vehicle}`,
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

    // Create fuel_requests entry
    const fuelPrice = fuelPrices[fuelType as keyof typeof fuelPrices];
    await supabase.from("fuel_requests").insert([
      {
        request_id: requestData.id,
        fuel_type: fuelType,
        litres: parseFloat(quantity),
        price_per_litre: fuelPrice,
        delivered: false,
      },
    ]);

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
        description: `${quantity}L ${fuelType} delivery`,
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
    <AuthGuard>
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
              onClick={() => handleFuelTypeChange(fuel.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                fuelType === fuel.value
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-white/70 backdrop-blur border-gray-300"
              }`}
            >
              <Icon size={20} />
              <span>{fuel.label}</span>
              <span className="text-xs font-bold">₹{fuelPrices[fuel.value as keyof typeof fuelPrices]}/L</span>
            </button>
          );
        })}
      </div>

      {/* Quantity Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Liters)</label>
        <div className="grid grid-cols-4 gap-2">
          {quantities.map((q) => {
            const quantityPrice = getQuantityPrice(q, fuelType);
            const totalCost = calculateCost(q, fuelType);
            return (
              <div key={q} className="relative">
                <button
                  onClick={() => handleQuantityChange(q)}
                  className={`w-full p-2 rounded-xl border transition-all flex flex-col items-center ${
                    quantity === q
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/70 backdrop-blur border-gray-300"
                  }`}
                >
                  <span>{q}L</span>
                  <span className="text-xs">₹{quantityPrice}</span>
                </button>
                {lat && lon && (
                  <button
                    onClick={() => {
                      setQuantity(q);
                      setCost(totalCost);
                      setTimeout(() => handlePayNow(), 100);
                    }}
                    className="w-full mt-1 bg-green-600 text-white py-1 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    Pay ₹{totalCost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="flex gap-3 mb-6">
        {getAvailableVehicles(fuelType).map((v) => {
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

      {/* Total Amount Display */}
      {cost > 0 && (
        <div className="mt-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount to Pay</p>
            <p className="text-4xl font-bold text-orange-600 mb-2">₹{cost}</p>
            <p className="text-xs text-gray-500">
              {quantity}L {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} for {vehicles.find(v => v.value === vehicle)?.label}
            </p>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fuel Cost:</span>
                <span>₹{parseInt(quantity) * fuelPrices[fuelType as keyof typeof fuelPrices]}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee:</span>
                <span>₹50</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button - Show after request is created */}
      {requestId && cost > 0 && (
        <div className="mt-4">
          <PaymentButton
            amount={cost}
            requestId={requestId}
            description={`${quantity}L ${fuelType} delivery`}
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
    </AuthGuard>
  );
}