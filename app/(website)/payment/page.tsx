"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader, CheckCircle, XCircle, Lock, CreditCard } from "lucide-react";
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
  services?: { title: string; key: string };
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
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    if (requestId) fetchRequest();
    else setLoading(false);
  }, [requestId]);

  async function fetchRequest() {
    if (!requestId) return;
    setLoading(true);
    const { data } = await supabase.from("requests")
      .select(`*, services:service_id(title, key)`)
      .eq("id", requestId).single();
    if (data) setRequest(data as any);
    setLoading(false);
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    fetchRequest();
    setTimeout(() => router.push(`/request/${requestId}`), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-500 text-sm">Loading payment details...</p>
      </div>
    );
  }

  if (!requestId || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-md w-full py-12 px-8" style={{ borderRadius: 24 }}>
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-3">Payment Not Available</h1>
          <p className="text-gray-500 text-sm mb-6">
            {!requestId ? "No request ID provided." : "Request not found or payment not required."}
          </p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const amount = request.price || request.estimated_price || 0;
  const isPaid = request.payment_status === "completed" || request.payment_status === "paid";

  if (paymentSuccess || isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F8FAFC" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-md w-full py-12 px-8" style={{ borderRadius: 24 }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)" }}>
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 text-sm mb-1">Your payment of <span className="font-bold text-gray-800">₹{amount.toFixed(2)}</span> has been processed.</p>
          <p className="text-xs text-gray-400 mb-8">Request ID: {request.id.slice(0, 8)}...</p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-green-800 font-bold text-sm mb-1">What's next?</p>
            <p className="text-green-700 text-xs leading-relaxed">Our technician will complete your service shortly. Track the progress in your request details.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/request/${requestId}`)} className="btn-primary flex-1">View Request</button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary flex-1">Dashboard</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFC" }}>
      <div className="max-w-xl mx-auto">

        {/* Back button */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition mb-8">
          <ArrowLeft size={16} /> Back
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Complete Payment</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13">Secure payment for your service request</p>
        </motion.div>

        {/* Service Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card mb-5" style={{ borderRadius: 20 }}>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Service Details</h2>
          <div className="space-y-3">
            {[
              { label: "Service", value: request.services?.title || request.description },
              { label: "Request ID", value: `${request.id.slice(0, 8)}...`, mono: true },
              { label: "Status", value: request.status.replace("_", " "), capitalize: true },
              { label: "Amount Due", value: `₹${amount.toFixed(2)}`, bold: true, big: true },
            ].map(({ label, value, mono, capitalize, bold, big }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-sm ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""} ${bold ? "font-bold" : "font-semibold"} ${big ? "text-blue-600 text-base" : "text-gray-900"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PaymentSection
            amount={amount}
            requestId={request.id}
            description={request.services?.title || request.description}
            paymentStatus={request.payment_status || "pending"}
            onSuccess={handlePaymentSuccess}
            onError={(error) => alert(`Payment failed: ${error}`)}
            userEmail={user?.email}
            userName={user?.user_metadata?.name}
            userPhone={user?.phone}
          />
        </motion.div>

        {/* Security note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center text-gray-400 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Lock size={12} /> Your payment is secured with 256-bit SSL encryption
        </motion.p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <Loader className="animate-spin text-blue-600" size={28} />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </AuthGuard>
  );
}