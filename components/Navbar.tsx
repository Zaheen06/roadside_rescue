"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Car, LogOut, Menu, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user || null)
    );

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/landing";
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        backdropFilter: "blur(16px)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Logo ── */}
          <Link href="/landing" className="flex items-center gap-2.5 shrink-0">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
              <Car className="text-white" size={18} />
            </div>
            <span className="text-base font-extrabold tracking-tight" style={{ color: "#0F172A" }}>Roadside Rescue</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => {
              if (link.requiresAuth && !user) return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    color: isActive ? "#2563EB" : "#475569",
                    background: isActive ? "#EFF6FF" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#2563EB";
                      (e.currentTarget as HTMLElement).style.background = "#F8FAFF";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#475569";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* SOS Emergency Button */}
            <Link href="/request">
              <button
                className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all"
                style={{ color: "#DC2626", background: "#FEF2F2", border: "1.5px solid #FECACA" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "#FEE2E2";
                  (e.currentTarget as HTMLElement).style.borderColor = "#FCA5A5";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "#FEF2F2";
                  (e.currentTarget as HTMLElement).style.borderColor = "#FECACA";
                }}
              >
                <AlertCircle size={14} />
                SOS Help
              </button>
            </Link>

            {/* Technician Portal */}
            <Link
              href="/technician"
              className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ color: "#2563EB", background: "#EFF6FF" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DBEAFE"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
            >
              Technician Portal
            </Link>

            <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
                    {(user.user_metadata?.name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold max-w-[120px] truncate" style={{ color: "#0F172A" }}>
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-2 rounded-full transition-all"
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
            className="md:hidden p-2 rounded-xl transition-all"
            style={{ color: "#475569", background: open ? "#F1F5F9" : "transparent" }}
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
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    color: isActive ? "#2563EB" : "#475569",
                    background: isActive ? "#EFF6FF" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

            <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 8, paddingTop: 8 }} className="flex flex-col gap-2">
              <Link
                href="/request"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl"
                style={{ color: "#DC2626", background: "#FEF2F2" }}
              >
                <AlertCircle size={16} /> SOS Emergency Help
              </Link>
              <Link
                href="/technician"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm font-bold rounded-xl"
                style={{ color: "#2563EB", background: "#EFF6FF" }}
              >
                Technician Portal
              </Link>
            </div>

            <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 8, paddingTop: 8 }} className="flex flex-col gap-2">
              {user ? (
                <>
                  <p className="px-4 text-sm font-semibold" style={{ color: "#475569" }}>
                    👤 {user.user_metadata?.name || user.email?.split("@")[0]}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="mx-4 py-2 text-sm font-bold rounded-xl"
                    style={{ color: "#DC2626", background: "#FEE2E2" }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="mx-4 py-2.5 text-center text-sm font-bold text-white rounded-xl"
                  style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
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
