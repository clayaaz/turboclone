import StudyDeck from '@/components/StudyDeck';

export default async function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudyDeck materialId={id} type="flashcards" />;
}
