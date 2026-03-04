"use client";

import { useState } from "react";
import { Search, MapPin, Package, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TrackingIndexPage() {
  const [orderId, setOrderId] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSearched(true);
      window.location.href = `/tracking/${orderId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Partner Tracking
          </h1>
          <p className="text-gray-600">
            Track your service requests and monitor partner locations in real-time
          </p>
        </div>

        {/* Search Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Request ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., abc12345"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Track Request
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                <MapPin size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Live Location</h3>
              <p className="text-sm text-gray-500 mt-1">
                Real-time partner tracking
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3">
                <Package size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Status Updates</h3>
              <p className="text-sm text-gray-500 mt-1">
                Live status notifications
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3">
                <Clock size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">ETA Estimates</h3>
              <p className="text-sm text-gray-500 mt-1">
                Accurate arrival times
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">How to Track</h3>
            <ol className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                <span>Your request ID is sent to your registered email after booking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                <span>Enter the request ID in the field above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                <span>Click "Track Request" to view live location and status</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

