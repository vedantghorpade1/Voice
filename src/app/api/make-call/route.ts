import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to } = await req.json();

    // Use your number directly for testing
    const destinationNumber = "+919527355763";

    // Validate phone number
    if (!destinationNumber) {
      return NextResponse.json({ error: "Missing 'to' phone number" }, { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(destinationNumber)) {
      return NextResponse.json({ error: "Invalid phone number format. Use +<country_code><number>." }, { status: 400 });
    }

    // Load environment variables
    const EXOTEL_SID = process.env.EXOTEL_SID;
    const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN;
    const EXOTEL_PHONE = process.env.EXOTEL_PHONE;
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!EXOTEL_SID || !EXOTEL_TOKEN || !EXOTEL_PHONE || !ELEVENLABS_API_KEY || !AGENT_ID || !BASE_URL) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    console.log("🧩 Env check:", { EXOTEL_SID, EXOTEL_PHONE, AGENT_ID, BASE_URL });

    // Get signed ElevenLabs URL
    const signedRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
      { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
    );

    if (!signedRes.ok) {
      const text = await signedRes.text();
      console.error("ElevenLabs error:", text);
      return NextResponse.json({ error: "Failed to get signed URL", details: text }, { status: signedRes.status });
    }

    const signedData = await signedRes.json();
    const signed_url = signedData?.signed_url;

    if (!signed_url) {
      return NextResponse.json({ error: "Signed URL missing in ElevenLabs response" }, { status: 500 });
    }

    console.log("🔗 ElevenLabs signed URL:", signed_url);

    // Prepare Exotel call
    const exotelParams = new URLSearchParams();
    exotelParams.append("From", EXOTEL_PHONE);
    exotelParams.append("To", destinationNumber);
    exotelParams.append("CallerId", EXOTEL_PHONE);
    exotelParams.append(
      "Url",
      `${BASE_URL}/api/exotel-websocket?signedUrl=${encodeURIComponent(signed_url)}`
    );

    const exotelURL = `https://api.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`;
    const authHeader = "Basic " + Buffer.from(`${EXOTEL_SID}:${EXOTEL_TOKEN}`).toString("base64");

    console.log("📞 Calling Exotel:", exotelURL);

    const exotelRes = await fetch(exotelURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": authHeader,
      },
      body: exotelParams,
    });

    const rawText = await exotelRes.text();
    console.log("📡 Exotel raw response:", rawText);

    let exotelData;
    try {
      exotelData = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse Exotel response:", err);
      return NextResponse.json({ error: "Exotel response not valid JSON", raw: rawText }, { status: 500 });
    }

    if (!exotelData?.Call?.Sid) {
      return NextResponse.json({ error: "Exotel call failed", details: exotelData }, { status: 500 });
    }

    return NextResponse.json({ success: true, sid: exotelData.Call.Sid });
  } catch (err) {
    console.error("🔥 Server error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
