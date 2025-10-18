import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface StudyTopic {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  exam_type: string;
  difficulty_level: number;
  subjects: { name: string };
}

export default function StudyHub() {
  const navigate = useNavigate();
  const { canAccessPremium, loading: subLoading } = useSubscription();
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [selectedExamType, setSelectedExamType] = useState('JAMB');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subLoading && !canAccessPremium) {
      toast.error('Study Hub is available for Premium and Pro subscribers only');
      navigate('/payment');
      return;
    }

    if (canAccessPremium) {
      fetchTopics();

      // Subscribe to real-time updates
      const topicsChannel = supabase
        .channel('study-topics-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_topics' }, () => {
          fetchTopics();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(topicsChannel);
      };
    }
  }, [canAccessPremium, subLoading, selectedExamType, navigate]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_topics')
        .select(`
          *,
          subjects (name)
        `)
        .eq('exam_type', selectedExamType as any)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load study topics');
    } finally {
      setLoading(false);
    }
  };

  if (subLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!canAccessPremium) {
    return null;
  }

  // Group topics by subject
  const topicsBySubject = topics.reduce((acc, topic) => {
    const subjectName = topic.subjects?.name || 'Other';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(topic);
    return acc;
  }, {} as Record<string, StudyTopic[]>);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">📚 Study Companion Hub</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Master topics organized by subject → lessons</p>
        </div>

        <Tabs value={selectedExamType} onValueChange={(val) => setSelectedExamType(val)} className="mb-6 sm:mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="JAMB" className="text-xs sm:text-sm">JAMB</TabsTrigger>
            <TabsTrigger value="WAEC" className="text-xs sm:text-sm">WAEC</TabsTrigger>
            <TabsTrigger value="NECO" className="text-xs sm:text-sm">NECO</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedExamType} className="mt-4 sm:mt-6">
            {topics.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Book className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground text-center">No study topics available yet for {selectedExamType}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(topicsBySubject).map(([subject, subjectTopics]) => (
                  <div key={subject} className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{subject}</h2>
                        <p className="text-xs text-muted-foreground">{subjectTopics.length} {subjectTopics.length === 1 ? 'topic' : 'topics'}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {subjectTopics.map((topic) => (
                        <Card 
                          key={topic.id} 
                          className="hover:shadow-lg transition-all cursor-pointer animate-fade-in hover-scale border-l-4"
                          style={{ borderLeftColor: `hsl(var(--primary))` }}
                          onClick={() => navigate(`/study-hub/topic/${topic.id}`)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">{topic.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Level {topic.difficulty_level}/5
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </div>
                            <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-2">
                              {topic.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
