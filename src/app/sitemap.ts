import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { isNull, and } from "drizzle-orm";
import { notLadiesProductWhere, storefrontCategoryWhere } from "@/lib/mens-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const [prods, cats] = await Promise.all([
      db.query.products.findMany({
        where: and(isNull(products.deletedAt), notLadiesProductWhere),
        columns: { slug: true, updatedAt: true },
        limit: 500,
      }),
      db.query.categories.findMany({
        where: storefrontCategoryWhere,
        columns: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...cats.map((c) => ({
        url: `${base}/category/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...prods.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
