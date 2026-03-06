"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, Navigation, Phone, Car, Fuel, Wrench, CheckCircle } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  { icon: Wrench, title: "Puncture Repair", price: "From ₹100", desc: "Fast on-site tyre repair anywhere", tag: "Most Popular", tagColor: "badge-blue" },
  { icon: Car, title: "Stepney Change", price: "From ₹200", desc: "Professional spare tyre replacement", tag: null },
  { icon: Wrench, title: "Tube Replacement", price: "From ₹500", desc: "New tube fitted at your location", tag: null },
  { icon: Fuel, title: "Fuel Delivery", price: "From ₹200", desc: "Petrol or diesel delivered to you", tag: "24/7", tagColor: "badge-green" },
];

const WHY_US = [
  { icon: Clock, title: "15–30 Min Response", desc: "A certified mechanic reaches your location within minutes of your request." },
  { icon: Shield, title: "Verified Mechanics", desc: "Every technician is background-checked and professionally trained." },
  { icon: Navigation, title: "Live GPS Tracking", desc: "Watch your mechanic approach in real-time on an interactive map." },
];

const STEPS = [
  { step: "01", title: "Select a Service", desc: "Choose tyre repair, fuel delivery, or breakdown help." },
  { step: "02", title: "Share Your Location", desc: "Allow location access or type your address." },
  { step: "03", title: "Mechanic Dispatched", desc: "We match and dispatch the nearest available technician." },
  { step: "04", title: "Get Helped & Pay", desc: "Service completed. Pay securely via UPI or card." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ─── Hero ─────────────────────────────────── */}
      <section
        className="relative text-white text-center px-4 pt-24 pb-32 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Available 24/7 &mdash; Book in under 60 seconds
          </div>

          <h1
            className="font-extrabold text-white mb-5 leading-tight"
            style={{ fontSize: "clamp(36px,6vw,56px)" }}
          >
            Roadside Help,<br />Anytime. Anywhere.
          </h1>

          <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
            Flat tyre? Out of fuel? Get a verified mechanic to your exact GPS location in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold text-base px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all"
              >
                Request Help Now <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.a
              href="tel:+919876543210"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold text-base px-8 py-3.5 rounded-xl border border-white/25 hover:bg-white/25 transition-all backdrop-blur"
            >
              <Phone size={18} /> Call Us
            </motion.a>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
            {["Verified mechanics", "Live GPS tracking", "Secure payments", "Instant booking"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-400" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Services ─────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Services</p>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#0F172A" }}>
              What do you need help with?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="card relative"
                >
                  {s.tag && <span className={`badge ${s.tagColor} absolute top-4 right-4`}>{s.tag}</span>}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#EFF6FF" }}>
                    <Icon size={22} style={{ color: "#2563EB" }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1" style={{ fontSize: "15px" }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{s.desc}</p>
                  <p className="font-bold text-blue-600 text-sm">{s.price}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────  */}
      <section className="py-20 px-4" style={{ background: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">How It Works</p>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#0F172A" }}>Help in 4 simple steps</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Us ───────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Why Us</p>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#0F172A" }}>Built for emergencies</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="card text-center"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EFF6FF" }}>
                    <Icon size={22} style={{ color: "#2563EB" }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: "15px" }}>{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────── */}
      <section
        className="py-20 px-4 text-center text-white"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="max-w-xl mx-auto"
        >
          <h2 className="font-bold text-white mb-3" style={{ fontSize: "32px" }}>Stuck right now?</h2>
          <p className="text-white/75 mb-8">Request help in under 60 seconds. A mechanic is dispatched immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-blue-50 transition-all"
              >
                Request Help Now <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/technician/auth">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-all"
              >
                Become a Technician
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────── */}
      <footer style={{ background: "#0F172A" }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Car className="text-white" size={16} />
            </div>
            <span className="font-bold text-white text-sm">Roadside Rescue</span>
          </div>
          <p className="text-slate-500 text-xs">© 2026 Roadside Rescue. Professional roadside assistance.</p>
          <div className="flex gap-5 text-xs text-slate-400">
            <Link href="/technician/auth" className="hover:text-white transition">Technician Portal</Link>
            <a href="tel:+919876543210" className="hover:text-white transition">+91 98765 43210</a>
          </div>
        </div>
      </footer>

    </div>
  );
}