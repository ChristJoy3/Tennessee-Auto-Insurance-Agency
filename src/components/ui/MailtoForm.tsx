"use client";
/**
 * Visual-only contact form (static site): builds a pre-filled email to auto@insuringyouforless.com.
 * Fields from the old contact form + preferred office + preferred language.
 * Variant "refer" mirrors the old Refer a Friend form.
 */
import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { EMAIL, OFFICES } from "@/lib/site";

// Inquiry types exactly as on the old /contact/ form
const INQUIRY = ["General Inquiry", "Automobile", "Business & Commercial", "Homeowners", "Motorcycle", "Renters", "Watercraft & Boat"];
const INQUIRY_ES: Record<string, string> = {
  "General Inquiry": "Consulta general",
  Automobile: "Automóvil",
  "Business & Commercial": "Negocios y comercial",
  Homeowners: "Propietarios",
  Motorcycle: "Motocicleta",
  Renters: "Inquilinos",
  "Watercraft & Boat": "Embarcaciones y botes",
};

const field = "w-full min-h-12 rounded-xl border-[1.5px] border-[var(--line)] bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-red";

export default function MailtoForm({ lang, variant = "contact", dark = false }: { lang: Lang; variant?: "contact" | "refer"; dark?: boolean }) {
  const d = t(lang);
  const es = lang === "es";
  const [inquiry, setInquiry] = useState(INQUIRY[0]);

  // Allow /contact/?type=Motorcycle deep links from product rows
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type && INQUIRY.includes(type)) setInquiry(type);
  }, []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const lines =
      variant === "refer"
        ? [
            "Your Information",
            `First Name: ${get("first")}`, `Last Name: ${get("last")}`, `Email: ${get("email")}`, `Phone: ${get("phone")}`,
            "",
            "Your Friend's Information",
            `Friend's First Name: ${get("ffirst")}`, `Friend's Last Name: ${get("flast")}`, `Friend's Email: ${get("femail")}`, `Friend's Phone: ${get("fphone")}`,
            "", `Comments: ${get("comments")}`,
          ]
        : [
            `First Name: ${get("first")}`, `Last Name: ${get("last")}`, `Email: ${get("email")}`, `Phone: ${get("phone")}`,
            `Inquiry Type: ${get("inquiry")}`, `Preferred office: ${get("office")}`, `Preferred language: ${get("language")}`,
            "", `Comments: ${get("comments")}`,
          ];
    const subject =
      variant === "refer"
        ? `Referral from ${get("first")} ${get("last")}`
        : `${get("inquiry")} – website inquiry from ${get("first")} ${get("last")}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  const label = `mb-1.5 block text-sm font-semibold ${dark ? "text-paper/85" : ""}`;
  const L = (k: string, text: string, input: React.ReactNode) => (
    <label className="block" htmlFor={k}>
      <span className={label}>{text}</span>
      {input}
    </label>
  );
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
      {variant === "refer" && <p className="mile text-red sm:col-span-2">{es ? "Su información" : "Your Information"}</p>}
      {L("first", `${d.formFirst}*`, <input id="first" name="first" required autoComplete="given-name" className={field} />)}
      {L("last", `${d.formLast}*`, <input id="last" name="last" required autoComplete="family-name" className={field} />)}
      {L("email", `${d.formEmail}*`, <input id="email" name="email" type="email" required autoComplete="email" className={field} />)}
      {L("phone", `${d.formPhone}*`, <input id="phone" name="phone" type="tel" required autoComplete="tel" className={field} />)}
      {variant === "refer" ? (
        <>
          <p className="mile mt-2 text-red sm:col-span-2">{es ? "Información de su amigo" : "Your Friend's Information"}</p>
          {L("ffirst", `${es ? "Nombre de su amigo" : "Friend's First Name"}*`, <input id="ffirst" name="ffirst" required className={field} />)}
          {L("flast", `${es ? "Apellido de su amigo" : "Friend's Last Name"}*`, <input id="flast" name="flast" required className={field} />)}
          {L("femail", es ? "Correo de su amigo" : "Friend's Email Address", <input id="femail" name="femail" type="email" className={field} />)}
          {L("fphone", es ? "Teléfono de su amigo" : "Friend's Phone Number", <input id="fphone" name="fphone" type="tel" className={field} />)}
        </>
      ) : (
        <>
          {L(
            "inquiry",
            d.formInquiry,
            <select id="inquiry" name="inquiry" value={inquiry} onChange={(e) => setInquiry(e.target.value)} className={field}>
              {INQUIRY.map((o) => (
                <option key={o} value={o}>{es ? INQUIRY_ES[o] : o}</option>
              ))}
            </select>,
          )}
          {L(
            "office",
            d.formOffice,
            <select id="office" name="office" className={field}>
              {OFFICES.map((o) => (
                <option key={o.slug} value={o.city}>{o.city}</option>
              ))}
            </select>,
          )}
          {L(
            "language",
            d.formLanguage,
            <select id="language" name="language" defaultValue={es ? "Español" : "English"} className={field}>
              <option value="English">English</option>
              <option value="Español">Español</option>
            </select>,
          )}
        </>
      )}
      <div className="sm:col-span-2">{L("comments", d.formComments, <textarea id="comments" name="comments" rows={4} className={field} />)}</div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${dark ? "text-paper/70" : "text-muted"}`}>{d.formNote}</p>
        <button type="submit" className="btn btn-red shrink-0">{d.formSend}</button>
      </div>
    </form>
  );
}
