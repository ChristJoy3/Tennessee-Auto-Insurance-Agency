// Generated route wrapper: Spanish (/es-us/) → src/views/ContentView.tsx
import ContentView, { contentMetadata, contentParams } from "@/views/ContentView";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;
export const generateStaticParams = () => contentParams("es");

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return contentMetadata("es", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ContentView lang="es" slug={slug} />;
}
