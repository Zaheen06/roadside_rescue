import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
    try {
        // Total requests count per status
        const { data: requests, error: reqError } = await supabaseAdmin
            .from("requests")
            .select("status, price");

        if (reqError) throw new Error(reqError.message);

        const statusCounts = { pending: 0, accepted: 0, in_progress: 0, completed: 0, cancelled: 0 };
        let totalRevenue = 0;

        for (const r of requests || []) {
            const s = r.status as keyof typeof statusCounts;
            if (s in statusCounts) statusCounts[s]++;
            if (r.status === "completed" && r.price) totalRevenue += parseFloat(r.price);
        }

        // Active technicians
        const { count: activeTechs } = await supabaseAdmin
            .from("technicians")
            .select("id", { count: "exact", head: true })
            .eq("is_available", true);

        // Total technicians
        const { count: totalTechs } = await supabaseAdmin
            .from("technicians")
            .select("id", { count: "exact", head: true });

        return NextResponse.json({
            totalRequests: requests?.length || 0,
            statusCounts,
            totalRevenue,
            activeTechnicians: activeTechs || 0,
            totalTechnicians: totalTechs || 0,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
