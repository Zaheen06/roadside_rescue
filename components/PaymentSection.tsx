"use client";

import { useState } from "react";
import { CreditCard, Shield, Clock, CheckCircle } from "lucide-react";
import PaymentButton from "./PaymentButton";

interface PaymentSectionProps {
  amount: number;
  requestId: string;
  description: string;
  paymentStatus: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export default function PaymentSection({
  amount,
  requestId,
  description,
  paymentStatus,
  onSuccess,
  onError,
  userEmail,
  userName,
  userPhone,
}: PaymentSectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isPaid = paymentStatus === "completed" || paymentStatus === "paid";
  const isPending = paymentStatus === "pending";

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <CreditCard className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payment</h3>
            <p className="text-gray-600 text-sm">Secure payment processing</p>
          </div>
        </div>
        {isPaid && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
            <CheckCircle size={20} />
            <span className="font-semibold">Paid</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Amount Display */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service Amount</span>
            <span className="text-2xl font-bold text-blue-600">₹{amount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isPaid 
                ? "bg-green-100 text-green-800" 
                : isPending 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {paymentStatus === "completed" ? "Paid" : paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Payment Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
            <Shield className="text-green-600 mx-auto mb-2" size={20} />
            <p className="text-xs text-gray-600 font-medium">Secure</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
            <Clock className="text-blue-600 mx-auto mb-2" size={20} />
            <p className="text-xs text-gray-600 font-medium">Instant</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
            <CreditCard className="text-purple-600 mx-auto mb-2" size={20} />
            <p className="text-xs text-gray-600 font-medium">All Cards</p>
          </div>
        </div>

        {/* Payment Button */}
        {!isPaid && (
          <div className="pt-4">
            <PaymentButton
              amount={amount}
              requestId={requestId}
              description={description}
              onSuccess={onSuccess}
              onError={onError}
              userEmail={userEmail}
              userName={userName}
              userPhone={userPhone}
            />
          </div>
        )}

        {/* Payment Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showDetails ? "Hide" : "Show"} Payment Details
        </button>

        {showDetails && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes</span>
              <span>Included</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-semibold">Payment Completed Successfully</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Your payment has been processed and the service will be completed shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}