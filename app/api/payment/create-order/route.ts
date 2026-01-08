import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import Razorpay from "razorpay";

function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: Request) {
  console.log("=== Payment API Called ===");

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { request_id, amount } = body;

    if (!request_id || !amount) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "request_id and amount are required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("Environment check:", {
      keyId: keyId ? `${keyId.substring(0, 10)}...` : "MISSING",
      keySecret: keySecret ? "PRESENT" : "MISSING"
    });

    if (!keyId || !keySecret) {
      console.log("Razorpay keys not configured");
      return NextResponse.json(
        { error: "Razorpay keys not configured" },
        { status: 500 }
      );
    }

    console.log("Creating Razorpay instance...");
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log("Creating order with amount:", Math.round(amount * 100));
    const amountNumber = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (!isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amountNumber * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}_${request_id.slice(0, 8)}`,
      notes: { request_id: request_id },
    });

    console.log("Order created successfully:", order.id);

    // Persist razorpay order id and mark payment as pending on the request
    try {
      const { error: updateError } = await supabaseAdmin
        .from("requests")
        .update({ razorpay_order_id: order.id, payment_status: "pending" })
        .eq("id", request_id);

      if (updateError) {
        console.error("Failed to update request with order id:", updateError);
      }
    } catch (dbErr) {
      console.error("Supabase update threw an error:", dbErr);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: amountNumber,
      currency: "INR",
      key: keyId,
    });
  } catch (error: any) {
    console.error("=== ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
