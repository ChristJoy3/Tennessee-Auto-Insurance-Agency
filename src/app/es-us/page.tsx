import { pageMeta } from "@/lib/seo";
import HomePage from "@/views/HomePage";

export const metadata = pageMeta({
  lang: "es",
  path: "/",
  description:
    "Tennessee Auto Insurance Agency: agencia de seguros independiente en Murfreesboro y Smyrna, TN, desde 1998. Seguro de auto, SR-22, restablecimiento de licencia, motocicleta, inquilinos, propietarios, botes y RV.",
});

export default function Page() {
  return <HomePage lang="es" />;
}
