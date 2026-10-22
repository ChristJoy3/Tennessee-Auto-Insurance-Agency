import { pageMeta } from "@/lib/seo";
import HomePage from "@/views/HomePage";

export const metadata = pageMeta({
  lang: "en",
  path: "/",
  description:
    "Tennessee Auto Insurance Agency: an independent agency in Murfreesboro & Smyrna, TN since 1998. Auto insurance, SR-22, license reinstatement, motorcycle, renters, homeowners, boat and RV. Insuring You For Less.",
});

export default function Page() {
  return <HomePage lang="en" />;
}
