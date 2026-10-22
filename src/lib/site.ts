/**
 * Business facts, verbatim from the old site (crawl of insuringyouforless.com, Oct 2026).
 * Anything flagged [CONFIRM] needs the client's sign-off — see migration/MIGRATION_REPORT.md.
 */

export const SITE_URL = "https://www.insuringyouforless.com";
export const FOUNDED = 1998;
/** Never hardcode "20 years": computed at build time (and at runtime in the odometer). */
export const yearsInBusiness = (now = new Date()) => now.getFullYear() - FOUNDED;

export const NAME = "Tennessee Auto Insurance Agency";
export const SHORT = "TNAIA";
export const TAGLINE = "Insuring You For Less";

export const QUOTE = {
  /** Online auto quote (iwantinsurance) — used everywhere for "Get a Quote" */
  auto: "https://b01452c8-45f4-4f3e-90f9-5581bc2898f6.quotes.iwantinsurance.com/auto",
  /** Online property/renters quote, linked from the old renters pages */
  property: "https://b01452c8-45f4-4f3e-90f9-5581bc2898f6.quotes.iwantinsurance.com/property",
};
export const PAYMENT_PORTAL = "https://aa29fee1-6480-4638-9516-93882a24a9a2.insurancewebsitebuilder.com/payments.aspx";
export const REVIEW_URL = "https://www.iwantinsurance.com/agent/insuringyouforless.com/review/";
export const AGENT_PROFILE_URL = "https://www.iwantinsurance.com/agent/insuringyouforless.com/";

export const EMAIL = "auto@insuringyouforless.com";
export const FAX = "(615) 893-6181";
export const TOLL_FREE = "1-877-Auto599"; // shown on the TN license reinstatement page [CONFIRM still active]

export type Office = {
  slug: "murfreesboro" | "smyrna";
  name: string;
  street: string;
  suite?: string;
  city: string;
  state: "TN";
  zip: string;
  phone: string;
  tel: string;
  lat: number;
  lng: number;
  staff: string[]; // staff slugs
  /** Old-site display string (footer) */
  original: string;
};

export const OFFICES: Office[] = [
  {
    slug: "murfreesboro",
    name: "Murfreesboro Office",
    street: "925 S Church St.",
    suite: "Suite A300",
    city: "Murfreesboro",
    state: "TN",
    zip: "37130",
    phone: "(615) 893-6177",
    tel: "6158936177",
    lat: 35.833884,
    lng: -86.392663,
    staff: ["isabel-garcia", "melinda-hernandez", "ashley-lowe", "gaby-rincon"],
    original: "Murfreesboro Office: 925 S Church St. Suite A300, Murfreesboro, TN 37130",
  },
  {
    slug: "smyrna",
    name: "Smyrna Office",
    street: "244 N Lowry St.",
    city: "Smyrna",
    state: "TN",
    zip: "37167",
    phone: "(615) 624-8007",
    tel: "6156248007",
    lat: 35.992528,
    lng: -86.528115,
    staff: ["brianna-estrada", "crystal-shaw", "brandi-twaddle"],
    original: "Smyrna Office: 244 N Lowry Street, Smyrna, TN 37167",
  },
];
export const MAIN = OFFICES[0];

/** Mon–Fri 8:30 AM – 5:30 PM at both offices (old /locations/ page). */
export const HOURS = { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "17:30", label: "8:30 AM – 5:30 PM" };

export const directionsUrl = (o: Office) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${o.street} ${o.suite ?? ""}, ${o.city}, ${o.state} ${o.zip}`)}`;
export const mapEmbedUrl = (o: Office) =>
  `https://www.google.com/maps?q=${encodeURIComponent(`${NAME} ${o.street}, ${o.city}, ${o.state} ${o.zip}`)}&output=embed`;

export const SOCIALS = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/TennesseeAutoInsuranceAgency" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/tennesseeautoinsurance/" },
  { key: "google", label: "Google", href: "https://g.page/tennessee-auto-insurance-age-880?share" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/watch?v=fc6qSBDAeSw" },
  { key: "x", label: "X (Twitter)", href: "https://twitter.com/TNAutoInsurance" },
  // Old site linked an /admin/ URL; public company page used instead [CONFIRM]
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/11338281/" },
] as const;
export const YOUTUBE_ID = "fc6qSBDAeSw";

/** Service area, from the home + about pages (typos fixed: "Symrna", "La Verge"). */
export const SERVICE_AREA = [
  "Murfreesboro", "Smyrna", "La Vergne", "Nashville", "Hendersonville", "Gallatin", "Mount Juliet",
  "Shelbyville", "Franklin", "Manchester", "Tullahoma", "Antioch", "Woodbury", "Columbia",
];
