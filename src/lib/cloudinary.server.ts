import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

function cloudinaryErrorMessage(err: unknown): string {
  if (!err) return "Upload failed";
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object") {
    const o = err as { message?: unknown; error?: { message?: unknown } };
    if (typeof o.message === "string" && o.message) return o.message;
    if (typeof o.error?.message === "string" && o.error.message) return o.error.message;
  }
  return "Upload failed";
}

function hasCloudinaryConfig() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

const SAFE_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".jpg", ".jpeg", ".png", ".webp"]);

export async function savePublicUpload(
  buffer: Buffer,
  folder: string,
  originalName: string
): Promise<{ url: string; publicId: string }> {
  const ext = extname(originalName).toLowerCase();
  const safeExt = SAFE_EXT.has(ext) ? ext : folder === "videos" ? ".mp4" : ".bin";
  const dir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${safeExt}`;
  await writeFile(join(dir, filename), buffer);
  return { url: `/uploads/${folder}/${filename}`, publicId: `local:uploads/${folder}/${filename}` };
}

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image",
  originalName = "upload"
): Promise<{ url: string; publicId: string }> {
  if (resourceType === "video") {
    if (hasCloudinaryConfig()) {
      const tmp = join(tmpdir(), `paji-${randomUUID()}${extname(originalName) || ".mp4"}`);
      await writeFile(tmp, buffer);
      try {
        const result = await cloudinary.uploader.upload_large(tmp, {
          resource_type: "video",
          folder: `paji-shoes/${folder}`,
          chunk_size: 6_000_000,
          timeout: 120_000,
        });
        if (result.secure_url) {
          return { url: result.secure_url, publicId: result.public_id };
        }
      } catch {
        // Fall through to local storage so admin can still add the video.
      } finally {
        await unlink(tmp).catch(() => {});
      }
    }
    return savePublicUpload(buffer, folder, originalName);
  }

  if (!hasCloudinaryConfig()) {
    return savePublicUpload(buffer, folder, originalName);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `paji-shoes/${folder}`, resource_type: "image" },
      (err, result) => {
        if (err || !result) reject(new Error(cloudinaryErrorMessage(err)));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType: "image" | "video" = "image") {
  if (!publicId) return;
  if (publicId.startsWith("local:")) {
    const relative = publicId.slice("local:".length);
    await unlink(join(process.cwd(), "public", relative)).catch(() => {});
    return;
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
