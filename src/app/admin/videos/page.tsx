"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Video = {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  videoPublicId?: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  videoPublicId: "",
  thumbnailUrl: "",
  thumbnailPublicId: "",
};

export default function AdminVideosPage() {
  const [list, setList] = useState<Video[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState<"video" | "thumbnail" | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const res = await fetch("/api/admin/videos");
    const data = await res.json();
    if (res.ok && Array.isArray(data)) setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File, type: "image" | "video", field: "video" | "thumbnail") {
    setError("");
    setSuccess("");
    setUploading(field);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "videos");
    fd.append("type", type);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const raw = await res.text();
      let data: { error?: string; url?: string; publicId?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(data.error || raw.slice(0, 180) || `${field === "video" ? "Video" : "Thumbnail"} upload failed`);
        return;
      }
      if (!data.url) {
        setError("Upload finished but no video URL was returned.");
        return;
      }
      if (field === "video") {
        setForm((f) => ({ ...f, videoUrl: data.url ?? "", videoPublicId: data.publicId || "" }));
        setSuccess("Video uploaded. Click Add video to save it.");
      } else {
        setForm((f) => ({ ...f, thumbnailUrl: data.url ?? "", thumbnailPublicId: data.publicId || "" }));
        setSuccess("Thumbnail uploaded");
      }
    } catch {
      setError("Upload failed. Check your connection and Cloudinary settings.");
    } finally {
      setUploading(null);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.videoUrl) {
      setError("Upload a video file or paste a video URL first.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not add video");
      return;
    }
    setForm(emptyForm);
    setSuccess("Video added to Our Glimpses");
    load();
  }

  async function remove(v: Video) {
    if (!confirm(`Delete video "${v.title}"?`)) return;
    setError("");
    setSuccess("");
    setDeletingId(v.id);
    const res = await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id }),
    });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);
    if (!res.ok) {
      setError(data.error || "Could not delete video");
      return;
    }
    setSuccess(`Deleted ${v.title}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Our Glimpses — Videos</h1>
      <p className="text-sm text-gray-500">Videos appear on homepage under &quot;OUR GLIMPSES&quot;</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      <form onSubmit={create} className="mt-6 max-w-lg space-y-3 rounded-xl border bg-white p-5">
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full rounded border p-2 text-sm"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="block text-sm font-medium">Video file (MP4, WebM or MOV — max 50MB)</label>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
          disabled={uploading !== null}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "video", "video")}
        />
        {uploading === "video" && <p className="text-sm text-paji-orange">Uploading video… this can take a minute</p>}
        {form.videoUrl && (
          <p className="truncate text-xs text-green-700">Video ready: {form.videoUrl}</p>
        )}
        <Input
          placeholder="Or paste a direct video URL (https://…)"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value, videoPublicId: "" })}
        />
        <label className="block text-sm font-medium">Thumbnail (optional)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          disabled={uploading !== null}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "image", "thumbnail")}
        />
        {uploading === "thumbnail" && <p className="text-sm text-paji-orange">Uploading thumbnail…</p>}
        {form.thumbnailUrl && (
          <img src={form.thumbnailUrl} alt="" className="h-20 w-32 rounded object-cover" />
        )}
        <Button type="submit" disabled={saving || uploading !== null || !form.videoUrl}>
          {saving ? "Saving..." : "Add video"}
        </Button>
        {!form.videoUrl && (
          <p className="text-xs text-gray-500">Upload a file or paste a URL before adding.</p>
        )}
      </form>
      <div className="mt-8 space-y-3">
        {list.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4">
            <div className="flex min-w-0 items-center gap-4">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt="" className="h-20 w-32 shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  No thumb
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold">{v.title}</p>
                <p className="text-xs text-gray-500">
                  {v.isActive ? "Active" : "Hidden"} · Order {v.displayOrder}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              disabled={deletingId === v.id}
              onClick={() => remove(v)}
            >
              {deletingId === v.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
        {!list.length && <p className="text-sm text-gray-400">No videos yet.</p>}
      </div>
    </div>
  );
}
