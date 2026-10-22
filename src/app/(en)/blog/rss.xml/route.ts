import { NAME, SITE_URL } from "@/lib/site";
import { POSTS } from "@/data/content";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS feed for the blog (replaces the old /blog/rss/ and /blog/atom/ feeds). */
export function GET() {
  const items = POSTS.slice(0, 50)
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}/</link><guid>${SITE_URL}/blog/${p.slug}/</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.excerpt || p.metaDescription)}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(NAME)} Blog</title><link>${SITE_URL}/blog/</link><description>View the latest blog posts from ${esc(NAME)}.</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
