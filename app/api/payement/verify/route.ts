import { NextResponse } from "next/server";
import crypto from "crypto";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  const checkString = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(checkString)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (isValid) {
    await supabaseAdmin
      .from("requests")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
      })
      .eq("razorpay_order_id", razorpay_order_id);

    return NextResponse.json({ status: "success" });
  }

  return NextResponse.json({ status: "error" });
}
