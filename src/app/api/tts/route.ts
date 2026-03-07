import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Chybí text" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API není nakonfigurován", fallback: true },
        { status: 200 }
      );
    }

    // Použijeme OpenAI TTS - mnohem lepší kvalita hlasu
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova", // nova je příjemný ženský hlas, nebo "alloy" pro neutrální
        response_format: "mp3",
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI TTS error:", response.status, await response.text());
      return NextResponse.json(
        { error: "Chyba OpenAI TTS", fallback: true },
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
