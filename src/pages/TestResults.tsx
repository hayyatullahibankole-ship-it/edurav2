import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useResultsData } from '@/hooks/useResultsData';
import { ResultsSummaryCard } from '@/components/results/ResultsSummaryCard';
import { SubjectBreakdownCard } from '@/components/results/SubjectBreakdownCard';
import { ResultsActions } from '@/components/results/ResultsActions';

const TestResults = () => {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { results, loading } = useResultsData(attemptId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <ResultsSummaryCard results={results} />
          <SubjectBreakdownCard results={results} />
          <ResultsActions attemptId={attemptId!} />
        </div>
      </div>
    </div>
  );
};

export default TestResults;
