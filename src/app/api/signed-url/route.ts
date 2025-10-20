import { NextResponse } from "next/server";
import { env } from "@/config/env";

export async function GET() {
  try {
    // Env variables are validated in a central place
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${env.AGENT_ID}`,
      {
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
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
