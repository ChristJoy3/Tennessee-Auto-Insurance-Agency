"use client";
/**
 * Single place where GSAP plugins are registered (client only).
 * Motion language: map → lane → cover → clear. Calm easing, consistent durations.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export const EASE = { out: "expo.out", strong: "power4.out", inOut: "power3.inOut" } as const;
/** Breakpoints for gsap.matchMedia(): mobile ≤767, tablet 768–1279, desktop ≥1280 */
export const MQ = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1279px)",
  desktop: "(min-width: 1280px)",
  motionOK: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
