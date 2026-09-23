import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const auth = await requireAdmin("videos.manage");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const list = await db.query.videos.findMany({ orderBy: (v, { asc }) => [asc(v.displayOrder)] });
  return NextResponse.json(list);
}

const emptyToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const schema = z.object({
  title: z.string().min(1),
  description: z.preprocess(emptyToUndef, z.string().optional()),
  videoUrl: z.string().url(),
  videoPublicId: z.preprocess(emptyToUndef, z.string().optional()),
  thumbnailUrl: z.preprocess(emptyToUndef, z.string().url().optional()),
  thumbnailPublicId: z.preprocess(emptyToUndef, z.string().optional()),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin("videos.manage");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue ? `${issue.path.join(".") || "form"}: ${issue.message}` : "Invalid data" },
      { status: 400 }
    );
  }

  try {
    const [row] = await db.insert(videos).values(parsed.data).returning();
    await logAudit({
      adminId: auth.session!.adminId,
      action: "video.created",
      entityType: "video",
      entityId: row.id,
    });
    return NextResponse.json(row);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdmin("videos.manage");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const id = body.id as number;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { id: _id, ...updates } = body;
  const [row] = await db
    .update(videos)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(videos.id, id))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin("videos.manage");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await req.json();
  await db.delete(videos).where(eq(videos.id, id));
  return NextResponse.json({ ok: true });
}
