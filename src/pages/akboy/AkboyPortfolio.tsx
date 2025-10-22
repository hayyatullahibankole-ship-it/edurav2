import { useEffect, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Calendar } from "lucide-react";
import portfolioHero from "@/assets/akboy-portfolio-hero.jpg";
import portfolioWeb from "@/assets/portfolio-web-1.jpg";
import portfolioDesign from "@/assets/portfolio-design-1.jpg";
import portfolioEducation from "@/assets/portfolio-education-1.jpg";

export default function AkboyPortfolio() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await supabase
        .from("akboy_portfolio")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (data) setPortfolio(data);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "web-development", "graphics-design", "education"];
  const filteredPortfolio = filter === "all" 
    ? portfolio 
    : portfolio.filter(p => p.category === filter);

  const defaultImages: { [key: string]: string } = {
    "web-development": portfolioWeb,
    "graphics-design": portfolioDesign,
    "education": portfolioEducation,
  };

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={portfolioHero} alt="Portfolio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#075E54]/95 to-[#0A8A74]/85"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold font-poppins">Our Portfolio</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-lato">
              Showcasing our creative excellence and successful projects across education, design, and technology
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                variant={filter === cat ? "default" : "outline"}
                className={`${
                  filter === cat 
                    ? "bg-[#075E54] text-white hover:bg-[#075E54]/90" 
                    : "border-[#075E54] text-[#075E54] hover:bg-[#075E54]/10"
                } font-poppins`}
              >
                {cat.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
            </div>
          ) : filteredPortfolio.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg font-lato">No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolio.map((project, index) => {
                const projectImage = project.images?.[0] || defaultImages[project.category] || portfolioWeb;
                
                return (
                  <Card 
                    key={project.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#A8E6A1]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={projectImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {project.is_featured && (
                        <Badge className="absolute top-4 right-4 bg-[#FFD700] text-[#075E54] font-poppins">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="border-[#075E54] text-[#075E54] font-poppins">
                          {project.category.split("-").join(" ")}
                        </Badge>
                        {project.completion_date && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 font-lato">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.completion_date).getFullYear()}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[#075E54] mb-2 font-poppins">{project.title}</h3>
                      {project.client_name && (
                        <p className="text-sm text-gray-600 mb-3 font-lato">Client: {project.client_name}</p>
                      )}
                      <p className="text-gray-600 mb-4 line-clamp-3 font-lato">{project.description}</p>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs font-lato">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {project.project_url && (
                        <Button asChild variant="outline" className="w-full border-[#075E54] text-[#075E54] hover:bg-[#075E54] hover:text-white font-poppins">
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                            View Project
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AkboyLayout>
  );
}
