import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageSquare, Pin, Star, Trash2, Eye, CheckCircle, XCircle, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ForumManager() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, repliesRes] = await Promise.all([
        supabase
          .from('forum_posts')
          .select('*, users(first_name, last_name, email), subjects(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('forum_replies')
          .select('*, users(first_name, last_name, email), forum_posts(title)')
          .order('created_at', { ascending: false })
      ]);

      if (postsRes.error) throw postsRes.error;
      if (repliesRes.error) throw repliesRes.error;

      setPosts(postsRes.data || []);
      setReplies(repliesRes.data || []);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePinned = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_pinned: !currentStatus })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Post ${!currentStatus ? 'pinned' : 'unpinned'} successfully`
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post',
        variant: 'destructive'
      });
    }
  };

  const handleToggleFeatured = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_featured: !currentStatus })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Post ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post',
        variant: 'destructive'
      });
    }
  };

  const handleToggleSolved = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          is_solved: !currentStatus,
          solved_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Post marked as ${!currentStatus ? 'solved' : 'unsolved'}`
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This will also delete all replies.')) return;

    try {
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Post deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Reply deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete reply',
        variant: 'destructive'
      });
    }
  };

  const viewPost = async (post: any) => {
    setSelectedPost(post);
    
    // Fetch replies for this post
    const { data: postReplies } = await supabase
      .from('forum_replies')
      .select('*, users(first_name, last_name, email)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    setSelectedPost({ ...post, replies: postReplies || [] });
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forum Management</h2>
          <p className="text-muted-foreground">Moderate posts, feature helpful threads, and manage discussions</p>
        </div>
        <div className="flex gap-2">
          <Card className="px-4 py-2">
            <div className="text-2xl font-bold">{posts.length}</div>
            <div className="text-xs text-muted-foreground">Total Posts</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-2xl font-bold">{replies.length}</div>
            <div className="text-xs text-muted-foreground">Total Replies</div>
          </Card>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Forum Posts</h3>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {post.title}
                      {post.is_pinned && (
                        <Badge variant="default">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.is_featured && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {post.is_solved && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Solved
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      By {post.users?.first_name} {post.users?.last_name} • {new Date(post.created_at).toLocaleDateString()}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {post.subjects && <Badge variant="outline">{post.subjects.name}</Badge>}
                      {post.exam_type && <Badge variant="outline">{post.exam_type.toUpperCase()}</Badge>}
                      <Badge variant="outline">👍 {post.upvotes}</Badge>
                      <Badge variant="outline">💬 {post.reply_count}</Badge>
                      <Badge variant="outline">👁️ {post.view_count}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => viewPost(post)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={post.is_pinned ? "default" : "ghost"} 
                      onClick={() => handleTogglePinned(post.id, post.is_pinned)}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={post.is_featured ? "secondary" : "ghost"} 
                      onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={post.is_solved ? "default" : "ghost"} 
                      onClick={() => handleToggleSolved(post.id, post.is_solved)}
                    >
                      {post.is_solved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View Post Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Posted by {selectedPost.users?.first_name} {selectedPost.users?.last_name} on{' '}
                  {new Date(selectedPost.created_at).toLocaleString()}
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              </div>

              {selectedPost.replies?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Replies ({selectedPost.replies.length})</h4>
                  <div className="space-y-3">
                    {selectedPost.replies.map((reply: any) => (
                      <div key={reply.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {reply.users?.first_name} {reply.users?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {reply.is_answer && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Answer
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteReply(reply.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
