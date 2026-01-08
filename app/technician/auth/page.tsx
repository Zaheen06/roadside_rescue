"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Wrench, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function TechnicianAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    vehicle_type: "bike",
  });

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
        
        // Check if user is a technician
        const { data: techData } = await supabase
          .from("technicians")
          .select("*")
          .eq("id", data.user.id)
          .single();
        
        if (!techData) {
          await supabase.auth.signOut();
          throw new Error("Access denied. Technician account required.");
        }
        
        setMessage("Login successful!");
        router.push("/technician");
      } else {
        // Sign up as technician
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              name: formData.name,
              role: "technician"
            }
          }
        });
        if (authError) throw authError;
        
        // Create technician record
        const { error: techError } = await supabase
          .from("technicians")
          .insert([
            {
              id: authData.user?.id,
              name: formData.name,
              phone: formData.phone,
              vehicle_type: formData.vehicle_type,
              is_available: true,
            },
          ]);
        
        if (techError) throw techError;
        
        setMessage("Account created! Please verify your email and login.");
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Technician Portal</h1>
          <p className="text-white/80">Roadside Rescue Technician Login</p>
        </div>

        {/* Auth Form */}
        <div className="glass rounded-3xl p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                isLogin ? "bg-orange-600 text-white" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                !isLogin ? "bg-orange-600 text-white" : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-4 pr-4 py-3 bg-white/60 backdrop-blur rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={!isLogin}
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-4 pr-4 py-3 bg-white/60 backdrop-blur rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={!isLogin}
                  />
                </div>
                <div className="relative">
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    className="w-full pl-4 pr-4 py-3 bg-white/60 backdrop-blur rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={!isLogin}
                  >
                    <option value="bike">Bike</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-3 bg-white/60 backdrop-blur rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register as Technician"}
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-sm ${
              message.includes("successful") || message.includes("created") 
                ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </p>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 font-semibold ml-1 hover:underline"
              >
                {isLogin ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
