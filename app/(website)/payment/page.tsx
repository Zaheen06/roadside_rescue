"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, CheckCircle, XCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import PaymentSection from "@/components/PaymentSection";

interface Request {
  id: string;
  service_id: number;
  description: string;
  status: string;
  price: number | null;
  estimated_price: number | null;
  payment_status: string;
  services?: {
    title: string;
    key: string;
  };
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("request_id");

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    if (requestId) {
      fetchRequest();
    } else {
      setLoading(false);
    }
  }, [requestId]);

  async function fetchRequest() {
    if (!requestId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        services:service_id (
          title,
          key
        )
      `)
      .eq("id", requestId)
      .single();

    if (data) {
      setRequest(data as any);
    }
    setLoading(false);
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    fetchRequest();

    // Redirect to request details after 3 seconds
    setTimeout(() => {
      router.push(`/request/${requestId}`);
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!requestId || !request) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            <XCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Available</h1>
            <p className="text-gray-600 mb-6">
              {!requestId ? "No request ID provided" : "Request not found or payment not required"}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const amount = request.price || request.estimated_price || 0;
  const isPaid = request.payment_status === "completed" || request.payment_status === "paid";

  if (paymentSuccess || isPaid) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8"
          >
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-2">
              Your payment of ₹{amount.toFixed(2)} has been processed successfully.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Request ID: {request.id.slice(0, 8)}...
            </p>

            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
              <p className="text-green-800 font-semibold">What's next?</p>
              <p className="text-green-700 text-sm mt-1">
                Our technician will complete your service shortly. You can track the progress in your request details.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/request/${requestId}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Request Details
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
            <p className="text-white/80 text-sm">Secure payment for your service request</p>
          </div>
        </motion.div>

        {/* Service Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service</span>
              <span className="font-semibold text-gray-900">
                {request.services?.title || request.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Request ID</span>
              <span className="font-mono text-sm text-gray-900">
                {request.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="capitalize font-semibold text-gray-900">
                {request.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PaymentSection
            amount={amount}
            requestId={request.id}
            description={request.services?.title || request.description}
            paymentStatus={request.payment_status || "pending"}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            userEmail={user?.email}
            userName={user?.user_metadata?.name}
            userPhone={user?.phone}
          />
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-white/60 text-sm">
            🔒 Your payment is secured with 256-bit SSL encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="animate-spin text-white" size={32} />
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </AuthGuard>
  );
}