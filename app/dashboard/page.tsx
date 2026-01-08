"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle, XCircle, Loader, Car, Fuel, Wrench } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import PaymentButton from "@/components/PaymentButton";

interface Request {
  id: string;
  service_id: number;
  vehicle_type: string;
  description: string;
  status: string;
  lat: number;
  lon: number;
  address: string;
  assigned_technician: string | null;
  estimated_price: number | null;
  price: number | null;
  payment_status: string;
  created_at: string;
  services?: {
    title: string;
    key: string;
  };
  technicians?: {
    name: string;
    phone: string;
  };
}

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (error) {
          console.error('Error getting user:', error);
          setLoading(false);
          return;
        }

        setUser(user);
        if (user) {
          await fetchRequests(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error getting user:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchRequests(session.user.id);
        } else {
          setUser(null);
          setRequests([]);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchRequests(userId: string) {
    if (!userId) {
      setLoading(false);
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          services:service_id (
            title,
            key
          ),
          technicians:assigned_technician (
            name,
            phone
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        // PGRST116 means no rows returned, which is fine
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // Table doesn't exist or no rows - just show empty state
          setRequests([]);
        } else {
          console.error('Database error:', error.message, error.code);
          setRequests([]);
        }
      } else {
        setRequests((data as any) || []);
      }
    } catch (error: any) {
      console.error('Unexpected error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-600" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-600" size={20} />;
      case "in_progress":
        return <Loader className="text-blue-600 animate-spin" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "accepted":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getServiceIcon = (serviceKey: string) => {
    switch (serviceKey) {
      case "fuel_delivery":
        return <Fuel className="text-orange-600" size={24} />;
      case "puncture_repair":
      case "stepney_change":
      case "tube_replacement":
        return <Wrench className="text-blue-600" size={24} />;
      default:
        return <Car className="text-gray-600" size={24} />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">My Requests</h1>
            <p className="text-white/80">Track your roadside assistance requests</p>
          </motion.div>

          <div className="flex gap-4 mb-6">
            <Link href="/request">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-6 py-3 rounded-xl font-semibold text-gray-900 hover:bg-white/90 transition"
              >
                New Request
              </motion.button>
            </Link>
            <Link href="/petrol">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-6 py-3 rounded-xl font-semibold text-gray-900 hover:bg-white/90 transition"
              >
                Fuel Delivery
              </motion.button>
            </Link>
            <Link href="/payment-test">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Pay Now Test
              </motion.button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          ) : requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <Car className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first roadside assistance request</p>
              <Link href="/request">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                  Create Request
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/60 p-3 rounded-xl">
                        {getServiceIcon(request.services?.key || "")}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {request.services?.title || request.description}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.vehicle_type} • {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="font-semibold capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                  </div>

                  {request.address && (
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <MapPin size={16} />
                      <span className="text-sm">{request.address}</span>
                    </div>
                  )}

                  {request.technicians && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Assigned Technician</p>
                      <p className="text-sm text-blue-700">{request.technicians.name}</p>
                      {request.technicians.phone && (
                        <p className="text-xs text-blue-600">Phone: {request.technicians.phone}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/30">
                    <div>
                      {request.price && request.price > 0 ? (
                        <p className="text-lg font-bold text-gray-900">
                          ₹{request.price.toFixed(2)}
                        </p>
                      ) : request.estimated_price && request.estimated_price > 0 ? (
                        <p className="text-sm text-gray-600">
                          Estimated: ₹{request.estimated_price.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Price pending
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                      {request.payment_status === "pending" && (request.price || request.estimated_price) && (
                        <>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold">
                            Payment Pending
                          </span>
                          <div className="w-auto">
                            <PaymentButton
                              amount={request.price || request.estimated_price || 0}
                              requestId={request.id}
                              description={request.services?.title || request.description}
                              onSuccess={() => window.location.reload()}
                              onError={(error) => alert(`Payment error: ${error}`)}
                              userEmail={user?.email}
                              userName={user?.user_metadata?.name}
                            />
                          </div>
                        </>
                      )}
                      {request.payment_status === "paid" && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                          Paid
                        </span>
                      )}
                      {(request.price && request.price > 0) ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                          ₹{request.price}
                        </span>
                      ) : (request.estimated_price && request.estimated_price > 0) ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold">
                          Est: ₹{request.estimated_price}
                        </span>
                      ) : null}
                      <Link href={`/request/${request.id}`}>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
