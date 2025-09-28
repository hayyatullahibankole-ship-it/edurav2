import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Search,
  Star,
  TrendingUp,
  BookOpen,
  Filter,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image_url?: string;
  is_featured: boolean;
  category: string;
  tags: any;
  view_count: number;
  created_at: string;
  published_at: string;
}

const Blog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'admissions', label: 'Admissions' },
    { value: 'results', label: 'Results' },
    { value: 'study-tips', label: 'Study Tips' },
    { value: 'news', label: 'News' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'updates', label: 'Updates' }
  ];

  useEffect(() => {
    if (slug) {
      fetchSinglePost();
    } else {
      fetchBlogPosts();
    }
  }, [slug]);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentPost(data);
        // Update view count
        await supabase
          .from('blog_posts')
          .update({ view_count: data.view_count + 1 })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'admissions': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'results': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'study-tips': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'news': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'announcements': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'updates': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'general': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[category] || colors['general'];
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Single post view
  if (slug && currentPost) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <article className="max-w-4xl mx-auto">
            {currentPost.featured_image_url && (
              <div className="aspect-video mb-8 overflow-hidden rounded-lg">
                <img 
                  src={currentPost.featured_image_url} 
                  alt={currentPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Badge className={getCategoryColor(currentPost.category)}>
                  {currentPost.category.replace('-', ' ').toUpperCase()}
                </Badge>
                {currentPost.is_featured && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {currentPost.title}
              </h1>

              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(currentPost.published_at)}
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {currentPost.view_count + 1} views
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {currentPost.excerpt}
              </p>
              
              {currentPost.content ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPost.content) }} />
              ) : (
                <div className="space-y-6 text-lg leading-relaxed">
                  <p>This is a comprehensive article about {currentPost.title.toLowerCase()}. The content covers important aspects and provides valuable insights for students and professionals.</p>
                  
                  <p>Key topics covered include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Understanding the fundamentals and core concepts</li>
                    <li>Practical applications and real-world examples</li>
                    <li>Best practices and recommended approaches</li>
                    <li>Common challenges and how to overcome them</li>
                    <li>Future trends and developments in this area</li>
                  </ul>
                  
                  <p>This information is designed to help you make informed decisions and achieve better results in your academic and professional journey.</p>
                  
                  <p>For more detailed information and personalized guidance, consider booking a consultation with our experts who can provide tailored advice based on your specific needs and goals.</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Link to="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    View All Articles
                  </Button>
                </Link>
                <Link to="/consultation">
                  <Button>
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Admission News & Updates
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest news, admission updates, study tips, and insights to help you succeed
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category.replace('-', ' ').toUpperCase()}
                      </Badge>
                      {post.is_featured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.published_at)}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {post.view_count} views
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="text-primary p-0 h-auto group-hover:translate-x-1 transition-transform">
                        Read Full Article →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;