import StudyDeck from '@/components/StudyDeck';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudyDeck materialId={id} type="quiz" />;
}
