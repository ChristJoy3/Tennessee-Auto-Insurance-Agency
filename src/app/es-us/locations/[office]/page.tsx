// Generated route wrapper: Spanish (/es-us/) → src/views/AgencyViews.tsx
import { OfficeView, officeMetadata, officeParams } from "@/views/AgencyViews";

type Props = { params: Promise<{ office: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => officeParams();

export async function generateMetadata({ params }: Props) {
  const { office } = await params;
  return officeMetadata("es", office);
}

export default async function Page({ params }: Props) {
  const { office } = await params;
  return <OfficeView lang="es" slug={office} />;
}
