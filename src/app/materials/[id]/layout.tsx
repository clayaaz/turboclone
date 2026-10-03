import MaterialShell from '@/components/MaterialShell';

export default async function MaterialLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MaterialShell materialId={id}>{children}</MaterialShell>;
}
