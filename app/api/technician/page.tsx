"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 🔥 Replace this with real technician ID (from your technicians table)
const TECHNICIAN_ID = "REPLACE_WITH_TECH_ID";

export default function TechnicianDashboard() {
  const [currentRequest, setCurrentRequest] = useState<any>(null);

  // Fetch request assigned to this technician
  async function fetchAssignedRequest() {
    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("assigned_technician", TECHNICIAN_ID)
      .neq("status", "completed")
      .single();

    setCurrentRequest(data);
  }

  useEffect(() => {
    fetchAssignedRequest();
  }, []);

  // 🔥 Update technician live GPS every 5 sec
  useEffect(() => {
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
            tech_status: currentRequest ? "moving" : "idle",
          })
          .eq("id", TECHNICIAN_ID);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentRequest]);

  // Mark as Arrived
  async function markArrived() {
    if (!currentRequest) return;

    await supabase
      .from("requests")
      .update({ status: "in_progress" })
      .eq("id", currentRequest.id);

    alert("Marked as Arrived!");
    fetchAssignedRequest();
  }

  // Mark as Completed
  async function markCompleted() {
    if (!currentRequest) return;

    await supabase
      .from("requests")
      .update({ status: "completed" })
      .eq("id", currentRequest.id);

    alert("Work Completed!");
    fetchAssignedRequest();
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Technician Dashboard</h1>

      {!currentRequest && (
        <p className="text-gray-600">No active requests assigned.</p>
      )}

      {currentRequest && (
        <div className="bg-white p-4 rounded shadow space-y-3">
          <p><strong>Service:</strong> {currentRequest.description}</p>
          <p><strong>Vehicle:</strong> {currentRequest.vehicle_type}</p>
          <p><strong>Address:</strong> {currentRequest.address}</p>
          <p><strong>Location:</strong> {currentRequest.lat}, {currentRequest.lon}</p>

          <button
            onClick={markArrived}
            className="w-full bg-yellow-500 text-white py-2 rounded"
          >
            Mark Arrived
          </button>

          <button
            onClick={markCompleted}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Mark Completed
          </button>
        </div>
      )}
    </div>
  );
}
