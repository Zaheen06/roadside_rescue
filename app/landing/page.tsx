"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, Shield, MapPin, Phone, Car, Fuel, Wrench, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Quick response time and professional service. They fixed my flat tire in 20 minutes!",
      location: "Downtown"
    },
    {
      name: "Mike Chen",
      rating: 5,
      text: "Saved my day when I ran out of fuel on the highway. Highly recommend!",
      location: "Highway 101"
    },
    {
      name: "Priya Sharma",
      rating: 5,
      text: "24/7 service is amazing. They helped me at 2 AM with a puncture repair.",
      location: "City Center"
    }
  ];

  const services = [
    { icon: Wrench, title: "Puncture Repair", desc: "Quick tire puncture fixes on-site" },
    { icon: Car, title: "Stepney Change", desc: "Professional tire replacement service" },
    { icon: Fuel, title: "Fuel Delivery", desc: "Emergency fuel delivery anywhere" },
    { icon: MapPin, title: "Breakdown Assistance", desc: "Complete roadside breakdown support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Emergency
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Roadside Help
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Professional 24/7 roadside assistance for tire punctures, fuel delivery, 
            and vehicle breakdowns. Help arrives in 15-30 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl flex items-center gap-2 justify-center"
              >
                Get Help Now <ArrowRight size={20} />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 justify-center"
            >
              <Phone size={20} />
              Call: +91 98765 43210
            </motion.button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "15K+", label: "Customers Served" },
              { number: "24/7", label: "Always Available" },
              { number: "15min", label: "Average Response" },
              { number: "4.9★", label: "Customer Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-4"
              >
                <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Comprehensive roadside assistance for all your vehicle emergencies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 text-center hover:scale-105 transition-transform"
                >
                  <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Roadside Rescue?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Lightning Fast Response",
                desc: "Average response time of just 15-30 minutes across the city"
              },
              {
                icon: Shield,
                title: "Trusted Professionals",
                desc: "Licensed technicians with 5+ years of experience and full insurance"
              },
              {
                icon: Users,
                title: "24/7 Availability",
                desc: "Round-the-clock service, 365 days a year, whenever you need help"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
            <p className="text-white/80 text-lg">Real experiences from real customers</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Need Emergency Roadside Assistance?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Don't wait! Get professional help in minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg flex items-center gap-2 justify-center"
                >
                  Request Help Now <ArrowRight size={20} />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 hover:bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg flex items-center gap-2 justify-center"
              >
                <Phone size={20} />
                Call Now: +91 98765 43210
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}