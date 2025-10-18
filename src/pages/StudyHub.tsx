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
      <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="gap-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Hero Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Study Companion Hub
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Master every topic with organized lessons → Subjects → Exams
          </p>
        </div>

        <Tabs value={selectedExamType} onValueChange={(val) => setSelectedExamType(val)} className="mb-8 sm:mb-10">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
            <TabsTrigger value="JAMB" className="text-sm sm:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">
              JAMB
            </TabsTrigger>
            <TabsTrigger value="WAEC" className="text-sm sm:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">
              WAEC
            </TabsTrigger>
            <TabsTrigger value="NECO" className="text-sm sm:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">
              NECO
            </TabsTrigger>
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
              <div className="space-y-10">
                {Object.entries(topicsBySubject).map(([subject, subjectTopics]) => (
                  <div key={subject} className="animate-fade-in">
                    {/* Subject Header - Enhanced */}
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-primary/10">
                      <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl shadow-sm">
                        <Book className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {subject}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium">
                          {subjectTopics.length} {subjectTopics.length === 1 ? 'topic' : 'topics'} available
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {subjectTopics.map((topic) => (
                        <Card 
                          key={topic.id} 
                          className="group hover:shadow-2xl transition-all duration-300 cursor-pointer animate-fade-in hover:-translate-y-1 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-card to-card/50"
                          onClick={() => navigate(`/study-hub/topic/${topic.id}`)}
                        >
                          <CardHeader className="pb-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg sm:text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                  {topic.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="text-xs font-semibold">
                                    📊 Level {topic.difficulty_level}/5
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {topic.exam_type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                            <CardDescription className="line-clamp-3 text-sm leading-relaxed">
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
