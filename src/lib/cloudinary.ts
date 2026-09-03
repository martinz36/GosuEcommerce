"use server";

import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

/**
 * Server Action para subir un archivo File (desde FormData) directamente a Cloudinary.
 */
export async function uploadImageToCloudinary(formData: FormData): Promise<{ success: boolean; data?: CloudinaryUploadResult; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo de imagen." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Si no están configuradas las credenciales reales de Cloudinary, retornamos una URL de demostración segura
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    if (!process.env.CLOUDINARY_API_KEY || cloudName === "gosu-tcg") {
      // Simulación de Cloudinary para entornos de prueba
      const mockPublicId = `gosu-products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const mockUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;
      return {
        success: true,
        data: {
          secure_url: mockUrl,
          public_id: mockPublicId,
          bytes: buffer.length,
          format: file.type.split("/")[1] || "png",
        },
      };
    }

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gosu-products",
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary Upload Error:", error);
            resolve({ success: false, error: error?.message || "Error al subir imagen a Cloudinary." });
          } else {
            resolve({
              success: true,
              data: {
                secure_url: result.secure_url,
                public_id: result.public_id,
                bytes: result.bytes,
                format: result.format,
              },
            });
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (err: any) {
    console.error("Upload Action Error:", err);
    return { success: false, error: err.message || "Excepción al procesar la imagen." };
  }
}
