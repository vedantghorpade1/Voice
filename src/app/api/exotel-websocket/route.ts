import { NextRequest, NextResponse } from "next/server";

/**
 * This API route acts as a dynamic webhook for Exotel.
 * When a call is connected, Exotel makes a GET request to this endpoint.
 * This endpoint's job is to return an XML response (TwiML-like)
 * instructing Exotel on how to handle the live call.
 *
 * In this case, it instructs Exotel to connect the call to a WebSocket
 * stream provided by ElevenLabs, effectively bridging the caller to the AI agent.
 */
export async function GET(req: NextRequest) {
  // Extract the search parameters from the incoming request URL from Exotel.
  const { searchParams } = new URL(req.url);

  // Get the 'signedUrl' which was passed from our /make-call endpoint.
  // This URL is the unique WebSocket endpoint for this specific conversation.
  const signedUrl = searchParams.get("signedUrl");

  // Log the received URL for debugging purposes.
  console.log(`[Exotel Webhook] Received request. Signed URL: ${signedUrl}`);

  // Security and validation: If the signedUrl is missing, we cannot proceed.
  // Return an error response. Exotel will then hang up the call.
  if (!signedUrl) {
    console.error("[Exotel Webhook] Fatal: 'signedUrl' query parameter is missing.");
    // This simple text response is sufficient for Exotel to know something went wrong.
    return new Response("Error: Missing signedUrl parameter.", { status: 400 });
  }

  // This is the TwiML-like XML response that Exotel expects.
  // <Response> is the root element.
  // <Connect> tells Exotel to connect the call to another service.
  // <Stream url="..."> is the specific instruction to open a bidirectional
  // audio stream to the provided WebSocket URL.
  const xmlResponse = `
<Response>
  <Connect>
    <Stream url="${signedUrl}" />
  </Connect>
</Response>
  `.trim();

  // Log the XML we are sending back to Exotel. This is useful for debugging.
  console.log(`[Exotel Webhook] Responding with XML:\n${xmlResponse}`);

  // Return the XML response.
  // We set the 'Content-Type' header to 'application/xml' to ensure
  // Exotel correctly interprets the response.
  return new Response(xmlResponse, {
    headers: {
      "Content-Type": "application/xml", 
    },
  });
}
