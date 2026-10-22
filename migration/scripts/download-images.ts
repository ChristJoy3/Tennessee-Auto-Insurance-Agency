/**
 * Download every image referenced by the old site (HTML, srcset, lazy attrs, inline styles,
 * linked CSS, JSON datasets, favicon) at the largest available size, rename meaningfully,
 * and write a manifest to migration/images.json.
 *
 * Output:
 *   migration/images-raw/<original-path>     untouched download (archive, incl. skipped/legacy files)
 *   public/images/<sub>/<meaningful-name>     original-format copy used by the new site
 *   public/logo.png, migration/old-favicon.ico
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { ORIGIN, MIG, ROOT, readJson, writeJson, fetchRetry, sleep, slugify } from "./lib";

type Found = { url: string; pages: string[] };
type Item = { type: string; src?: string; alt?: string; page: string; lang: string };

export type ImageRecord = {
  url: string;
  pages: string[];
  alts: string[];
  status: "downloaded" | "failed" | "skipped" | "duplicate";
  skipReason?: string;
  raw?: string; // migration/images-raw/...
  public?: string; // /images/... (site path)
  category?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  sha1?: string;
  duplicateOf?: string;
  lowRes?: boolean; // too small for large display (< 1200px wide for photos)
  shows?: string; // human description, filled by describe step
  note?: string;
};

const SKIP: [RegExp, string][] = [
  [/rightArrow\.png|\/arrow\.png|spacer\.gif|blank\.gif/i, "UI arrow/spacer"],
  [/fancybox|bx_loader|controls\.png|smallbuttongradient|grad_IE|search_icon/i, "UI chrome (template sprite/gradient)"],
  [/\/images\/(rss|googlereader|my-yahoo)\.png/i, "UI share icon (old AddThis toolbar)"],
  [/trkn\.us|googletagmanager|google-analytics|doubleclick|facebook\.com\/tr/i, "tracking pixel"],
  [/getitc|insurancewebsitebuilder.*badge|powered/i, "Powered by Insurance Website Builder badge"],
  [/^file:\/\//i, "broken: local file path pasted into blog editor"],
];

const LOB: Record<string, string> = { "01": "auto", "02": "renters", "03": "commercial-auto", "04": "homeowners", "05": "sr-22" };
const VALUE: Record<string, string> = { "1": "save-time", "2": "since-1998", "3": "save-money" };
const WAYS: Record<string, string> = { "0": "background", "1": "quote-now", "2": "call-us", "3": "stop-by" };

function cssUrls(css: string, base: string): string[] {
  return [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith("data:"))
    .map((u) => new URL(u, base).href);
}

/** Try to reach a larger rendition of the same image (size params, dynimage wrappers). */
function candidates(url: string): string[] {
  const out: string[] = [];
  const u = new URL(url);
  // blog_image.dynimage?src=%2fimg%2f... -> the original file
  const src = u.searchParams.get("src");
  if (/dynimage/i.test(u.pathname) && src) out.push(new URL(decodeURIComponent(src).replace(/%2f/gi, "/"), ORIGIN).href);
  for (const p of ["w", "h", "width", "height", "maxwidth", "maxheight", "size", "thumb"]) {
    if (u.searchParams.has(p)) {
      const v = new URL(url);
      [...v.searchParams.keys()].filter((k) => /^(w|h|width|height|maxwidth|maxheight|size|thumb)$/i.test(k)).forEach((k) => v.searchParams.delete(k));
      out.push(v.href);
      break;
    }
  }
  if (/employee_photo\.dynimage/i.test(u.pathname)) {
    const v = new URL(url);
    v.searchParams.set("w", "1200");
    out.push(v.href);
  }
  out.push(url);
  return [...new Set(out)];
}

function rawPathFor(url: string): string {
  const u = new URL(url);
  const host = u.hostname === new URL(ORIGIN).hostname ? "" : u.hostname + "/";
  let p = decodeURIComponent(u.pathname).replace(/^\/+/, "").replace(/~/g, "_");
  if (u.search) p += "__" + crypto.createHash("sha1").update(u.search).digest("hex").slice(0, 10);
  return path.join("images-raw", host + p).replace(/[<>:"|?*]/g, "_");
}

function main() {
  return run();
}

async function run() {
  // assets-found.json is written at the end of a full crawl; without it, fall back to the
  // site stylesheets (hero/background images live there) — <img> refs come from the inventory.
  const found: Found[] = fs.existsSync(path.join(MIG, "assets-found.json"))
    ? readJson<Found[]>("assets-found.json")
    : ["/style.css", "/img/~www.insuringyouforless.com/carriers/jquery.bxslider.css", "/img/resources/responsive.min.css"].map((p) => ({ url: ORIGIN + p, pages: ["en:/"] }));
  const inv = readJson<Item[]>("content-inventory.json").filter((i) => i.type === "image" && i.src);
  const employees = readJson<{ contact: string; profile_image: string }[]>("raw/en/_data/employees.json");

  const refs = new Map<string, { pages: Set<string>; alts: Set<string> }>();
  const addRef = (url: string, page?: string, alt?: string) => {
    let u: string;
    try {
      u = new URL(url, ORIGIN).href;
    } catch {
      u = url;
    }
    const r = refs.get(u) ?? refs.set(u, { pages: new Set(), alts: new Set() }).get(u)!;
    if (page) r.pages.add(page);
    if (alt) r.alts.add(alt);
  };

  // 1) HTML-level references
  const cssFiles: Found[] = [];
  for (const f of found) {
    if (/\.css(\?|$)/i.test(f.url)) cssFiles.push(f);
    else if (/\.(png|jpe?g|gif|webp|svg|ico|bmp)(\?|$)|dynimage/i.test(f.url)) f.pages.forEach((p) => addRef(f.url, p));
  }
  for (const i of inv) addRef(i.src!, `${i.lang}:${i.page}`, i.alt);

  // 2) CSS-referenced images (hero slides, backgrounds)
  const cssSeen = new Set<string>();
  for (const c of cssFiles) {
    if (cssSeen.has(c.url) || !c.url.includes(new URL(ORIGIN).hostname)) continue;
    cssSeen.add(c.url);
    const res = await fetchRetry(c.url);
    if (!res?.ok) continue;
    const css = await res.text();
    const dest = path.join(MIG, rawPathFor(c.url));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, css);
    for (const u of cssUrls(css, c.url)) addRef(u, `css:${new URL(c.url).pathname}`);
  }

  // 3) Datasets (staff photos)
  for (const e of employees) addRef(new URL(e.profile_image, ORIGIN).href, "data:employees", e.contact);

  // 4) Checklist + favicon
  for (const p of ["layout-assets/logo.png", "favicon.ico", "layout-assets/3ways_0.jpg"])
    addRef(`${ORIGIN}/img/~www.insuringyouforless.com/${p}`, "checklist");

  const staffByGuid = new Map(employees.map((e) => [new URL(e.profile_image, ORIGIN).searchParams.get("guid")?.toLowerCase(), e.contact]));
  const records: ImageRecord[] = [];
  const byHash = new Map<string, string>();
  const usedNames = new Set<string>();
  const blogCount = new Map<string, number>();
  const photoCount = new Map<string, number>();

  for (const [url, ref] of [...refs].sort((a, b) => a[0].localeCompare(b[0]))) {
    const rec: ImageRecord = { url, pages: [...ref.pages].sort(), alts: [...ref.alts].filter(Boolean), status: "failed" };
    records.push(rec);
    const skip = SKIP.find(([re]) => re.test(url));
    if (skip) {
      rec.status = "skipped";
      rec.skipReason = skip[1];
      if (!/^file:/i.test(url) && !/tracking/.test(skip[1])) await download(rec, [url], false);
      continue;
    }
    if (!/^https?:/i.test(url)) {
      rec.skipReason = "unsupported URL scheme";
      continue;
    }
    await download(rec, candidates(url), true);
    await sleep(120);
  }

  async function download(rec: ImageRecord, urls: string[], place: boolean) {
    let best: { buf: Buffer; w: number; h: number; fmt: string; from: string } | null = null;
    for (const u of urls) {
      const res = await fetchRetry(u, {}, 3);
      if (!res?.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      try {
        const m = await sharp(buf, { animated: true }).metadata();
        if (!m.width) continue;
        if (!best || m.width * (m.height ?? 1) > best.w * best.h) best = { buf, w: m.width, h: m.height ?? 0, fmt: m.format ?? "bin", from: u };
      } catch {
        if (/\.ico(\?|$)/i.test(u) && buf.length > 0 && !best) best = { buf, w: 0, h: 0, fmt: "ico", from: u };
      }
    }
    if (!best) {
      rec.status = place ? "failed" : rec.status;
      rec.note = (rec.note ? rec.note + "; " : "") + "could not download";
      return;
    }
    if (best.from !== rec.url) rec.note = `larger version from ${best.from}`;
    rec.width = best.w || undefined;
    rec.height = best.h || undefined;
    rec.bytes = best.buf.length;
    rec.format = best.fmt;
    rec.sha1 = crypto.createHash("sha1").update(best.buf).digest("hex");
    rec.raw = rawPathFor(rec.url);
    const rawAbs = path.join(MIG, rec.raw);
    fs.mkdirSync(path.dirname(rawAbs), { recursive: true });
    fs.writeFileSync(rawAbs, best.buf);
    if (!place) return;
    rec.status = "downloaded";

    if (byHash.has(rec.sha1)) {
      rec.status = "duplicate";
      rec.duplicateOf = byHash.get(rec.sha1);
      rec.public = records.find((r) => r.url === rec.duplicateOf)?.public;
      return;
    }
    byHash.set(rec.sha1, rec.url);

    const [category, name] = nameFor(rec, best.fmt);
    rec.category = category;
    if (category === "favicon") {
      fs.writeFileSync(path.join(MIG, `old-favicon.${best.fmt === "ico" ? "ico" : best.fmt}`), best.buf);
      return;
    }
    let file = `${name}.${extOf(best.fmt)}`;
    for (let n = 2; usedNames.has(`${category}/${file}`); n++) file = `${name}-${n}.${extOf(best.fmt)}`;
    usedNames.add(`${category}/${file}`);
    const dest = path.join(ROOT, "public", "images", category, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, best.buf);
    rec.public = `/images/${category}/${file}`;
    rec.lowRes = category === "photos" || category === "blog" ? best.w < 1200 : category === "staff" ? best.w < 400 : false;
    if (category === "brand" && name === "logo") fs.writeFileSync(path.join(MIG, "logo-original.png"), best.buf);
  }

  function extOf(fmt: string) {
    return fmt === "jpeg" ? "jpg" : fmt === "svg" ? "svg" : fmt;
  }

  function nameFor(rec: ImageRecord, fmt: string): [string, string] {
    const u = new URL(rec.url);
    const file = decodeURIComponent(u.pathname.split("/").pop() ?? "img").replace(/\.[a-z0-9]+$/i, "");
    const lower = u.pathname.toLowerCase();
    if (/favicon/.test(lower)) return ["favicon", "favicon"];
    if (/layout-assets\/logo\./.test(lower)) return ["brand", "logo"];
    let m;
    if ((m = lower.match(/lob_btn_(\d+)/))) return ["icons", `legacy-icon-${LOB[m[1]] ?? m[1]}`];
    if ((m = lower.match(/layout-assets\/icon(\d)/))) return ["icons", `legacy-value-${VALUE[m[1]] ?? m[1]}`];
    if ((m = lower.match(/3ways_(\d)/))) return [m[1] === "0" ? "photos" : "icons", `${m[1] === "0" ? "three-ways" : "legacy-3ways"}-${WAYS[m[1]]}`];
    if ((m = lower.match(/header_img_(\d+)/))) return ["photos", `hero-slide-${m[1].padStart(2, "0")}`];
    if (/testi_bg/.test(lower)) return ["photos", "testimonials-background"];
    if (/\/carriers\//.test(lower)) {
      const alt = rec.alts.find((a) => a && a !== "Carrier");
      const carrier = alt ? alt.replace(/\(.*?\)/g, "").trim() : file.replace(/-logo$/, "");
      return ["carriers", `carrier-${slugify(carrier)}`];
    }
    if (/employee_photo/.test(lower)) {
      const who = staffByGuid.get(u.searchParams.get("guid")?.toLowerCase()) ?? rec.alts[0] ?? "unknown";
      return ["staff", `staff-${slugify(who)}`];
    }
    const blogPage = rec.pages.find((p) => /:\/blog\/.+\.aspx/.test(p));
    if (blogPage) {
      const slug = blogPage.replace(/^.*\/blog\//, "").replace(/\.aspx.*$/, "").slice(0, 60);
      const n = (blogCount.get(slug) ?? 0) + 1;
      blogCount.set(slug, n);
      return ["blog", `blog-${slugify(slug)}-${String(n).padStart(2, "0")}`];
    }
    if (/\/library\//i.test(lower) || /buttons?\//i.test(lower)) return ["legacy-ui", slugify(file)];
    const pageSlug = slugify((rec.pages.find((p) => !p.startsWith("css:")) ?? "site").replace(/^[a-z-]+:/, "")) || "home";
    const n = (photoCount.get(pageSlug) ?? 0) + 1;
    photoCount.set(pageSlug, n);
    void fmt;
    return ["photos", `${pageSlug}-${String(n).padStart(2, "0")}`];
  }

  // Logo to public/logo.png (user-placed file is never overwritten silently)
  const logo = records.find((r) => r.category === "brand" && r.public);
  if (logo) {
    const target = path.join(ROOT, "public", "logo.png");
    if (fs.existsSync(target)) console.warn("public/logo.png already exists: NOT overwritten. Compare with migration/logo-original.png");
    else fs.copyFileSync(path.join(ROOT, "public", logo.public!), target);
  }

  writeJson("images.json", records);
  const c = (s: string) => records.filter((r) => r.status === s).length;
  console.log(`images: ${records.length} refs · downloaded ${c("downloaded")} · duplicate ${c("duplicate")} · skipped ${c("skipped")} · failed ${c("failed")}`);
}

main();
