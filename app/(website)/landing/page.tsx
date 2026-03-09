"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, Navigation, Phone, Car, Fuel, Wrench, CheckCircle, Star, Zap, MapPin, Truck } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  { icon: Wrench, title: "Puncture Repair", price: "From ₹100", desc: "Fast on-site tyre repair anywhere you're stuck.", tag: "Most Popular", tagColor: "badge-blue", iconBg: "bg-blue-50", iconColor: "text-blue-600", href: "/request" },
  { icon: Car, title: "Stepney Change", price: "From ₹200", desc: "Professional spare tyre replacement in minutes.", tag: null, iconBg: "bg-violet-50", iconColor: "text-violet-600", href: "/request" },
  { icon: Wrench, title: "Tube Replacement", price: "From ₹500", desc: "New tube fitted at your exact location.", tag: null, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", href: "/request" },
  { icon: Fuel, title: "Fuel Delivery", price: "From ₹200", desc: "Petrol or diesel delivered directly to you.", tag: "24/7", tagColor: "badge-green", iconBg: "bg-amber-50", iconColor: "text-amber-600", href: "/petrol" },
  { icon: Truck, title: "Car Tow Service", price: "₹25/km + ₹50", desc: "Tow your car to any garage or destination safely.", tag: "New", tagColor: "badge-purple", iconBg: "bg-orange-50", iconColor: "text-orange-600", href: "/tow" },
];

const STATS = [
  { value: "500+", label: "Rescues Completed" },
  { value: "15 min", label: "Avg. Response Time" },
  { value: "4.9★", label: "Customer Rating" },
  { value: "50+", label: "Verified Mechanics" },
];

const WHY_US = [
  { icon: Clock, title: "15–30 Min Response", desc: "A certified mechanic reaches your location within minutes of your request.", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: Shield, title: "Verified Mechanics", desc: "Every mechanic is background-checked and professionally trained.", iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { icon: Navigation, title: "Live GPS Tracking", desc: "Watch your mechanic approach in real-time on an interactive map.", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
];

const STEPS = [
  { step: "01", title: "Select a Service", desc: "Choose tyre repair, fuel delivery, or breakdown help." },
  { step: "02", title: "Share Your Location", desc: "Allow location access or type your address." },
  { step: "03", title: "Mechanic Dispatched", desc: "We match and dispatch the nearest available mechanic." },
  { step: "04", title: "Get Helped & Pay", desc: "Service completed. Pay securely via UPI or card." },
];

const TESTIMONIALS = [
  { name: "Arjun Sharma", location: "Koramangala, Bangalore", rating: 5, text: "Got a puncture at 11pm on Hosur Road. Within 20 minutes a mechanic arrived and fixed it. Absolutely lifesaving service!", initial: "A" },
  { name: "Priya Menon", location: "Indiranagar, Bangalore", rating: 5, text: "Ran out of fuel on the outer ring road. Called Roadside Rescue and fuel was delivered in under 15 minutes. Highly recommend!", initial: "P" },
  { name: "Rahul Verma", location: "HSR Layout, Bangalore", rating: 5, text: "The live tracking feature is fantastic. Could see exactly where the mechanic was. The OTP verification gave me extra confidence. 5 stars!", initial: "R" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ─── Hero ─────────────────────────────────── */}
      <section
        className="relative text-white text-center px-4 pt-24 pb-0 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0F1B4D 0%, #1E3A8A 35%, #2563EB 70%, #3B82F6 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60A5FA 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #818CF8 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-8 border border-white/20 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Available 24/7 in Bangalore — Book in 60 seconds
          </div>

          <h1
            className="font-extrabold text-white mb-5 leading-[1.12] tracking-tight"
            style={{ fontSize: "clamp(38px,6vw,64px)" }}
          >
            Roadside Help,<br /><span style={{ color: "#93C5FD" }}>Anytime.</span> Anywhere.
          </h1>

          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Flat tyre? Out of fuel? A verified mechanic is dispatched to your exact GPS location in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
              >
                Request Help Now <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.a
              href="tel:+919876543210"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Phone size={18} /> Call Us
            </motion.a>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/55 text-sm">
            {["Verified mechanics", "Live GPS tracking", "Secure payments", "Instant booking"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-400" /> {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ─── Stats Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-4xl mx-auto mt-16 relative z-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-0">
            {STATS.map((stat, i) => (
              <div key={i} className="stat-card">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          {/* wave/arc bottom */}
          <div className="h-12 mt-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0))" }} />
        </motion.div>
      </section>

      {/* ─── Services ─────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 bg-blue-50 rounded-full">Services</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              What do you need help with?
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Professional roadside assistance for every situation, available around the clock.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link key={i} href={s.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="feature-card relative group cursor-pointer h-full"
                  >
                    {s.tag && <span className={`badge ${s.tagColor} absolute top-4 right-4`}>{s.tag}</span>}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${s.iconBg}`}>
                      <Icon size={22} className={s.iconColor} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">{s.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                    <p className="font-bold text-blue-600 text-sm">{s.price}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/request">
              <button className="btn-primary">Book a Service <ArrowRight size={16} /></button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────  */}
      <section className="py-24 px-4" style={{ background: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 bg-blue-50 rounded-full">How It Works</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Help in 4 simple steps</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-extrabold text-lg shadow-md"
                  style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff" }}
                >
                  {step.step}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px" style={{ background: "linear-gradient(90deg, #BFDBFE, #E2E8F0)" }} />
                )}
                <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Us ───────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 bg-blue-50 rounded-full">Why Us</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Built for emergencies</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">We're not just an app. We're your safety net when you're stranded on the road.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="feature-card text-center"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${item.iconBg}`}>
                    <Icon size={24} className={item.iconColor} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-[16px]">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────── */}
      <section className="py-24 px-4" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 bg-blue-50 rounded-full">Testimonials</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Trusted by hundreds of drivers</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card"
                style={{ borderRadius: 20 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={10} />{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────── */}
      <section
        className="py-24 px-4 text-center text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0F1B4D 0%, #1E3A8A 40%, #2563EB 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #60A5FA 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="max-w-xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Zap size={14} className="text-yellow-400" /> Instant dispatch, no waiting
          </div>
          <h2 className="font-extrabold text-white mb-3 tracking-tight" style={{ fontSize: "clamp(28px,4vw,42px)" }}>Stuck right now?</h2>
          <p className="text-white/65 mb-10 text-lg">Request help in under 60 seconds. A mechanic is dispatched immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all"
              >
                Request Help Now <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/technician/auth">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all"
              >
                Become a Technician
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────── */}
      <footer style={{ background: "#0A1628" }} className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl" style={{ background: "#2563EB" }}>
                  <Car className="text-white" size={18} />
                </div>
                <span className="font-bold text-white text-base">Roadside Rescue</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">24/7 emergency roadside assistance across Bangalore. Fast, verified, and affordable.</p>
            </div>

            {/* Links */}
            <div className="flex gap-12 flex-wrap">
              <div>
                <p className="text-white text-sm font-bold mb-3">Services</p>
                <div className="flex flex-col gap-2 text-slate-400 text-sm">
                  <Link href="/request" className="hover:text-white transition">Puncture Repair</Link>
                  <Link href="/request" className="hover:text-white transition">Stepney Change</Link>
                  <Link href="/petrol" className="hover:text-white transition">Fuel Delivery</Link>
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-3">Company</p>
                <div className="flex flex-col gap-2 text-slate-400 text-sm">
                  <Link href="/technician/auth" className="hover:text-white transition">Mechanic Portal</Link>
                  <Link href="/tracking" className="hover:text-white transition">Live Tracking</Link>
                  <a href="tel:+919876543210" className="hover:text-white transition">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">© 2026 Roadside Rescue. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Professional roadside assistance when you need it most.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}