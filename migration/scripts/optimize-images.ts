/**
 * Create AVIF + WebP renditions (2–3 responsive widths, never upscaled) next to each
 * original in public/images/. Carrier logos and the brand logo are only re-encoded
 * losslessly-ish (no recolor/crop). Writes migration/images-optimized.json.
 *
 *   public/images/photos/hero-slide-01.jpg            original (fallback)
 *   public/images/photos/hero-slide-01-640.avif|webp  responsive renditions
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, writeJson } from "./lib";

const DIR = path.join(ROOT, "public", "images");
const WIDTHS: Record<string, number[]> = {
  photos: [640, 1280, 1920],
  blog: [480, 960, 1440],
  staff: [240, 480, 720],
  carriers: [160, 320],
  icons: [96, 192],
  brand: [178, 356],
  "legacy-ui": [],
};

async function main() {
  const out: Record<string, { width: number; height: number; renditions: string[] }> = {};
  for (const sub of fs.readdirSync(DIR)) {
    const widths = WIDTHS[sub] ?? [640, 1280];
    for (const file of fs.readdirSync(path.join(DIR, sub))) {
      if (!/\.(jpe?g|png|webp|gif)$/i.test(file) || /-\d+\.(avif|webp)$/.test(file)) continue;
      const src = path.join(DIR, sub, file);
      const meta = await sharp(src).metadata();
      if (!meta.width || !meta.height) continue;
      const base = file.replace(/\.[^.]+$/, "");
      // Never upscale: keep widths below the original, plus the original width itself
      const ws = [...new Set([...widths.filter((w) => w < meta.width!), meta.width])].sort((a, b) => a - b);
      const renditions: string[] = [];
      for (const w of ws) {
        for (const fmt of (process.env.AVIF ? ["avif", "webp"] : ["webp"]) as ("avif" | "webp")[]) {
          const name = `${base}-${w}.${fmt}`;
          const dest = path.join(DIR, sub, name);
          if (!fs.existsSync(dest)) {
            const img = sharp(src).resize({ width: w, withoutEnlargement: true });
            await (fmt === "avif" ? img.avif({ quality: sub === "carriers" || sub === "brand" ? 80 : 55 }) : img.webp({ quality: sub === "carriers" || sub === "brand" ? 92 : 78 })).toFile(dest);
          }
          renditions.push(`/images/${sub}/${name}`);
        }
      }
      out[`/images/${sub}/${file}`] = { width: meta.width, height: meta.height, renditions };
    }
  }
  writeJson("images-optimized.json", out);
  console.log(`optimized ${Object.keys(out).length} images`);
}
main();
