import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, RotateCcw, Home, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultsActionsProps {
  attemptId: string;
  onDownloadReport?: () => void;
}

export const ResultsActions = ({ attemptId, onDownloadReport }: ResultsActionsProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <Button asChild variant="default" size="lg">
            <Link to={`/answer-review?attempt=${attemptId}`}>
              <Eye className="w-4 h-4 mr-2" />
              Review Answers
            </Link>
          </Button>

          {onDownloadReport && (
            <Button onClick={onDownloadReport} variant="outline" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}

          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Test
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
