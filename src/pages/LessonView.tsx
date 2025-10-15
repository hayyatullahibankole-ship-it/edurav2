import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, Download, PlayCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { MathRenderer } from '@/components/ui/math-renderer';

interface Lesson {
  id: string;
  title: string;
  content: string;
  summary: string;
  estimated_minutes: number;
  topic_id: string;
  media_urls?: any;
  study_topics: {
    title: string;
    subjects: { name: string };
  };
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  resource_url: string;
  duration_seconds?: number;
  file_size_bytes?: number;
}

interface Question {
  id: string;
  question_text: string;
  options: any;
  display_order: number;
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetails();
    }
  }, [lessonId]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);

      const [lessonRes, resourcesRes, questionsRes] = await Promise.all([
        supabase
          .from('study_lessons')
          .select('*, study_topics(title, subjects(name))')
          .eq('id', lessonId)
          .single(),
        supabase
          .from('study_resources')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('display_order'),
        supabase
          .from('lesson_questions')
          .select('*, questions(*)')
          .eq('lesson_id', lessonId)
          .order('display_order')
      ]);

      if (lessonRes.error) throw lessonRes.error;
      
      setLesson(lessonRes.data);
      setResources(resourcesRes.data || []);
      
      // Extract questions from the join
      const questionData = questionsRes.data?.map((lq: any) => ({
        id: lq.questions.id,
        question_text: lq.questions.question_text,
        options: lq.questions.options,
        display_order: lq.display_order
      })) || [];
      setQuestions(questionData);
      
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <PlayCircle className="h-5 w-5" />;
      case 'document':
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
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

  if (!lesson) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Lesson not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/study-hub/topic/${lesson.topic_id}`)}
          className="mb-4 text-xs sm:text-sm"
        >
          ← Back to Topic
        </Button>

        {/* Lesson Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="text-xs">{lesson.study_topics?.subjects?.name}</Badge>
            <Badge variant="secondary" className="text-xs">{lesson.study_topics?.title}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.estimated_minutes} minutes</span>
            </div>
          </div>
          {lesson.summary && (
            <p className="mt-4 text-muted-foreground">{lesson.summary}</p>
          )}
        </div>

        {/* Lesson Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Content
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-4">
            <MathRenderer content={lesson.content} />
            
            {/* Display media in the order they were uploaded */}
            {lesson.media_urls && Array.isArray(lesson.media_urls) && lesson.media_urls.length > 0 && (
              <div className="space-y-4 mt-6">
                {lesson.media_urls.map((media: any, index: number) => (
                  <div key={index} className="not-prose">
                    {media.type === 'image' ? (
                      <div className="space-y-2">
                        <img 
                          src={media.url} 
                          alt={media.caption || `Lesson image ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                        {media.caption && (
                          <p className="text-sm text-muted-foreground text-center italic">
                            {media.caption}
                          </p>
                        )}
                      </div>
                    ) : media.type === 'video' ? (
                      <div className="space-y-2">
                        <video 
                          controls 
                          className="w-full rounded-lg"
                          src={media.url}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {media.caption && (
                          <p className="text-sm text-muted-foreground text-center italic">
                            {media.caption}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Resources */}
        {resources.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Study Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getResourceIcon(resource.resource_type)}
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {resource.resource_type}
                          {resource.duration_seconds && ` • ${Math.round(resource.duration_seconds / 60)} min`}
                        </p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Practice Questions */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Practice Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id}>
                    <div className="mb-4">
                      <p className="font-medium mb-3">
                        {index + 1}. <MathRenderer content={question.question_text} />
                      </p>
                      <div className="space-y-2 ml-4">
                        {question.options && typeof question.options === 'object' && (
                          Array.isArray(question.options) ? (
                            question.options.map((option: string, optIndex: number) => (
                              <div key={optIndex} className="text-sm">
                                <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>{' '}
                                <MathRenderer content={option} />
                              </div>
                            ))
                          ) : (
                            Object.entries(question.options).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}.</span>{' '}
                                <MathRenderer content={String(value)} />
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>
                    {index < questions.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
