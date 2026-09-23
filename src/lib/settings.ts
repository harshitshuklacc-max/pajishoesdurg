import { db } from "@/db";
import { websiteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MENS_SEO_DESCRIPTION, MENS_TAGLINE, mentionsLadiesOrWomen } from "@/lib/mens-store";

export type StoreSettings = {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  businessDescription: string;
  storeHours: string;
  googleRating: string;
  shippingFlatRate: number;
  freeShippingAbove: number;
  /** Flat courier charge for Cash on Delivery (includes delivery). */
  codCourierCharge: number;
  taxPercent: number;
  seoSiteTitle: string;
  seoSiteDescription: string;
  logoUrl: string;
  logoPublicId: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  logoMobileUrl: string;
  faviconUrl: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Paji Shoes",
  phone: "088390 18919",
  address:
    "Near Marwadi School, Baniya Para, Durg, Chhattisgarh – 491001",
  email: "",
  instagram: "https://www.instagram.com/pajishoes1/",
  businessDescription: MENS_TAGLINE,
  storeHours: "Open until 10 PM",
  googleRating: "4.8/5 based on 22 Google reviews",
  shippingFlatRate: 0,
  freeShippingAbove: 999,
  codCourierCharge: 200,
  taxPercent: 0,
  seoSiteTitle: "Paji Shoes | Premium Footwear in Durg",
  seoSiteDescription: MENS_SEO_DESCRIPTION,
  logoUrl: "",
  logoPublicId: "",
  logoLightUrl: "",
  logoDarkUrl: "",
  logoMobileUrl: "",
  faviconUrl: "",
};

const SETTINGS_KEY = "store";

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await db.query.websiteSettings.findFirst({
      where: eq(websiteSettings.key, SETTINGS_KEY),
    });
    if (!row?.value) return DEFAULT_SETTINGS;
    const merged = { ...DEFAULT_SETTINGS, ...(row.value as Partial<StoreSettings>) };
    const sanitized = {
      ...merged,
      businessDescription: mentionsLadiesOrWomen(merged.businessDescription)
        ? DEFAULT_SETTINGS.businessDescription
        : merged.businessDescription,
      seoSiteDescription: mentionsLadiesOrWomen(merged.seoSiteDescription)
        ? DEFAULT_SETTINGS.seoSiteDescription
        : merged.seoSiteDescription,
    };
    if (
      sanitized.businessDescription !== merged.businessDescription ||
      sanitized.seoSiteDescription !== merged.seoSiteDescription
    ) {
      await db
        .insert(websiteSettings)
        .values({ key: SETTINGS_KEY, value: sanitized })
        .onConflictDoUpdate({
          target: websiteSettings.key,
          set: { value: sanitized, updatedAt: new Date() },
        });
    }
    return sanitized;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setStoreSettings(partial: Partial<StoreSettings>, adminId?: number) {
  const current = await getStoreSettings();
  const merged = { ...current, ...partial };
  if (mentionsLadiesOrWomen(merged.businessDescription)) {
    merged.businessDescription = DEFAULT_SETTINGS.businessDescription;
  }
  if (mentionsLadiesOrWomen(merged.seoSiteDescription)) {
    merged.seoSiteDescription = DEFAULT_SETTINGS.seoSiteDescription;
  }
  await db
    .insert(websiteSettings)
    .values({ key: SETTINGS_KEY, value: merged })
    .onConflictDoUpdate({
      target: websiteSettings.key,
      set: { value: merged, updatedAt: new Date() },
    });
  return merged;
}
