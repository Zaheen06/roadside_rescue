import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        error: "Missing environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection
    const { data, error } = await supabase.from("services").select("count").limit(1);
    
    return NextResponse.json({
      success: true,
      connected: !error,
      error: error?.message,
      message: "Supabase connection test",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to connect to Supabase",
      },
      { status: 500 }
    );
  }
}
