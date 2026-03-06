import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

// Haversine formula (same as nearby route)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
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

// Weighted scoring: lower score = better match
// Components:
//   distance_km * 0.5  → closer is better (penalizes far techs)
//   rating * -0.3      → higher rating reduces score (rewards good techs)
//   jobs_done * -0.01  → experience bonus, small weight
function calculateScore(distanceKm: number, rating: number): number {
    return (distanceKm * 0.5) + (rating * -0.3);
}

export async function POST(req: Request) {
    try {
        const { lat, lon, vehicle_type, request_id, excluded_techs = [] } = await req.json();

        if (!lat || !lon || !request_id) {
            return NextResponse.json(
                { error: "lat, lon, and request_id are required" },
                { status: 400 }
            );
        }

        const RADIUS_KM = 15;
        const latRange = RADIUS_KM / 111;
        const lonRange = RADIUS_KM / (111 * Math.cos(lat * Math.PI / 180));

        // Fetch all available technicians within bounding box
        let query = supabaseAdmin
            .from("technicians")
            .select("id, name, phone, rating, lat, lon, vehicle_type, tech_status")
            .eq("is_available", true)
            .gte("lat", lat - latRange)
            .lte("lat", lat + latRange)
            .gte("lon", lon - lonRange)
            .lte("lon", lon + lonRange);

        const { data: technicians, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const validTechs = technicians?.filter(t => !excluded_techs.includes(t.id)) || [];

        if (validTechs.length === 0) {
            // Also unset the assigned technician so it returns to the open pool
            await supabaseAdmin.from("requests").update({ assigned_technician: null, status: "pending" }).eq("id", request_id);
            return NextResponse.json(
                { error: "No technicians available nearby. Please try again later.", matched: false },
                { status: 200 }
            );
        }

        // Score every technician
        const scored = validTechs
            .map((tech) => {
                const distanceKm = calculateDistance(lat, lon, tech.lat, tech.lon);
                const rating = tech.rating || 3.0;
                const score = calculateScore(distanceKm, rating);
                return { ...tech, distanceKm: parseFloat(distanceKm.toFixed(2)), score: parseFloat(score.toFixed(3)) };
            })
            .sort((a, b) => a.score - b.score); // ascending: best score first

        const best = scored[0];

        // Assign the best technician as "pending" so they must accept it
        const { error: updateError } = await supabaseAdmin
            .from("requests")
            .update({
                assigned_technician: best.id,
                status: "pending", // Waiting for tech to click accept
            })
            .eq("id", request_id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            matched: true,
            technician: {
                id: best.id,
                name: best.name,
                phone: best.phone,
                rating: best.rating,
                distanceKm: best.distanceKm,
                score: best.score,
            },
            allCandidates: scored.length,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
