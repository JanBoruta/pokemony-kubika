import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Chybí text" }, { status: 400 });
    }

    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "westeurope";

    // Pokud není Azure klíč, použijeme fallback
    if (!subscriptionKey) {
      return NextResponse.json(
        { error: "Azure TTS není nakonfigurován", fallback: true },
        { status: 200 }
      );
    }

    // SSML pro lepší kvalitu hlasu
    const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="cs-CZ">
  <voice name="cs-CZ-VlastaNeural">
    <prosody rate="-5%" pitch="+5%">
      ${text}
    </prosody>
  </voice>
</speak>`;

    // Volání Azure TTS REST API
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      console.error("Azure TTS error:", response.status, await response.text());
      return NextResponse.json(
        { error: "Chyba Azure TTS", fallback: true },
        { status: 200 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Chyba při generování hlasu", fallback: true },
      { status: 200 }
    );
  }
}
