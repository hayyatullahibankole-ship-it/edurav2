import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Video, Download, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  summary: string;
  estimated_minutes: number;
  display_order: number;
  isCompleted?: boolean;
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

      const [topicRes, lessonsRes, completionsRes] = await Promise.all([
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
          .order('display_order'),
        supabase
          .from('lesson_completions')
          .select('lesson_id')
      ]);

      if (topicRes.error) throw topicRes.error;
      if (lessonsRes.error) throw lessonsRes.error;

      setTopic(topicRes.data);

      // Mark completed lessons
      const completedLessonIds = new Set(
        completionsRes.data?.map(c => c.lesson_id) || []
      );

      const lessonsWithCompletion = (lessonsRes.data || []).map(lesson => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id)
      }));

      setLessons(lessonsWithCompletion);
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
      <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Button
          variant="outline"
          onClick={() => navigate('/study-hub')}
          className="mb-6 gap-2 hover:bg-primary/10 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Study Hub
        </Button>

        {/* Topic Hero Section */}
        <div className="mb-10 sm:mb-12 relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl shadow-lg">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {topic.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="text-sm px-3 py-1">{topic.subjects?.name}</Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">{topic.exam_type}</Badge>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    📊 Difficulty: {topic.difficulty_level}/5
                  </span>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {topic.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Course Lessons</h2>
              <p className="text-sm text-muted-foreground mt-1">{lessons.length} lessons to master this topic</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {lessons.filter(l => l.isCompleted).length}/{lessons.length} Done
            </Badge>
          </div>
          
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Card 
                key={lesson.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer animate-fade-in hover:-translate-y-1 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-card to-card/50"
                onClick={() => navigate(`/study-hub/lesson/${lesson.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {/* Lesson Number Badge */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
                      lesson.isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-br from-primary to-secondary text-white'
                    }`}>
                      {lesson.isCompleted ? <CheckCircle2 className="h-7 w-7" /> : index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary">
                          Lesson {index + 1}
                        </span>
                        {lesson.isCompleted && (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                            ✓ Completed
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.estimated_minutes} min
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </CardTitle>
                      
                      <CardDescription className="text-sm sm:text-base line-clamp-2 leading-relaxed">
                        {lesson.summary}
                      </CardDescription>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <PlayCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {lessons.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground text-center">No lessons available for this topic yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
