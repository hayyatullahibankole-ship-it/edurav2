import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Trash2, Play, Calendar } from 'lucide-react';
import { OfflineExamManager } from '@/utils/offlineExamManager';
import { OfflineExam } from '@/utils/offlineStorage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/hooks/useOffline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const OfflineExams = () => {
  const [offlineExams, setOfflineExams] = useState<OfflineExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<string>('jamb');
  const { isOnline } = useOffline();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadOfflineExams();
  }, []);

  const loadOfflineExams = async () => {
    try {
      setLoading(true);
      const exams = await OfflineExamManager.getAvailableOfflineExams();
      setOfflineExams(exams);
    } catch (error) {
      console.error('Error loading offline exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!isOnline) {
      toast({
        title: 'No Internet Connection',
        description: 'You need to be online to download exams.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDownloading(true);

      // Get subjects for the exam type
      const { data: examData } = await supabase
        .from('exams')
        .select(`
          id,
          exam_subjects (
            subject_id
          )
        `)
        .eq('type', selectedExamType as any)
        .eq('is_published', true)
        .single();

      if (!examData) {
        throw new Error('Exam not found');
      }

      const subjectIds = examData.exam_subjects.map((es: any) => es.subject_id);

      const examId = await OfflineExamManager.downloadExamForOffline(
        selectedExamType,
        subjectIds,
        10
      );

      toast({
        title: 'Download Complete! 📥',
        description: 'Exam downloaded successfully. You can now practice offline.',
      });

      await loadOfflineExams();
    } catch (error) {
      console.error('Error downloading exam:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download exam. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    try {
      await OfflineExamManager.deleteOfflineExam(examId);
      toast({
        title: 'Exam Deleted',
        description: 'Offline exam has been removed.',
      });
      await loadOfflineExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete exam.',
        variant: 'destructive',
      });
    }
  };

  const handleStartExam = async (examId: string) => {
    try {
      const attemptId = await OfflineExamManager.startOfflineAttempt(examId);
      navigate(`/practice?offline=${attemptId}`);
    } catch (error) {
      console.error('Error starting exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to start exam.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Offline Exams</CardTitle>
            <CardDescription>
              Download exams to practice without internet connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Download Section */}
            <div className="p-6 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5" />
                <h3 className="font-semibold">Download New Exam</h3>
              </div>
              
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamb">JAMB</SelectItem>
                  <SelectItem value="waec">WAEC</SelectItem>
                  <SelectItem value="neco">NECO</SelectItem>
                  <SelectItem value="post-utme">Post-UTME</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleDownload}
                disabled={downloading || !isOnline}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download for Offline'}
              </Button>

              {!isOnline && (
                <p className="text-sm text-muted-foreground text-center">
                  Connect to internet to download exams
                </p>
              )}
            </div>

            {/* Offline Exams List */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Downloaded Exams ({offlineExams.length})
              </h3>

              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : offlineExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No offline exams yet</p>
                  <p className="text-sm mt-2">Download exams to practice offline</p>
                </div>
              ) : (
                offlineExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg uppercase">
                              {exam.examType}
                            </h4>
                            <Badge variant="secondary">
                              {exam.questions.length} Questions
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Downloaded: {new Date(exam.downloadedAt).toLocaleDateString()}
                            </span>
                            <span>
                              Expires: {new Date(exam.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStartExam(exam.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Info Card */}
            <div className="p-4 bg-info/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Offline Mode Tips:</strong>
                <br />
                • Downloaded exams expire after 7 days
                <br />
                • Answers are revealed only after submission
                <br />
                • Your attempts will sync when you're back online
                <br />
                • Make sure to have enough storage space on your device
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfflineExams;
