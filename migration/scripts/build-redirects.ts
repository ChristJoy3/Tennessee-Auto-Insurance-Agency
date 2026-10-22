/**
 * Map every old URL (crawled pages, aliases, sitemap entries, failed/404 links) to its new URL.
 *
 * Outputs (migration/):
 *   redirects.csv            old,new,kind,status,reason   (kind: mirror | redirect | external | broken)
 *   redirects/_redirects     Netlify / Cloudflare Pages
 *   redirects/vercel.json    Vercel
 *   redirects/.htaccess      Apache / cPanel
 *   redirects/stubs/...      host-independent fallback: <old-path>/index.html meta-refresh + canonical
 *   new-routes.json          every new static route (EN + ES) the site must generate
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { MIG, ORIGIN, readJson, writeJson, basePath, slugify, toKey } from "./lib";

type PageInfo = { lang: string; key: string; page: string; status: number | null; source: string; aliasOf?: string; finalUrl?: string; title?: string };

const QUOTE_AUTO = "https://b01452c8-45f4-4f3e-90f9-5581bc2898f6.quotes.iwantinsurance.com/auto";

/** Old path (no /es-us prefix) → new path. Returns null when there is no sensible target. */
export function mapPath(raw: string): { to: string; reason: string } | null {
  const [p0, q = ""] = raw.split("?");
  let p = p0.replace(/\/default\.aspx$/i, "/");
  const lower = p.toLowerCase();
  const query = new URLSearchParams(q);

  // Query-string URLs
  if (/^\/category\.aspx$/i.test(p) && query.get("id")?.toUpperCase() === "MISC1") return { to: "/content/tn-drivers-license-reinstatement/", reason: "category page (TN DL reinstatement)" };
  if (/^\/language\.aspx$/i.test(p)) return { to: /2058/.test(q) ? "/es-us/" : "/", reason: "old language switch" };
  if (/^\/employee_vcf\.aspx$/i.test(p)) return { to: `/vcards/${query.get("agent")?.toLowerCase()}.vcf`, reason: "staff vCard (static file)" };

  // Top-level .aspx pages
  const flat: Record<string, string> = {
    "/about.aspx": "/about/", "/contact.aspx": "/contact/", "/locations.aspx": "/locations/",
    "/testimonials.aspx": "/testimonials/", "/claims.aspx": "/claims/", "/payments.aspx": "/payments/",
    "/links.aspx": "/carriers/", "/links/": "/carriers/", "/default.aspx": "/",
    "/blog/rss/": "/blog/rss.xml", "/blog/atom/": "/blog/rss.xml",
    "/tn/home-mobi/": "/", "/tn/virtual-tour/": "/", "/tn/about/": "/about/", "/tn/about/auto-insurance/": "/automobile/",
    "/tn/online-quotes/": "/get_a_quote/", "/tn/": "/", "/tn": "/",
    "/tn/home-mobi/carrier-direct-claims-bill-payments/": "/claims/",
    "/customer_service/": "/contact/", "/areas-we-service/murfeesboro.aspx": "/areas-we-service/murfreesboro/",
    "/locations/tn/default.aspx": "/locations/", "/locations/tn/": "/locations/",
    "/locations/tn/37130/": "/locations/murfreesboro/", "/locations/tn/37167/": "/locations/smyrna/",
    "/locations/tn/murfreesboro/murfreesboro_office.aspx": "/locations/murfreesboro/",
    "/locations/tn/smyrna/smyrna_office.aspx": "/locations/smyrna/",
    "/automobile/car_insurance_quote.aspx": QUOTE_AUTO,
    "/glossary/": "/glossary/", "/atv/": "/atv/", "/rv/": "/rv/",
  };
  if (flat[lower]) return { to: flat[lower], reason: "renamed / consolidated page" };

  // Product quote forms → /get_a_quote/#<product> (external quote links live there)
  const qf = lower.match(/^\/(business|homeowners|motorcycle|renters|boat)\/[a-z_]*quote\.aspx$/);
  if (qf) return { to: `/get_a_quote/#${qf[1] === "business" ? "commercial_auto" : qf[1]}`, reason: "old on-site quote form (static site links to quote providers)" };

  // Staff
  const staff = lower.match(/^\/(profile|contact)\/([a-z_]+)\.aspx$/);
  if (staff) return { to: `/employees/${staff[2].replace(/_/g, "-")}/`, reason: "staff profile" };
  if (/^\/contact\/\d+\/?$/.test(lower)) return { to: "/contact/", reason: "contact form variant" };

  // Blog
  const post = p.match(/^\/blog\/(.+)\.aspx$/i);
  if (post) return { to: `/blog/${slugify(post[1])}/`, reason: "blog post (.aspx → clean slug)" };
  const tag = p.match(/^\/blog\/tag\/(.*?)\/?(\d+\/?)?$/i);
  if (tag) {
    const s = slugify(decodeURIComponent(tag[1]));
    return { to: s ? `/blog/tag/${s}/${tag[2] ? tag[2].replace(/\/?$/, "/") : ""}` : "/blog/", reason: "blog tag archive" };
  }
  if (/^\/blog\/\d{4}\//.test(lower)) return { to: "/blog/", reason: "blog date archive" };

  // Area pages
  const area = lower.match(/^\/(areas-of-service|areas-we-service)\/([a-z-]+)\.aspx$/);
  if (area) return { to: `/${area[1]}/${area[2]}/`, reason: "area page (.aspx → folder)" };

  // Content pages (.aspx → folder)
  const content = lower.match(/^\/content\/([a-z0-9-]+)(\.aspx)?\/?$/);
  if (content) return { to: `/content/${content[1]}/`, reason: content[2] ? "content page (.aspx → folder)" : "mirror" };

  // Generic: folder mirrors, add trailing slash
  if (/\.aspx$/i.test(p)) return { to: p.replace(/\.aspx$/i, "/").toLowerCase(), reason: ".aspx → folder" };
  if (!p.endsWith("/")) return { to: p + "/", reason: "trailing slash" };
  return { to: p, reason: "mirror" };
}

function main() {
  const pages = readJson<PageInfo[]>("pages.json");
  const log = readJson<PageInfo[]>("crawl-log.json");
  const sitemap = fs.existsSync(path.join(MIG, "raw/sitemap.xml"))
    ? [...fs.readFileSync(path.join(MIG, "raw/sitemap.xml"), "utf8").matchAll(/(?:<loc>|href=")([^<"]+)/g)].map((m) => toKey(m[1].trim())).filter(Boolean) as string[]
    : [];

  const all = new Map<string, { status: number | null; source: string; aliasOfKey?: string; inSitemap: boolean }>();
  for (const l of log) all.set(l.key, { status: l.status, source: l.source, inSitemap: false });
  for (const p of pages) if (p.aliasOf) all.get(p.key)!.aliasOfKey = p.aliasOf;
  for (const s of sitemap) all.set(s, { ...(all.get(s) ?? { status: null, source: "sitemap-only" }), inSitemap: true });

  const rows: { old: string; new: string; kind: string; status: number; reason: string; oldStatus: string }[] = [];
  const routes = new Set<string>();
  for (const [key, info] of [...all].sort((a, b) => a[0].localeCompare(b[0]))) {
    const es = /^\/es-us(\/|$)/i.test(key);
    const prefix = es ? "/es-us" : "";
    const base = basePath(key);
    const live = info.source.startsWith("live") || info.source === "archive";
    const oldStatus = `${info.status ?? "ERR"}${info.inSitemap ? " (sitemap)" : ""}`;

    // Alias of another crawled page → follow it, unless the alias itself has a distinct mapping
    let m = mapPath(base);
    if (info.aliasOfKey && m && m.reason === "mirror") {
      const target = mapPath(basePath(info.aliasOfKey));
      if (target && target.to !== m.to) m = { to: target.to, reason: `duplicate of ${info.aliasOfKey}` };
    }
    if (!live && !info.inSitemap) {
      rows.push({ old: ORIGIN + key, new: "", kind: "broken", status: 0, reason: `old URL returned ${info.status ?? "error"} (linked but dead)`, oldStatus });
      continue;
    }
    if (!m) continue;
    const to = /^https?:/.test(m.to) || m.to.endsWith(".vcf") || m.to.endsWith(".xml") ? m.to : prefix + m.to;
    const external = /^https?:/.test(to);
    const same = to === key;
    if (!external && !to.includes("#") && !to.endsWith(".vcf") && !to.endsWith(".xml")) routes.add(to);
    else if (!external && to.includes("#")) routes.add(to.split("#")[0]);
    rows.push({
      old: ORIGIN + key,
      new: external ? to : to,
      kind: same ? "mirror" : external ? "external" : "redirect",
      status: same ? 200 : 301,
      reason: m.reason + (live ? "" : " — old page was not live; redirect kept for links/rankings"),
      oldStatus,
    });
  }

  // CSV
  const csv = ["old_url,new_url,kind,http_status,old_status,reason", ...rows.map((r) => [r.old, r.new, r.kind, r.status, r.oldStatus, r.reason].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  fs.writeFileSync(path.join(MIG, "redirects.csv"), csv + "\n");

  const redirects = rows.filter((r) => r.kind === "redirect" || r.kind === "external");
  const rel = (u: string) => u.replace(ORIGIN, "");
  const dir = path.join(MIG, "redirects");
  fs.mkdirSync(dir, { recursive: true });

  // Netlify / Cloudflare Pages: query params matched with `key=value` syntax (Netlify); CF ignores them
  const nl = redirects.map((r) => {
    const [p, q] = rel(r.old).split("?");
    const enc = encodeURI(p);
    return q ? `${enc}  ${q.split("&").join(" ")}  ${r.new}  301!` : `${enc}  ${r.new}  301`;
  });
  fs.writeFileSync(path.join(dir, "_redirects"), "# Generated by migration/scripts/build-redirects.ts\n" + [...new Set(nl)].join("\n") + "\n");

  // Vercel
  const vr = redirects.map((r) => {
    const [p, q] = rel(r.old).split("?");
    const has = q ? q.split("&").map((kv) => ({ type: "query", key: kv.split("=")[0], value: kv.split("=")[1] ?? "" })) : undefined;
    return { source: encodeURI(p).replace(/[()]/g, "\\$&").replace(/:/g, "\\:"), destination: r.new, permanent: true, ...(has ? { has } : {}) };
  });
  const seen = new Set<string>();
  fs.writeFileSync(
    path.join(dir, "vercel.json"),
    JSON.stringify({ trailingSlash: true, redirects: vr.filter((v) => { const k = v.source + JSON.stringify(v.has ?? ""); return seen.has(k) ? false : (seen.add(k), true); }) }, null, 2),
  );

  // Apache (.htaccess): case-insensitive, exact path match, query-aware
  const ht = ["# Generated by migration/scripts/build-redirects.ts", "RewriteEngine On", ""];
  const htSeen = new Set<string>();
  for (const r of redirects) {
    const [p, q] = rel(r.old).split("?");
    const k = p + "?" + (q ?? "");
    if (htSeen.has(k)) continue;
    htSeen.add(k);
    const re = "^" + p.replace(/^\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s") + "$";
    if (q) ht.push(`RewriteCond %{QUERY_STRING} ^${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$ [NC]`);
    ht.push(`RewriteRule ${re} ${r.new.replace(/ /g, "%20")}${/^https?:/.test(r.new) || !q ? "" : "?"} [R=301,L,NC${q ? ",QSD" : ""}]`);
  }
  fs.writeFileSync(path.join(dir, ".htaccess"), ht.join("\n") + "\n");

  // Host-independent fallback stubs (only for paths that can be a folder)
  const stubs = path.join(dir, "stubs");
  fs.rmSync(stubs, { recursive: true, force: true });
  let stubCount = 0;
  for (const r of redirects) {
    const [p, q] = rel(r.old).split("?");
    if (q || /[<>:"|*]/.test(p)) continue;
    const f = path.join(stubs, decodeURIComponent(p).replace(/^\//, ""), "index.html");
    if (fs.existsSync(f)) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const target = /^https?:/.test(r.new) ? r.new : `https://www.insuringyouforless.com${r.new}`;
    fs.writeFileSync(f, `<!doctype html><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${target}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${r.new}"><a href="${r.new}">This page has moved.</a>\n`);
    stubCount++;
  }

  writeJson("new-routes.json", [...routes].sort());
  const k = (s: string) => rows.filter((r) => r.kind === s).length;
  console.log(`old URLs: ${rows.length} · mirror ${k("mirror")} · redirect ${k("redirect")} · external ${k("external")} · broken ${k("broken")} · new routes ${routes.size} · stubs ${stubCount}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
