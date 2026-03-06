import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import webpush from "web-push";

export async function POST(req: Request) {
    try {
        // Initialize within handler so missing env variables don't crash Next.js build
        webpush.setVapidDetails(
            process.env.VAPID_EMAIL || "mailto:admin@roadsiderescue.com",
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "dummy",
            process.env.VAPID_PRIVATE_KEY || "dummy"
        );

        const { userId, title, body, url } = await req.json();

        if (!userId || !title || !body) {
            return NextResponse.json({ error: "userId, title and body are required" }, { status: 400 });
        }

        // Fetch push subscription for this user
        const { data, error } = await supabaseAdmin
            .from("push_subscriptions")
            .select("subscription")
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "No subscription found for this user" }, { status: 404 });
        }

        const payload = JSON.stringify({ title, body, url: url || `/dashboard` });

        await webpush.sendNotification(data.subscription, payload);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Push send error:", err);
        // Don't fail silently — but also don't crash the caller
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
