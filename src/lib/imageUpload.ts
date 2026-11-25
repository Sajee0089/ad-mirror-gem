import { supabase } from "@/integrations/supabase/client";

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

async function resizeToWebpBlob(img: HTMLImageElement, maxDimension: number, quality = 0.82): Promise<{ blob: Blob; ext: string; mime: string }> {
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const webpBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality),
  );
  if (webpBlob && webpBlob.type === "image/webp") {
    return { blob: webpBlob, ext: "webp", mime: "image/webp" };
  }

  const jpegBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
  if (!jpegBlob) {
    throw new Error("Image compression failed");
  }
  return { blob: jpegBlob, ext: "jpg", mime: "image/jpeg" };
}

export interface UploadedAdImage {
  imageUrl: string;
  thumbnailUrl: string;
}

/**
 * Resizes an uploaded image to max 1200px WebP + generates a 400px WebP thumbnail,
 * then uploads both to Supabase Storage under the authenticated user's folder.
 */
export async function uploadOptimizedAdImage(file: File, userId: string): Promise<UploadedAdImage> {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const img = await loadImageFromFile(file);
    const [full, thumb] = await Promise.all([
      resizeToWebpBlob(img, 1200, 0.82),
      resizeToWebpBlob(img, 400, 0.78),
    ]);

    const fullPath = `${userId}/${stamp}.${full.ext}`;
    const thumbPath = `${userId}/thumb-${stamp}.${thumb.ext}`;

    const [fullRes, thumbRes] = await Promise.all([
      supabase.storage.from("ad-images").upload(fullPath, full.blob, {
        contentType: full.mime,
        cacheControl: "31536000",
      }),
      supabase.storage.from("ad-images").upload(thumbPath, thumb.blob, {
        contentType: thumb.mime,
        cacheControl: "31536000",
      }),
    ]);

    if (fullRes.error) throw fullRes.error;
    const { data: fullUrl } = supabase.storage.from("ad-images").getPublicUrl(fullPath);
    const thumbnailUrl = thumbRes.error
      ? fullUrl.publicUrl
      : supabase.storage.from("ad-images").getPublicUrl(thumbPath).data.publicUrl;

    return { imageUrl: fullUrl.publicUrl, thumbnailUrl };
  } catch {
    // Fallback to raw upload if canvas/WebP fails
    const ext = file.name.split(".").pop() || "jpg";
    const fallbackPath = `${userId}/${stamp}.${ext}`;
    const { error } = await supabase.storage.from("ad-images").upload(fallbackPath, file, {
      cacheControl: "31536000",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("ad-images").getPublicUrl(fallbackPath);
    return { imageUrl: data.publicUrl, thumbnailUrl: data.publicUrl };
  }
}
