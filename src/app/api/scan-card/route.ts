import { NextRequest, NextResponse } from "next/server";
import * as jpeg from "jpeg-js";
import { HeifDecoder } from "libheif-js";

interface ScanResult {
  name: string;
  set?: string;
  number?: string;
  hp?: string;
  confidence: string;
}

// Konverze HEIC na JPEG pomocí libheif-js (čisté WASM)
async function convertHeicToJpeg(heicBuffer: Buffer): Promise<Buffer> {
  const decoder = new HeifDecoder();
  const images = decoder.decode(heicBuffer);

  if (!images || images.length === 0) {
    throw new Error("Failed to decode HEIC - no images found");
  }

  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  // Získej RGBA data
  const rgbaData = await new Promise<Uint8ClampedArray>((resolve, reject) => {
    const imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    };

    try {
      image.display(imageData, (displayData: { data: Uint8ClampedArray }) => {
        resolve(displayData.data);
      });
    } catch (err) {
      reject(err);
    }
  });

  // Enkóduj do JPEG
  const jpegData = jpeg.encode(
    {
      data: Buffer.from(rgbaData),
      width,
      height,
    },
    90
  );

  return Buffer.from(jpegData.data);
}

export async function POST(req: NextRequest) {
  console.log("[scan-card] API called");

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[scan-card] JSON parse error:", parseError);
      return NextResponse.json({ error: "Neplatný JSON v požadavku" }, { status: 400 });
    }

    const { image } = body;

    if (!image) {
      console.log("[scan-card] Missing image");
      return NextResponse.json({ error: "Chybí obrázek" }, { status: 400 });
    }

    // Validuj base64 formát
    const validPrefixes = ["data:image/", "data:application/octet-stream"];
    const hasValidPrefix = validPrefixes.some(prefix => image.startsWith(prefix));

    if (!hasValidPrefix) {
      console.log("[scan-card] Invalid image format, starts with:", image.substring(0, 50));
      return NextResponse.json(
        { error: "Neplatný formát obrázku. Očekává se base64 data URL." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log("[scan-card] API key exists:", !!apiKey, "Length:", apiKey?.length || 0);

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API není nakonfigurován. Kontaktuj správce." },
        { status: 500 }
      );
    }

    console.log("[scan-card] Image size:", Math.round(image.length / 1024), "KB");

    // Extrahuj base64 data a MIME type
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Neplatný formát base64 obrázku" },
        { status: 400 }
      );
    }

    let mimeType = matches[1];
    let base64Data = matches[2];
    let finalImageUrl = image;

    // Pokud je to HEIC nebo neznámý formát, konvertuj na JPEG
    const supportedFormats = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!supportedFormats.includes(mimeType.toLowerCase())) {
      console.log("[scan-card] Converting from", mimeType, "to JPEG using libheif-js...");
      try {
        const inputBuffer = Buffer.from(base64Data, "base64");
        const jpegBuffer = await convertHeicToJpeg(inputBuffer);
        base64Data = jpegBuffer.toString("base64");
        mimeType = "image/jpeg";
        finalImageUrl = `data:image/jpeg;base64,${base64Data}`;
        console.log("[scan-card] Conversion successful, new size:", Math.round(jpegBuffer.length / 1024), "KB");
      } catch (conversionError) {
        console.error("[scan-card] Conversion error:", conversionError);
        return NextResponse.json(
          { error: "Nepodařilo se konvertovat obrázek. Zkus použít JPEG nebo PNG." },
          { status: 400 }
        );
      }
    }

    // Použij GPT-4 Vision pro rozpoznání karty
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Jsi expert na rozpoznávání Pokémon Trading Card Game (TCG) karet.

Tvým úkolem je analyzovat obrázek a identifikovat Pokémon kartu. Extrahuj tyto informace:
- name: Přesný název Pokémona nebo karty ANGLICKY (např. "Pikachu", "Charizard ex", "Professor's Research")
- set: Název setu/edice pokud je viditelný (např. "Scarlet & Violet", "Obsidian Flames")
- number: Číslo karty pokud je viditelné (např. "025/198", "001/165")
- hp: HP hodnota pokud je viditelná (jen číslo, např. "60", "280")
- confidence: Tvoje jistota v rozpoznání - "high" pokud je karta jasně čitelná, "medium" pokud jsou části rozmazané, "low" pokud je velmi špatná kvalita

DŮLEŽITÉ:
- Vždy použij ANGLICKÝ název karty, ne český
- Pokud na obrázku není Pokémon karta, vrať {"name":"NOT_A_POKEMON_CARD","confidence":"high"}
- Pokud je obrázek příliš rozmazaný nebo nečitelný, vrať {"name":"UNREADABLE","confidence":"low"}

Odpověz POUZE validním JSON objektem bez markdown formátování a bez dalšího textu.
Příklad správné odpovědi: {"name":"Pikachu","set":"Scarlet & Violet","number":"025/198","hp":"60","confidence":"high"}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyzuj tuto fotografii a identifikuj Pokémon kartu. Vrať JSON s informacemi."
              },
              {
                type: "image_url",
                image_url: {
                  url: finalImageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Příliš mnoho požadavků. Zkus to za chvíli znovu." },
          { status: 429 }
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Neplatný API klíč. Kontaktuj správce." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Chyba při komunikaci s AI. Zkus to znovu." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    console.log("AI response:", content);

    if (!content) {
      return NextResponse.json(
        { error: "AI nevrátila žádnou odpověď" },
        { status: 500 }
      );
    }

    // Parsuj JSON odpověď
    try {
      let cleanContent = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      const result: ScanResult = JSON.parse(cleanContent);

      if (result.name === "NOT_A_POKEMON_CARD") {
        return NextResponse.json(
          { error: "Na obrázku není Pokémon karta" },
          { status: 400 }
        );
      }

      if (result.name === "UNREADABLE") {
        return NextResponse.json(
          { error: "Obrázek je příliš rozmazaný nebo nečitelný. Zkus pořídit lepší fotku." },
          { status: 400 }
        );
      }

      if (!result.name || result.name.trim() === "") {
        return NextResponse.json(
          { error: "AI nedokázala rozpoznat název karty" },
          { status: 400 }
        );
      }

      return NextResponse.json({ result });
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);

      const patterns = [
        /name["'\s:]+["']?([A-Za-z][A-Za-z0-9\s\-'éèêëàâäùûüîïôöç]+)/i,
        /(?:Pikachu|Charizard|Blastoise|Venusaur|Mewtwo|Mew|Eevee|Bulbasaur|Squirtle|Charmander)(?:\s+(?:ex|EX|V|VMAX|VSTAR|GX))?/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const name = match[1] || match[0];
          return NextResponse.json({
            result: {
              name: name.trim().replace(/["']/g, ""),
              confidence: "low"
            }
          });
        }
      }

      return NextResponse.json(
        { error: "Nepodařilo se rozpoznat kartu. Zkus pořídit jasnější fotku." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Chyba při zpracování obrázku. Zkus to znovu." },
      { status: 500 }
    );
  }
}
