// Generated route wrapper: English → src/views/GlossaryView.tsx
import GlossaryView, { glossaryMetadata, glossaryParams } from "@/views/GlossaryView";

type Props = { params: Promise<{ letter: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => glossaryParams();

export async function generateMetadata({ params }: Props) {
  const { letter } = await params;
  return glossaryMetadata("en", letter);
}

export default async function Page({ params }: Props) {
  const { letter } = await params;
  return <GlossaryView lang="en" letter={letter} />;
}
