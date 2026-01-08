"use client";

import { useState } from "react";
import PaymentButton from "@/components/PaymentButton";

export default function PaymentTestPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Pay Now Test</h1>
        
        {message && (
          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-gray-900">{message}</p>
          </div>
        )}
        
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Payment - ₹500</h2>
          <p className="text-gray-600 mb-4">Click the button below to test Razorpay payment integration</p>
          <PaymentButton
            amount={500}
            requestId="test-123"
            description="Test Service Payment"
            onSuccess={() => setMessage("✅ Payment successful! This confirms Razorpay is working.")}
            onError={(error) => setMessage(`❌ Payment failed: ${error}`)}
            userEmail="test@example.com"
            userName="Test User"
          />
        </div>
        
        <div className="text-center text-white/60 text-sm">
          <p>This uses Razorpay test mode. No real money will be charged.</p>
          <p className="mt-2">Test card: 4111 1111 1111 1111 | CVV: 123 | Expiry: Any future date</p>
        </div>
      </div>
    </div>
  );
}