import SiteShell, { rootMetadata } from "@/components/layouts/SiteShell";

export { viewport } from "@/components/layouts/SiteShell";
export const metadata = rootMetadata("es");

/** Spanish root layout: /es-us/ mirrors the old site's Spanish URLs. */
export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="es">{children}</SiteShell>;
}
