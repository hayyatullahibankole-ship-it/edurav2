import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AkboyBlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Blog post link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <AkboyLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
      </AkboyLayout>
    );
  }

  if (!post) {
    return (
      <AkboyLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Post Not Found</h1>
            <p className="text-gray-600">This blog post doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </AkboyLayout>
    );
  }

  return (
    <AkboyLayout>
      {/* Floating Back Button */}
      <Link to="/blog" className="fixed top-24 left-4 z-50 animate-fade-in">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 rounded-full px-6 py-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blog
        </Button>
      </Link>

      {/* Hero Section with Featured Image */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
        {post.featured_image ? (
          <>
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl">📝</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 pb-12 w-full">
            {post.category && (
              <span className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {post.read_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.read_time} min read</span>
                </div>
              )}
              {post.author && (
                <div className="flex items-center gap-2">
                  <span>By {post.author}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <article className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed space-y-6 font-lato text-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-gray-900">Share this article</h3>
              <Button
                onClick={handleShare}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Back to Blog CTA */}
          <div className="mt-12 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
              Explore More Articles
            </h3>
            <p className="text-gray-600 mb-6 font-lato">
              Discover more insights on education, design, and technology
            </p>
            <Link to="/blog">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </AkboyLayout>
  );
}
