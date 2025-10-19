import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const signedUrl = searchParams.get("signedUrl");
  if (!signedUrl) {
    return NextResponse.json({ error: "Missing signed URL" }, { status: 400 });
  }

  const ws = new WebSocket(signedUrl);

  ws.on("open", () => {
    console.log("✅ Connected to ElevenLabs WebSocket agent");
  });

  ws.on("message", (msg) => {
    console.log("🎤 Agent:", msg.toString());
  });

  ws.on("close", () => {
    console.log("🔚 WebSocket closed");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  return NextResponse.json({ success: true });                  
}
