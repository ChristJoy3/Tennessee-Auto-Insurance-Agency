// Generated route wrapper: Spanish (/es-us/) → src/views/GlossaryView.tsx
import GlossaryView, { glossaryMetadata, glossaryParams } from "@/views/GlossaryView";

type Props = { params: Promise<{ letter: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => glossaryParams();

export async function generateMetadata({ params }: Props) {
  const { letter } = await params;
  return glossaryMetadata("es", letter);
}

export default async function Page({ params }: Props) {
  const { letter } = await params;
  return <GlossaryView lang="es" letter={letter} />;
}
