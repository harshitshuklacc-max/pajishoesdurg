"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Video = {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

export default function AdminVideosPage() {
  const [list, setList] = useState<Video[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoPublicId: "",
    thumbnailUrl: "",
    thumbnailPublicId: "",
  });

  async function load() {
    const res = await fetch("/api/admin/videos");
    setList(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(file: File, type: "image" | "video", field: "video" | "thumbnail") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "videos");
    fd.append("type", type);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      if (field === "video") setForm((f) => ({ ...f, videoUrl: data.url, videoPublicId: data.publicId }));
      else setForm((f) => ({ ...f, thumbnailUrl: data.url, thumbnailPublicId: data.publicId }));
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", videoUrl: "", videoPublicId: "", thumbnailUrl: "", thumbnailPublicId: "" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Our Glimpses — Videos</h1>
      <p className="text-sm text-gray-500">Videos appear on homepage under &quot;OUR GLIMPSES&quot;</p>
      <form onSubmit={create} className="mt-6 max-w-lg space-y-3 rounded-xl border bg-white p-5">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full rounded border p-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="block text-sm">Video file</label>
        <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "video", "video")} />
        <label className="block text-sm">Thumbnail</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "image", "thumbnail")} />
        <Button type="submit" disabled={!form.videoUrl}>Add video</Button>
      </form>
      <div className="mt-8 space-y-3">
        {list.map((v) => (
          <div key={v.id} className="flex gap-4 rounded-xl border bg-white p-4">
            {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="h-20 w-32 rounded object-cover" />}
            <div>
              <p className="font-semibold">{v.title}</p>
              <p className="text-xs text-gray-500">{v.isActive ? "Active" : "Hidden"} · Order {v.displayOrder}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
