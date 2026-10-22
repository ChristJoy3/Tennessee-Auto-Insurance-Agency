import type { Lang } from "./i18n";
import { PRODUCTS } from "@/data/products";

/** Every page of the site, grouped for the fullscreen menu and the footer. */
export function navGroups(lang: Lang) {
  const es = lang === "es";
  return [
    {
      title: es ? "Cobertura" : "Coverage",
      links: PRODUCTS.map((p) => ({ label: p.name[lang], path: p.path })).concat([
        { label: es ? "Negocios y comercial" : "Business & Commercial", path: "/business/" },
        { label: es ? "Propiedad en alquiler" : "Rental Property", path: "/rental_property/" },
      ]),
    },
    {
      title: es ? "La agencia" : "The Agency",
      links: [
        { label: es ? "Sobre nosotros" : "About Us", path: "/about/" },
        { label: es ? "Nuestro personal" : "Our Staff", path: "/employees/" },
        { label: es ? "Ubicaciones" : "Locations", path: "/locations/" },
        { label: es ? "Testimonios" : "Testimonials", path: "/testimonials/" },
        { label: es ? "Nuestras aseguradoras" : "Our Carriers", path: "/carriers/" },
        { label: es ? "Contáctenos" : "Contact Us", path: "/contact/" },
      ],
    },
    {
      title: es ? "Servicio al cliente" : "Customer Service",
      links: [
        { label: es ? "Obtenga una cotización" : "Get a Quote", path: "/get_a_quote/" },
        { label: es ? "Realizar un pago" : "Make a Payment", path: "/payments/" },
        { label: es ? "Informar un reclamo" : "Report a Claim", path: "/claims/" },
        { label: es ? "Recomendar a un amigo" : "Refer a Friend", path: "/refer/" },
      ],
    },
    {
      title: es ? "Aprenda" : "Learn",
      links: [
        { label: "Blog", path: "/blog/" },
        { label: es ? "Glosario de seguros" : "Insurance Glossary", path: "/glossary/a/" },
        { label: es ? "Noticias y otros recursos" : "News and Other Resources", path: "/resources/" },
        { label: es ? "Política de privacidad" : "Privacy Policy", path: "/privacy/" },
      ],
    },
    {
      title: es ? "Áreas que atendemos" : "Areas We Service",
      links: [
        { label: "Murfreesboro, TN", path: "/areas-we-service/murfreesboro/" },
        { label: "Smyrna, TN", path: "/auto-insurance-smyrna/" },
        { label: "La Vergne, TN", path: "/auto-insurance-la-vergne/" },
        { label: "Antioch, TN", path: "/auto-insurance-antioch/" },
        { label: "Nashville, TN", path: "/areas-of-service/nashville/" },
        { label: "Hendersonville, TN", path: "/areas-of-service/hendersonville/" },
        { label: es ? "Smyrna (historia)" : "Welcome to Smyrna", path: "/content/smyrna/" },
      ],
    },
  ];
}
