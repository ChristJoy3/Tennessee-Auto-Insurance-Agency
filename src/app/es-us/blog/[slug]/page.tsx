// Generated route wrapper: Spanish (/es-us/) → src/views/BlogViews.tsx
import { BlogSlugView, blogSlugMetadata, blogSlugParams } from "@/views/BlogViews";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => blogSlugParams();

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return blogSlugMetadata("es", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogSlugView lang="es" slug={slug} />;
}
