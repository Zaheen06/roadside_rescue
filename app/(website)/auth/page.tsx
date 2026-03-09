"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Car, CheckCircle, Shield, Navigation, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const FEATURES = [
  { icon: Clock, text: "15–30 min response time" },
  { icon: Shield, text: "Verified & trained mechanics" },
  { icon: Navigation, text: "Live GPS tracking" },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data?.user) {
          setMessage("Login successful! Redirecting...");
          await new Promise(resolve => setTimeout(resolve, 300));
          window.location.href = "/dashboard";
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        if (data?.user) {
          if (data.user.email_confirmed_at) {
            setMessage("Account created! Redirecting...");
            setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
          } else {
            setMessage("Account created! Please check your email to verify before logging in.");
          }
        }
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("successful") || message.includes("created") || message.includes("verify");

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0F1B4D 0%, #1E3A8A 40%, #2563EB 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #60A5FA 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #818CF8 0%, transparent 70%)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur">
              <Car className="text-white" size={20} />
            </div>
            <span className="font-extrabold text-lg">Roadside Rescue</span>
          </div>
          <h1 className="font-extrabold leading-tight mb-4" style={{ fontSize: "clamp(28px, 3vw, 38px)" }}>
            Your emergency<br />assistance partner
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            Get a verified mechanic to your exact GPS location within minutes, 24/7.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10">© 2026 Roadside Rescue. All rights reserved.</p>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
              <Car size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-gray-900">Roadside Rescue</span>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{isLogin ? "Welcome back 👋" : "Create an account"}</h2>
          <p className="text-gray-500 text-sm mb-8">{isLogin ? "Sign in to track your requests" : "Join thousands of drivers who trust us"}</p>

          {/* Tabs */}
          <div className="flex p-1 rounded-xl mb-6" style={{ background: "#F1F5F9" }}>
            {["Login", "Sign Up"].map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setMessage(""); }}
                className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
                style={{
                  background: (i === 0) === isLogin ? "#FFFFFF" : "transparent",
                  color: (i === 0) === isLogin ? "#1E40AF" : "#64748B",
                  boxShadow: (i === 0) === isLogin ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3.5 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-xl flex items-start gap-3 text-sm border ${isSuccess
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
                  }`}
              >
                {isSuccess ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : null}
                <p>{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-500 text-sm mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLogin(!isLogin); setMessage(""); }}
              className="text-blue-600 font-bold ml-1.5 hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}