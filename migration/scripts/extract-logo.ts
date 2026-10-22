/**
 * Fetch the old site's logo + favicon at the largest available size and report how it
 * compares with any public/logo.png already in place (never overwrites without --force).
 * download-images.ts does the same as part of the full image pass; this is the standalone check.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ORIGIN, ROOT, MIG, fetchRetry } from "./lib";

const LOGO_URL = `${ORIGIN}/img/~www.insuringyouforless.com/layout-assets/logo.png`;
const FAVICON_URL = `${ORIGIN}/img/~www.insuringyouforless.com/favicon.ico`;

async function main() {
  const res = await fetchRetry(LOGO_URL);
  if (!res?.ok) throw new Error("logo download failed");
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  fs.writeFileSync(path.join(MIG, "logo-original.png"), buf);
  console.log(`old-site logo: ${meta.width}×${meta.height} ${meta.format} alpha=${meta.hasAlpha}`);

  const target = path.join(ROOT, "public", "logo.png");
  if (fs.existsSync(target)) {
    const cur = await sharp(target).metadata();
    console.log(`existing public/logo.png: ${cur.width}×${cur.height} ${cur.format}`);
    if (!process.argv.includes("--force")) {
      console.log("Not overwriting. Re-run with --force to replace it with the old-site logo.");
      return;
    }
  }
  fs.writeFileSync(target, buf);
  console.log("saved public/logo.png");

  const fav = await fetchRetry(FAVICON_URL);
  if (fav?.ok) {
    fs.writeFileSync(path.join(MIG, "old-favicon.ico"), Buffer.from(await fav.arrayBuffer()));
    console.log("saved migration/old-favicon.ico");
  }
}
main();
