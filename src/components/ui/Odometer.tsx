"use client";
/**
 * Mechanical odometer: each digit is a vertical strip that rolls into place.
 * `from` → `to` (e.g. 1998 → current year). Pass a timeline to sync with other motion.
 */
import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";

export type OdometerHandle = { roll: (duration?: number) => gsap.core.Timeline; set: (value: number) => void };

const DIGITS = "0123456789";

const Odometer = forwardRef<OdometerHandle, { from: number; to: number; className?: string; label?: string }>(function Odometer({ from, to, className = "", label }, ref) {
  const root = useRef<HTMLSpanElement>(null);
  const width = String(Math.max(from, to)).length;
  const fromStr = String(from).padStart(width, "0");
  const toStr = String(to).padStart(width, "0");

  useImperativeHandle(ref, () => ({
    roll(duration = 1.6) {
      const tl = gsap.timeline();
      const strips = root.current?.querySelectorAll<HTMLElement>(".odo-strip") ?? [];
      strips.forEach((strip, i) => {
        const a = Number(fromStr[i]);
        let b = Number(toStr[i]);
        // Like a real odometer, lower-order (rightmost) digits spin through extra full turns
        const turns = i; // rightmost digit spins the most
        if (turns > 0 && a !== b) b += 10 * Math.min(turns, 2);
        else if (b < a) b += 10;
        tl.fromTo(strip, { yPercent: (-a * 100) / 30 }, { yPercent: (-b * 100) / 30, duration, ease: "power3.inOut" }, i * 0.08);
      });
      return tl;
    },
    set(value: number) {
      const s = String(value).padStart(width, "0");
      root.current?.querySelectorAll<HTMLElement>(".odo-strip").forEach((strip, i) => gsap.set(strip, { yPercent: (-Number(s[i]) * 100) / 30 }));
    },
  }));

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span ref={root} className="inline-flex overflow-hidden rounded-md bg-ink p-1 font-mono text-paper" aria-label={String(to)} role="img">
        {fromStr.split("").map((ch, i) => (
          <span key={i} className="relative mx-[1px] inline-block h-[1.2em] w-[0.8em] overflow-hidden rounded-[3px] bg-ink-2 text-center leading-[1.2em]" aria-hidden="true">
            {/* 30 digits (0–9 × 3) so lower digits can spin full turns */}
            <span className="odo-strip absolute inset-x-0 top-0 flex flex-col" style={{ transform: `translateY(${(-Number(ch) * 100) / 30}%)` }}>
              {(DIGITS + DIGITS + DIGITS).split("").map((dg, k) => (
                <span key={k} className="block h-[1.2em]">{dg}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {label && <span className="font-mono text-[0.65rem] tracking-[0.16em] text-current opacity-80">{label}</span>}
    </span>
  );
});

export default Odometer;
