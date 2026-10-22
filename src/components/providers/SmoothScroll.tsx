"use client";
/**
 * Lenis smooth scrolling driven by the GSAP ticker, with ScrollTrigger kept in sync.
 * - Touch devices keep native scrolling (syncTouch off).
 * - prefers-reduced-motion: Lenis is not mounted at all.
 * - Anchor links (#section) scroll smoothly through Lenis.
 */
import { useEffect, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);
    const onChange = () => setEnabled(!mq.matches);
    mq.addEventListener("change", onChange);

    // Re-measure triggers once fonts and images have settled
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    window.addEventListener("orientationchange", refresh);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("load", refresh);
      window.removeEventListener("orientationchange", refresh);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;
  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: false, lerp: 0.1, anchors: { offset: -72 } }}>
      {children}
    </ReactLenis>
  );
}
