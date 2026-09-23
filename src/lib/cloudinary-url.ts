/** Client-safe Cloudinary URL helpers (no Node SDK — safe for browser bundles). */

export type ImagePreset = "thumbnail" | "card" | "product" | "zoom" | "hero" | "category";

const TRANSFORMS: Record<ImagePreset, string> = {
  thumbnail: "c_fill,w_120,h_120,q_auto,f_auto",
  card: "c_fill,w_400,h_500,q_auto,f_auto",
  product: "c_limit,w_800,q_auto,f_auto",
  zoom: "c_limit,w_1200,q_auto,f_auto",
  hero: "c_fill,w_1920,h_800,q_auto,f_auto",
  category: "c_fill,w_600,h_400,q_auto,f_auto",
};

export function cloudinaryUrl(
  publicIdOrUrl: string,
  preset: ImagePreset = "product",
  extra?: string
): string {
  if (!publicIdOrUrl) return "";
  if (publicIdOrUrl.startsWith("http")) {
    if (publicIdOrUrl.includes("res.cloudinary.com")) return publicIdOrUrl;
    return publicIdOrUrl;
  }
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
  if (!cloud) return publicIdOrUrl;
  const transform = extra ? `${TRANSFORMS[preset]},${extra}` : TRANSFORMS[preset];
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicIdOrUrl}`;
}

export function faviconFromLogo(publicId: string, size = 32): string {
  return cloudinaryUrl(publicId, "thumbnail", `c_fill,w_${size},h_${size},f_png`);
}

const ALLOWED_IMAGE = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/avi",
  "video/x-msvideo",
  "video/mpeg",
  "video/3gpp",
];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v", ".avi"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export function validateUpload(file: File, type: "image" | "video"): string | null {
  const mime = (file.type || "").toLowerCase();
  const ext = fileExt(file.name);
  const max = type === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  const okMime = type === "image" ? ALLOWED_IMAGE : ALLOWED_VIDEO;
  const okExt = type === "image" ? IMAGE_EXT : VIDEO_EXT;
  const typeOk = (mime && okMime.includes(mime)) || okExt.includes(ext);
  if (!typeOk) {
    return type === "video"
      ? `Invalid video type${mime ? `: ${mime}` : ""}. Use MP4, WebM, or MOV.`
      : `Invalid file type${mime ? `: ${mime}` : ""}`;
  }
  if (file.size > max) return `File too large (max ${max / 1024 / 1024}MB)`;
  return null;
}
