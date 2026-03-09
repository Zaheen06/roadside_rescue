"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, XCircle, Loader, Clock, Navigation, Phone, Car, Play, Square, Map as MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TechnicianDashboard() {
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [technician, setTechnician] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingConnected, setTrackingConnected] = useState(false);
  const [trackingLogs, setTrackingLogs] = useState<string[]>([]);
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const router = useRouter();
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const trackingChannelRef = useRef<any>(null);

  useEffect(() => {
    checkTechnicianAuth();

    return () => {
      stopTracking();
    };
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

  async function toggleAvailability() {
    if (!technician) return;

    const newStatus = !isAvailable;
    await supabase
      .from("technicians")
      .update({ is_available: newStatus })
      .eq("id", technician.id);

    setIsAvailable(newStatus);
  }

  // Tracking functions
  function addTrackingLog(msg: string) {
    setTrackingLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 4)]);
  }

  async function startTracking() {
    if (!currentRequest) {
      alert("No active request to track.");
      return;
    }

    setIsTracking(true);
    setTrackingConnected(true);
    addTrackingLog(`Starting location tracking for request: ${currentRequest.id}`);

    // Create Supabase Channel for Broadcast
    const channel = supabase.channel(`tracking_${currentRequest.id}`);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        addTrackingLog(`Joined tracking room: ${currentRequest.id}`);
      }
    });

    trackingChannelRef.current = channel;

    // Start sending location updates
    trackingInterval.current = setInterval(async () => {
      if (!navigator.geolocation) {
        addTrackingLog("Geolocation not supported");
        stopTracking();
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const payload = {
          orderId: currentRequest.id,
          deliveryPartnerId: technician.id,
          lat,
          lng: lon,
          timestamp: Date.now(),
          status: "ontheway"
        };

        // Broadcast via Supabase
        if (trackingChannelRef.current) {
          trackingChannelRef.current.send({
            type: 'broadcast',
            event: 'location_broadcast',
            payload: payload
          });
        }

        addTrackingLog(`Sent: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);

        // Update technician location in database
        await supabase
          .from("technicians")
          .update({ current_lat: lat, current_lon: lon, tech_status: "moving" })
          .eq("id", technician.id);
      }, (error) => {
        addTrackingLog(`GPS error: ${error.message}`);
      });
    }, 3000); // Update every 3 seconds
  }

  function stopTracking() {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
    if (trackingChannelRef.current) {
      supabase.removeChannel(trackingChannelRef.current);
      trackingChannelRef.current = null;
    }
    setIsTracking(false);
    setTrackingConnected(false);
    addTrackingLog("Tracking stopped");
  }

  async function markArrived() {
    if (!currentRequest || !technician) return;

    if (currentRequest.otp && otpInput !== currentRequest.otp) {
      alert("Invalid OTP! Please ask the user for the correct 4-digit PIN.");
      return;
    }

    // Stop tracking if running
    if (isTracking) {
      stopTracking();
    }

    await supabase
      .from("requests")
      .update({ status: "in_progress" })
      .eq("id", currentRequest.id);

    setShowOtpPrompt(false);
    setOtpInput("");
    alert("Verified and Marked as Arrived!");
    fetchAssignedRequest(technician.id);
  }

  async function markCompleted() {
    // Notify tracking server that it's delivered
    if (trackingChannelRef.current) {
      trackingChannelRef.current.send({
        type: 'broadcast',
        event: 'status_update',
        payload: { status: 'delivered' }
      });
    }

    // Stop tracking if running
    if (isTracking) {
      stopTracking();
    }

    if (!currentRequest || !technician) return;

    await supabase
      .from("requests")
      .update({ status: "completed" })
      .eq("id", currentRequest.id);

    await supabase
      .from("technicians")
      .update({ is_available: true, tech_status: "idle" })
      .eq("id", technician.id);

    setIsAvailable(true);
    setCurrentRequest(null);
    fetchAvailableRequests();
    alert("Work Completed!");
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Technician Dashboard</h1>
              <p className="text-gray-500">{technician?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-xl font-semibold transition ${isAvailable
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
            className="card mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Request</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Request ID</p>
                <p className="text-lg font-mono font-semibold text-gray-900">{currentRequest.id.slice(0, 8)}...</p>
              </div>
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

              {/* Tracking Section */}
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <MapIcon size={18} />
                    Live Tracking
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${trackingConnected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                    }`}>
                    {trackingConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  {!isTracking ? (
                    <button
                      onClick={startTracking}
                      disabled={currentRequest.status === "completed"}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Play size={16} />
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopTracking}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Square size={16} />
                      Stop Tracking
                    </button>
                  )}
                </div>

                {/* Tracking Logs */}
                <div className="bg-slate-800 rounded-lg p-3 text-xs font-mono h-24 overflow-auto">
                  {trackingLogs.length === 0 ? (
                    <span className="text-slate-500">Tracking logs will appear here...</span>
                  ) : (
                    trackingLogs.map((log, i) => (
                      <div key={i} className="text-green-400 mb-1">{log}</div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {currentRequest.status === "accepted" && (
                  !showOtpPrompt ? (
                    <button
                      onClick={() => setShowOtpPrompt(true)}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
                    >
                      Mark Arrived & Start Work
                    </button>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-center text-lg"
                      />
                      <button
                        onClick={markArrived}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => { setShowOtpPrompt(false); setOtpInput(""); }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )
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

              {/* Share tracking link with customer */}
              <a
                href={`/tracking/${currentRequest.id}`}
                target="_blank"
                className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View on Customer Tracking Page ↗
              </a>
            </div>
          </motion.div>
        )}

        {!currentRequest && isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
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
          <div className="card text-center">
            <p className="text-gray-600">You are currently unavailable. Toggle availability to see new requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
