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
      <section className="py-16 px-4 bg-gradient-to-br from-[#075E54] to-[#0A8A74] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">AKBOY Blog</h1>
          <p className="text-xl text-white/90 font-lato">
            Insights on education, design, technology, and creative innovation
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#075E54]" : "border-[#075E54] text-[#075E54]"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-[#075E54] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No articles found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {post.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#FFD700] text-[#075E54] px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent"}</span>
                      </div>
                      {post.read_time && (
                        <span>• {post.read_time} min read</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#075E54] mb-3 font-poppins line-clamp-2 group-hover:text-[#0A8A74] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 font-lato">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link 
                      to={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-2 text-[#075E54] font-semibold group-hover:gap-4 transition-all font-poppins"
                    >
                      Read More 
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#075E54] to-[#0A8A74] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins">Stay Updated</h2>
          <p className="text-xl text-white/90 font-lato">
            Subscribe to our newsletter for the latest insights and updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 font-semibold px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
