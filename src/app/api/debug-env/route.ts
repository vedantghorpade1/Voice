import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    EXOTEL_SID: process.env.EXOTEL_SID ? "✅ Loaded" : "❌ Missing",
    EXOTEL_TOKEN: process.env.EXOTEL_TOKEN ? "✅ Loaded" : "❌ Missing",
    EXOTEL_PHONE: process.env.EXOTEL_PHONE ? "✅ Loaded" : "❌ Missing",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? "✅ Loaded" : "❌ Missing",
    AGENT_ID: process.env.AGENT_ID ? "✅ Loaded" : "❌ Missing",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? "✅ Loaded" : "❌ Missing",
  });
}
