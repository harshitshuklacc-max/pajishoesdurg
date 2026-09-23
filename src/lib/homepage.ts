import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MENS_HERO_DESCRIPTION, mentionsLadiesOrWomen } from "@/lib/mens-store";

export type HeroContent = {
  heading: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageUrl: string;
  imagePublicId: string;
};

const DEFAULT_HERO: HeroContent = {
  heading: "Step Into Style at Paji Shoes",
  description: MENS_HERO_DESCRIPTION,
  ctaPrimary: "Shop Now",
  ctaSecondary: "Explore Categories",
  imageUrl: "",
  imagePublicId: "",
};

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const row = await db.query.homepageSections.findFirst({
      where: eq(homepageSections.key, "hero"),
    });
    if (row?.content) {
      const merged = { ...DEFAULT_HERO, ...(row.content as Partial<HeroContent>) };
      if (mentionsLadiesOrWomen(merged.description)) {
        merged.description = DEFAULT_HERO.description;
        await db
          .update(homepageSections)
          .set({ content: merged, updatedAt: new Date() })
          .where(eq(homepageSections.key, "hero"));
      }
      return merged;
    }
  } catch {
    /* db not ready */
  }
  return DEFAULT_HERO;
}

export async function getSectionMeta(key: string) {
  try {
    return db.query.homepageSections.findFirst({ where: eq(homepageSections.key, key) });
  } catch {
    return null;
  }
}
