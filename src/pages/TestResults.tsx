import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Share2,
  Download,
  BarChart3,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ScheduleTestModal from "@/components/ScheduleTestModal";

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const attemptId = searchParams.get('attempt');

  useEffect(() => {
    if (location.state) {
      // Results passed from navigation
      setResults(location.state);
    } else if (attemptId) {
      // Fetch results using attempt ID
      fetchResultsByAttempt();
    }
  }, [location.state, attemptId]);

  const fetchResultsByAttempt = async () => {
    if (!attemptId) return;
    
    setLoading(true);
    try {
      // Fetch results from database
      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .select(`
          *,
          attempts!inner(
            id,
            exam_id,
            user_id,
            started_at,
            submitted_at,
            proctoring_data
          )
        `)
        .eq('attempt_id', attemptId)
        .maybeSingle();

      if (resultError) {
        console.error('Error fetching results:', resultError);
        toast({
          title: "Error",
          description: "Failed to load test results",
          variant: "destructive"
        });
        return;
      }

      if (!resultData) {
        console.log('No results found for attempt:', attemptId);
        // Don't show toast for missing results, just let the component show "No Results Found"
        return;
      }

      if (resultData) {
        // Get exam info from attempt's proctoring_data or exam (for backward compatibility)
        const proctoringData = resultData.attempts.proctoring_data as any || {};
        const examTitle = proctoringData.title || 'Practice Test';
        const examDuration = proctoringData.duration_minutes || 120;
        
        // Transform the data to match expected format
        const transformedResults: any = {
          score: Math.round(resultData.percentage || 0),
          totalQuestions: resultData.total_questions,
          correctAnswers: resultData.correct_answers,
          wrongAnswers: resultData.wrong_answers,
          unanswered: resultData.unanswered,
          timeTaken: resultData.time_taken_minutes,
          timeAllotted: examDuration,
          subjects: resultData.subject_breakdown ? Object.entries(resultData.subject_breakdown as any).map(([name, data]: [string, any]) => ({
            name,
            score: Math.round((data?.percentage ?? ((data?.correct ?? 0) / Math.max(1, data?.total ?? 0)) * 100) || 0),
            total: data?.total || 0,
            correct: data?.correct || 0
          })) : []
        };

        // Fallback: build subject breakdown from attempt_answers if missing
        if (!transformedResults.subjects || transformedResults.subjects.length === 0) {
          try {
            const { data: answers } = await supabase
              .from('attempt_answers')
              .select('question_id,is_correct')
              .eq('attempt_id', attemptId);

            const questionIds = (answers || []).map((a: any) => a.question_id).filter(Boolean);
            if (questionIds.length > 0) {
              const { data: questions } = await supabase
                .from('questions')
                .select('id, subject_id')
                .in('id', questionIds);

              const subjectIds = Array.from(new Set((questions || []).map((q: any) => q.subject_id).filter(Boolean)));
              const { data: subjects } = await supabase
                .from('subjects')
                .select('id, name')
                .in('id', subjectIds);

              const qById: Record<string, any> = {};
              (questions || []).forEach((q: any) => { qById[q.id] = q; });
              const subjectNameById: Record<string, string> = {};
              (subjects || []).forEach((s: any) => { subjectNameById[s.id] = s.name; });

              const stats: Record<string, { total: number; correct: number; percentage: number }> = {};
              (answers || []).forEach((a: any) => {
                const subjId = qById[a.question_id]?.subject_id;
                const subjName = subjectNameById[subjId] || 'General';
                if (!stats[subjName]) stats[subjName] = { total: 0, correct: 0, percentage: 0 };
                stats[subjName].total += 1;
                if (a.is_correct) stats[subjName].correct += 1;
              });
              Object.keys(stats).forEach((key) => {
                const s = stats[key];
                s.percentage = Math.round((s.correct / Math.max(1, s.total)) * 100);
              });

              transformedResults.subjects = Object.entries(stats).map(([name, data]: [string, any]) => ({
                name,
                score: data.percentage,
                total: data.total,
                correct: data.correct
              }));
            }
          } catch (e) {
            console.warn('Fallback subject breakdown failed:', e);
          }
        }
        
        setResults(transformedResults);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to load test results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 70) return { label: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 60) return { label: "Average", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const scoreBadge = results ? getScoreBadge(results.score) : { label: "Loading", color: "bg-gray-100 text-gray-800" };

  const recommendations = [
    {
      subject: "Mathematics",
      weakness: "Quadratic Equations",
      suggestion: "Practice more word problems and formula applications",
      resources: ["Video Tutorial: Quadratic Equations", "Practice Questions Set 1"]
    },
    {
      subject: "Physics",
      weakness: "Electromagnetic Induction",
      suggestion: "Review Faraday's law and Lenz's law concepts",
      resources: ["Physics Textbook Chapter 12", "Online Simulation Tool"]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              We couldn't find any test results to display.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-2">Test Results</h1>
            <p className="text-xl opacity-90">Your performance summary</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="text-center mb-8">
              <div className={`text-7xl font-bold mb-4 ${getScoreColor(results.score)}`}>
                {results.score}%
              </div>
              <Badge className={scoreBadge.color} variant="secondary">
                {scoreBadge.label}
              </Badge>
              <p className="text-muted-foreground mt-2">
                You scored {results.correctAnswers} out of {results.totalQuestions} questions correctly
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{results.wrongAnswers}</div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{results.unanswered}</div>
                <div className="text-sm text-muted-foreground">Unanswered</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{results.timeTaken}m</div>
                <div className="text-sm text-muted-foreground">Time Used</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <ScheduleTestModal>
                <Button>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Test
                </Button>
              </ScheduleTestModal>
              <Button 
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Test Results',
                      text: `I scored ${results.score}% on my recent test!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link Copied!",
                      description: "Results link copied to clipboard",
                    });
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Simple download functionality - could be enhanced later
                  const dataStr = JSON.stringify(results, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `test-results-${new Date().toISOString().split('T')[0]}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                  toast({
                    title: "Download Started",
                    description: "Test results downloaded successfully",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Link to="/dashboard">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="breakdown" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown">Subject Breakdown</TabsTrigger>
            <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown">
            <div className="grid md:grid-cols-2 gap-6">
              {results.subjects?.map((subject: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <Badge className={getScoreColor(subject.score)}>
                        {subject.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{subject.correct}/{subject.total}</span>
                        </div>
                        <Progress value={subject.score} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-bold text-green-600">{subject.correct}</div>
                          <div className="text-muted-foreground">Correct</div>
                        </div>
                        <div>
                          <div className="font-bold text-red-600">{subject.total - subject.correct}</div>
                          <div className="text-muted-foreground">Wrong</div>
                        </div>
                        <div>
                          <div className="font-bold text-muted-foreground">{subject.total}</div>
                          <div className="text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Accuracy Rate</span>
                    <span className="font-bold">{Math.round((results.correctAnswers / results.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Speed (Questions/min)</span>
                    <span className="font-bold">{(results.totalQuestions / results.timeTaken).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time Efficiency</span>
                    <span className="font-bold">{Math.round((results.timeTaken / results.timeAllotted) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-bold">{Math.round(((results.totalQuestions - results.unanswered) / results.totalQuestions) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Strong performance in English Language</li>
                        <li>• Good time management</li>
                        <li>• High completion rate</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-yellow-600 mb-2">Areas for Improvement</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Chemistry concepts need more practice</li>
                        <li>• Physics problem-solving speed</li>
                        <li>• Mathematical accuracy</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {rec.subject}
                    </CardTitle>
                    <CardDescription>Focus Area: {rec.weakness}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Recommended Action</h4>
                        <p className="text-muted-foreground">{rec.suggestion}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Study Resources</h4>
                        <div className="space-y-2">
                          {rec.resources.map((resource, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="text-sm">{resource}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/resources?subject=${encodeURIComponent(rec.subject)}`)}>
                        Start Studying {rec.subject}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Overall Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Based on your performance, we recommend focusing on Chemistry and Physics concepts 
                    while maintaining your strong performance in English and Mathematics. Consider taking 
                    subject-specific practice tests to improve in weaker areas.
                  </p>
                  <div className="flex gap-4">
                    <Button>
                      Create Study Plan
                    </Button>
                    <Button variant="outline">
                      Book Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestResults;