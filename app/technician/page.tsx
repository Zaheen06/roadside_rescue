"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, XCircle, Loader, Clock, Navigation, Phone, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TechnicianDashboard() {
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [technician, setTechnician] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkTechnicianAuth();
  }, []);

  async function checkTechnicianAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/technician/auth");
      return;
    }

    const { data: techData } = await supabase
      .from("technicians")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!techData) {
      router.push("/technician/auth");
      return;
    }

    setTechnician(techData);
    setIsAvailable(techData.is_available);
    setLoading(false);
    fetchAssignedRequest(user.id);
    fetchAvailableRequests();
  }

  // Fetch request assigned to this technician
  async function fetchAssignedRequest(technicianId: string) {
    const { data } = await supabase
      .from("requests")
      .select(`
        *,
        services:service_id (
          title,
          key
        )
      `)
      .eq("assigned_technician", technicianId)
      .in("status", ["accepted", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setCurrentRequest(data);
  }

  async function fetchAvailableRequests() {
    const { data } = await supabase
      .from("requests")
      .select(`
        *,
        services:service_id (
          title,
          key,
          base_price
        )
      `)
      .eq("status", "pending")
      .is("assigned_technician", null)
      .order("created_at", { ascending: true })
      .limit(10);

    setAvailableRequests(data || []);
  }

  // Update technician live GPS every 5 sec
  useEffect(() => {
    if (!technician) return;

    const interval = setInterval(() => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        await supabase
          .from("technicians")
          .update({
            current_lat: lat,
            current_lon: lon,
            lat: lat,
            lon: lon,
            tech_status: currentRequest ? "moving" : "idle",
          })
          .eq("id", technician.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [technician, currentRequest]);

  // Accept a request
  async function acceptRequest(requestId: string) {
    if (!technician) return;

    const { error } = await supabase
      .from("requests")
      .update({
        assigned_technician: technician.id,
        status: "accepted",
      })
      .eq("id", requestId);

    if (error) {
      alert("Error accepting request: " + error.message);
      return;
    }

    await supabase
      .from("technicians")
      .update({ is_available: false })
      .eq("id", technician.id);

    setIsAvailable(false);
    fetchAssignedRequest(technician.id);
    fetchAvailableRequests();
  }

  // Mark as Arrived
  async function markArrived() {
    if (!currentRequest || !technician) return;

    await supabase
      .from("requests")
      .update({ status: "in_progress" })
      .eq("id", currentRequest.id);

    alert("Marked as Arrived!");
    fetchAssignedRequest(technician.id);
  }

  // Mark as Completed
  async function markCompleted() {
    if (!currentRequest || !technician) return;

    await supabase
      .from("requests")
      .update({ status: "completed" })
      .eq("id", currentRequest.id);

    await supabase
      .from("technicians")
      .update({ is_available: true })
      .eq("id", technician.id);

    setIsAvailable(true);
    setCurrentRequest(null);
    fetchAvailableRequests();
    alert("Work Completed!");
  }

  async function toggleAvailability() {
    if (!technician) return;

    const newStatus = !isAvailable;
    await supabase
      .from("technicians")
      .update({ is_available: newStatus })
      .eq("id", technician.id);

    setIsAvailable(newStatus);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/technician/auth");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Technician Dashboard</h1>
              <p className="text-white/80">{technician?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  isAvailable
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {isAvailable ? "Available" : "Unavailable"}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {currentRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Request</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentRequest.services?.title || currentRequest.description}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {currentRequest.vehicle_type}
                </p>
              </div>
              {currentRequest.address && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-lg font-semibold text-gray-900">{currentRequest.address}</p>
                </div>
              )}
              {currentRequest.lat && currentRequest.lon && (
                <div className="h-64 rounded-xl overflow-hidden">
                  <Map lat={currentRequest.lat} lon={currentRequest.lon} />
                </div>
              )}
              <div className="flex gap-3">
                {currentRequest.status === "accepted" && (
                  <button
                    onClick={markArrived}
                    className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
                  >
                    Mark Arrived
                  </button>
                )}
                {currentRequest.status === "in_progress" && (
                  <button
                    onClick={markCompleted}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!currentRequest && isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Requests</h2>
            {availableRequests.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No pending requests available</p>
            ) : (
              <div className="space-y-4">
                {availableRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/60 rounded-xl p-4 border border-white/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.services?.title || request.description}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {request.vehicle_type} • {new Date(request.created_at).toLocaleString()}
                        </p>
                        {request.address && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin size={14} />
                            {request.address}
                          </p>
                        )}
                      </div>
                      {request.services?.base_price && (
                        <p className="text-lg font-bold text-blue-600">
                          ₹{request.services.base_price}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => acceptRequest(request.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Accept Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!currentRequest && !isAvailable && (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-gray-600">You are currently unavailable. Toggle availability to see new requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
