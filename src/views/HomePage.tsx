import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PRODUCTS, productDescription } from "@/data/products";
import { CARRIERS } from "@/data/carriers";
import { POSTS, STAFF, TESTIMONIALS, firstParagraph } from "@/data/content";
import Preloader from "@/components/ui/Preloader";
import Hero from "@/components/sections/Hero";
import Products from "@/components/sections/Products";
import IndependentAgency from "@/components/sections/IndependentAgency";
import Carriers from "@/components/sections/Carriers";
import SR22 from "@/components/sections/SR22";
import Story from "@/components/sections/Story";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Offices from "@/components/sections/Offices";
import ThreeWays from "@/components/sections/ThreeWays";
import BlogPreview from "@/components/sections/BlogPreview";
import Contact from "@/components/sections/Contact";

/** The signature single-page scroll experience: Map → Lane → Cover → Clear. */
export default function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang);
  const rows = PRODUCTS.map((p) => ({ ...p, description: productDescription(p, lang) }));
  // Latest reviews first (all 102 are on /testimonials/)
  const reviews = TESTIMONIALS.items.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  return (
    <>
      <Preloader label={d.milesSince} skipLabel={d.skip} />
      <Hero lang={lang} />
      <Products lang={lang} rows={rows} />
      <IndependentAgency lang={lang} carriers={CARRIERS.filter((c) => c.featured).map((c) => c.name)} />
      <Carriers lang={lang} />
      <SR22 lang={lang} sr22Intro={firstParagraph("/sr_22/", lang)} />
      <Story lang={lang} />
      <Team lang={lang} staff={STAFF} />
      <Testimonials lang={lang} items={reviews} average={TESTIMONIALS.overall.averageRating || "5"} count={TESTIMONIALS.overall.reviewCount || String(TESTIMONIALS.items.length)} />
      <Offices lang={lang} staff={STAFF} />
      <ThreeWays lang={lang} />
      <BlogPreview lang={lang} posts={POSTS.slice(0, 3)} />
      <Contact lang={lang} />
    </>
  );
}
