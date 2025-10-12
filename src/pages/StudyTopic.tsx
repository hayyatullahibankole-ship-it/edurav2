import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Video, Download, PlayCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  summary: string;
  estimated_minutes: number;
  display_order: number;
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  resource_url: string;
}

export default function StudyTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [topic, setTopic] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchTopicDetails();
    }
  }, [topicId]);

  const fetchTopicDetails = async () => {
    try {
      setLoading(true);

      const [topicRes, lessonsRes] = await Promise.all([
        supabase
          .from('study_topics')
          .select('*, subjects(name)')
          .eq('id', topicId)
          .single(),
        supabase
          .from('study_lessons')
          .select('*')
          .eq('topic_id', topicId)
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (topicRes.error) throw topicRes.error;
      if (lessonsRes.error) throw lessonsRes.error;

      setTopic(topicRes.data);
      setLessons(lessonsRes.data || []);
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast.error('Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Topic not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/study-hub')}
          className="mb-4"
        >
          ← Back to Study Hub
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{topic.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge>{topic.subjects?.name}</Badge>
            <Badge variant="secondary">{topic.exam_type}</Badge>
            <span className="text-sm text-muted-foreground">
              Difficulty: {topic.difficulty_level}/5
            </span>
          </div>
          <p className="text-muted-foreground">{topic.description}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Lessons ({lessons.length})</h2>
          
          {lessons.map((lesson, index) => (
            <Card 
              key={lesson.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/study-hub/lesson/${lesson.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Lesson {index + 1}
                      </span>
                    </div>
                    <CardTitle>{lesson.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {lesson.summary}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {lesson.estimated_minutes} min
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {lessons.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lessons available for this topic yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
