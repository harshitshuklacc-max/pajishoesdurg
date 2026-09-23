import { db } from "@/db";
import { orderSequence, orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.transaction(async (tx) => {
    const existing = await tx.query.orderSequence.findFirst({
      where: eq(orderSequence.year, year),
    });
    let next: number;
    if (!existing) {
      await tx.insert(orderSequence).values({ year, lastNumber: 1 });
      next = 1;
    } else {
      next = existing.lastNumber + 1;
      await tx
        .update(orderSequence)
        .set({ lastNumber: next })
        .where(eq(orderSequence.year, year));
    }
    return next;
  });
  return `PAJI-${year}-${String(result).padStart(6, "0")}`;
}

export async function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: { items: true },
  });
}
