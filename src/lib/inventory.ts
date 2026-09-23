import { db } from "@/db";
import { products, productVariants, inventoryLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function decreaseStock(params: {
  productId: number;
  variantId?: number | null;
  quantity: number;
  orderId: number;
}) {
  const { productId, variantId, quantity, orderId } = params;

  await db.transaction(async (tx) => {
    if (variantId) {
      const [variant] = await tx.select().from(productVariants).where(eq(productVariants.id, variantId));
      if (!variant || variant.stock < quantity) {
        throw new Error("Insufficient variant stock");
      }
      await tx
        .update(productVariants)
        .set({ stock: variant.stock - quantity, updatedAt: new Date() })
        .where(eq(productVariants.id, variantId));
    } else {
      const [product] = await tx.select().from(products).where(eq(products.id, productId));
      if (!product || product.stock < quantity) {
        throw new Error("Insufficient stock");
      }
      await tx
        .update(products)
        .set({ stock: product.stock - quantity, updatedAt: new Date() })
        .where(eq(products.id, productId));
    }

    await tx.insert(inventoryLogs).values({
      productId,
      variantId: variantId ?? null,
      changeAmount: -quantity,
      reason: "order_paid",
      orderId,
    });
  });
}

export async function getAvailableStock(productId: number, variantId?: number | null): Promise<number> {
  if (variantId) {
    const v = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
    });
    return v?.stock ?? 0;
  }
  const p = await db.query.products.findFirst({ where: eq(products.id, productId) });
  return p?.stock ?? 0;
}
