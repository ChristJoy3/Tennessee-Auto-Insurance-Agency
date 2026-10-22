/**
 * Shared helpers for the migration scripts (crawl, extract, images, redirects, verify).
 * Run any script with: npx tsx migration/scripts/<name>.ts
 */
import fs from "node:fs";
import path from "node:path";

export const ORIGIN = "https://www.insuringyouforless.com";
export const HOST = "www.insuringyouforless.com";
export const ROOT = path.resolve(import.meta.dirname, "..", "..");
export const MIG = path.join(ROOT, "migration");
export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

export type Lang = "en" | "es-us";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(MIG, file), "utf8")) as T;
}
export function writeJson(file: string, data: unknown) {
  const p = path.join(MIG, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

/** Normalize an old-site URL to a comparable path key ("/blog/x.aspx", "/category.aspx?id=MISC1"). */
export function toKey(href: string, base = ORIGIN + "/"): string | null {
  let u: URL;
  try {
    u = new URL(href.trim(), base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^insuringyouforless\.com$/, HOST);
  if (host !== HOST) return null;
  let p = decodeURIComponent(u.pathname).replace(/\/{2,}/g, "/");
  if (p.toLowerCase() === "/default.aspx") p = "/";
  if (p.toLowerCase() === "/es-us/default.aspx") p = "/es-us/";
  return p + (u.search || "");
}

export function langOf(key: string): Lang {
  return key.toLowerCase().startsWith("/es-us/") || key.toLowerCase() === "/es-us" ? "es-us" : "en";
}

/** Strip the /es-us prefix so EN and ES versions share the same logical path. */
export function basePath(key: string): string {
  const k = key.replace(/^\/es-us(?=\/|$)/i, "");
  return k === "" ? "/" : k;
}

/** Filesystem-safe file path for a raw HTML snapshot. */
export function rawFile(lang: Lang, key: string): string {
  let p = basePath(key);
  const [pathname, query] = p.split("?");
  p = pathname;
  if (p.endsWith("/")) p += "index";
  p = p.replace(/^\//, "").replace(/[<>:"|*]/g, "_");
  if (query) p += "__" + query.replace(/[^a-z0-9=&_-]/gi, "_");
  return path.join(MIG, "raw", lang, p + ".html");
}

/** fetch with retries; returns null on hard failure. Callers must read the body inside try/catch. */
export async function fetchRetry(
  url: string,
  init: RequestInit = {},
  tries = 5,
  timeoutMs = 60000,
): Promise<Response | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", ...(init.headers || {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status < 500 && res.status !== 429) return res;
    } catch {
      /* retry */
    }
    await sleep(800 * (i + 1));
  }
  return null;
}

/** Fetch and fully read a text body, with retries covering slow body reads too. */
export async function fetchText(
  url: string,
  init: RequestInit = {},
  tries = 5,
  timeoutMs = 180000,
): Promise<{ status: number; url: string; type: string; text: string } | null> {
  let last: { status: number; url: string; type: string; text: string } | null = null;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", ...(init.headers || {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      last = { status: res.status, url: res.url, type: res.headers.get("content-type") ?? "", text };
      if (res.status < 500 && res.status !== 429) return last;
    } catch {
      /* retry */
    }
    await sleep(1000 * (i + 1));
  }
  return last;
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
