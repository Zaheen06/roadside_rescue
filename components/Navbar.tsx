"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Car, User, LogOut, Menu } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/landing";
  };

  return (
    <header className="backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">

        {/* NAVBAR */}
        <div className="flex items-center justify-between w-full">

          {/* LEFT SIDE (Logo + Title) */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md">
              <Car className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Roadside Rescue
            </h1>
          </div>

          {/* RIGHT SIDE DESKTOP */}
          <div className="hidden md:flex items-center gap-6">

            <a href="/landing" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Home
            </a>

            {user ? (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Dashboard
                </a>
                <a href="/request" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Services
                </a>
                <a href="/petrol" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Petrol
                </a>
              </>
            ) : (
              <>
                <span className="text-gray-400 font-medium cursor-not-allowed">
                  Dashboard
                </span>
                <span className="text-gray-400 font-medium cursor-not-allowed">
                  Services
                </span>
                <span className="text-gray-400 font-medium cursor-not-allowed">
                  Petrol
                </span>
              </>
            )}

            {/* User Info */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow border border-gray-200">
                  <User size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                className="px-5 py-2 bg-blue-600 text-white rounded-full shadow-md font-medium hover:bg-blue-700 transition"
              >
                Login
              </a>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition"
            onClick={() => setOpen(!open)}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {open && (
          <div className="md:hidden mt-3 flex flex-col gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-lg">
            <a href="/landing" className="text-gray-700 font-medium">Home</a>
            {user ? (
              <>
                <a href="/dashboard" className="text-gray-700 font-medium">Dashboard</a>
                <a href="/request" className="text-gray-700 font-medium">Services</a>
                <a href="/petrol" className="text-gray-700 font-medium">Petrol</a>
              </>
            ) : (
              <>
                <span className="text-gray-400 font-medium cursor-not-allowed">Dashboard</span>
                <span className="text-gray-400 font-medium cursor-not-allowed">Services</span>
                <span className="text-gray-400 font-medium cursor-not-allowed">Petrol</span>
              </>
            )}

            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
                  <User size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/auth"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                Login
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
