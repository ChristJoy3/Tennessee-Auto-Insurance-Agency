"use client";
/**
 * Signature preloader, built around the real logo (never altered):
 *  1 MAP     faint contour lines fade in
 *  2 ROUTE   a dashed lane line enters from the screen edge, drives a smooth route,
 *            then wraps around the logo as a rounded coverage frame — closing the loop as it ends
 *  3 ARRIVE  the logo appears inside the closed frame (opacity + slight scale settle)
 *  4 ODOMETER rolls 1998 → current year in the corner ("MILES SINCE 1998" / "DESDE 1998")
 *  5 REVEAL  a windshield-wiper sweep (rotating sector clip from the bottom-left corner) wipes it away
 * ~2.8s first visit · ~1.2s on repeat visits (sessionStorage) · skippable · none with reduced motion.
 * Works with any logo aspect ratio (frame is computed from the logo's natural size).
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { FOUNDED } from "@/lib/site";
import Odometer, { type OdometerHandle } from "./Odometer";

const KEY = "tnaia-intro-seen";
export const INTRO_EVENT = "tnaia:intro-done";

export function introDone() {
  (window as unknown as { __tnaiaIntro?: boolean }).__tnaiaIntro = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}
export function onIntroDone(cb: () => void) {
  if ((window as unknown as { __tnaiaIntro?: boolean }).__tnaiaIntro) {
    cb();
    return () => {};
  }
  window.addEventListener(INTRO_EVENT, cb, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, cb);
}

/** Rounded-rect path starting at the middle of the left edge, drawn clockwise (closes the loop). */
function framePath(x: number, y: number, w: number, h: number, r: number) {
  return [
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `L ${x} ${y + h / 2}`,
  ].join(" ");
}

export default function Preloader({ label, skipLabel }: { label: string; skipLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const odo = useRef<OdometerHandle>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);
  const [geo, setGeo] = useState<{ W: number; H: number; d: string; box: { x: number; y: number; w: number; h: number } } | null>(null);
  const year = new Date().getFullYear();

  // Geometry from the viewport + the logo's natural aspect ratio
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      introDone();
      return;
    }
    const W = window.innerWidth;
    const H = window.innerHeight;
    const mobile = W < 768;
    const ratio = 178 / 107; // public/logo.png natural size
    const logoW = Math.min(mobile ? W * 0.5 : 240, 240); // logo is only 178px wide: keep upscaling modest
    const logoH = logoW / ratio;
    const pad = mobile ? 22 : 34;
    const box = { w: logoW + pad * 2, h: logoH + pad * 2, x: 0, y: 0 };
    box.x = (W - box.w) / 2;
    box.y = (H - box.h) / 2;
    const r = Math.min(28, box.h / 3);
    // Route: from off-screen left, a smooth S-curve across the lower screen, arriving at the frame's left edge midpoint
    const sx = -40, sy = H * (mobile ? 0.78 : 0.72);
    const ex = box.x, ey = box.y + box.h / 2;
    const d = mobile
      ? `M ${sx} ${sy} C ${W * 0.35} ${sy}, ${ex - 60} ${ey + 90}, ${ex} ${ey + 20} ${framePath(box.x, box.y, box.w, box.h, r)}`
      : `M ${sx} ${sy} C ${W * 0.22} ${sy}, ${W * 0.24} ${H * 0.92}, ${W * 0.36} ${H * 0.82} S ${ex - 140} ${ey + 40}, ${ex} ${ey + 30} ${framePath(box.x, box.y, box.w, box.h, r)}`;
    setGeo({ W, H, d, box });
  }, []);

  useEffect(() => {
    if (!geo || !root.current) return;
    const el = root.current;
    const repeat = sessionStorage.getItem(KEY) === "1";
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
    const draw = el.querySelector<SVGPathElement>(".pl-mask-path")!;
    const lane = el.querySelector<SVGPathElement>(".pl-lane")!;
    const frame = el.querySelector<SVGPathElement>(".pl-frame")!;
    const len = draw.getTotalLength();
    const blade = el.querySelector<HTMLElement>(".pl-blade")!;
    const diag = Math.hypot(geo.W, geo.H) * 1.6;
    const P = { x: 0, y: geo.H };

    // Wiper: visible region = sector from angle θ to 90° around the bottom-left pivot
    const wipe = { a: 0 };
    const setClip = () => {
      const pts = [`${P.x}px ${P.y}px`];
      for (let i = 0; i <= 10; i++) {
        const ang = ((wipe.a + ((90 - wipe.a) * i) / 10) * Math.PI) / 180;
        pts.push(`${P.x + Math.cos(ang) * diag}px ${P.y - Math.sin(ang) * diag}px`);
      }
      el.style.clipPath = `polygon(${pts.join(",")}, -10px -10px, -10px ${geo.H + 10}px)`;
      blade.style.transform = `rotate(${-wipe.a}deg)`;
    };

    const finish = () => {
      introDone();
      setGone(true);
    };

    gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(frame, { opacity: 0 });
    gsap.set(".pl-logo", { opacity: 0, scale: 0.94 });
    const speed = repeat ? 0.45 : 1;
    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    tl.to(".pl-contours", { opacity: 1, duration: 0.6 * speed, ease: "power2.out" })
      .to(".pl-odo", { opacity: 1, duration: 0.4 }, "<")
      .add(() => odo.current?.roll(repeat ? 0.9 : 2.1), "<")
      .to(draw, { strokeDashoffset: 0, duration: repeat ? 0.7 : 1.6, ease: "power2.inOut" }, "<0.1")
      .to(lane, { strokeDashoffset: -120, duration: repeat ? 0.7 : 1.6, ease: "none" }, "<")
      .to(frame, { opacity: 1, duration: 0.35 }, ">-0.1")
      .to(".pl-logo", { opacity: 1, scale: 1, duration: 0.7 * speed, ease: "expo.out" }, "<")
      .to({}, { duration: repeat ? 0.15 : 0.45 })
      .set(blade, { opacity: 1 })
      .to(wipe, { a: 90, duration: repeat ? 0.6 : 0.95, ease: "power2.inOut", onUpdate: setClip })
      .set(blade, { opacity: 0 });

    // Safety: never trap the page behind the intro; Escape skips
    const safety = window.setTimeout(() => tl.progress(1), 6000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && tl.progress(1);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
      tl.kill();
    };
  }, [geo]);

  const skip = () => tlRef.current?.progress(1);

  if (gone) return null;
  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[95] overflow-hidden bg-paper text-ink"
      aria-hidden="true"
      data-preloader
    >
      <noscript>
        <style>{`[data-preloader]{display:none!important}`}</style>
      </noscript>
      <div className="pl-contours contours absolute inset-0 opacity-0" />
      {geo && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${geo.W} ${geo.H}`}>
          <defs>
            <mask id="pl-mask" maskUnits="userSpaceOnUse">
              <path className="pl-mask-path" d={geo.d} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
            </mask>
          </defs>
          {/* moving lane dashes, revealed by the drawing mask */}
          <path className="pl-lane" d={geo.d} fill="none" stroke="var(--red)" strokeWidth="3" strokeDasharray="14 12" mask="url(#pl-mask)" />
          {/* closed coverage frame turns solid once the loop closes */}
          <rect className="pl-frame" x={geo.box.x} y={geo.box.y} width={geo.box.w} height={geo.box.h} rx={Math.min(28, geo.box.h / 3)} fill="#fff" stroke="var(--red)" strokeWidth="3" />
        </svg>
      )}
      {geo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt=""
          className="pl-logo absolute"
          width={178}
          height={107}
          style={{
            left: geo.box.x + (geo.box.w - (geo.box.h - (geo.W < 768 ? 44 : 68)) * (178 / 107)) / 2,
            top: geo.box.y + (geo.W < 768 ? 22 : 34),
            height: geo.box.h - (geo.W < 768 ? 44 : 68),
            width: "auto",
          }}
        />
      )}
      <div className="pl-odo absolute bottom-[calc(1.25rem+var(--safe-b))] right-5 text-2xl opacity-0 md:bottom-8 md:right-8 md:text-3xl">
        <Odometer ref={odo} from={FOUNDED} to={year} label={label} />
      </div>
      <button
        type="button"
        onClick={skip}
        className="pointer-events-auto absolute left-5 top-5 min-h-11 rounded-full border-[1.5px] border-ink px-4 font-mono text-xs uppercase tracking-[0.14em]"
        tabIndex={-1}
      >
        {skipLabel}
      </button>
      {/* wiper blade */}
      <div className="pl-blade pointer-events-none absolute bottom-0 left-0 h-[3px] w-[200vmax] origin-left bg-red opacity-0" />
    </div>
  );
}
