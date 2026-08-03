import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewsAggregator } from './NewsAggregator';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  category: string;
  tags: any;
  author_id?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const itemsPerPage = 8; // Between 7-9 as requested

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    is_published: false,
    is_featured: false,
    category: 'general',
    tags: ''
  });

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'admissions', label: 'Admissions' },
    { value: 'results', label: 'Results' },
    { value: 'study-tips', label: 'Study Tips' },
    { value: 'news', label: 'News' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'updates', label: 'Updates' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    // Normalize unicode (e.g., fancy bold letters) and remove diacritics
    const normalized = title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // remove combining marks
      .toLowerCase();

    // Replace anything not alphanum with hyphens, collapse repeats
    let slug = normalized
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '-')
      .replace(/-+/g, '-');

    // Fallback if empty
    if (!slug || slug === '-') {
      slug = `post-${Date.now()}`;
    }

    return slug;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    try {
      const fileName = `blog-images/${Date.now()}-${selectedImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, selectedImage);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = generateSlug(formData.title);
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Upload image if one is selected
      let imageUrl = formData.featured_image_url;
      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const postData = {
        title: formData.title,
        slug: editingPost ? editingPost.slug : slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featured_image_url: imageUrl || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        category: formData.category,
        tags: tags,
        published_at: formData.is_published ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      fetchPosts();
      setIsCreateModalOpen(false);
      setEditingPost(null);
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url || '',
      is_published: post.is_published,
      is_featured: post.is_featured,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : ''
    });
    setSelectedImage(null);
    setImagePreview(post.featured_image_url || '');
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    // Optimistic update - remove from UI immediately
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      // Revert optimistic update on error
      fetchPosts();
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const togglePostStatus = async (postId: string, field: 'is_published' | 'is_featured', currentValue: boolean) => {
    // Optimistic update
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const updates: Partial<BlogPost> = { [field]: !currentValue };
        if (field === 'is_published') {
          updates.published_at = !currentValue ? new Date().toISOString() : undefined;
        }
        return { ...post, ...updates };
      }
      return post;
    }));

    try {
      const updateData: any = { [field]: !currentValue };
      
      if (field === 'is_published' && !currentValue) {
        updateData.published_at = new Date().toISOString();
      } else if (field === 'is_published' && currentValue) {
        updateData.published_at = null;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Post ${field === 'is_published' ? 'publication' : 'featured'} status updated`,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      // Revert optimistic update on error
      fetchPosts();
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      is_published: false,
      is_featured: false,
      category: 'general',
      tags: ''
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* News Aggregator Section */}
      <NewsAggregator onNewsAdded={fetchPosts} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Management</h2>
          <p className="text-slate-400">Manage admission news and blog posts</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                Create engaging content for students and parents
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Post title"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief summary of the post"
                  rows={2}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Full post content"
                  rows={8}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-white">Featured Image</Label>
                
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image_upload" className="text-sm text-slate-300">Upload Image</Label>
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Recommended size: 1200x630px (16:9 aspect ratio)
                  </p>
                </div>

                {/* Image Preview */}
                {(imagePreview || formData.featured_image_url) && (
                  <div className="mt-2">
                    <Label className="text-sm text-slate-300">Preview</Label>
                    <div className="mt-1 aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-slate-600">
                      <img 
                        src={imagePreview || formData.featured_image_url} 
                        alt="Image preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Or Image URL */}
                <div>
                  <Label htmlFor="featured_image_url" className="text-sm text-slate-300">Or Enter Image URL</Label>
                  <Input
                    id="featured_image_url"
                    value={formData.featured_image_url}
                    onChange={(e) => {
                      setFormData({...formData, featured_image_url: e.target.value});
                      if (e.target.value && !selectedImage) {
                        setImagePreview(e.target.value);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                  />
                  <Label htmlFor="is_published" className="text-white">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="is_featured" className="text-white">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Posts</p>
                <p className="text-3xl font-bold text-blue-400">{posts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Published</p>
                <p className="text-3xl font-bold text-green-400">{posts.filter(p => p.is_published).length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Featured</p>
                <p className="text-3xl font-bold text-yellow-400">{posts.filter(p => p.is_featured).length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Views</p>
                <p className="text-3xl font-bold text-purple-400">{posts.reduce((sum, p) => sum + p.view_count, 0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <Card key={post.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col h-full">
                {/* Featured Image */}
                {post.featured_image_url && (
                  <div className="relative h-40 overflow-hidden bg-slate-900">
                    <img 
                      src={post.featured_image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900"></div>
                  </div>
                )}
                
                <CardContent className="flex-1 p-5 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={post.is_published ? "bg-green-600 text-white" : "bg-slate-600 text-slate-200"}>
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                    {post.is_featured && (
                      <Badge className="bg-yellow-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-slate-300">
                      {post.category}
                    </Badge>
                  </div>
                  
                  {/* Excerpt */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{post.excerpt || post.content.substring(0, 100)}</p>
                  
                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 text-xs text-slate-500 border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1.5" />
                        {post.view_count}
                      </span>
                    </div>
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && <span className="text-slate-500">+{post.tags.length - 2}</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                      className="flex-1 text-xs bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => togglePostStatus(post.id, 'is_published', post.is_published)}
                      className={`flex-1 text-xs ${post.is_published ? 'bg-slate-700 hover:bg-slate-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    >
                      {post.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => togglePostStatus(post.id, 'is_featured', post.is_featured)}
                      className={`flex-1 text-xs ${post.is_featured ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {post.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(post.id)}
                      className="text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Showing <span className="font-semibold text-white">{startIndex + 1}-{Math.min(endIndex, posts.length)}</span> of <span className="font-semibold text-white">{posts.length}</span> posts
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  ← Prev
                </Button>
                
                <div className="flex items-center space-x-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    currentPage === page || (
                      currentPage - 1 === page || currentPage + 1 === page || page === 1 || page === totalPages
                    ) ? (
                      <Button
                        key={page}
                        variant={currentPage === page ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page 
                          ? "bg-orange-600 text-white border-orange-600" 
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                        }
                      >
                        {page}
                      </Button>
                    ) : (
                      page === 2 && currentPage > 3 ? <span key="dots1" className="px-2 text-slate-400">...</span> :
                      page === totalPages - 1 && currentPage < totalPages - 2 ? <span key="dots2" className="px-2 text-slate-400">...</span> :
                      null
                    )
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No blog posts found</h3>
              <p className="text-slate-500 mb-4">Create your first blog post to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;