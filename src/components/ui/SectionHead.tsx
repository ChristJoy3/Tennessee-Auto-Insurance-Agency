import { RevealText } from "./Reveal";

/** Mile-marker label ("MILE 03 / CHOOSE YOUR COVERAGE") + masked headline. */
export default function SectionHead({ mile, label, title, className = "", titleClass = "h-lg", id, dark = false }: { mile: number; label: string; title: React.ReactNode; className?: string; titleClass?: string; id?: string; dark?: boolean }) {
  return (
    <div className={className}>
      <p className={`mile ${dark ? "text-red" : "text-red"}`}>
        <span className="font-semibold">MILE {String(mile).padStart(2, "0")}</span>
        <span aria-hidden="true">/</span>
        <span>{label}</span>
      </p>
      <RevealText as="h2" id={id} className={`display ${titleClass} mt-5`}>
        {title}
      </RevealText>
    </div>
  );
}
