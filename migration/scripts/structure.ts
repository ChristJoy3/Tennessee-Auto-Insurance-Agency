/**
 * Turn raw pages + JSON datasets into structured, verbatim content for the new site:
 *   migration/structured/{glossary,blog,testimonials,staff,offices,carriers,forms,quote-links}.json
 * These feed src/data/ (original + display). Nothing here is rewritten: `original` text only.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { MIG, ORIGIN, Lang, readJson, writeJson, basePath, slugify } from "./lib";

type PageLog = { lang: Lang; key: string; url: string; source: string; file?: string; status: number | null; finalUrl?: string };

const clean = (s: string) => s.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
const decodeHtml = (s: string) => cheerio.load(`<div>${s}</div>`)("div").text();

const log = readJson<PageLog[]>("crawl-log.json").filter((p) => p.file);
const load = (p: PageLog) => cheerio.load(fs.readFileSync(path.join(MIG, p.file!), "utf8"));
const pagesWhere = (re: RegExp) => log.filter((p) => re.test(basePath(p.key)));

/** Keep only safe, semantic markup from rich text (blog bodies): tags, links, images; drop styles/classes. */
function sanitize($: cheerio.CheerioAPI, html: string, base: string) {
  const $b = cheerio.load(`<div id="__root">${html}</div>`);
  const root = $b("#__root");
  root.find("script,style,meta,link,o\\:p,xml").remove();
  root.find("*").each((_, el) => {
    const e = el as unknown as { attribs: Record<string, string>; tagName: string };
    const keep: Record<string, string> = {};
    if (e.tagName === "a" && e.attribs.href) keep.href = new URL(e.attribs.href.trim(), base).href;
    if (e.tagName === "img") {
      keep.src = (e.attribs["data-src"] || e.attribs.src || "").startsWith("file:") ? e.attribs.src : new URL(e.attribs["data-src"] || e.attribs.src || "", base).href;
      keep.alt = e.attribs.alt ?? "";
    }
    if (e.tagName === "iframe" && e.attribs.src) keep.src = e.attribs.src;
    if (/^(td|th)$/.test(e.tagName)) {
      if (e.attribs.colspan) keep.colspan = e.attribs.colspan;
      if (e.attribs.rowspan) keep.rowspan = e.attribs.rowspan;
    }
    e.attribs = keep;
  });
  // unwrap presentational wrappers
  root.find("span,font,div").each((_, el) => {
    $b(el).replaceWith($b(el).contents());
  });
  return root.html()!.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/<p>\s*<\/p>/g, "").trim();
  void $;
}

function glossary() {
  const out: { lang: Lang; letter: string; oldUrl: string; intro: string; terms: { term: string; definition: string }[] }[] = [];
  for (const p of pagesWhere(/^\/glossary\/[a-z]\/$/)) {
    const $ = load(p);
    const letter = basePath(p.key).split("/")[2];
    const span = $("[id$=lbl_glossary]");
    const terms: { term: string; definition: string }[] = [];
    let cur: { term: string; definition: string } | null = null;
    span.contents().each((_, n) => {
      if (n.type === "tag" && (n as unknown as { tagName: string }).tagName === "b") {
        cur = { term: oneLine($(n).text()), definition: "" };
        terms.push(cur);
      } else if (cur) {
        const t = n.type === "text" ? (n as unknown as { data: string }).data : (n as unknown as { tagName: string }).tagName === "br" ? "\n" : $(n).text();
        cur.definition += t;
      }
    });
    terms.forEach((t) => (t.definition = clean(t.definition)));
    const intro = oneLine(
      $("#ctl00_tdBodyCenter").clone().find("blockquote,script,style,h1,h2").remove().end().text(),
    );
    out.push({ lang: p.lang, letter, oldUrl: p.url, intro, terms: terms.filter((t) => t.term) });
  }
  return out.sort((a, b) => (a.lang + a.letter).localeCompare(b.lang + b.letter));
}

function blog() {
  const posts: Record<string, unknown>[] = [];
  for (const p of pagesWhere(/^\/blog\/[^/]+\.aspx$/i)) {
    const $ = load(p);
    const panel = $(".blogEntryPanel").first();
    if (!panel.length) continue;
    const slug = basePath(p.key).replace(/^\/blog\//, "").replace(/\.aspx$/i, "");
    const body = panel.find("[itemprop=articleBody]");
    const images = body.find("img").map((_, i) => ({ src: $(i).attr("data-src") || $(i).attr("src"), alt: $(i).attr("alt") ?? "" })).get();
    const links = body.find("a[href]").map((_, a) => ({ label: oneLine($(a).text()), href: $(a).attr("href") })).get();
    const posted = oneLine(panel.text().match(/Posted\s+[0-9:]+\s*[AP]M/i)?.[0] ?? "");
    posts.push({
      lang: p.lang,
      slug,
      cleanSlug: slugify(slug),
      oldUrl: p.url,
      title: oneLine(panel.find("[itemprop=headline]").text()),
      datePublished: panel.find("[itemprop=datePublished]").attr("datetime"),
      dateLabel: oneLine(panel.find("[itemprop=datePublished]").text()),
      postedTime: posted,
      tags: panel.find("[itemprop=keywords] a").map((_, a) => oneLine($(a).text())).get(),
      metaDescription: $("meta[name=description]").attr("content") ?? "",
      bodyHtml: sanitize($, body.html() ?? "", p.url),
      bodyText: clean(body.text()),
      images,
      links,
    });
  }
  // Index-page teasers (excerpt + teaser image) — the excerpt text is also original content
  const teasers: Record<string, unknown>[] = [];
  for (const p of pagesWhere(/^\/blog\/(\d+\/)?$/)) {
    const $ = load(p);
    $("[itemprop=blogPost]").each((_, el) => {
      const a = $(el).find("[itemprop=headline] a").attr("href") ?? "";
      const bg = $(el).find("[style*=background-image]").attr("style")?.match(/url\(['"]?([^'")]+)/)?.[1];
      teasers.push({
        lang: p.lang,
        listPage: basePath(p.key),
        slug: a.replace(/^.*\/blog\//, "").replace(/\.aspx$/i, ""),
        excerpt: oneLine($(el).find("[itemprop=description]").text()),
        teaserImage: bg ?? $(el).find("img").not("[src*=spacer]").attr("src") ?? null,
      });
    });
  }
  return { posts: posts.sort((a, b) => String(b.datePublished).localeCompare(String(a.datePublished))), teasers };
}

function testimonials() {
  const data = readJson<{ text: string; name: string; location: string; timestamp: string; rating: number }[]>("raw/en/_data/testimonials.json");
  const page = log.find((p) => p.lang === "en" && /^\/testimonials(\.aspx|\/)$/i.test(basePath(p.key)));
  let overall: Record<string, string> = {};
  if (page) {
    const $ = load(page);
    const headerText = oneLine($("#ctl00_tdBodyCenter").text()).match(/(\d+) Reviews/);
    overall = {
      heading: oneLine($("h1").first().text()),
      averageRating: $("#ctl00_cph_main_overallRanking a").first().attr("title") ?? "",
      reviewCount: headerText?.[1] ?? "",
      leaveReviewUrl: $(".reviewFrame").attr("data-src") ?? "",
      sourcePage: page.url,
    };
  }
  return {
    overall,
    items: data.map((t, i) => ({
      id: `t${String(i + 1).padStart(3, "0")}`,
      original: decodeHtml(t.text).replace(/ /g, " ").trim(),
      name: t.name,
      location: t.location,
      date: t.timestamp,
      rating: t.rating,
    })),
  };
}

function staff() {
  const data = readJson<Record<string, string | boolean | number>[]>("raw/en/_data/employees.json");
  return data.map((e) => {
    const slug = String(e.profile_url).replace(/^.*\//, "").replace(/\.aspx$/, "");
    const prof = log.find((p) => p.lang === "en" && basePath(p.key).toLowerCase() === `/profile/${slug}.aspx`);
    let profileText = "";
    let vcard = "";
    if (prof) {
      const $ = load(prof);
      profileText = clean($("#ctl00_tdBodyCenter").text());
      vcard = $("a:contains('vCard')").attr("href") ?? "";
    }
    const vcfFile = path.join(MIG, "raw/en/_data/vcards", `${slug}.vcf`);
    const vcf = fs.existsSync(vcfFile) ? fs.readFileSync(vcfFile, "utf8") : "";
    const vEmail = vcf.match(/^EMAIL[^:]*:(.+)$/m)?.[1]?.trim() ?? "";
    return {
      slug,
      vcardEmail: vEmail,
      vcardRaw: vcf,
      name: e.contact,
      title: e.title,
      office: e.name,
      phoneLabel: e.phone_selector,
      phone: e.phone,
      alternatePhone: e.alternate_phone,
      profileText: e.profiletext || "",
      profilePageText: profileText,
      email: e.AgentEmail || "",
      showEmail: e.ShowEmployeeEmail,
      showPhone: e.ShowEmployeePhone,
      photoUrl: new URL(String(e.profile_image), ORIGIN).href,
      emailImageUrl: new URL(String(e.email_address), ORIGIN).href,
      vcardUrl: vcard ? new URL(vcard, ORIGIN).href : "",
      oldProfileUrl: ORIGIN + e.profile_url,
      oldContactUrl: ORIGIN + e.contact_url,
    };
  });
}

function offices() {
  const data = readJson<Record<string, string | number>[]>("raw/en/_data/locations.json");
  const loc = log.find((p) => p.lang === "en" && basePath(p.key) === "/locations/");
  const hours: Record<string, { day: string; hours: string }[]> = {};
  const staffBy: Record<string, string[]> = {};
  if (loc) {
    const $ = load(loc);
    const txt = oneLine($("#ctl00_tdBodyCenter").text());
    for (const o of data) {
      const name = String(o.name);
      const seg = txt.slice(txt.indexOf(name), txt.indexOf(name) + 900);
      hours[name] = [...seg.matchAll(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*([0-9:]+ [AP]M - [0-9:]+ [AP]M|Closed)/g)].map((m) => ({ day: m[1], hours: m[2] }));
      const staffSeg = seg.split("Staff")[1] ?? "";
      staffBy[name] = staffSeg.split(/\d+ \w+ Office|Smyrna Office|Murfreesboro Office/)[0].trim().split(/\s(?=[A-Z][a-z]+ [A-Z])/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return data.map((o) => ({ ...o, hours: hours[String(o.name)] ?? [], staff: staffBy[String(o.name)] ?? [] }));
}

function carriers() {
  const out: Record<string, unknown>[] = [];
  for (const [kind, re] of [["links", /^\/links(\.aspx|\/)$/i], ["payments", /^\/payments(\.aspx|\/)$/i]] as const) {
    const p = log.find((x) => x.lang === "en" && re.test(basePath(x.key)));
    if (!p) continue;
    const $ = load(p);
    $(".reveal.ins-mo").each((_, el) => {
      const title = oneLine($(el).find("h2.title").text());
      out.push({
        source: kind,
        title,
        name: title.replace(/\(.*?\)/g, "").trim(),
        phone: title.match(/Phone:\s*([0-9-]+)/)?.[1] ?? "",
        action: oneLine($(el).find("span").first().text()),
        logo: new URL($(el).find("img").attr("src") ?? "", ORIGIN).href,
        logoAlt: $(el).find("img").attr("alt") ?? "",
        urls: $(el).find(".ins-mo__text a").map((_, a) => $(a).attr("href")).get(),
        extraText: oneLine($(el).find(".ins-mo__text").text()),
      });
    });
  }
  const c = log.find((x) => x.lang === "en" && /^\/claims(\.aspx|\/)$/i.test(basePath(x.key)));
  if (c) {
    const $ = load(c);
    $("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const lines = clean(tds.eq(0).text()).split("\n").map((s) => s.trim()).filter(Boolean);
      out.push({ source: "claims", name: lines[0], phone: lines.slice(1).join(" "), websiteLabel: oneLine(tds.eq(1).text()), urls: tds.eq(1).find("a").map((_, a) => $(a).attr("href")).get() });
    });
  }
  // Home page "Featured Carriers" slider
  const home = log.find((x) => x.lang === "en" && basePath(x.key) === "/");
  if (home) {
    const $ = load(home);
    $(".bxslider img").each((_, i) => {
      out.push({ source: "home-featured", logo: new URL($(i).attr("src")!, ORIGIN).href, logoAlt: $(i).attr("alt") ?? "" });
    });
  }
  return out;
}

/** All quote links (per product) + every form's fields (labels, options, required messages). */
function formsAndQuotes() {
  const quotes = new Map<string, Set<string>>();
  const forms: Record<string, unknown>[] = [];
  for (const p of log) {
    const $ = load(p);
    $("a[href], option[value]").each((_, a) => {
      const h = $(a).attr("href") ?? $(a).attr("value") ?? "";
      if (/iwantinsurance\.com|_quote\.aspx|insurance_quote|quote\.aspx/i.test(h)) {
        const label = oneLine($(a).text());
        const k = `${label} → ${new URL(h, ORIGIN).href}`;
        (quotes.get(k) ?? quotes.set(k, new Set()).get(k)!).add(`${p.lang}:${basePath(p.key)}`);
      }
    });
    const body = $("#ctl00_tdBodyCenter");
    const fields = body.find("input:not([type=hidden]), select, textarea");
    if (fields.length >= 3 && p.lang === "en") {
      forms.push({
        page: basePath(p.key),
        oldUrl: p.url,
        finalUrl: p.finalUrl,
        fields: fields
          .map((_, f) => {
            const id = $(f).attr("id") ?? "";
            const lab = id ? oneLine(body.find(`label[for="${id}"]`).text()) : "";
            const row = $(f).closest("tr, .formRow, div");
            return {
              tag: f.tagName,
              type: $(f).attr("type") ?? "",
              name: $(f).attr("name") ?? id,
              label: lab || oneLine(row.find("label, .formFieldText, .formLabel").first().text()) || $(f).attr("placeholder") || "",
              options: f.tagName === "select" ? $(f).find("option").map((_, o) => oneLine($(o).text())).get() : undefined,
            };
          })
          .get()
          .filter((f) => !/captcha|__/i.test(String(f.name))),
        validationMessages: body.find("[id*=rfv], [id*=rev], .validator, span[style*='color:Red']").map((_, v) => oneLine($(v).text())).get().filter(Boolean),
      });
    }
  }
  return {
    quoteLinks: [...quotes].map(([k, pages]) => ({ link: k, pages: [...pages].sort() })).sort((a, b) => a.link.localeCompare(b.link)),
    forms,
  };
}

function main() {
  const dir = path.join(MIG, "structured");
  fs.mkdirSync(dir, { recursive: true });
  const g = glossary();
  writeJson("structured/glossary.json", g);
  const b = blog();
  writeJson("structured/blog.json", b);
  const t = testimonials();
  writeJson("structured/testimonials.json", t);
  writeJson("structured/staff.json", staff());
  writeJson("structured/offices.json", offices());
  writeJson("structured/carriers.json", carriers());
  const f = formsAndQuotes();
  writeJson("structured/quote-links.json", f.quoteLinks);
  writeJson("structured/forms.json", f.forms);
  console.log(
    `glossary: ${g.filter((x) => x.lang === "en").reduce((n, x) => n + x.terms.length, 0)} EN terms / ${g.filter((x) => x.lang === "es-us").reduce((n, x) => n + x.terms.length, 0)} ES terms`,
    `| blog: ${b.posts.filter((p) => p.lang === "en").length} EN / ${b.posts.filter((p) => p.lang === "es-us").length} ES posts`,
    `| testimonials: ${t.items.length} | forms: ${f.forms.length} | quote links: ${f.quoteLinks.length}`,
  );
}
main();
