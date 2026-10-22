"use client";
import { usePathname } from "next/navigation";
import { altPath, type Lang } from "@/lib/i18n";

/** EN/ES switch that keeps you on the same page in the other language. */
export default function LanguageToggle({ lang, className = "" }: { lang: Lang; className?: string }) {
  const pathname = usePathname() || "/";
  const alt = altPath(pathname.endsWith("/") ? pathname : pathname + "/");
  return (
    <div className={`items-center rounded-full border-[1.5px] border-current p-0.5 font-mono text-xs ${className}`} role="group" aria-label="Language / Idioma">
      {(["en", "es"] as const).map((l) => (
        // Plain <a>: the two languages use different root layouts (full page load by design)
        <a
          key={l}
          href={alt[l]}
          hrefLang={l === "en" ? "en-US" : "es-US"}
          lang={l === "en" ? "en" : "es"}
          aria-current={lang === l ? "true" : undefined}
          className={`inline-flex h-9 min-w-11 items-center justify-center rounded-full px-2.5 transition-colors ${
            lang === l ? "bg-ink text-paper" : "hover:text-red"
          }`}
        >
          {l === "en" ? "EN" : "ES"}
        </a>
      ))}
    </div>
  );
}
