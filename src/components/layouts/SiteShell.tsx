import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { HTML_LANG, type Lang } from "@/lib/i18n";
import { NAME, SITE_URL } from "@/lib/site";
import { JsonLd, orgJsonLd } from "@/lib/seo";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Navbar from "@/components/ui/Navbar";
import MobileActionBar from "@/components/ui/MobileActionBar";
import Cursor from "@/components/ui/Cursor";
import Footer from "@/components/sections/Footer";

export const viewport: Viewport = {
  themeColor: "#d2232a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function rootMetadata(lang: Lang): Metadata {
  const es = lang === "es";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: es
        ? "Seguro de auto en Murfreesboro y Smyrna, TN | Tennessee Auto Insurance Agency"
        : "Auto Insurance in Murfreesboro & Smyrna, TN | Tennessee Auto Insurance Agency",
      template: `%s | ${NAME}`,
    },
    description: es
      ? "Agencia de seguros independiente en Murfreesboro y Smyrna, TN, desde 1998. Seguro de auto, SR-22, restablecimiento de licencia, motocicleta, inquilinos y más."
      : "Independent insurance agency in Murfreesboro & Smyrna, TN since 1998. Auto insurance, SR-22, license reinstatement, motorcycle, renters, homeowners, boat and RV.",
    applicationName: NAME,
    manifest: "/site.webmanifest",
    icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }], apple: "/apple-icon.png" },
    formatDetection: { telephone: true },
  };
}

/** Root <html> for one language. Each language has its own root layout so `lang` is correct in static HTML. */
export default function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={HTML_LANG[lang]} className={fontVars}>
      <body className="grain min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          {lang === "es" ? "Saltar al contenido" : "Skip to content"}
        </a>
        <SmoothScroll>
          <Navbar lang={lang} />
          <main id="main">{children}</main>
          <Footer lang={lang} />
        </SmoothScroll>
        <MobileActionBar lang={lang} />
        <Cursor />
        <JsonLd data={orgJsonLd()} />
      </body>
    </html>
  );
}
