import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const { userId, subscription } = await req.json();

        if (!subscription) {
            return NextResponse.json({ error: "Subscription data is required" }, { status: 400 });
        }

        // Upsert push subscription into Supabase
        // Table: push_subscriptions (user_id text, subscription jsonb, created_at timestamptz)
        const { error } = await supabaseAdmin
            .from("push_subscriptions")
            .upsert(
                { user_id: userId || "anonymous", subscription },
                { onConflict: "user_id" }
            );

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Subscribe error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
