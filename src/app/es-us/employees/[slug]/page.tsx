// Generated route wrapper: Spanish (/es-us/) → src/views/AgencyViews.tsx
import { StaffView, staffMetadata, staffParams } from "@/views/AgencyViews";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => staffParams();

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return staffMetadata("es", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <StaffView lang="es" slug={slug} />;
}
