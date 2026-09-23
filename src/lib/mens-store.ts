import { categories, products } from "@/db/schema";
import { and, eq, ilike, isNull, not, or, type SQL } from "drizzle-orm";

export const MENS_TAGLINE = "Premium men's footwear in Durg — style, comfort, and the right fit.";
export const MENS_SEO_DESCRIPTION =
  "Shop men's footwear at Paji Shoes, Durg. Premium shoes, sandals, and sneakers for men.";
export const MENS_HERO_DESCRIPTION =
  "Premium men's footwear in Durg — style, comfort, and the right fit.";

export function mentionsLadiesOrWomen(text: string | null | undefined) {
  return /lad(?:y|ies)|women|woman|female/i.test(text || "");
}

function sqlClause(clause: SQL | undefined): SQL {
  if (!clause) throw new Error("Expected SQL clause");
  return clause;
}

export const notLadiesCategoryWhere = not(
  sqlClause(
    or(
      ilike(categories.slug, "%women%"),
      ilike(categories.slug, "%ladies%"),
      ilike(categories.name, "%women%"),
      ilike(categories.name, "%ladies%")
    )
  )
);

export const storefrontCategoryWhere = sqlClause(
  and(eq(categories.isActive, true), isNull(categories.deletedAt), notLadiesCategoryWhere)
);

export const notLadiesProductWhere = not(
  sqlClause(
    or(
      ilike(products.name, "%ladies%"),
      ilike(products.name, "%women%"),
      ilike(products.slug, "%ladies%"),
      ilike(products.slug, "%women%")
    )
  )
);

export const storefrontProductWhere = sqlClause(
  and(isNull(products.deletedAt), eq(products.isActive, true), notLadiesProductWhere)
);

export function isLadiesCategory(cat: { slug?: string | null; name?: string | null }) {
  return mentionsLadiesOrWomen(cat.slug) || mentionsLadiesOrWomen(cat.name);
}
