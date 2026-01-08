import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { lat, lon, radius = 10 } = await req.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Find technicians within radius (in km) using PostGIS or simple distance calculation
    // For simplicity, using a bounding box approach
    // 1 degree latitude ≈ 111 km, so radius/111 gives us the degree range
    const latRange = radius / 111;
    const lonRange = radius / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await supabaseAdmin
      .from("technicians")
      .select("*")
      .eq("is_available", true)
      .gte("lat", lat - latRange)
      .lte("lat", lat + latRange)
      .gte("lon", lon - lonRange)
      .lte("lon", lon + lonRange)
      .order("rating", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate actual distance and sort
    const techniciansWithDistance = data?.map((tech) => {
      const distance = calculateDistance(lat, lon, tech.lat, tech.lon);
      return { ...tech, distance };
    }).sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ technicians: techniciansWithDistance });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
