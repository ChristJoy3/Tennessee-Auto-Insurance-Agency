/**
 * The old IWB template loads staff, offices, testimonials and product lines from a JSON
 * endpoint via XHR (not present in the HTML). Save each dataset, per language, to
 * migration/raw/<lang>/_data/<name>.json so nothing JS-rendered is lost.
 */
import fs from "node:fs";
import path from "node:path";
import { ORIGIN, MIG, fetchRetry, sleep } from "./lib";

const DATASETS = ["employees", "locations", "testimonials", "lines"];

async function main() {
  // Spanish session cookie, in case the endpoint localizes by session rather than path
  const sw = await fetchRetry(ORIGIN + "/language.aspx?language=2058", { redirect: "manual" });
  const esCookie = (sw?.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");

  for (const r of DATASETS) {
    const variants: [string, string, RequestInit][] = [
      ["en", `${ORIGIN}/resources/data/website_data.ashx?r=${r}`, {}],
      ["es-us", `${ORIGIN}/es-us/resources/data/website_data.ashx?r=${r}`, {}],
      ["es-us-session", `${ORIGIN}/resources/data/website_data.ashx?r=${r}`, { headers: { Cookie: esCookie } }],
    ];
    for (const [lang, url, init] of variants) {
      const res = await fetchRetry(url, init);
      const body = res?.ok ? await res.text() : "";
      let ok = false;
      try {
        JSON.parse(body);
        ok = true;
      } catch { /* not json */ }
      const dir = path.join(MIG, "raw", lang.startsWith("es") ? "es-us" : "en", "_data");
      fs.mkdirSync(dir, { recursive: true });
      const name = lang === "es-us-session" ? `${r}.session.json` : `${r}.json`;
      if (ok) fs.writeFileSync(path.join(dir, name), body);
      console.log(`${lang.padEnd(14)} ${r.padEnd(13)} ${res?.status ?? "ERR"} ${ok ? body.length + "b" : "not json"}`);
      await sleep(300);
    }
  }

  // Staff vCards (only place the staff emails exist as text; the site renders them as images)
  const employees = JSON.parse(fs.readFileSync(path.join(MIG, "raw/en/_data/employees.json"), "utf8")) as { agentguid: string; profile_url: string }[];
  const vdir = path.join(MIG, "raw/en/_data/vcards");
  fs.mkdirSync(vdir, { recursive: true });
  for (const e of employees) {
    const res = await fetchRetry(`${ORIGIN}/employee_vcf.aspx?agent=${e.agentguid}`);
    if (res?.ok) fs.writeFileSync(path.join(vdir, e.profile_url.split("/").pop()!.replace(".aspx", ".vcf")), await res.text());
    await sleep(300);
  }
}
main();
