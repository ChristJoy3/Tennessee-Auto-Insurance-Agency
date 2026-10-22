"use client";
/**
 * Mobile-only sticky action bar: Call · Quote · Directions · Pay.
 * Call and Directions open a small sheet to choose Murfreesboro or Smyrna.
 */
import { useRef, useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import { OFFICES, QUOTE, directionsUrl } from "@/lib/site";
import { useDialogKeys, useScrollLock } from "@/hooks/useScrollLock";
import { Icon } from "./Icons";

type Sheet = null | "call" | "directions";

export default function MobileActionBar({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [sheet, setSheet] = useState<Sheet>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const close = () => setSheet(null);
  useScrollLock(sheet !== null);
  useDialogKeys(sheet !== null, sheetRef, close);

  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold";
  return (
    <>
      <nav
        aria-label={lang === "es" ? "Acciones rápidas" : "Quick actions"}
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[var(--line-light)] bg-ink pb-[var(--safe-b)] text-paper md:hidden"
      >
        <button type="button" className={item} onClick={() => setSheet("call")} aria-haspopup="dialog">
          <Icon name="phone" size={22} />
          {d.call}
        </button>
        <a className={`${item} bg-red`} href={QUOTE.auto} target="_blank" rel="noopener noreferrer">
          <Icon name="quote" size={22} />
          {lang === "es" ? "Cotizar" : "Quote"}
        </a>
        <button type="button" className={item} onClick={() => setSheet("directions")} aria-haspopup="dialog">
          <Icon name="pin" size={22} />
          {d.directions}
        </button>
        <a className={item} href={href(lang, "/payments/")}>
          <Icon name="card" size={22} />
          {d.pay}
        </a>
      </nav>

      {sheet && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label={d.chooseOffice}>
          <button type="button" aria-label={d.close} className="absolute inset-0 bg-ink/60" onClick={close} />
          <div ref={sheetRef} className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-paper p-5 pb-[calc(1.25rem+var(--safe-b))] text-ink">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />
            <p className="mile mb-3 text-red">{d.chooseOffice}</p>
            <div className="grid gap-3">
              {OFFICES.map((o) => (
                <a
                  key={o.slug}
                  href={sheet === "call" ? `tel:${o.tel}` : directionsUrl(o)}
                  target={sheet === "call" ? undefined : "_blank"}
                  rel={sheet === "call" ? undefined : "noopener noreferrer"}
                  onClick={close}
                  className="flex min-h-16 items-center justify-between rounded-2xl border-[1.5px] border-ink px-4 py-3"
                >
                  <span>
                    <span className="block font-display text-lg font-bold [font-stretch:110%]">{o.city}</span>
                    <span className="block text-sm text-muted">{sheet === "call" ? o.phone : `${o.street}, ${o.city}`}</span>
                  </span>
                  <Icon name={sheet === "call" ? "phone" : "arrowUpRight"} size={22} />
                </a>
              ))}
            </div>
            <button type="button" onClick={close} className="btn btn-line mt-4 w-full">{d.close}</button>
          </div>
        </div>
      )}
    </>
  );
}
