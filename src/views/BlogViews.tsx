import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, t, type Lang } from "@/lib/i18n";
import { JsonLd, pageMeta } from "@/lib/seo";
import { NAME, SITE_URL } from "@/lib/site";
import { BLOG_PAGE_SIZE, POSTS, allTags, blogPageCount, fixTypos, formatDate, tagSlug, type Post } from "@/data/content";
import InnerPage from "@/components/layouts/InnerPage";
import { PostCard } from "@/components/sections/BlogPreview";
import { Reveal } from "@/components/ui/Reveal";

const BLOG_TITLE = { en: "Tennessee Auto Insurance Agency Blog", es: "Blog de Tennessee Auto Insurance Agency" };
const BLOG_SUB = { en: "View the latest blog posts from Tennessee Auto Insurance Agency.", es: "Vea las publicaciones más recientes de Tennessee Auto Insurance Agency." };

/** /blog/[slug]/ serves both posts and numbered index pages (old pagination was /blog/2/). */
export const blogSlugParams = () => [
  ...POSTS.map((p) => ({ slug: p.slug })),
  ...Array.from({ length: blogPageCount() - 1 }, (_, i) => ({ slug: String(i + 2) })),
];
export const tagParams = () => allTags().map((t) => ({ tag: t.slug }));

export function blogIndexMetadata(lang: Lang, page = 1): Metadata {
  const path = page === 1 ? "/blog/" : `/blog/${page}/`;
  return pageMeta({ lang, path, title: page === 1 ? "Blog" : `Blog · ${t(lang).page} ${page}`, description: BLOG_SUB[lang] });
}
export function blogSlugMetadata(lang: Lang, slug: string): Metadata {
  if (/^\d+$/.test(slug)) return blogIndexMetadata(lang, Number(slug));
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) return {};
  return pageMeta({ lang, path: `/blog/${slug}/`, title: p.title, description: p.metaDescription || p.excerpt || p.title, image: p.image ?? undefined });
}

function Pager({ lang, page, pages }: { lang: Lang; page: number; pages: number }) {
  return (
    <nav aria-label="Pagination" className="mt-16 flex flex-wrap gap-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(lang, n === 1 ? "/blog/" : `/blog/${n}/`)}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border-[1.5px] px-3 font-mono text-sm ${n === page ? "border-ink bg-ink text-paper" : "border-[var(--line)] hover:border-ink"}`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}

function TagCloud({ lang }: { lang: Lang }) {
  return (
    <div className="mt-20 border-t border-dashed border-[var(--line)] pt-10">
      <p className="mile text-muted">{t(lang).tags}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {allTags().map((tg) => (
          <li key={tg.slug}>
            <Link href={href(lang, `/blog/tag/${tg.slug}/`)} className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-4 text-sm hover:border-ink">
              {tg.tag} <span className="ml-2 font-mono text-xs text-muted">{tg.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlogIndexView({ lang, page = 1 }: { lang: Lang; page?: number }) {
  const pages = blogPageCount();
  if (page < 1 || page > pages) notFound();
  const list = POSTS.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  return (
    <InnerPage lang={lang} label={t(lang).blogLabel} title={BLOG_TITLE[lang]} intro={BLOG_SUB[lang]} crumbs={[{ name: "Blog", path: "/blog/" }]} englishOnly>
      <Reveal className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p, i) => (
          <PostCard key={p.slug} p={p} lang={lang} eager={i < 3} />
        ))}
      </Reveal>
      <Pager lang={lang} page={page} pages={pages} />
      <TagCloud lang={lang} />
    </InnerPage>
  );
}

export function TagView({ lang, tag }: { lang: Lang; tag: string }) {
  const info = allTags().find((x) => x.slug === tag);
  if (!info) notFound();
  const list = POSTS.filter((p) => p.tags.some((x) => tagSlug(x) === tag));
  return (
    <InnerPage lang={lang} label={`${t(lang).tags}`} title={info.tag} crumbs={[{ name: "Blog", path: "/blog/" }, { name: info.tag, path: `/blog/tag/${tag}/` }]} englishOnly>
      <Reveal className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <PostCard key={p.slug} p={p} lang={lang} />
        ))}
      </Reveal>
      <TagCloud lang={lang} />
    </InnerPage>
  );
}

export function tagMetadata(lang: Lang, tag: string): Metadata {
  const info = allTags().find((x) => x.slug === tag);
  return pageMeta({ lang, path: `/blog/tag/${tag}/`, title: `${info?.tag ?? tag} · Blog`, description: `${BLOG_SUB[lang]} (${info?.tag ?? tag})` });
}

function postLd(p: Post, lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.date,
    inLanguage: "en-US",
    mainEntityOfPage: `${SITE_URL}${href(lang, `/blog/${p.slug}/`)}`,
    image: p.image ? `${SITE_URL}${p.image}` : `${SITE_URL}/og-image.png`,
    author: { "@type": "Organization", name: NAME },
    publisher: { "@type": "Organization", name: NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    keywords: p.tags.join(", "),
  };
}

export function BlogSlugView({ lang, slug }: { lang: Lang; slug: string }) {
  if (/^\d+$/.test(slug)) return <BlogIndexView lang={lang} page={Number(slug)} />;
  const i = POSTS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = POSTS[i];
  const prev = POSTS[i + 1];
  const next = POSTS[i - 1];
  return (
    <InnerPage
      lang={lang}
      label={formatDate(p.date, lang).toUpperCase()}
      title={p.title}
      crumbs={[{ name: "Blog", path: "/blog/" }, { name: p.title, path: `/blog/${p.slug}/` }]}
      englishOnly
    >
      <JsonLd data={postLd(p, lang)} />
      <div className="grid gap-12 xl:grid-cols-12">
        <article className="prose-content xl:col-span-8" dangerouslySetInnerHTML={{ __html: fixTypos(p.html) }} />
        <aside className="xl:col-span-3 xl:col-start-10">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] space-y-6 text-sm">
            <div>
              <p className="mile text-muted">{t(lang).posted}</p>
              <p className="mt-2">
                <time dateTime={p.date}>{p.dateLabel}</time>
              </p>
            </div>
            {p.tags.length > 0 && (
              <div>
                <p className="mile text-muted">{t(lang).tags}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((tg) => (
                    <li key={tg}>
                      <Link href={href(lang, `/blog/tag/${tagSlug(tg)}/`)} className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] px-3 hover:border-ink">{tg}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
      <nav className="mt-16 grid gap-4 border-t border-dashed border-[var(--line)] pt-8 md:grid-cols-2" aria-label="Posts">
        {prev && (
          <Link href={href(lang, `/blog/${prev.slug}/`)} className="group rounded-[22px] border border-[var(--line)] p-5 hover:border-ink">
            <span className="mile text-muted">← {lang === "es" ? "Anterior" : "Previous"}</span>
            <span className="mt-2 block font-display text-lg font-bold [font-stretch:106%]">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link href={href(lang, `/blog/${next.slug}/`)} className="group rounded-[22px] border border-[var(--line)] p-5 text-right hover:border-ink md:col-start-2">
            <span className="mile text-muted">{lang === "es" ? "Siguiente" : "Next"} →</span>
            <span className="mt-2 block font-display text-lg font-bold [font-stretch:106%]">{next.title}</span>
          </Link>
        )}
      </nav>
    </InnerPage>
  );
}
