import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("[upload-image] API called");

  try {
    // Zkontroluj Cloudinary konfiguraci
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[upload-image] Missing Cloudinary config");
      return NextResponse.json(
        { error: "Cloudinary není nakonfigurován" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Chybí soubor" }, { status: 400 });
    }

    console.log("[upload-image] File:", file.name, "Size:", file.size, "Type:", file.type);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do Cloudinary
    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      format: string;
      width: number;
      height: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "pokemon-cards",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error("[upload-image] Cloudinary error:", error);
              return reject(error);
            }
            resolve(result as typeof result & { public_id: string; secure_url: string; format: string; width: number; height: number });
          }
        )
        .end(buffer);
    });

    console.log("[upload-image] Upload successful:", result.public_id);

    // Generuj JPEG URL s transformací
    const jpgUrl = cloudinary.url(result.public_id, {
      secure: true,
      fetch_format: "jpg",
      quality: "auto",
    });

    console.log("[upload-image] JPG URL:", jpgUrl);

    return NextResponse.json({
      public_id: result.public_id,
      jpg_url: jpgUrl,
      original_url: result.secure_url,
      format: result.format,
    });
  } catch (error: unknown) {
    console.error("[upload-image] Error:", error);
    const message = error instanceof Error ? error.message : "Upload selhal";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
