"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Car, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/landing';
  };

  return (
    <header className="glass sticky top-0 z-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Car className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roadside Rescue</h1>
              <p className="text-sm text-gray-600">24/7 Emergency Assistance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
              <a href="/landing" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/request" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Services
              </a>
              <a href="/petrol" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Petrol
              </a>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <a href="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}