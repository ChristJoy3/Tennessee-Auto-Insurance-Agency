"use client";
/** Button/link that gently follows the pointer (desktop fine pointer only). */
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

export default function MagneticButton({ children, className = "", strength = 0.35, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { strength?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !window.matchMedia(MQ.finePointer).matches || window.matchMedia(MQ.reduce).matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  );
}
