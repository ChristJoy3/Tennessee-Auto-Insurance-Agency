import SiteShell, { rootMetadata } from "@/components/layouts/SiteShell";

export { viewport } from "@/components/layouts/SiteShell";
export const metadata = rootMetadata("en");

/** English root layout (all routes except /es-us/). */
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
