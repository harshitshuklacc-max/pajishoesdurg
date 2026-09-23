import Link from "next/link";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const list = await db.query.categories
    .findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.displayOrder)],
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-card-hover"
          >
            <div className="aspect-square bg-paji-gray-light">
              {cat.imageUrl ? (
                <OptimizedImage src={cat.imageUrl} alt={cat.name} preset="category" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">{cat.name}</div>
              )}
            </div>
            <p className="p-4 text-center font-semibold group-hover:text-paji-orange">{cat.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
