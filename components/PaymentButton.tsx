"use client";

import { useState, useEffect } from "react";
import { loadRazorpayScript, RazorpayOptions, RazorpayResponse } from "@/lib/razorpay";
import { Loader } from "lucide-react";

interface PaymentButtonProps {
  amount: number;
  requestId: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export default function PaymentButton({
  amount,
  requestId,
  description,
  onSuccess,
  onError,
  userEmail,
  userName,
  userPhone,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setScriptLoaded);
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError?.("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    if (!window.Razorpay) {
      onError?.("Payment gateway failed to load. Please refresh the page.");
      return;
    }

    setLoading(true);

    try {
      // Create order on server
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          amount: amount,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Initialize Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.key,
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        name: "Roadside Rescue",
        description: description,
        order_id: orderData.order_id,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                request_id: requestId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Payment successful
            onSuccess?.();
            
            // Reload page to show updated payment status
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            onError?.(error.message || "Payment verification failed");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      onError?.(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl text-lg font-bold shadow-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={20} />
          Processing Payment...
        </>
      ) : (
        <>
          <span>Pay Now - ₹{amount.toFixed(2)}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </>
      )}
    </button>
  );
}
