import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json();
  const { request_id, amount } = body;

  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: amount * 100, // in paise
    currency: "INR",
    receipt: request_id,
  });

  // Save order to DB
  await supabaseAdmin
    .from("requests")
    .update({
      price: amount,
      razorpay_order_id: order.id,
      payment_status: "pending",
    })
    .eq("id", request_id);

  return NextResponse.json(order);
}
