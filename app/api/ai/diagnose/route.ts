import { NextResponse } from "next/server";
import { diagnoseBreakdown } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message || message.trim().length < 3) {
            return NextResponse.json({ error: "Please describe your problem in more detail." }, { status: 400 });
        }

        const result = await diagnoseBreakdown(message.trim());
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("AI diagnosis error:", err);
        return NextResponse.json({ error: "AI assistant is temporarily unavailable. Please select a service manually." }, { status: 500 });
    }
}
