import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth-server";
import { handleRouteError } from "@/lib/errors";

// Configure Cloudinary client
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Auth Guard Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file object to Node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Fallback Check: If credentials are not configured, use local base64/placeholder fallback
    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes("placeholder");

    if (!hasCloudinary) {
      console.warn("[Upload API] Cloudinary not configured. Returning local Base64 fallback URI.");
      const base64Data = buffer.toString("base64");
      const mimeType = file.type || "image/png";
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({
        url: dataUrl,
        publicId: `mock_${Date.now()}`,
        fallback: true,
      });
    }

    // 4. Upload to Cloudinary with compression & optimization
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "creatoros-ai/thumbnails",
            transformation: [
              { width: 1280, height: 720, crop: "fill", gravity: "center" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    console.log(`[Upload API] Image successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    return handleRouteError(error, "Failed to process file upload");
  }
}
