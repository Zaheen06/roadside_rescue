import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { technician_id, request_id } = body;

    const { error: updateError } = await supabaseAdmin
      .from("requests")
      .update({
        assigned_technician: technician_id,
        status: "accepted",
      })
      .eq("id", request_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Attempt to notify user via WhatsApp
    try {
      // Fetch technician info
      const { data: techData } = await supabaseAdmin
        .from("technicians")
        .select("name")
        .eq("id", technician_id)
        .single();

      // Fetch request info for user
      const { data: requestData } = await supabaseAdmin
        .from("requests")
        .select("user_id")
        .eq("id", request_id)
        .single();

      if (requestData?.user_id && techData?.name) {
        // Fetch User to get phone number
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(requestData.user_id);

        // Find phone number - check auth.phone, metadata.phone, or fallback to an env var for testing
        let userPhone = userData?.user?.phone || userData?.user?.user_metadata?.phone;

        if (!userPhone && process.env.TEST_WHATSAPP_NUMBER) {
          userPhone = process.env.TEST_WHATSAPP_NUMBER;
          console.log("Using TEST_WHATSAPP_NUMBER as fallback.");
        }

        if (userPhone) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const trackingUrl = `${baseUrl}/tracking/${request_id}`;

          await sendWhatsAppNotification(userPhone, trackingUrl, techData.name);
        } else {
          console.warn("Cannot send WhatsApp: No user phone found and TEST_WHATSAPP_NUMBER not set.");
        }
      }
    } catch (notifyError) {
      console.error("Failed to send WhatsApp notification:", notifyError);
    }

    return NextResponse.json({ status: "accepted" });
  } catch (error: any) {
    console.error("Accept route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
