// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Search, Calendar, ArrowRight, Tag } from "lucide-react";

export default function AkboyBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Education", "Design", "Technology", "Tips", "News"];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (response.error) throw response.error;
      const data: any[] = response.data || [];
      setPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '5%', animationDelay: '0s' }}></div>
          <div className="absolute w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ top: '60%', right: '10%', animationDelay: '2s' }}></div>
          <div className="absolute w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-float" style={{ bottom: '10%', left: '50%', animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-100 text-sm font-semibold tracking-wide">
              📚 INSIGHTS & STORIES
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-poppins text-white animate-fade-in">
            AKBOY Blog
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50/90 font-lato max-w-3xl mx-auto leading-relaxed">
            Explore our latest insights on education, design, technology, and creative innovation
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 transition-transform group-focus-within:scale-110" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="pl-12 h-14 text-lg border-2 border-emerald-200 focus:border-emerald-500 rounded-xl shadow-sm"
              />
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 px-6 py-2.5 rounded-full font-semibold" 
                    : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-2.5 rounded-full font-semibold"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg font-lato">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">No Articles Found</h3>
              <p className="text-gray-600 text-lg font-lato">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group overflow-hidden border-2 border-gray-100 hover:border-emerald-200 hover:shadow-2xl shadow-xl transition-all duration-500 hover:-translate-y-3 rounded-2xl bg-white"
                >
                  {post.featured_image && (
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-7">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-lato">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent"}</span>
                      </div>
                      {post.read_time && (
                        <span className="flex items-center gap-1">
                          • {post.read_time} min read
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-5 line-clamp-3 font-lato leading-relaxed">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mb-5 flex-wrap">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link 
                      to={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all font-poppins text-sm uppercase tracking-wide"
                    >
                      Read Article
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ bottom: '20%', right: '10%', animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block mb-4">
            <span className="text-6xl">✉️</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-white">
            Stay In The Loop
          </h2>
          <p className="text-xl md:text-2xl text-white/95 font-lato max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter for the latest insights, stories, and updates delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-500 h-14 text-lg rounded-xl shadow-lg font-lato"
            />
            <Button className="bg-white text-emerald-600 hover:bg-gray-50 font-bold px-8 h-14 text-lg rounded-xl shadow-lg whitespace-nowrap">
              Subscribe Now
            </Button>
          </div>
          <p className="text-white/80 text-sm font-lato pt-2">
            Join 5,000+ subscribers already getting our updates
          </p>
        </div>
      </section>
    </AkboyLayout>
  );
}
