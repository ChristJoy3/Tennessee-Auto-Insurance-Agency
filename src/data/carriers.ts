/**
 * Carriers, from the old /links.aspx (Helpful Links), /payments.aspx (Company Payment Links)
 * and /claims.aspx (Direct 24/7 Claims Reporting) pages — phone numbers and URLs verbatim.
 * Logos are shown exactly as downloaded (no recolor/crop).
 */
export type Carrier = {
  slug: string;
  name: string;
  logo: string; // primary logo
  logoW: number;
  logoH: number;
  /** Featured in the old home page slider */
  featured: boolean;
  claimsPhone?: string;
  website?: { label: string; href: string };
  payment?: { phone?: string; href: string; label?: string };
  note?: string;
};

export const CARRIERS: Carrier[] = [
  {
    slug: "trexis",
    name: "Trexis",
    logo: "/images/carriers/carrier-trexis-insurance.jpg", logoW: 200, logoH: 78,
    featured: true,
    claimsPhone: "1-877-884-7466",
    website: { label: "WWW.ALFAPOLICY.COM", href: "https://beta.alfapolicy.com/" },
    payment: { label: "Trexis Insurance", phone: "1-877-784-7466", href: "https://www.trexis.com/#Registration" },
    note: "Claims phone 1-877-884-7466 vs. payments phone 1-877-784-7466 differ on the old site [CONFIRM]",
  },
  {
    slug: "the-general",
    name: "The General",
    logo: "/images/carriers/carrier-the-general.png", logoW: 450, logoH: 141,
    featured: true,
    claimsPhone: "1-800-280-1466",
    website: { label: "WWW.THEGENERAL.COM", href: "https://www.thegeneral.com/" },
    payment: { phone: "1-800-246-9618", href: "https://www.thegeneral.com/mypolicy/welcome.htm" },
  },
  {
    slug: "progressive",
    name: "Progressive",
    logo: "/images/carriers/carrier-progressive-2.png", logoW: 816, logoH: 130,
    featured: true,
    claimsPhone: "1-800-929-2886",
    website: { label: "WWW.DRIVEINSURANCE.COM", href: "http://www.driveinsurance.com/" },
    payment: { phone: "1-800-876-5581", href: "https://account.progressive.com/access/login?cntgrp=R" },
  },
  {
    slug: "preferred",
    name: "Preferred",
    logo: "/images/carriers/carrier-preferred.png", logoW: 172, logoH: 85,
    featured: true,
    claimsPhone: "1-901-328-2000",
    website: { label: "WWW.PAIC.COM", href: "https://paic.com/" },
    payment: { href: "https://paic.biz/login.max?preprocess=true&CCare=1" },
  },
  {
    slug: "first-acceptance",
    name: "First Acceptance",
    logo: "/images/carriers/carrier-first-acceptance.jpg", logoW: 775, logoH: 515,
    featured: true,
    claimsPhone: "1-800-321-0899",
    website: { label: "WWW.FIRSTACCEPTANCECORP.COM", href: "https://www.acceptanceinsurance.com/" },
    payment: { phone: "1-800-321-0899", href: "https://www.acceptanceinsurance.com/my-account/register" },
  },
  {
    slug: "haulers",
    name: "Haulers",
    logo: "/images/carriers/carrier-haulers.png", logoW: 328, logoH: 151,
    featured: true,
    claimsPhone: "1-866-665-1003",
    website: { label: "WWW.HAULERSINSURANCE.COM", href: "https://haulersinsurance.com/" },
    payment: { phone: "1-877-765-3690", href: "https://www.haulersinsurance.com/quickpay.html" },
  },
  {
    slug: "gainsco",
    name: "Gainsco",
    logo: "/images/carriers/carrier-gainsco.jpg", logoW: 500, logoH: 222,
    featured: false,
    claimsPhone: "1-866-424-6726",
    website: { label: "WWW.GAINSCO.COM", href: "https://www.gainsco.com/" },
    payment: { phone: "1-866-", href: "https://web.mgaebp.com/mgaw/WebPay/BillInfo" },
    note: "Payment phone is incomplete on the old site (\"1-866-\") [CONFIRM]",
  },
  {
    slug: "safeway",
    name: "Safeway",
    logo: "/images/carriers/carrier-safeway.png", logoW: 520, logoH: 117,
    featured: false,
    website: { label: "WWW.SAFEWAYINSURANCE.COM", href: "https://www.safewayinsurance.com/" },
    payment: { phone: "1-800-659-6551", href: "https://www.mysafeway.com/default.aspx?Lang=EN" },
  },
  {
    slug: "auto-advantage",
    name: "Auto Advantage",
    logo: "/images/carriers/carrier-auto-advantage.jpg", logoW: 523, logoH: 173,
    featured: false,
    payment: { phone: "1-800-422-0792", href: "https://c50-prod.diamondasaservice.com/diamondweb/(S(ixklmcy02efe2kkf3mswywij))/consumer" },
    note: "Old site shows the Mendota Insurance logo for Auto Advantage [CONFIRM]",
  },
  {
    slug: "dairyland",
    name: "Dairyland",
    logo: "/images/carriers/carrier-dairyland.png", logoW: 520, logoH: 168,
    featured: false,
    payment: { phone: "1-800-334-0090", href: "https://my.dairylandinsurance.com/j_security_check" },
  },
];

/** Other logo versions used on the old site (kept so nothing is lost; shown in an archive strip). */
export const LEGACY_LOGOS = [
  { src: "/images/carriers/carrier-first-acceptance-insurance.jpg", alt: "First Acceptance Insurance logo (small version)" },
  { src: "/images/carriers/carrier-haulers.jpg", alt: "Haulers Insurance Company logo (older version)" },
  { src: "/images/carriers/carrier-preferred.jpg", alt: "Preferred Auto Insurance Company logo (alternate version)" },
  { src: "/images/carriers/carrier-progressive.jpg", alt: "Progressive logo (small version)" },
  { src: "/images/carriers/carrier-progressive.png", alt: "Drive Insurance (Progressive) logo" },
  { src: "/images/carriers/carrier-the-general.jpg", alt: "The General Insurance logo (small version)" },
];
/** Old /links.aspx entry for First Acceptance pointed to a review page instead of the carrier. */
export const LINKS_PAGE_EXTRA = {
  firstAcceptanceInfo: "https://www.insure.com/companies/first-acceptance-car-insurance.html",
  trexisWebsite: "https://beta.alfapolicy.com/",
};
