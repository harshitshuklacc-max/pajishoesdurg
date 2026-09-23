import Link from "next/link";

import { db } from "@/db";

import { categories, videos } from "@/db/schema";

import { asc, eq } from "drizzle-orm";
import { storefrontCategoryWhere } from "@/lib/mens-store";

import { BrandHero } from "@/components/home/brand-hero";

import { GlimpsesSection } from "@/components/home/glimpses-section";

import { TrustSections } from "@/components/home/trust-sections";

import { ProductCard } from "@/components/store/product-card";

import { OptimizedImage } from "@/components/ui/optimized-image";

import { getHeroContent, getSectionMeta } from "@/lib/homepage";

import { getHomepageCatalog, mapProductToCard } from "@/lib/products";

import { getStoreSettings } from "@/lib/settings";



export const dynamic = "force-dynamic";



export default async function HomePage() {

  const [hero, settings, glimpsesMeta, activeVideos, cats, catalog] =

    await Promise.all([

      getHeroContent(),

      getStoreSettings(),

      getSectionMeta("glimpses"),

      db.query.videos

        .findMany({

          where: eq(videos.isActive, true),

          orderBy: [asc(videos.displayOrder)],

          limit: 12,

        })

        .catch(() => []),

      db.query.categories

        .findMany({

          where: storefrontCategoryWhere,

          orderBy: [asc(categories.displayOrder)],

          limit: 10,

        })

        .catch(() => []),

      getHomepageCatalog(20).catch(() => []),

    ]);



  const glimpsesTitle = glimpsesMeta?.title || "Our Glimpses";

  const glimpsesEnabled = glimpsesMeta?.isEnabled !== false;



  const orgJsonLd = {

    "@context": "https://schema.org",

    "@type": "ShoeStore",

    name: settings.storeName,

    description: settings.businessDescription,

    telephone: settings.phone,

    address: {

      "@type": "PostalAddress",

      streetAddress: settings.address,

      addressLocality: "Durg",

      addressRegion: "Chhattisgarh",

      postalCode: "491001",

      addressCountry: "IN",

    },

    sameAs: settings.instagram ? [settings.instagram] : [],

  };



  return (

    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />



      <BrandHero settings={settings} hero={hero} />



      {glimpsesEnabled && activeVideos.length > 0 && (

        <GlimpsesSection

          sectionTitle={glimpsesTitle}

          storeTagline={settings.businessDescription}

          videos={activeVideos.map((v) => ({

            id: v.id,

            title: v.title,

            description: v.description,

            videoUrl: v.videoUrl,

            thumbnailUrl: v.thumbnailUrl,

            autoplay: v.autoplay,

            loop: v.loop,

          }))}

        />

      )}



      {cats.length > 0 && (

        <section className="py-16 md:py-24">

          <div className="mx-auto max-w-7xl px-4 lg:px-6">

            <div className="mb-10 text-center">

              <p className="section-eyebrow">Collections</p>

              <h2 className="section-title mt-3">Shop by Category</h2>

            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">

              {cats.map((cat) => (

                <Link

                  key={cat.id}

                  href={`/category/${cat.slug}`}

                  className="premium-card group"

                >

                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-paji-cream to-white">

                    {cat.imageUrl ? (

                      <>

                        <OptimizedImage

                          src={cat.imageUrl}

                          alt={cat.name}

                          preset="category"

                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"

                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-paji-deep/75 via-paji-deep/10 to-transparent" />

                        <p className="absolute bottom-4 left-0 right-0 text-center font-serif text-sm font-semibold uppercase tracking-[0.15em] text-white">

                          {cat.name}

                        </p>

                      </>

                    ) : (

                      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">

                        <span className="text-2xl opacity-40">👟</span>

                        <span className="font-serif text-xs font-semibold uppercase tracking-wide text-gray-600">{cat.name}</span>

                      </div>

                    )}

                  </div>

                </Link>

              ))}

            </div>

          </div>

        </section>

      )}



      {catalog.length > 0 && (

        <section className="border-t border-black/5 bg-white py-16 md:py-24">

          <div className="mx-auto max-w-7xl px-4 lg:px-6">

            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

              <div className="text-center sm:text-left">

                <p className="section-eyebrow">Featured · max 20</p>

                <h2 className="section-title mt-3">Featured Pieces</h2>

                <p className="mt-2 max-w-md text-sm text-gray-600">

                  Latest styles from our Durg store — updated as you add products in admin.

                </p>

              </div>

              <Link

                href="/shop"

                className="mx-auto rounded-full border border-paji-orange/30 px-5 py-2 text-sm font-semibold text-paji-orange transition hover:bg-paji-orange hover:text-white sm:mx-0"

              >

                View All Products

              </Link>

            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">

              {catalog.map((p) => (

                <ProductCard key={p.id} product={mapProductToCard(p)} />

              ))}

            </div>

          </div>

        </section>

      )}



      <TrustSections settings={settings} />

    </>

  );

}


