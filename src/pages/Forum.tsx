import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, ThumbsUp, Eye, Pin, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  is_solved: boolean;
  is_pinned: boolean;
  is_featured: boolean;
  upvotes: number;
  reply_count: number;
  view_count: number;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
  };
  subjects?: {
    name: string;
  };
}

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access the forum');
      navigate('/auth');
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users (first_name, last_name),
          subjects (name)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">💬 Discussion Forum</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Ask questions and get help from tutors and peers</p>
            </div>
            <Button onClick={() => navigate('/forum/new')} className="w-full sm:w-auto">
              Ask Question
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card 
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
              onClick={() => navigate(`/forum/post/${post.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.is_pinned && (
                      <Badge variant="default" className="text-xs">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    {post.is_solved && (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Solved
                      </Badge>
                    )}
                    {post.subjects && (
                      <Badge variant="secondary" className="text-xs">{post.subjects.name}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl leading-tight">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {post.content}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="truncate">
                      by {post.users?.first_name} {post.users?.last_name}
                    </span>
                    <span className="text-xs">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{post.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{post.reply_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{post.view_count}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground text-center">
                  {searchQuery ? 'No posts found matching your search' : 'No discussions yet. Be the first to ask a question!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
