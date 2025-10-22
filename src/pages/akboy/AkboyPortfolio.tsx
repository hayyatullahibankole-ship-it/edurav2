import { useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import portfolioHero from "@/assets/akboy-portfolio-hero.jpg";
import eduraLogo from "@/assets/edura-logo.png";

export default function AkboyPortfolio() {
  const [filter, setFilter] = useState<string>("all");

  const portfolio = [
    {
      id: 1,
      title: "Edura CBT Platform",
      category: "Web Development",
      description: "Africa's most advanced educational platform with AI-powered learning and 10,000+ practice questions. Revolutionizing exam preparation for Nigerian students.",
      tags: ["React", "AI", "Education", "Mobile-First"],
      image: eduraLogo,
      featured: true,
      url: "https://edura.app"
    },
    {
      id: 2,
      title: "SchoolHub Management System",
      category: "Web Development",
      description: "Complete school management solution with student records, fee management, and parent portals.",
      tags: ["React", "Node.js", "PostgreSQL"],
      featured: false
    },
    {
      id: 3,
      title: "BrandCraft Logo Design",
      category: "Graphics Design",
      description: "Modern brand identity design for leading Nigerian tech startup including logo, color palette, and brand guidelines.",
      tags: ["Branding", "Logo Design", "Identity"],
      featured: true
    },
    {
      id: 4,
      title: "TechFest Website",
      category: "Web Design",
      description: "Event website with registration system, speaker profiles, and schedule management.",
      tags: ["UI/UX", "Event", "Responsive"],
      featured: false
    },
    {
      id: 5,
      title: "E-Commerce Platform",
      category: "Web Development",
      description: "Full-featured online store with payment integration, inventory management, and order tracking.",
      tags: ["E-Commerce", "Payment", "React"],
      featured: false
    },
    {
      id: 6,
      title: "Corporate Training Program",
      category: "Education",
      description: "3-month intensive training program for 50+ participants in web development and design.",
      tags: ["Training", "Bootcamp", "Certificate"],
      featured: true
    }
  ];

  const categories = ["All", "Web Development", "Graphics Design", "Web Design", "Education"];
  const filteredPortfolio = filter === "All" || filter === "all"
    ? portfolio
    : portfolio.filter(p => p.category === filter);

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={portfolioHero} alt="Portfolio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-green-900/95"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl text-white space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Our Work
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Creative Excellence in
              <span className="block bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                Every Project
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 leading-relaxed">
              Showcasing our successful projects across education, design, and technology
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-emerald-100 sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                variant={filter === cat ? "default" : "outline"}
                className={`${
                  filter === cat
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
                    : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                } rounded-full px-6 font-semibold`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPortfolio.map((project, index) => (
              <Card
                key={project.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-300 bg-white"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {project.featured && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 font-bold shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="p-8">
                  <Badge variant="outline" className="border-emerald-600 text-emerald-700 mb-4 font-semibold">
                    {project.category}
                  </Badge>

                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {project.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {project.url && (
                    <Button
                      asChild
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        View Project
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-emerald-50 mb-10 leading-relaxed">
            Let's create something amazing together
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-emerald-900 hover:bg-emerald-50 text-lg px-10 py-6 h-auto font-bold shadow-2xl hover:scale-105 transition-all rounded-2xl"
          >
            <a href="/akboy/contact">Get Started Today</a>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
