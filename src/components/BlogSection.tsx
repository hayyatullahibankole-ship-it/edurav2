import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Star,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  is_featured: boolean;
  category: string;
  tags: any;
  view_count: number;
  created_at: string;
  published_at: string;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const blogPosts = data || [];
      const featured = blogPosts.find(post => post.is_featured);
      const regular = blogPosts.filter(post => !post.is_featured).slice(0, 5);

      setFeaturedPost(featured || null);
      setPosts(regular);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
      'admissions': 'bg-blue-100 text-blue-800',
      'results': 'bg-green-100 text-green-800',
      'study-tips': 'bg-purple-100 text-purple-800',
      'news': 'bg-red-100 text-red-800',
      'announcements': 'bg-yellow-100 text-yellow-800',
      'updates': 'bg-indigo-100 text-indigo-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['general'];
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest Admission News & Updates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest news, admission updates, and study tips to help you succeed
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <div className="lg:col-span-2">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {featuredPost.featured_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={featuredPost.featured_image_url} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor(featuredPost.category)}>
                      {featuredPost.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl leading-tight hover:text-primary transition-colors cursor-pointer">
                    {featuredPost.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(featuredPost.published_at)}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {featuredPost.view_count} views
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4 leading-relaxed">
                    {featuredPost.excerpt}
                  </CardDescription>
                   <Link to={`/blog/${featuredPost.slug}`}>
                     <Button className="group">
                       Read Full Article
                       <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Recent Posts</h3>
            </div>
            
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(post.category)} variant="secondary">
                      {post.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-3 line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {post.view_count} views
                    </span>
                     <Link to={`/blog/${post.slug}`}>
                       <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                         Read more →
                       </Button>
                     </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && !featuredPost && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No posts available</h3>
                <p className="text-muted-foreground">Check back soon for the latest updates</p>
              </div>
            )}
          </div>
        </div>

        {(posts.length > 0 || featuredPost) && (
          <div className="text-center mt-12">
             <Link to="/blog">
               <Button variant="outline" size="lg">
                 View All Posts
                 <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;