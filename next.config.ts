import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to out/
  output: "export",
  // Mirror the old site's folder-style URLs (/about/, /sr_22/, /glossary/a/)
  trailingSlash: true,
  images: { unoptimized: true },
  // Two root layouts (EN + /es-us/) → one global 404 page
  // Low worker count keeps the ~500-page build within a small (3.5 GB) machine's memory
  experimental: { globalNotFound: true, cpus: 2, staticGenerationMaxConcurrency: 4 },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
