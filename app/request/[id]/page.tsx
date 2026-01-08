"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle, XCircle, Loader, Car, Fuel, Wrench, Phone, Navigation } from "lucide-react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import AuthGuard from "@/components/AuthGuard";
import PaymentSection from "@/components/PaymentSection";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

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
  updated_at: string;
  services?: {
    title: string;
    key: string;
    base_price: number;
    estimated_time_minutes: number;
  };
  technicians?: {
    name: string;
    phone: string;
    rating: number;
    current_lat: number;
    current_lon: number;
  };
  fuel_requests?: {
    fuel_type: string;
    litres: number;
    price_per_litre: number;
    delivered: boolean;
  }[];
}

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [techLocation, setTechLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    if (requestId) {
      fetchRequest();
      // Set up real-time subscription
      const subscription = supabase
        .channel(`request:${requestId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "requests",
            filter: `id=eq.${requestId}`,
          },
          () => {
            fetchRequest();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [requestId]);

  async function fetchRequest() {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        services:service_id (
          title,
          key,
          base_price,
          estimated_time_minutes
        ),
        technicians:assigned_technician (
          name,
          phone,
          rating,
          current_lat,
          current_lon
        ),
        fuel_requests (
          fuel_type,
          litres,
          price_per_litre,
          delivered
        )
      `)
      .eq("id", requestId)
      .single();

    if (data) {
      setRequest(data as any);
      if (data.technicians?.current_lat && data.technicians?.current_lon) {
        setTechLocation({
          lat: data.technicians.current_lat,
          lon: data.technicians.current_lon,
        });
      }
    }
    setLoading(false);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-600" size={24} />;
      case "cancelled":
        return <XCircle className="text-red-600" size={24} />;
      case "in_progress":
        return <Loader className="text-blue-600 animate-spin" size={24} />;
      default:
        return <Clock className="text-yellow-600" size={24} />;
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

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="animate-spin text-white" size={32} />
        </div>
      </AuthGuard>
    );
  }

  if (!request) {
    return (
      <AuthGuard>
        <div className="text-center py-12">
          <p className="text-white text-xl">Request not found</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {request.services?.title || request.description}
                </h1>
                <p className="text-gray-600">
                  Request ID: {request.id.slice(0, 8)}...
                </p>
              </div>
              <div className={`px-6 py-3 rounded-xl border flex items-center gap-3 ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="font-bold text-lg capitalize">{request.status.replace("_", " ")}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{request.vehicle_type}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
              {request.services?.estimated_time_minutes && (
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {request.services.estimated_time_minutes} minutes
                  </p>
                </div>
              )}
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {request.payment_status || "pending"}
                </p>
              </div>
            </div>

            {request.address && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-gray-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                </div>
                <p className="text-gray-700 mb-4">{request.address}</p>
                <div className="h-64 rounded-xl overflow-hidden">
                  <Map lat={request.lat} lon={request.lon} />
                </div>
              </div>
            )}

            {request.technicians && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Assigned Technician</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-blue-900">{request.technicians.name}</p>
                    {request.technicians.phone && (
                      <a
                        href={`tel:${request.technicians.phone}`}
                        className="flex items-center gap-2 text-blue-700 mt-2 hover:text-blue-900"
                      >
                        <Phone size={18} />
                        {request.technicians.phone}
                      </a>
                    )}
                    {request.technicians.rating && (
                      <p className="text-sm text-blue-600 mt-1">
                        Rating: {request.technicians.rating} ⭐
                      </p>
                    )}
                  </div>
                  {techLocation && (
                    <a
                      href={`https://www.google.com/maps/dir/${techLocation.lat},${techLocation.lon}/${request.lat},${request.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                      <Navigation size={18} />
                      Track Technician
                    </a>
                  )}
                </div>
              </div>
            )}

            {request.fuel_requests && request.fuel_requests.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">Fuel Details</h3>
                {request.fuel_requests.map((fuel, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{fuel.fuel_type}</p>
                        <p className="text-sm text-gray-600">{fuel.litres}L @ ₹{fuel.price_per_litre}/L</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          ₹{(fuel.litres * fuel.price_per_litre).toFixed(2)}
                        </p>
                        {fuel.delivered ? (
                          <span className="text-xs text-green-600 font-semibold">Delivered</span>
                        ) : (
                          <span className="text-xs text-yellow-600 font-semibold">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(request.price || request.estimated_price) && (
              <PaymentSection
                amount={request.price || request.estimated_price || 0}
                requestId={request.id}
                description={request.services?.title || request.description}
                paymentStatus={request.payment_status || "pending"}
                onSuccess={() => {
                  alert("Payment successful!");
                  fetchRequest();
                }}
                onError={(error) => alert(`Payment error: ${error}`)}
                userEmail={user?.email}
                userName={user?.user_metadata?.name}
                userPhone={user?.phone}
              />
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}
