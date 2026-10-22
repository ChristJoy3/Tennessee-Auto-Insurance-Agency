/**
 * Generate the favicon / app-icon set from public/logo.png without altering the logo:
 * proportional resize only, centered on a square canvas with a neutral background.
 *
 *   Option A ("full")  the complete logo, letterboxed.
 *   Option B ("mark")  the oval "AIA" mark alone, as an unaltered proportional REGION of
 *                      the original (crop box below), only because the full logo is
 *                      unreadable at 16–48px.
 *
 * Previews of both go to migration/favicon-previews/. The installed set uses
 *   --small=<A|B> for favicon.ico (16/32/48)   default B
 *   --large=<A|B> for 180/192/512 icons        default A
 * Usage: npx tsx migration/scripts/generate-favicons.ts [--small=B] [--large=A]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, MIG } from "./lib";

const LOGO = path.join(ROOT, "public", "logo.png");
const BG = "#ffffff"; // the logo's red hairline type has a white matte: keep it on white
const THEME = "#d2232a"; // brand red from the old site's CSS + logo
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const SMALL = (args.small ?? "B").toUpperCase();
const LARGE = (args.large ?? "A").toUpperCase();

/** Bounding box of the oval mark inside the 178×107 original (measured from the alpha channel). */
async function markBox() {
  const { data, info } = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // The oval is the large solid-red region: find rows/cols where red coverage is substantial.
  const W = info.width, H = info.height;
  const solid = (x: number, y: number) => {
    const i = (y * W + x) * 4;
    return data[i + 3] > 200 && data[i] > 150 && data[i + 1] < 90;
  };
  const rowFill = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => +solid(x, y)).reduce((a, b) => a + b, 0));
  const colFill = Array.from({ length: W }, (_, x) => Array.from({ length: H }, (_, y) => +solid(x, y)).reduce((a, b) => a + b, 0));
  const rows = rowFill.map((v, i) => [v, i]).filter(([v]) => v > W * 0.35).map(([, i]) => i);
  const cols = colFill.map((v, i) => [v, i]).filter(([v]) => v > H * 0.12).map(([, i]) => i);
  const top = Math.min(...rows), bottom = Math.max(...rows), left = Math.min(...cols), right = Math.max(...cols);
  // Expand to include the oval's rounded ends, keep inside image bounds
  const padX = Math.round((right - left) * 0.04), padY = Math.round((bottom - top) * 0.12);
  const box = {
    left: Math.max(0, left - padX),
    top: Math.max(0, top - padY),
    width: Math.min(W, right + padX) - Math.max(0, left - padX),
    height: Math.min(H, bottom + padY) - Math.max(0, top - padY),
  };
  return box;
}

async function square(src: Buffer, size: number, paddingRatio: number, bg = BG) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const fitted = await sharp(src).resize(inner, inner, { fit: "inside", kernel: "lanczos3" }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: fitted, gravity: "centre" }])
    .png()
    .toBuffer();
}

/** Minimal ICO writer: PNG-compressed entries (supported by all modern browsers). */
function ico(pngs: { size: number; buf: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

async function main() {
  if (!fs.existsSync(LOGO)) throw new Error("public/logo.png missing: run download-images first");
  const full = fs.readFileSync(LOGO);
  const box = await markBox();
  const mark = await sharp(full).extract(box).png().toBuffer();
  const variants: Record<string, Buffer> = { A: full, B: mark };

  // Previews (both options, all sizes) + a side-by-side sheet
  const prevDir = path.join(MIG, "favicon-previews");
  fs.mkdirSync(prevDir, { recursive: true });
  const sizes = [16, 32, 48, 180, 192, 512];
  const sheet: sharp.OverlayOptions[] = [];
  for (const [k, src] of Object.entries(variants)) {
    let x = 20;
    for (const s of sizes) {
      const pad = s <= 48 ? 0.02 : 0.1;
      const b = await square(src, s, pad);
      fs.writeFileSync(path.join(prevDir, `option-${k}-${s}.png`), b);
      // show small sizes at 4× (nearest) so the real pixels are visible
      const shown = s <= 48 ? await sharp(b).resize(s * 4, s * 4, { kernel: "nearest" }).png().toBuffer() : s > 192 ? await sharp(b).resize(256).png().toBuffer() : b;
      sheet.push({ input: shown, left: x, top: k === "A" ? 20 : 320 });
      x += (s <= 48 ? s * 4 : Math.min(s, 256)) + 30;
    }
  }
  await sharp({ create: { width: 1300, height: 620, channels: 4, background: "#e9e6e1" } })
    .composite(sheet)
    .png()
    .toFile(path.join(prevDir, "comparison-sheet.png"));
  fs.writeFileSync(path.join(prevDir, "mark-crop-box.json"), JSON.stringify({ source: "public/logo.png 178x107", box }, null, 2));

  // Installed set
  const small = variants[SMALL];
  const large = variants[LARGE];
  const app = path.join(ROOT, "src", "app");
  const icoBuf = ico(await Promise.all([16, 32, 48].map(async (s) => ({ size: s, buf: await square(small, s, 0.02) }))));
  fs.writeFileSync(path.join(app, "favicon.ico"), icoBuf);
  fs.writeFileSync(path.join(app, "icon.png"), await square(large, 512, 0.1));
  fs.writeFileSync(path.join(app, "apple-icon.png"), await square(large, 180, 0.1)); // solid white bg
  fs.writeFileSync(path.join(ROOT, "public", "icon-192.png"), await square(large, 192, 0.1));
  fs.writeFileSync(path.join(ROOT, "public", "icon-512.png"), await square(large, 512, 0.1));
  fs.writeFileSync(path.join(ROOT, "public", "icon-maskable-512.png"), await square(large, 512, 0.2)); // safe zone
  fs.writeFileSync(
    path.join(ROOT, "public", "site.webmanifest"),
    JSON.stringify(
      {
        name: "Tennessee Auto Insurance Agency",
        short_name: "TNAIA",
        start_url: "/",
        display: "standalone",
        theme_color: THEME,
        background_color: "#ffffff",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      null,
      2,
    ),
  );

  // Open Graph image: logo on a light brand surface, 1200×630 (logo shown at max 2× its native size)
  const ogLogo = await sharp(full).resize({ width: 356, kernel: "lanczos3" }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#ffffff" } })
    .composite([
      { input: Buffer.from(`<svg width="1200" height="630"><rect x="0" y="600" width="1200" height="30" fill="${THEME}"/></svg>`), left: 0, top: 0 },
      { input: ogLogo, gravity: "centre" },
    ])
    .png()
    .toFile(path.join(ROOT, "public", "og-image.png"));

  console.log(`favicon.ico: option ${SMALL} · app icons: option ${LARGE} · mark box ${JSON.stringify(box)}`);
  console.warn("NOTE: icons ≥180px upscale a 178×107 logo; request a vector/high-res logo from the client.");
}
main();
