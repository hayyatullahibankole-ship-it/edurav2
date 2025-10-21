import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Calculator, Atom, Beaker, Globe2, BookOpen, TrendingUp, Briefcase, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { SubjectButton } from '@/components/dashboard/SubjectButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface Subject {
  id: string;
  name: string;
  course_category: string;
  is_active: boolean;
}

interface StudyTopic {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  exam_type: string;
  difficulty_level: number;
  subjects: { name: string };
}

const subjectIcons: Record<string, { icon: any; gradient: string }> = {
  'Mathematics': { icon: Calculator, gradient: 'from-blue-500 to-blue-600' },
  'Physics': { icon: Atom, gradient: 'from-purple-500 to-purple-600' },
  'Chemistry': { icon: Beaker, gradient: 'from-green-500 to-green-600' },
  'Biology': { icon: Sparkles, gradient: 'from-teal-500 to-teal-600' },
  'English': { icon: BookOpen, gradient: 'from-orange-500 to-orange-600' },
  'Geography': { icon: Globe2, gradient: 'from-cyan-500 to-cyan-600' },
  'Economics': { icon: TrendingUp, gradient: 'from-indigo-500 to-indigo-600' },
  'Commerce': { icon: Briefcase, gradient: 'from-pink-500 to-pink-600' },
};

export default function StudyHub() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canAccessPremium, loading: subLoading } = useSubscription();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subLoading && !canAccessPremium) {
      toast.error('Study Hub is available for Premium and Pro subscribers only');
      navigate('/payment');
      return;
    }

    if (canAccessPremium) {
      fetchSubjects();

      // Subscribe to real-time updates
      const topicsChannel = supabase
        .channel('study-topics-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_topics' }, () => {
          if (selectedSubject) {
            fetchTopics(selectedSubject);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(topicsChannel);
      };
    }
  }, [canAccessPremium, subLoading, navigate, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_topics')
        .select(`
          *,
          subjects (name)
        `)
        .eq('is_active', true)
        .eq('subject_id', subjectId)
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

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId);
    fetchTopics(subjectId);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setTopics([]);
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

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-8">
          <Button
            variant="ghost"
            onClick={selectedSubject ? handleBackToSubjects : () => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {selectedSubject ? 'Back to Subjects' : 'Back'}
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            Study Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            {selectedSubject ? 'Select a topic to study' : 'Choose a subject to get started'}
          </p>
        </div>

        {/* Subject Selection */}
        {!selectedSubject && (
          <div className="px-6 -mt-4">
            <div className="grid grid-cols-4 gap-4">
              {subjects.map((subject) => {
                const iconData = subjectIcons[subject.name] || { icon: Book, gradient: 'from-gray-500 to-gray-600' };
                return (
                  <SubjectButton
                    key={subject.id}
                    icon={iconData.icon}
                    title={subject.name}
                    gradient={iconData.gradient}
                    onClick={() => handleSubjectClick(subject.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Topics List */}
        {selectedSubject && (
          <div className="px-6 -mt-4">
            {topics.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                  <Book className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No topics available for this subject yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="hover:shadow-xl transition-all cursor-pointer animate-fade-in border-l-4"
                    style={{ borderLeftColor: `hsl(var(--primary))` }}
                    onClick={() => navigate(`/study-hub/topic/${topic.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 line-clamp-2">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {topic.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                              Level {topic.difficulty_level}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {topic.exam_type}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/10">
                          <Book className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop view
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
          <p className="text-sm sm:text-base text-muted-foreground">Master topics organized by subject</p>
        </div>

        {subjects.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <Book className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground text-center">No subjects available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => {
              const iconData = subjectIcons[subject.name] || { icon: Book, gradient: 'from-gray-500 to-gray-600' };
              const Icon = iconData.icon;
              return (
                <Card
                  key={subject.id}
                  className="hover:shadow-xl transition-all cursor-pointer animate-fade-in group"
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    fetchTopics(subject.id);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${iconData.gradient} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                      <Icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-lg">{subject.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
