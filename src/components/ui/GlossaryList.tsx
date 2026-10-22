"use client";
/** Glossary terms with a client-side search filter (keyboard + screen-reader friendly). */
import { useDeferredValue, useMemo, useState } from "react";
import { Icon } from "./Icons";

type Term = { term: string; definition: string; letter: string };

export default function GlossaryList({ terms, searchLabel, emptyLabel, showLetters = false }: { terms: Term[]; searchLabel: string; emptyLabel: string; showLetters?: boolean }) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());
  const list = useMemo(() => (dq ? terms.filter((t) => t.term.toLowerCase().includes(dq) || t.definition.toLowerCase().includes(dq)) : terms), [terms, dq]);
  let lastLetter = "";
  return (
    <div>
      <label className="relative block max-w-xl">
        <span className="sr-only">{searchLabel}</span>
        <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchLabel}
          className="min-h-14 w-full rounded-full border-[1.5px] border-[var(--line)] bg-white pl-12 pr-5 text-base outline-none focus:border-red"
        />
      </label>
      <p className="mt-3 font-mono text-xs text-muted" aria-live="polite">
        {list.length} / {terms.length}
      </p>
      {list.length === 0 && <p className="mt-8">{emptyLabel}</p>}
      <dl className="mt-8">
        {list.map((t) => {
          const header = showLetters && !dq && t.letter !== lastLetter;
          lastLetter = t.letter;
          return (
            <div key={t.letter + t.term}>
              {header && (
                <p id={`letter-${t.letter}`} className="display mt-14 scroll-mt-28 border-b-[1.5px] border-dashed border-[var(--line)] pb-3 text-5xl text-red">
                  {t.letter.toUpperCase()}
                </p>
              )}
              <div className="grid gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
                <dt className="font-display text-lg font-bold leading-snug [font-stretch:106%]">{t.term}</dt>
                <dd className="whitespace-pre-line text-[1rem] text-ink/85">{t.definition}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
