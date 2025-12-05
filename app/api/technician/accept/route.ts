import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json();
  const { technician_id, request_id } = body;

  await supabaseAdmin
    .from("requests")
    .update({
      assigned_technician: technician_id,
      status: "accepted",
    })
    .eq("id", request_id);

  return NextResponse.json({ status: "accepted" });
}
