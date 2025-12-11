import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Tag, Share2, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Function to format plain text content into proper HTML
const formatBlogContent = (content: string): string => {
  // If content already has HTML tags, return as is
  if (content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>')) {
    return content;
  }
  
  // Split by double line breaks to create paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs
    .map(para => {
      // Skip empty paragraphs
      if (!para.trim()) return '';
      
      // Check if it looks like a heading (short line, possibly with # or all caps)
      if (para.length < 60 && (para.startsWith('#') || para === para.toUpperCase())) {
        const cleanPara = para.replace(/^#+\s*/, '');
        return `<h2>${cleanPara}</h2>`;
      }
      
      // Wrap in paragraph tags
      return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(p => p)
    .join('');
};

// Social share utilities
const getShareUrl = (platform: string, url: string, title: string, description: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedText = encodeURIComponent(`${title}\n\n${description}\n\n`);

  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    default:
      return '';
  }
};

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
      // First try to fetch by slug
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true);

      // Check if slug looks like a UUID (has dashes in UUID format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || "");
      
      if (isUUID) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Blog post link copied to clipboard",
    });
  };

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    const description = post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '') || '';
    
    const shareUrl = getShareUrl(platform, url, title, description);
    window.open(shareUrl, '_blank', 'width=600,height=400');
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogImage = post.featured_image_url || 'https://zqapbmllkywsuywpfava.supabase.co/storage/v1/object/public/resources/og-default.png';
  const ogDescription = post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '') || 'Read this article on AKBOY Blog';

  return (
    <AkboyLayout>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{post.title} | AKBOY Blog</title>
        <meta name="title" content={post.title} />
        <meta name="description" content={ogDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AKBOY Creative Hub" />
        {post.author && <meta property="article:author" content={post.author} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        {post.category && <meta property="article:section" content={post.category} />}
        {post.tags && post.tags.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={ogDescription} />
        <meta property="twitter:image" content={ogImage} />
      </Helmet>

      {/* Floating Back Button */}
      <Link to="/blog" className="fixed top-24 left-4 z-50 animate-fade-in">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 rounded-full px-6 py-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blog
        </Button>
      </Link>

      {/* Hero Section with Featured Image */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
        {post.featured_image_url ? (
          <>
            <img
              src={post.featured_image_url}
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
          <div className="prose prose-lg prose-emerald max-w-none">
            <div 
              className="blog-post-content space-y-6"
              dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
            />
          </div>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Share this article</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleShare('whatsapp')}
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare('facebook')}
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </Button>
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </Button>
              <Button
                onClick={() => handleShare('linkedin')}
                className="bg-[#0A66C2] hover:bg-[#095196] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </Button>
              <Button
                onClick={() => handleShare('telegram')}
                className="bg-[#0088CC] hover:bg-[#0077B5] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Copy className="w-4 h-4 mr-2" />
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
