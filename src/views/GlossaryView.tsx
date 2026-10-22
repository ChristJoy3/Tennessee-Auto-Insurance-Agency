import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, t, type Lang } from "@/lib/i18n";
import { JsonLd, pageMeta } from "@/lib/seo";
import { NAME, SITE_URL } from "@/lib/site";
import { GLOSSARY } from "@/data/content";
import InnerPage from "@/components/layouts/InnerPage";
import GlossaryList from "@/components/ui/GlossaryList";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const TITLE = { en: "Insurance Glossary", es: "Glosario de seguros" };
const SUB = { en: "Insurance terms and definitions from Tennessee Auto Insurance Agency.", es: "Términos y definiciones de seguros de Tennessee Auto Insurance Agency." };
// Verbatim disclaimer from the old glossary pages
const NOTE =
  "Coverages and benefits listed below may not be available in your state. If available, some optional coverages and benefits might be offered at an additional charge. Contact Tennessee Auto Insurance Agency today to learn more.";

export const glossaryParams = () => LETTERS.map((letter) => ({ letter }));

export function glossaryMetadata(lang: Lang, letter?: string): Metadata {
  return pageMeta({
    lang,
    path: letter ? `/glossary/${letter}/` : "/glossary/",
    title: letter ? `${TITLE[lang]}: ${letter.toUpperCase()}` : TITLE[lang],
    description: SUB[lang],
  });
}

export default function GlossaryView({ lang, letter }: { lang: Lang; letter?: string }) {
  if (letter && !LETTERS.includes(letter)) notFound();
  const d = t(lang);
  const groups = letter ? GLOSSARY.letters.filter((g) => g.letter === letter) : GLOSSARY.letters;
  const terms = groups.flatMap((g) => g.terms.map((x) => ({ ...x, letter: g.letter })));
  const have = new Set(GLOSSARY.letters.filter((g) => g.terms.length).map((g) => g.letter));
  const ld = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `${TITLE.en}${letter ? ` – ${letter.toUpperCase()}` : ""}`,
    url: `${SITE_URL}${href(lang, letter ? `/glossary/${letter}/` : "/glossary/")}`,
    publisher: { "@type": "Organization", name: NAME },
    hasDefinedTerm: terms.map((x) => ({ "@type": "DefinedTerm", name: x.term, description: x.definition })),
  };
  return (
    <InnerPage
      lang={lang}
      label={letter ? `${TITLE[lang].toUpperCase()} · ${letter.toUpperCase()}` : TITLE[lang].toUpperCase()}
      title={letter ? <>{TITLE[lang]} <span className="text-red">{letter.toUpperCase()}</span></> : TITLE[lang]}
      intro={SUB[lang]}
      crumbs={letter ? [{ name: TITLE[lang], path: "/glossary/" }, { name: letter.toUpperCase(), path: `/glossary/${letter}/` }] : [{ name: TITLE[lang], path: "/glossary/" }]}
      englishOnly
    >
      <JsonLd data={ld} />
      <p className="max-w-3xl text-sm text-muted" lang="en">
        {NOTE.replace("Contact Tennessee Auto Insurance Agency today", "")}
        <Link href={href(lang, "/contact/")} className="lane-link text-ink">Contact Tennessee Auto Insurance Agency</Link> today to learn more.
      </p>
      <nav aria-label={lang === "es" ? "Letras" : "Letters"} className="sticky top-[var(--nav-h)] z-20 -mx-[var(--gutter)] mt-8 bg-paper/95 px-[var(--gutter)] py-3">
        <ul className="flex flex-wrap gap-1.5">
          <li>
            <Link href={href(lang, "/glossary/")} aria-current={!letter ? "page" : undefined} className={`inline-flex h-11 items-center rounded-full border-[1.5px] px-4 font-mono text-sm ${!letter ? "border-ink bg-ink text-paper" : "border-[var(--line)] hover:border-ink"}`}>
              A–Z
            </Link>
          </li>
          {LETTERS.map((l) =>
            have.has(l) ? (
              <li key={l}>
                <Link href={href(lang, `/glossary/${l}/`)} aria-current={letter === l ? "page" : undefined} className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] font-mono text-sm ${letter === l ? "border-red bg-red text-white" : "border-[var(--line)] hover:border-ink"}`}>
                  {l.toUpperCase()}
                </Link>
              </li>
            ) : (
              <li key={l}>
                <span aria-disabled="true" className="inline-flex h-11 w-11 items-center justify-center rounded-full font-mono text-sm text-muted/50">{l.toUpperCase()}</span>
              </li>
            ),
          )}
        </ul>
      </nav>
      <div className="mt-8" lang="en">
        <GlossaryList terms={terms} searchLabel={d.search} emptyLabel={d.noResults} showLetters={!letter} />
      </div>
    </InnerPage>
  );
}
