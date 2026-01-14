import { NextResponse } from "next/server";
import OpenAI, { APIError, toFile } from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateBackPayload = {
  imageDataUrl?: string;
  maskDataUrl?: string;
  style?: "classic" | "stylized" | "neon" | "fire";
  size?: "256x256" | "512x512" | "1024x1024";
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateBackPayload;
    if (!body?.imageDataUrl || typeof body.imageDataUrl !== "string") {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 }
      );
    }

    const base64 = body.imageDataUrl.split(",")[1];
    if (!base64) {
      return NextResponse.json(
        { error: "Invalid image data." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64, "base64");
    const imageFile = await toFile(buffer, "source.png", {
      type: "image/png",
    });
    let maskFile: Awaited<ReturnType<typeof toFile>> | undefined;
    if (body.maskDataUrl) {
      const maskBase64 = body.maskDataUrl.split(",")[1];
      if (maskBase64) {
        const maskBuffer = Buffer.from(maskBase64, "base64");
        maskFile = await toFile(maskBuffer, "mask.png", {
          type: "image/png",
        });
      }
    }

    const client = new OpenAI({ apiKey });
    const style = body.style ?? "classic";
    const styleNote =
      style === "stylized"
        ? "Style note: emphasize bold inked outlines and graphic cel shading."
        : style === "neon"
        ? "Style note: add subtle neon rim lighting and cool glow accents."
        : style === "fire"
        ? "Style note: add a warm fire aura with ember-like highlights."
        : "Style note: keep the lighting clean and athletic with balanced contrast.";
    const prompt = `Restyle the cutout subject into a 90s shonen sports anime illustration (not a copy). Preserve likeness (face structure, hair silhouette, skin tone, pose). Replace the photo with hand-drawn inked line art, bold cel shading, limited palette, subtle screentone texture, rim light, crisp highlights. Outfit: anime baseball uniform based on original colors, simplified flat blocks, light folds. Background: bright baseball stadium at golden hour, painterly blurred crowd, glowing lights, depth of field; strong foreground contrast. Composition: waist-up hero shot, slight low angle, energetic, clean edges. ${styleNote} Constraints: no photorealism or photo textures, do not leave subject unchanged, no extra limbs/fingers, no text/logos/watermark.`;

    const size = body.size ?? "512x512";
    let image: string | undefined;

    if (size !== "1024x1024") {
      const fallback = await client.images.edit({
        model: "dall-e-2",
        image: imageFile,
        ...(maskFile ? { mask: maskFile } : {}),
        prompt,
        size,
        response_format: "b64_json",
      });
      image = fallback.data?.[0]?.b64_json;
    } else {
      try {
        const response = await client.images.edit({
          model: "gpt-image-1",
          image: imageFile,
          prompt,
          size: "1024x1024",
          input_fidelity: "high",
          background: "transparent",
          output_format: "png",
        });

        image = response.data?.[0]?.b64_json;
      } catch (error) {
        if (
          error instanceof APIError &&
          error.status === 403 &&
          error.message?.toLowerCase().includes("verified")
        ) {
          const fallback = await client.images.edit({
            model: "dall-e-2",
            image: imageFile,
            ...(maskFile ? { mask: maskFile } : {}),
            prompt,
            size: "1024x1024",
            response_format: "b64_json",
          });
          image = fallback.data?.[0]?.b64_json;
        } else {
          throw error;
        }
      }
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image returned from OpenAI." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imageDataUrl: `data:image/png;base64,${image}`,
    });
  } catch (error) {
    if (error instanceof APIError) {
      const message =
        (error.error as { message?: string } | undefined)?.message ??
        error.message ??
        "OpenAI request failed.";
      console.error("OpenAI API error:", {
        status: error.status,
        message,
        requestId: error.requestID,
      });
      return NextResponse.json(
        {
          error: message,
          status: error.status,
          requestId: error.requestID,
        },
        { status: error.status ?? 500 }
      );
    }

    console.error("Back art error:", error);
    return NextResponse.json(
      { error: "Failed to generate back art." },
      { status: 500 }
    );
  }
}
