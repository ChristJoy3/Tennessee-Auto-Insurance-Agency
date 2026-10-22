// Generated route wrapper: English → src/views/ContentView.tsx
import ContentView, { contentMetadata, contentParams } from "@/views/ContentView";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;
export const generateStaticParams = () => contentParams("en");

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return contentMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ContentView lang="en" slug={slug} />;
}
