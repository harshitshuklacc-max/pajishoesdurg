"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  isActive: boolean;
  isDemo: boolean;
  category?: { name: string } | null;
};

export default function AdminProductsPage() {
  const [list, setList] = useState<Product[]>([]);

  async function load() {
    const res = await fetch("/api/admin/products");
    if (res.ok) setList(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(p: Product) {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    load();
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Delete "${name}" from the store?`)) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">Homepage shows latest 20 published products. Delete or unpublish anytime.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  {p.name}
                  {p.isDemo && <span className="ml-2 rounded bg-yellow-100 px-1 text-xs">DEMO</span>}
                </td>
                <td className="p-3 text-gray-600">{p.category?.name ?? "—"}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.isActive ? "Published" : "Draft"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-paji-orange hover:underline"
                      onClick={() => togglePublish(p)}
                    >
                      {p.isActive ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => remove(p.id, p.name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No products yet. Add your first shoe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
