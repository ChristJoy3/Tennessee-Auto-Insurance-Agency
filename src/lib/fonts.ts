import { Archivo, Figtree, JetBrains_Mono } from "next/font/google";

/** Display: variable-width grotesk, used expanded + heavy for road-sign energy (not highway signage). */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
/** Body: highly legible, full Spanish diacritic support. */
export const figtree = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-figtree", display: "swap" });
/** Mono: mile-marker labels and the odometer. */
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "600"] });

export const fontVars = `${archivo.variable} ${figtree.variable} ${jetbrains.variable}`;
