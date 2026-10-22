/**
 * Products, in the order of the old site's Products menu (+ RV, ATV listed on /about/).
 * Descriptions are the first paragraph of each old product page (verbatim, via firstParagraph).
 */
import { QUOTE } from "@/lib/site";
import { firstParagraph } from "./content";
import type { Lang } from "@/lib/i18n";

export type IconName = "auto" | "commercial" | "motorcycle" | "home" | "renters" | "boat" | "rv" | "atv" | "sr22" | "license";

export type Product = {
  slug: string;
  path: string; // new page path (mirrors the old URL)
  icon: IconName;
  name: { en: string; es: string };
  /** Short line shown in the product rows */
  short: { en: string; es: string };
  /** Online quote URL; otherwise the row links to the contact form with this product preselected */
  quote?: string;
  inquiry: string; // value for the contact form "Inquiry Type" (old form options)
};

export const PRODUCTS: Product[] = [
  {
    slug: "auto", path: "/automobile/", icon: "auto", quote: QUOTE.auto, inquiry: "Automobile",
    name: { en: "Auto", es: "Auto" },
    short: { en: "Car insurance for Tennessee drivers, our primary focus.", es: "Seguro de auto para conductores de Tennessee, nuestro enfoque principal." },
  },
  {
    slug: "commercial-auto", path: "/commercial_auto/", icon: "commercial", inquiry: "Business & Commercial",
    name: { en: "Commercial Auto", es: "Auto Comercial" },
    short: { en: "Coverage for vehicles that work for your business.", es: "Cobertura para los vehículos de su negocio." },
  },
  {
    slug: "motorcycle", path: "/motorcycle/", icon: "motorcycle", inquiry: "Motorcycle",
    name: { en: "Motorcycle", es: "Motocicleta" },
    short: { en: "Protection for riders and their bikes.", es: "Protección para motociclistas y sus motos." },
  },
  {
    slug: "homeowners", path: "/homeowners/", icon: "home", inquiry: "Homeowners",
    name: { en: "Homeowners", es: "Propietarios" },
    short: { en: "Coverage for the place you come home to.", es: "Cobertura para el lugar al que regresa cada día." },
  },
  {
    slug: "renters", path: "/renters/", icon: "renters", quote: QUOTE.property, inquiry: "Renters",
    name: { en: "Renters", es: "Inquilinos" },
    short: { en: "Protect your belongings when you rent.", es: "Proteja sus pertenencias cuando alquila." },
  },
  {
    slug: "boat", path: "/boat/", icon: "boat", inquiry: "Watercraft & Boat",
    name: { en: "Boat & Watercraft", es: "Botes y Embarcaciones" },
    short: { en: "On the lake or the river, covered.", es: "En el lago o en el río, con cobertura." },
  },
  {
    slug: "rv", path: "/rv/", icon: "rv", inquiry: "General Inquiry",
    name: { en: "RV", es: "Vehículos Recreativos" },
    short: { en: "For the road trips that take you farther.", es: "Para los viajes que lo llevan más lejos." },
  },
  {
    slug: "atv", path: "/atv/", icon: "atv", inquiry: "General Inquiry",
    name: { en: "ATV", es: "ATV" },
    short: { en: "Coverage for off-road fun.", es: "Cobertura para la diversión todoterreno." },
  },
  {
    slug: "sr-22", path: "/sr_22/", icon: "sr22", quote: QUOTE.auto, inquiry: "Automobile",
    name: { en: "SR-22", es: "SR-22" },
    short: { en: "Instant SR-22 filing so you can drive legally again.", es: "SR-22 al instante para que pueda volver a manejar legalmente." },
  },
  {
    slug: "license-reinstatement", path: "/content/tn-drivers-license-reinstatement/", icon: "license", quote: QUOTE.auto, inquiry: "General Inquiry",
    name: { en: "Driver's License Reinstatement", es: "Restablecimiento de Licencia" },
    short: { en: "Help getting your Tennessee license reinstated.", es: "Ayuda para restablecer su licencia de Tennessee." },
  },
];
// Spanish short lines and the RV/License Spanish names are new: [REVIEW TRANSLATION]

export const productDescription = (p: Product, lang: Lang) => firstParagraph(p.path, lang) || p.short[lang];
export const productByPath = (path: string) => PRODUCTS.find((p) => p.path === path);
