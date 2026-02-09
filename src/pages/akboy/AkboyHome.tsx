import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Code, Palette, Users, ArrowRight, CheckCircle2, Sparkles, Trophy, Target, Zap, Star, Calendar, Clock, MapPin } from "lucide-react";
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
  
  // Use root paths on Akboy domain, prefixed paths on Edura domain
  const basePath = isAkboy ? "" : "/akboy";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
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
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await supabase
        .from("akboy_events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data } = await supabase
        .from("akboy_portfolio")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(3);
      
      setPortfolio(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };
  const services = [
    {
      icon: BookOpen,
      title: "Educational Consultancy",
      description: "Expert guidance for academic excellence and curriculum development",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Users,
      title: "Tutorial Services",
      description: "Personalized learning experiences with qualified instructors",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Palette,
      title: "Graphics Design",
      description: "Creative visual solutions that bring your brand to life",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Code,
      title: "Web Development",
      description: "Modern, responsive websites and web applications",
      color: "from-emerald-500 to-green-500"
    }
  ];

  const features = [
    { icon: Trophy, title: "Award-Winning Team", description: "Recognized excellence in creative solutions" },
    { icon: Target, title: "Result-Driven", description: "Focused on delivering measurable outcomes" },
    { icon: Sparkles, title: "Innovation First", description: "Cutting-edge approaches to every project" }
  ];

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Image Carousel Background */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image}
                alt={`AKBOY Creative Hub ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-900/65 to-green-900/70"></div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'w-12 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              Transform Ideas Into
              <span className="block bg-gradient-to-r from-emerald-200 via-teal-200 to-green-200 bg-clip-text text-transparent">
                Digital Reality
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Your creative partner for education, design, and technology solutions that inspire and deliver results
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-emerald-900 hover:bg-emerald-50 text-lg px-8 py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
              >
                <Link to={`${basePath}/services`}>
                  Explore Our Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-900 text-lg px-8 py-6 h-auto font-semibold"
              >
                <Link to={`${basePath}/contact`}>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-teal-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions tailored to your unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-200 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Link to={`${basePath}/services`}>
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 rounded-full text-emerald-800 font-semibold">
                <Sparkles className="w-4 h-4" />
                About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Where Creativity Meets Innovation
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AKBOY Creative Hub is a dynamic collective of educators, designers, and developers 
                passionate about transforming ideas into impactful solutions. Since our inception, 
                we've been at the forefront of educational technology and creative design in Nigeria.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-emerald-600">5+</div>
                  <div className="text-sm text-muted-foreground font-medium">Years Experience</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-emerald-600">200+</div>
                  <div className="text-sm text-muted-foreground font-medium">Projects Completed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-emerald-600">50+</div>
                  <div className="text-sm text-muted-foreground font-medium">Happy Clients</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-extrabold text-emerald-600">15+</div>
                  <div className="text-sm text-muted-foreground font-medium">Team Members</div>
                </div>
              </div>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                <Link to={`${basePath}/about`}>
                  Learn More About Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="relative animate-fade-in">
              <img 
                src={hero2}
                alt="AKBOY Team"
                className="w-full rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border-2 border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">4.9★</div>
                    <div className="text-xs text-muted-foreground">Client Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 rounded-full text-emerald-800 font-semibold mb-6">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
              Featured Project
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6">
              Meet <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Edura</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Africa's most advanced CBT platform revolutionizing exam preparation with AI-powered learning
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🎯", label: "10,000+", sublabel: "Questions" },
                  { icon: "🤖", label: "AI-Powered", sublabel: "Learning" },
                  { icon: "📊", label: "Real-Time", sublabel: "Analytics" },
                  { icon: "📱", label: "Offline", sublabel: "Mode" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all group">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.sublabel}</div>
                  </div>
                ))}
              </div>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                <div className="space-y-4">
                  {[
                    "Comprehensive JAMB, WAEC & NECO preparation",
                    "Intelligent performance tracking & insights",
                    "Practice anywhere with offline functionality",
                    "Personalized study recommendations"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all rounded-2xl"
                >
                  <Link to="/">
                    <Zap className="mr-2 w-5 h-5" />
                    Visit Edura
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 h-auto font-semibold rounded-2xl"
                >
                  <Link to="/demo">Try Demo</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-4xl font-extrabold text-emerald-600">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="h-12 w-px bg-emerald-200"></div>
                <div>
                  <div className="text-4xl font-extrabold text-emerald-600">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="h-12 w-px bg-emerald-200"></div>
                <div>
                  <div className="text-4xl font-extrabold text-emerald-600">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup - Fills the section */}
            <div className="relative animate-fade-in flex items-center justify-center min-h-[700px] lg:min-h-full">
              {/* Main Phone - Larger and centered */}
              <div className="relative z-20 w-full h-full flex items-center justify-center py-8">
                <img 
                  src={eduraMockup}
                  alt="Edura App Dashboard"
                  className="w-full h-auto max-h-[800px] lg:max-h-[900px] object-contain drop-shadow-2xl animate-float hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute top-8 -right-4 lg:right-8 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl animate-float z-30 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Live Stats</span>
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-xs text-gray-600 font-semibold">Active Students</div>
              </div>
              
              <div className="absolute bottom-16 lg:bottom-24 -left-4 lg:left-8 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl animate-float z-30 border border-emerald-200" style={{animationDelay: '0.5s'}}>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Success</span>
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">98%</div>
                <div className="text-xs text-gray-600 font-semibold">Pass Rate</div>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl animate-float z-30 border border-emerald-200 hidden lg:block" style={{animationDelay: '1s'}}>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <div className="text-3xl font-extrabold text-gray-900">4.9</div>
                </div>
                <div className="text-xs text-gray-600 font-semibold">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Latest Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our diverse portfolio of creative projects and solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {portfolio.length > 0 ? portfolio.map((project, index) => (
              <Card 
                key={project.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-200"
              >
                <div className="relative h-64 overflow-hidden">
                  {project.images && project.images.length > 0 ? (
                    <img 
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                  </div>
                </div>
              </Card>
            )) : (
              /* Fallback to original hardcoded data if no portfolio items */
              [
                {
                  title: "Edura CBT Platform",
                  category: "Web Development",
                  image: eduraMockup,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "School Rebranding",
                  category: "Graphics Design",
                  image: hero3,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  title: "Educational Campaign",
                  category: "Educational Consultancy",
                  image: hero4,
                  color: "from-emerald-500 to-teal-500"
                }
              ].map((project, index) => (
                <Card 
                  key={index}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-200"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${project.color} mb-2`}>
                        {project.category}
                      </span>
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              <Link to={`${basePath}/portfolio`}>
                View Full Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events & Blog Combined Section - Sleek Design with Real Data */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full text-emerald-800 font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Latest Updates
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
              Stay <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Connected</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover upcoming events and read our latest insights
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Events Preview - Modern Card Design */}
            <div>
              <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">Join our programs</p>
                  </div>
                </div>
                <Link 
                  to={`${basePath}/events`} 
                  className="group inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-all hover:gap-3"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-5">
                {events.length > 0 ? events.map((event, index) => (
                  <Card 
                    key={event.id}
                    className="group p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200 bg-white hover:-translate-y-1"
                  >
                    <div className="flex gap-5">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col items-center justify-center text-white shadow-lg">
                        <div className="text-2xl font-extrabold leading-none">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="text-xs font-semibold uppercase">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {event.title}
                          </h4>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-medium">{event.location}</span>
                            </div>
                          )}
                          {event.duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-medium">{event.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No upcoming events at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Preview - Modern Card Design */}
            <div>
              <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Latest Articles</h3>
                    <p className="text-sm text-muted-foreground">Read our insights</p>
                  </div>
                </div>
                <Link 
                  to="/blog" 
                  className="group inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-all hover:gap-3"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-5">
                {blogPosts.length > 0 ? blogPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/blog/${post.slug || post.id}`}
                  >
                    <Card className="group p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200 bg-white hover:-translate-y-1 cursor-pointer">
                      <div className="flex gap-5">
                        {/* Featured Image or Icon */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden shadow-md">
                          {post.featured_image_url ? (
                            <img 
                              src={post.featured_image_url} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <BookOpen className="w-8 h-8 text-emerald-600" />
                          )}
                        </div>
                        
                        {/* Post Details */}
                        <div className="flex-1 min-w-0">
                          {post.category && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 mb-2.5">
                              {post.category}
                            </span>
                          )}
                          
                          <h4 className="font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors leading-snug">
                            {post.title}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {post.excerpt || post.content?.substring(0, 100)}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-medium">
                                {new Date(post.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            {post.read_time && (
                              <>
                                <span>•</span>
                                <span className="font-medium">{post.read_time} min read</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No articles published yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose AKBOY?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We bring passion, expertise, and innovation to every project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="text-center p-10 hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 hover:-translate-y-1"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            {[
              {
                name: "Dr. Adewale Johnson",
                role: "School Principal",
                quote: "AKBOY's educational consultancy transformed our curriculum. Student performance improved by 40%."
              },
              {
                name: "Sarah Okonkwo",
                role: "Business Owner",
                quote: "The website they built for us is stunning and has increased our online sales significantly."
              },
              {
                name: "Michael Eze",
                role: "Student",
                quote: "Their tutorial services helped me excel in my exams. The personalized approach made all the difference."
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500 bg-white"
              >
                <div className="mb-4">
                  <div className="flex text-emerald-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed mb-6">"{testimonial.quote}"</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-emerald-50/90 mb-10 leading-relaxed">
            Let's collaborate to bring your vision to life with innovative solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-emerald-900 hover:bg-emerald-50 text-lg px-8 py-6 h-auto font-semibold shadow-xl"
            >
              <Link to={`${basePath}/contact`}>
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-900 text-lg px-8 py-6 h-auto font-semibold"
            >
              <Link to={`${basePath}/portfolio`}>View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
