import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  tags: string[];
  images: string[];
  is_featured: boolean;
  project_url: string | null;
}

export default function AkboyPortfolio() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPortfolio(); }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase.from("akboy_portfolio").select("*").eq("is_active", true).order("display_order", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      setPortfolio(data?.map((item: any) => ({
        id: item.id, title: item.title, category: item.category, description: item.description,
        tags: Array.isArray(item.tags) ? item.tags : [], images: Array.isArray(item.images) ? item.images : [],
        is_featured: item.is_featured, project_url: item.project_url,
      })) || []);
    } catch (error) { console.error("Error:", error); toast.error("Failed to load portfolio"); }
    finally { setLoading(false); }
  };

  const categories = ["All", ...Array.from(new Set(portfolio.map(p => p.category)))];
  const filtered = filter === "All" ? portfolio : portfolio.filter(p => p.category === filter);

  if (loading) {
    return (
      <AkboyLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-500 font-mono text-sm">Loading portfolio...</p>
          </div>
        </div>
      </AkboyLayout>
    );
  }

  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-slate-950 to-emerald-500/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Portfolio</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Creative Excellence in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Every Project</span>
            </h1>
            <p className="text-xl text-slate-400">Showcasing successful projects across education, design, and technology</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 border-y border-cyan-500/10 sticky top-20 z-40 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button key={cat} onClick={() => setFilter(cat)} variant="outline" size="sm"
                className={`rounded-lg font-mono text-xs transition-all ${
                  filter === cat
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'border-slate-700 text-slate-400 hover:border-cyan-500/20 hover:text-cyan-400 bg-transparent'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <Card key={project.id} className="group overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl">
                <div className="relative h-56 overflow-hidden">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-800/50 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  {project.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px]">
                      <Sparkles className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">{project.category}</span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{project.description}</p>

                  {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-800/50 border border-slate-700/30">{tag}</span>
                      ))}
                    </div>
                  )}

                  {project.project_url && (
                    <Button asChild size="sm" className="w-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 rounded-lg text-xs">
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                        View Project <ExternalLink className="ml-1 w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No projects in this category yet</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Project?</h2>
          <p className="text-lg text-slate-400 mb-10">Let's create something amazing together</p>
          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-10 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/20">
            <Link to={`${basePath}/contact`}>Get Started Today</Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
