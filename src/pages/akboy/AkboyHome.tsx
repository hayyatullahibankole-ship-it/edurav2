import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Code, Palette, Users, ArrowRight, CheckCircle2, Sparkles, Trophy, Target, Zap, Star, Calendar, Clock, MapPin, Terminal, Cpu, Globe, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";
import eduraMockup from "@/assets/edura-dashboard-mockup.png";

export default function AkboyHome() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const heroImages = [hero1, hero2, hero3, hero4];
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    fetchBlogPosts();
    fetchEvents();
    fetchPortfolio();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3);
      setBlogPosts(data || []);
    } catch (error) { console.error("Error fetching blog posts:", error); }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await supabase.from("akboy_events").select("*").gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(3);
      setEvents(data || []);
    } catch (error) { console.error("Error fetching events:", error); }
  };

  const fetchPortfolio = async () => {
    try {
      const { data } = await supabase.from("akboy_portfolio").select("*").eq("is_active", true).order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(3);
      setPortfolio(data || []);
    } catch (error) { console.error("Error fetching portfolio:", error); }
  };

  const services = [
    { icon: BookOpen, title: "Educational Consultancy", description: "Expert guidance for academic excellence and curriculum development", tag: "Education" },
    { icon: Users, title: "Tutorial Services", description: "Personalized learning with qualified instructors", tag: "Training" },
    { icon: Palette, title: "Graphics Design", description: "Creative visual solutions that bring your brand to life", tag: "Design" },
    { icon: Code, title: "Web Development", description: "Modern, responsive websites and web applications", tag: "Development" },
  ];

  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
              <img src={image} alt={`AKBOY ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {heroImages.map((_, index) => (
              <button key={index} onClick={() => setCurrentImageIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-10 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono mb-8">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Innovation · Education · Technology
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Transform Ideas
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400">
                Into Digital Reality
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your creative partner for education, design, and technology solutions that inspire and deliver results
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-lg px-8 py-6 h-auto font-bold shadow-lg shadow-cyan-500/20 transition-all rounded-xl"
              >
                <Link to={`${basePath}/services`}>
                  Explore Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 text-lg px-8 py-6 h-auto font-semibold rounded-xl bg-transparent"
              >
                <Link to={`${basePath}/contact`}>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-cyan-500/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "5+", label: "Years Experience" },
              { value: "200+", label: "Projects Completed" },
              { value: "50+", label: "Happy Clients" },
              { value: "15+", label: "Team Members" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono">{stat.value}</div>
                <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Our Services</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Comprehensive solutions tailored to your unique needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index}
                className="group p-6 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <service.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">{service.tag}</span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 bg-transparent rounded-lg">
              <Link to={`${basePath}/services`}>
                View All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono mb-4">
              <Star className="w-4 h-4 fill-cyan-400" />
              Featured Project
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Edura</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Africa's most advanced CBT platform revolutionizing exam preparation with AI-powered learning</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Target, label: "10,000+", sub: "Questions" },
                  { icon: Cpu, label: "AI-Powered", sub: "Learning" },
                  { icon: Globe, label: "Real-Time", sub: "Analytics" },
                  { icon: Zap, label: "Offline", sub: "Mode" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/20 p-5 rounded-xl transition-all group">
                    <stat.icon className="w-6 h-6 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-xl font-bold text-white font-mono">{stat.label}</div>
                    <div className="text-xs text-slate-500">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {["JAMB, WAEC & NECO preparation", "Intelligent performance tracking", "Offline practice mode", "Personalized study plans"].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg">
                  <Link to="/"><Zap className="mr-2 w-4 h-4" /> Visit Edura</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 bg-transparent rounded-lg">
                  <Link to="/demo">Try Demo</Link>
                </Button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-3xl blur-3xl" />
              <img src={eduraMockup} alt="Edura Dashboard" className="relative w-full max-h-[600px] object-contain drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Our Work</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Latest Projects</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(portfolio.length > 0 ? portfolio : [
              { id: "1", title: "Edura CBT Platform", category: "Web Development", images: [eduraMockup] },
              { id: "2", title: "School Rebranding", category: "Graphics Design", images: [hero3] },
              { id: "3", title: "Educational Campaign", category: "Consultancy", images: [hero4] },
            ]).map((project: any) => (
              <Card key={project.id} className="group overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl">
                <div className="relative h-56 overflow-hidden">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-2 py-1 rounded text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 bg-transparent rounded-lg">
              <Link to={`${basePath}/portfolio`}>View Full Portfolio <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events & Blog */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Latest Updates</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Stay Connected</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                </div>
                <Link to={`${basePath}/events`} className="text-cyan-400 hover:text-cyan-300 text-sm font-mono flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {events.length > 0 ? events.map((event) => (
                  <Card key={event.id} className="p-4 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-lg">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold text-cyan-400 font-mono leading-none">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{event.description}</p>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-cyan-500/50" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-8 text-slate-600">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Blog */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Latest Articles</h3>
                </div>
                <Link to="/blog" className="text-cyan-400 hover:text-cyan-300 text-sm font-mono flex items-center gap-1">
                  Read More <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {blogPosts.length > 0 ? blogPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug || post.id}`}>
                    <Card className="p-4 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-lg cursor-pointer">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-800/50 overflow-hidden">
                          {post.featured_image_url ? (
                            <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-slate-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm line-clamp-1">{post.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{post.excerpt || post.content?.substring(0, 100)}</p>
                          <div className="text-[10px] text-slate-600 mt-2 font-mono">
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )) : (
                  <div className="text-center py-8 text-slate-600">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No articles yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">What Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Dr. Adewale Johnson", role: "School Principal", quote: "AKBOY's educational consultancy transformed our curriculum. Student performance improved by 40%." },
              { name: "Sarah Okonkwo", role: "Business Owner", quote: "The website they built for us is stunning and has increased our online sales significantly." },
              { name: "Michael Eze", role: "Student", quote: "Their tutorial services helped me excel in my exams. The personalized approach made all the difference." },
            ].map((t, i) => (
              <Card key={i} className="p-6 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <p className="text-slate-400 text-sm italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="border-t border-slate-800 pt-4">
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-cyan-500/60 font-mono">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-slate-950 to-emerald-500/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Let's collaborate to bring your vision to life with innovative solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/20">
              <Link to={`${basePath}/contact`}>Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 px-8 py-6 h-auto rounded-xl bg-transparent">
              <Link to={`${basePath}/portfolio`}>View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
