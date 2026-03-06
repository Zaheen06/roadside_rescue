"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Car, User, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/landing", label: "Home" },
  { href: "/request", label: "Services" },
  { href: "/dashboard", label: "My Requests", requiresAuth: true },
  { href: "/tracking", label: "Track" },
  { href: "/petrol", label: "Fuel" },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/landing";
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid #E2E8F0",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Logo ── */}
          <Link href="/landing" className="flex items-center gap-2.5 shrink-0">
            <div className="p-2 rounded-xl" style={{ background: "#2563EB" }}>
              <Car className="text-white" size={18} />
            </div>
            <span className="text-base font-bold" style={{ color: "#0F172A" }}>Roadside Rescue</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => {
              if (link.requiresAuth && !user) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                  style={{ color: "#475569" }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.color = "#2563EB";
                    (e.target as HTMLElement).style.background = "#EFF6FF";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.color = "#475569";
                    (e.target as HTMLElement).style.background = "transparent";
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Technician Portal — separated */}
            <Link
              href="/technician"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition"
              style={{ color: "#2563EB", background: "#EFF6FF" }}
            >
              Technician Portal
            </Link>

            <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#2563EB" }}>
                    {(user.user_metadata?.name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: "#0F172A" }}>
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-2 rounded-full transition"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={e => { (e.currentTarget).style.color = "#DC2626"; (e.currentTarget).style.background = "#FEE2E2"; }}
                  onMouseLeave={e => { (e.currentTarget).style.color = "#94A3B8"; (e.currentTarget).style.background = "transparent"; }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-sm py-2 px-5">
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className="md:hidden p-2 rounded-lg transition"
            style={{ color: "#475569" }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {open && (
          <div className="md:hidden py-4 border-t flex flex-col gap-1 animate-fade-in" style={{ borderColor: "#E2E8F0" }}>
            {NAV_LINKS.map((link) => {
              if (link.requiresAuth && !user) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg"
                  style={{ color: "#475569" }}
                >
                  {link.label}
                </Link>
              );
            })}

            <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 8, paddingTop: 8 }}>
              <Link
                href="/technician"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-bold rounded-lg"
                style={{ color: "#2563EB", background: "#EFF6FF" }}
              >
                Technician Portal
              </Link>
            </div>

            <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 8, paddingTop: 8 }} className="flex flex-col gap-2">
              {user ? (
                <>
                  <p className="px-4 text-sm font-medium" style={{ color: "#475569" }}>
                    👤 {user.user_metadata?.name || user.email?.split("@")[0]}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="mx-4 py-2 text-sm font-semibold rounded-lg"
                    style={{ color: "#DC2626", background: "#FEE2E2" }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="mx-4 py-2.5 text-center text-sm font-semibold text-white rounded-lg"
                  style={{ background: "#2563EB" }}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
