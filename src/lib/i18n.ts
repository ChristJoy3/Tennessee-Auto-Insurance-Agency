/**
 * Two locales: English at "/", Spanish at "/es-us/" (mirrors the old site's Spanish URLs).
 * Spanish UI strings not found on the old site are new translations: [REVIEW TRANSLATION].
 */
export type Lang = "en" | "es";
export const LOCALES: Lang[] = ["en", "es"];
export const HTML_LANG: Record<Lang, string> = { en: "en-US", es: "es-US" };

/** Prefix an English path for the given language: href("es", "/about/") → "/es-us/about/" */
export function href(lang: Lang, path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  if (lang === "en") return path;
  return path === "/" ? "/es-us/" : `/es-us${path}`;
}
/** The same page in the other language. */
export function altPath(path: string): { en: string; es: string } {
  const en = path.replace(/^\/es-us(?=\/|$)/, "") || "/";
  return { en, es: href("es", en) };
}

const en = {
  quote: "Get a Quote",
  call: "Call",
  callUs: "Call Us",
  directions: "Directions",
  pay: "Pay",
  menu: "Menu",
  close: "Close",
  skip: "Skip",
  langName: "English",
  otherLang: "Español",
  milesSince: "MILES SINCE 1998",
  since: "SINCE 1998",
  area: "MURFREESBORO · SMYRNA · ALL OF TENNESSEE",
  heroTitle: ["Insuring", "you", "for less."],
  heroSub: "Auto insurance in Murfreesboro & Smyrna, TN. An independent agency that shops several carriers to find the right rate for you.",
  productsLabel: "CHOOSE YOUR COVERAGE",
  productsTitle: "Every mile, covered.",
  productsIntro: "We browse through a wide variety of coverages and find the right one for you.",
  learnMore: "Learn more",
  agencyLabel: "WHY AN INDEPENDENT AGENCY",
  agencyTitle: "One call. Several carriers. The rate that fits you.",
  agencyBody:
    "As an independent insurance agency, we are able to obtain several quotes through multiple carriers to provide the consumer with the best rate.",
  agencyBody2: "Shopping for insurance can be difficult, but our staff does the work for you.",
  laneYou: "You",
  laneBest: "Your best rate",
  carriersLabel: "OUR CARRIERS",
  carriersTitle: "Featured carriers",
  allCarriers: "See all carriers",
  sr22Label: "SR-22 & LICENSE REINSTATEMENT",
  sr22Title: "Back on the road, without the stress.",
  storyLabel: "SINCE 1998",
  storyYears: "years serving Tennessee",
  teamLabel: "MEET THE TEAM",
  teamTitle: "Real people. Two local offices.",
  agent: "Agent",
  testimonialsLabel: "WHAT CLIENTS SAY",
  testimonialsTitle: "Customer ratings & reviews",
  reviews: "Reviews",
  leaveReview: "Leave a Review",
  readAll: "Read all reviews",
  officesLabel: "TWO OFFICES",
  officesTitle: "Stop by. We're on your route.",
  hours: "Hours",
  hoursValue: "Monday – Friday, 8:30 AM – 5:30 PM",
  staff: "Staff",
  getDirections: "Get directions",
  serviceArea: "Serving all of Tennessee, including",
  waysLabel: "THREE WAYS TO START",
  waysTitle: "We are here for you. Get started with a quote.",
  quoteNow: "Quote Now",
  stopBy: "Stop By",
  blogLabel: "FROM THE BLOG",
  blogTitle: "Road-tested advice",
  allPosts: "All posts",
  readMore: "Read more",
  contactLabel: "CONTACT",
  contactTitle: "Let's get you covered.",
  email: "Email",
  fax: "Fax",
  formFirst: "First Name",
  formLast: "Last Name",
  formEmail: "Email Address",
  formPhone: "Phone Number",
  formInquiry: "Inquiry Type",
  formOffice: "Preferred office",
  formLanguage: "Preferred language",
  formComments: "Comments",
  formSend: "Send by email",
  formNote: "This opens your email app with your message ready to send to auto@insuringyouforless.com.",
  footerResources: "Resources",
  makePayment: "Make a Payment",
  reportClaim: "Report a Claim",
  refer: "Refer a Friend",
  glossary: "Insurance Glossary",
  privacy: "Privacy Policy",
  resources: "News and Other Resources",
  rights: "All rights reserved.",
  chooseOffice: "Choose an office",
  englishOnly: "",
  breadcrumbHome: "Home",
  ctaTitle: "Ready when you are.",
  ctaBody: "Get a quote online or call our team. We do the shopping for you.",
  search: "Search terms",
  noResults: "No terms match your search.",
  page: "Page",
  tags: "Tags",
  posted: "Posted",
  watchVideo: "Watch our video",
  loadMap: "Show map",
  officeHoursShort: "Mon–Fri 8:30–5:30",
};

const es: typeof en = {
  quote: "Obtenga una cotización",
  call: "Llamar",
  callUs: "Llámenos",
  directions: "Cómo llegar",
  pay: "Pagar",
  menu: "Menú",
  close: "Cerrar",
  skip: "Saltar",
  langName: "Español",
  otherLang: "English",
  milesSince: "DESDE 1998",
  since: "DESDE 1998",
  area: "MURFREESBORO · SMYRNA · TODO TENNESSEE",
  heroTitle: ["Asegurándolo", "por", "menos."], // [REVIEW TRANSLATION]
  heroSub:
    "Seguro de auto en Murfreesboro y Smyrna, TN. Una agencia independiente que compara varias aseguradoras para encontrar la tarifa adecuada para usted.", // [REVIEW TRANSLATION]
  productsLabel: "ELIJA SU COBERTURA",
  productsTitle: "Cada milla, cubierta.", // [REVIEW TRANSLATION]
  productsIntro: "Examinamos una amplia variedad de coberturas y encontramos la adecuada para usted.", // original ES site
  learnMore: "Más información",
  agencyLabel: "POR QUÉ UNA AGENCIA INDEPENDIENTE",
  agencyTitle: "Una llamada. Varias aseguradoras. La tarifa que le conviene.", // [REVIEW TRANSLATION]
  agencyBody:
    "Como agencia de seguros independiente, podemos obtener varias cotizaciones de múltiples aseguradoras para ofrecerle al consumidor la mejor tarifa.", // [REVIEW TRANSLATION]
  agencyBody2: "Comprar un seguro puede ser difícil, pero nuestro personal hace el trabajo por usted.", // original ES site
  laneYou: "Usted",
  laneBest: "Su mejor tarifa",
  carriersLabel: "NUESTRAS ASEGURADORAS",
  carriersTitle: "Aseguradoras destacadas",
  allCarriers: "Ver todas las aseguradoras",
  sr22Label: "SR-22 Y RESTABLECIMIENTO DE LICENCIA",
  sr22Title: "De vuelta en el camino, sin estrés.", // [REVIEW TRANSLATION]
  storyLabel: "DESDE 1998",
  storyYears: "años sirviendo a Tennessee",
  teamLabel: "NUESTRO PERSONAL",
  teamTitle: "Personas reales. Dos oficinas locales.", // [REVIEW TRANSLATION]
  agent: "Agente",
  testimonialsLabel: "LO QUE DICEN LOS CLIENTES",
  testimonialsTitle: "Calificaciones y reseñas de clientes",
  reviews: "Reseñas",
  leaveReview: "Deje una reseña",
  readAll: "Ver todas las reseñas",
  officesLabel: "DOS OFICINAS",
  officesTitle: "Visítenos. Estamos en su camino.", // [REVIEW TRANSLATION]
  hours: "Horario",
  hoursValue: "Lunes a viernes, 8:30 AM – 5:30 PM",
  staff: "Personal",
  getDirections: "Cómo llegar",
  serviceArea: "Servimos a todo Tennessee, incluyendo",
  waysLabel: "TRES FORMAS DE EMPEZAR",
  waysTitle: "Nosotros estamos aquí para usted. Comience con una cotización.", // original ES site (adapted)
  quoteNow: "Cotizar ahora",
  stopBy: "Visítenos",
  blogLabel: "DEL BLOG",
  blogTitle: "Consejos para el camino", // [REVIEW TRANSLATION]
  allPosts: "Todas las publicaciones",
  readMore: "Leer más",
  contactLabel: "CONTACTO",
  contactTitle: "Vamos a protegerlo.", // [REVIEW TRANSLATION]
  email: "Correo electrónico",
  fax: "Fax",
  formFirst: "Nombre",
  formLast: "Apellido",
  formEmail: "Correo electrónico",
  formPhone: "Número de teléfono",
  formInquiry: "Tipo de consulta",
  formOffice: "Oficina preferida",
  formLanguage: "Idioma preferido",
  formComments: "Comentarios",
  formSend: "Enviar por correo",
  formNote: "Se abrirá su aplicación de correo con su mensaje listo para enviar a auto@insuringyouforless.com.",
  footerResources: "Recursos",
  makePayment: "Realizar un pago",
  reportClaim: "Informar un reclamo",
  refer: "Recomendar a un amigo",
  glossary: "Glosario de seguros",
  privacy: "Política de privacidad",
  resources: "Noticias y otros recursos",
  rights: "Todos los derechos reservados.",
  chooseOffice: "Elija una oficina",
  englishOnly: "Este contenido está disponible solo en inglés en este momento.",
  breadcrumbHome: "Inicio",
  ctaTitle: "Listos cuando usted lo esté.", // [REVIEW TRANSLATION]
  ctaBody: "Cotice en línea o llame a nuestro equipo. Nosotros comparamos por usted.", // [REVIEW TRANSLATION]
  search: "Buscar términos",
  noResults: "Ningún término coincide con su búsqueda.",
  page: "Página",
  tags: "Etiquetas",
  posted: "Publicado",
  watchVideo: "Vea nuestro video",
  loadMap: "Mostrar mapa",
  officeHoursShort: "Lun–Vie 8:30–5:30",
};

export const DICT = { en, es };
export type Dict = typeof en;
export const t = (lang: Lang) => DICT[lang];
