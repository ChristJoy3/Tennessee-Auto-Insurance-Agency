import "./globals.css";
import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = { title: "Page not found | Tennessee Auto Insurance Agency" };

/** 404 for the whole site (two root layouts, so no single layout can compose it). Bilingual. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVars}>
      <body className="contours flex min-h-dvh items-center">
        <main className="wrap py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Tennessee Auto Insurance Agency logo" width={119} height={72} className="rounded-xl bg-white p-1" />
          <p className="mile mt-10 text-red">MILE 404 / OFF ROUTE</p>
          <h1 className="display h-lg mt-5">This road doesn&apos;t go anywhere.</h1>
          <p className="lead mt-4 text-muted" lang="es">Esta página no existe.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/" className="btn btn-red">Back home</a>
            <a href="/es-us/" className="btn btn-line">Inicio en español</a>
            <a href="tel:6158936177" className="btn btn-line">(615) 893-6177</a>
          </div>
        </main>
      </body>
    </html>
  );
}
