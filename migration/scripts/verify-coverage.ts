/**
 * Verify the static export in out/ covers 100% of the old site:
 *   1. every inventory text item's key phrase appears in some built HTML page (same language)
 *   2. every downloaded image (public/images/...) is referenced by some built page
 *   3. every old URL has a built page or a redirect entry
 * Items explicitly approved for omission are read from migration/approved-omissions.json.
 * Usage: npx tsx migration/scripts/verify-coverage.ts   (after `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, MIG, readJson } from "./lib";

type Item = { id: string; lang: string; page: string; type: string; originalText: string; region: string; href?: string; src?: string };
type Img = { url: string; status: string; public?: string };

const OUT = path.join(ROOT, "out");
const norm = (s: string) =>
  s.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();

function walk(dir: string, acc: string[] = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, acc);
    else if (f.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Key phrase: the longest run of up to 12 words from the item (short items are used whole). */
function keyPhrase(t: string) {
  const words = norm(t).split(" ");
  if (words.length <= 12) return words.join(" ");
  const mid = Math.floor(words.length / 2);
  return words.slice(Math.max(0, mid - 6), mid + 6).join(" ");
}

function main() {
  if (!fs.existsSync(OUT)) throw new Error("out/ not found: run `npm run build` first");
  const approved = new Set<string>(fs.existsSync(path.join(MIG, "approved-omissions.json")) ? readJson<string[]>("approved-omissions.json") : []);
  const files = walk(OUT);
  const textByLang: Record<string, string> = { en: "", "es-us": "" };
  const rawAll = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    const lang = path.relative(OUT, f).startsWith("es-us") ? "es-us" : "en";
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, (s) => (/application\/(ld\+)?json/.test(s) ? s : " "))
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    textByLang[lang] += " " + norm(text) + " " + norm(html.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
  }

  const items = readJson<Item[]>("content-inventory.json");
  const missingText: Item[] = [];
  let checked = 0;
  for (const i of items) {
    if (approved.has(i.id) || i.type === "image" || i.type === "embed") continue;
    if (i.type === "link") {
      if (i.href && /^https?:/.test(i.href) && !/insuringyouforless\.com/.test(i.href)) {
        checked++;
        if (!rawAll.includes(i.href.replace(/&/g, "&amp;")) && !rawAll.includes(i.href)) missingText.push(i);
      }
      continue;
    }
    if (!i.originalText || i.originalText.length < 3) continue;
    checked++;
    const kp = keyPhrase(i.originalText);
    if (!textByLang[i.lang]?.includes(kp)) missingText.push(i);
  }

  const imgs = readJson<Img[]>("images.json").filter((i) => i.status === "downloaded" && i.public);
  const missingImg = imgs.filter((i) => !approved.has(i.url) && !rawAll.includes(path.basename(i.public!).replace(/\.[^.]+$/, "")));

  const csv = fs.readFileSync(path.join(MIG, "redirects.csv"), "utf8").trim().split("\n").slice(1);
  const missingUrl: string[] = [];
  for (const line of csv) {
    const [oldUrl, newUrl, kind] = line.split(",").map((s) => s.replace(/^"|"$/g, ""));
    if (kind === "broken" || kind === "external") continue;
    const p = newUrl.split("#")[0];
    if (p.endsWith(".vcf") || p.endsWith(".xml")) {
      if (!fs.existsSync(path.join(OUT, p))) missingUrl.push(`${oldUrl} → ${newUrl}`);
      continue;
    }
    if (!fs.existsSync(path.join(OUT, decodeURIComponent(p), "index.html"))) missingUrl.push(`${oldUrl} → ${newUrl}`);
  }

  const pct = (miss: number, total: number) => (total ? (((total - miss) / total) * 100).toFixed(2) : "100.00");
  const report = [
    `# Coverage check (${new Date().toISOString()})`,
    `- Text/link items: ${checked - missingText.length}/${checked} (${pct(missingText.length, checked)}%)`,
    `- Images: ${imgs.length - missingImg.length}/${imgs.length} (${pct(missingImg.length, imgs.length)}%)`,
    `- Old URLs with page or redirect: ${csv.length - missingUrl.length}/${csv.length}`,
    "",
    missingText.length ? "## Missing text/links\n" + missingText.map((i) => `- [${i.id}] (${i.type}) ${i.originalText.slice(0, 120).replace(/\n/g, " ")}${i.href ? " → " + i.href : ""}`).join("\n") : "## Missing text/links\nNone.",
    missingImg.length ? "## Unreferenced images\n" + missingImg.map((i) => `- ${i.public} (${i.url})`).join("\n") : "## Unreferenced images\nNone.",
    missingUrl.length ? "## Old URLs without a built target\n" + missingUrl.map((u) => `- ${u}`).join("\n") : "## Old URLs without a built target\nNone.",
  ].join("\n");
  fs.writeFileSync(path.join(MIG, "COVERAGE_REPORT.md"), report + "\n");
  console.log(report.split("\n").slice(0, 5).join("\n"));
  process.exitCode = missingText.length || missingImg.length || missingUrl.length ? 1 : 0;
}
main();
