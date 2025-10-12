import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, ChevronRight } from 'lucide-react';
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">📚 Study Companion Hub</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Master topics before taking your CBT tests</p>
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
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="hover:shadow-lg transition-all cursor-pointer animate-fade-in hover-scale"
                    onClick={() => navigate(`/study-hub/topic/${topic.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">{topic.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {topic.subjects?.name}
                          </Badge>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-2">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>Difficulty: {topic.difficulty_level}/5</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
