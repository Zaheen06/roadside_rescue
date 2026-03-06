import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

// GET all technicians
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("technicians")
            .select("id, name, phone, vehicle_type, rating, is_available, tech_status, lat, lon, created_at")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return NextResponse.json({ technicians: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: toggle availability for a technician
export async function PATCH(req: Request) {
    try {
        const { id, is_available } = await req.json();
        if (!id) return NextResponse.json({ error: "Technician ID required" }, { status: 400 });

        const { error } = await supabaseAdmin
            .from("technicians")
            .update({ is_available })
            .eq("id", id);

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
