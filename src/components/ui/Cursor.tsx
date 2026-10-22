"use client";
/**
 * Custom cursor: a small route dot trailed by a short dashed line (desktop, fine pointer only).
 * Grows over links/buttons. Native cursor stays visible for accessibility.
 */
import { useEffect, useRef, useState } from "react";

const TRAIL = 14;

export default function Cursor() {
  const [on, setOn] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOn(ok);
    if (!ok) return;
    const pts = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    let mx = -100, my = -100, raf = 0, big = false;
    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      big = !!(e.target as HTMLElement)?.closest?.("a,button,[data-cursor]");
    };
    const tick = () => {
      pts[0].x += (mx - pts[0].x) * 0.35;
      pts[0].y += (my - pts[0].y) * 0.35;
      for (let i = 1; i < TRAIL; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.42;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.42;
      }
      if (dot.current) dot.current.style.transform = `translate3d(${pts[0].x}px, ${pts[0].y}px, 0) translate(-50%, -50%) scale(${big ? 2.6 : 1})`;
      path.current?.setAttribute("points", pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] mix-blend-multiply">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <polyline ref={path} fill="none" stroke="#d2232a" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" opacity="0.7" />
      </svg>
      <div ref={dot} className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-red transition-[scale] duration-300" style={{ transition: "transform 0.05s linear" }} />
    </div>
  );
}
