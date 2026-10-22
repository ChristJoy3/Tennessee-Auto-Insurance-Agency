import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { formatDate, type Post } from "@/data/content";
import { Icon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

export function PostCard({ p, lang, eager = false }: { p: Post; lang: Lang; eager?: boolean }) {
  return (
    <article data-reveal-item className="group flex flex-col">
      <Link href={href(lang, `/blog/${p.slug}/`)} className="block overflow-hidden rounded-[22px] bg-paper-2">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" loading={eager ? "eager" : "lazy"} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="contours flex aspect-[16/10] items-end p-5" aria-hidden="true">
            <span className="mile text-red">{p.tags[0] ?? "Blog"}</span>
          </div>
        )}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
      </p>
      <h3 className="mt-2 font-display text-xl font-bold leading-tight [font-stretch:106%]">
        <Link href={href(lang, `/blog/${p.slug}/`)} className="lane-link">{p.title}</Link>
      </h3>
      {p.excerpt && <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted" lang="en">{p.excerpt}</p>}
    </article>
  );
}

export default function BlogPreview({ lang, posts }: { lang: Lang; posts: Post[] }) {
  const d = t(lang);
  return (
    <section className="section bg-paper-2" aria-labelledby="blog-title">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead mile={10} label={d.blogLabel} title={d.blogTitle} id="blog-title" />
          <Link href={href(lang, "/blog/")} className="btn btn-line self-start md:self-auto">
            {d.allPosts} <Icon name="arrow" size={18} />
          </Link>
        </div>
        <Reveal className="mt-12 grid gap-10 md:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} p={p} lang={lang} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
