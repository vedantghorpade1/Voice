import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
    const AGENT_ID = process.env.AGENT_ID!;

    if (!ELEVENLABS_API_KEY || !AGENT_ID) {
      console.error("Missing ElevenLabs credentials");
      return NextResponse.json({ error: "Missing ElevenLabs credentials" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("ElevenLabs error:", errorText);
      return NextResponse.json({ error: "Failed to fetch signed URL" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
