import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, t, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { QUOTE } from "@/lib/site";
import { fixTypos, getPage, genericPaths } from "@/data/content";
import { productByPath } from "@/data/products";
import InnerPage, { OfficeAside } from "@/components/layouts/InnerPage";
import { Icon } from "@/components/ui/Icons";

/** Catch-all params for every old content page (products, SR-22, about, areas, privacy, …). */
export const contentParams = (lang: Lang) => genericPaths(lang).map((p) => ({ slug: p.split("/").filter(Boolean) }));
const pathOf = (slug: string[]) => `/${slug.join("/")}/`;

function labelFor(path: string, lang: Lang) {
  const es = lang === "es";
  if (productByPath(path) || /business|rental_property/.test(path)) return es ? "COBERTURA" : "COVERAGE";
  if (/auto-insurance-|areas-|content\/smyrna|\/tn\//.test(path)) return es ? "ÁREAS QUE ATENDEMOS" : "AREAS WE SERVICE";
  return es ? "TENNESSEE AUTO INSURANCE AGENCY" : "TENNESSEE AUTO INSURANCE AGENCY";
}

export function contentMetadata(lang: Lang, slug: string[]): Metadata {
  const path = pathOf(slug);
  const p = getPage(lang, path);
  if (!p) return {};
  const title = fixTypos((lang === "es" && p.spanishH1) || p.h1 || p.metaTitle.split(" - ")[0]);
  return pageMeta({ lang, path, title, description: fixTypos(p.metaDescription || title) });
}

export default function ContentView({ lang, slug }: { lang: Lang; slug: string[] }) {
  const path = pathOf(slug);
  const page = getPage(lang, path);
  if (!page) notFound();
  const d = t(lang);
  const product = productByPath(path);
  const title = fixTypos((lang === "es" && page.spanishH1) || page.h1 || page.metaTitle.split(" - ")[0]);
  const quoteHref = product?.quote ?? (product ? href(lang, `/contact/?type=${encodeURIComponent(product.inquiry)}`) : QUOTE.auto);
  return (
    <InnerPage
      lang={lang}
      label={labelFor(path, lang)}
      title={
        <span className="flex flex-wrap items-center gap-x-5">
          {product && <Icon name={product.icon} size={64} className="hidden shrink-0 text-red md:block" />}
          {title}
        </span>
      }
      crumbs={[{ name: title, path }]}
      englishOnly={!!page.englishOnly}
      aside={<OfficeAside lang={lang} />}
      quoteHref={quoteHref}
    >
      <article className="prose-content" dangerouslySetInnerHTML={{ __html: fixTypos(page.html) }} />
      {product && (
        <div className="mt-12 flex flex-wrap gap-3">
          <a href={quoteHref} target={product.quote ? "_blank" : undefined} rel={product.quote ? "noopener noreferrer" : undefined} className="btn btn-red">
            {d.quote} · {product.name[lang]}
          </a>
          <a href="tel:6158936177" className="btn btn-line">
            <Icon name="phone" size={18} /> (615) 893-6177
          </a>
        </div>
      )}
    </InnerPage>
  );
}
