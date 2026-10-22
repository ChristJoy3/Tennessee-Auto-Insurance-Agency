/**
 * Custom monoline icon set (1.5px strokes, rounded caps) in the site's "linework" style.
 * Replaces the role of the old clip-art product icons (files kept in public/images/icons/legacy-*).
 */
import type { SVGProps } from "react";
import type { IconName } from "@/data/products";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

const PATHS: Record<IconName | string, React.ReactNode> = {
  auto: (
    <>
      <path d="M6 30v-6l5-9a4 4 0 0 1 3.5-2h19a4 4 0 0 1 3.5 2l5 9v6" />
      <path d="M4 30h40v5a2 2 0 0 1-2 2h-3M9 37H6a2 2 0 0 1-2-2" />
      <circle cx="14" cy="37" r="4" /><circle cx="34" cy="37" r="4" /><path d="M18 37h12M10 24h28" strokeDasharray="3 3" />
    </>
  ),
  commercial: (
    <>
      <path d="M4 33V13h24v20M28 19h8l6 7v7" /><path d="M4 33h3m8 0h18m8 0h2" />
      <circle cx="11" cy="34" r="4" /><circle cx="37" cy="34" r="4" /><path d="M9 19h13" strokeDasharray="3 3" />
    </>
  ),
  motorcycle: (
    <>
      <circle cx="11" cy="32" r="7" /><circle cx="37" cy="32" r="7" />
      <path d="M11 32l8-12h9l9 12M23 20l-3-6h-5M28 20l4-6h4" /><path d="M19 32h8" strokeDasharray="3 3" />
    </>
  ),
  home: (
    <>
      <path d="M6 22 24 7l18 15" /><path d="M10 19v22h28V19" /><path d="M20 41V29h8v12" />
      <path d="M14 41h20" strokeDasharray="3 3" />
    </>
  ),
  renters: (
    <>
      <rect x="9" y="6" width="30" height="36" rx="2" /><path d="M15 14h6M27 14h6M15 22h6M27 22h6M15 30h6M27 30h6" />
      <path d="M21 42v-6h6v6" />
    </>
  ),
  boat: (
    <>
      <path d="M6 30h36l-5 8H11z" /><path d="M24 30V8l12 18H24" /><path d="M4 43c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 8-2" strokeDasharray="0" />
    </>
  ),
  rv: (
    <>
      <path d="M4 34V12h30l8 10v12z" /><path d="M34 12v10h8M9 18h7v6H9zM21 18h7v6h-7z" />
      <circle cx="13" cy="35" r="4" /><circle cx="33" cy="35" r="4" />
    </>
  ),
  atv: (
    <>
      <circle cx="11" cy="33" r="6" /><circle cx="37" cy="33" r="6" />
      <path d="M8 24h32l-4-6H24l-3-5h-5M17 33h14M20 24l3 9" />
    </>
  ),
  sr22: (
    <>
      <path d="M12 5h17l9 9v29H12z" /><path d="M29 5v9h9" /><path d="M17 22h14M17 28h14M17 34h8" strokeDasharray="3 3" />
      <path d="m27 37 3 3 6-6" />
    </>
  ),
  license: (
    <>
      <rect x="4" y="10" width="40" height="28" rx="3" /><circle cx="15" cy="22" r="4" /><path d="M9 32c1-3 3-4 6-4s5 1 6 4" />
      <path d="M26 19h12M26 25h12M26 31h7" strokeDasharray="3 3" />
    </>
  ),
  phone: <path d="M14 6h-4a4 4 0 0 0-4 4c0 17.7 14.3 32 32 32a4 4 0 0 0 4-4v-4l-9-4-4 4c-5-2-9-6-11-11l4-4z" />,
  pin: (
    <>
      <path d="M24 44S9 30 9 19a15 15 0 0 1 30 0c0 11-15 25-15 25z" /><circle cx="24" cy="19" r="5" />
    </>
  ),
  quote: (
    <>
      <path d="M12 5h17l9 9v29H12z" /><path d="M29 5v9h9" /><path d="M18 26l4 4 8-9" />
    </>
  ),
  card: (
    <>
      <rect x="4" y="11" width="40" height="27" rx="3" /><path d="M4 19h40M10 30h10" />
    </>
  ),
  arrow: <path d="M8 24h32M28 12l12 12-12 12" />,
  arrowUpRight: <path d="M14 34 34 14M18 14h16v16" />,
  menu: <path d="M6 16h36M6 32h36" />,
  close: <path d="m11 11 26 26M37 11 11 37" />,
  mail: (
    <>
      <rect x="5" y="10" width="38" height="28" rx="3" /><path d="m6 12 18 14 18-14" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="18" /><path d="M24 13v11l7 5" />
    </>
  ),
  star: <path d="m24 5 5.6 11.8 13 1.6-9.5 9 2.4 12.8L24 34l-11.5 6.2 2.4-12.8-9.5-9 13-1.6z" />,
  play: <path d="M17 12v24l20-12z" />,
  search: (
    <>
      <circle cx="21" cy="21" r="13" /><path d="m31 31 11 11" />
    </>
  ),
  globe: (
    <>
      <circle cx="24" cy="24" r="18" /><path d="M6 24h36M24 6c6 5 8 11 8 18s-2 13-8 18c-6-5-8-11-8-18s2-13 8-18z" />
    </>
  ),
};

export function Icon({ name, size = 24, ...rest }: P & { name: keyof typeof PATHS }) {
  return (
    <svg {...base(size)} {...rest}>
      {PATHS[name]}
    </svg>
  );
}

/** Brand marks for socials (filled, simplified). */
export function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
  switch (name) {
    case "facebook":
      return <svg {...common}><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.6V14h2.7v8z" /></svg>;
    case "instagram":
      return <svg {...common}><path d="M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.1c-.1-1.6-.4-3-1.6-4.2S17.6 1.3 16 1.2C14.3 1.1 9.7 1.1 8 1.2c-1.6.1-3 .4-4.2 1.6S2.2 5.5 2.1 7.1C2 8.8 2 13.2 2.1 14.9c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.2-1.7.2-6.1.2-7.8zm-2.2 9.7a3.3 3.3 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.8s-.1-4.6.4-5.9a3.3 3.3 0 0 1 1.8-1.8C7.4 2.8 10.4 3 12 3s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.9s.1 4.5-.4 5.7z" /></svg>;
    case "google":
      return <svg {...common}><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6A6 6 0 0 1 12 5.9z" /></svg>;
    case "youtube":
      return <svg {...common}><path d="M23 7.2a3 3 0 0 0-2-2.1C19.1 4.6 12 4.6 12 4.6s-7.1 0-9 .5a3 3 0 0 0-2 2.1A31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2 2.1c1.9.5 9 .5 9 .5s7.1 0 9-.5a3 3 0 0 0 2-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15V9l5.9 3z" /></svg>;
    case "x":
      return <svg {...common}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg>;
    case "linkedin":
      return <svg {...common}><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.5H3.5V9h3.6zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" /></svg>;
    default:
      return null;
  }
}
