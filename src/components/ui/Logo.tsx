/**
 * The original logo (public/logo.png, 178×107) used EXACTLY as-is: only resized proportionally.
 * Its red hairline type has a white matte, so it always sits on a white plate —
 * we change the background behind it, never the logo.
 */
import { NAME } from "@/lib/site";

const W = 178;
const H = 107;

export default function Logo({ height = 44, plate = true, className = "", priority = false }: { height?: number; plate?: boolean; className?: string; priority?: boolean }) {
  const width = Math.round((W / H) * height);
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      width={width}
      height={height}
      alt={`${NAME} logo`}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ width, height }}
      className="block select-none"
      draggable={false}
    />
  );
  if (!plate) return <span className={className}>{img}</span>;
  return <span className={`inline-flex items-center justify-center rounded-xl bg-white px-2 py-1 ${className}`}>{img}</span>;
}
