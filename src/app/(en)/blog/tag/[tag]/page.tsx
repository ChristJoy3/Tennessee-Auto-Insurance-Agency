// Generated route wrapper: English → src/views/BlogViews.tsx
import { TagView, tagMetadata, tagParams } from "@/views/BlogViews";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => tagParams();

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return tagMetadata("en", tag);
}

export default async function Page({ params }: Props) {
  const { tag } = await params;
  return <TagView lang="en" tag={tag} />;
}
