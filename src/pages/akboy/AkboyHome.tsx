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
      color: "bg-emerald-600"
    },
    {
      icon: Users,
      title: "Tutorial Services",
      description: "Personalized learning experiences with qualified instructors",
      color: "bg-teal-600"
    },
    {
      icon: Palette,
      title: "Graphics Design",
      description: "Creative visual solutions that bring your brand to life",
      color: "bg-cyan-600"
    },
    {
      icon: Code,
      title: "Web Development",
      description: "Modern, responsive websites and web applications",
      color: "bg-blue-600"
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
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
          <div className="absolute inset-0 bg-black/50"></div>
          
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
              Education. Consultancy.
              <span className="block text-emerald-300">
                Design solutions.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              AKBOY Creative Hub is an edtech institution offering education, admission consultancy, and creative design solutions for students and organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold transition-colors"
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
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6 h-auto font-semibold"
              >
                <Link to={`${basePath}/contact`}>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions tailored to your unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="group p-8 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-emerald-300 bg-white"
              >
                <div className={`w-14 h-14 rounded-lg ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-semibold">
              <Link to={`${basePath}/services`}>
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg text-emerald-700 font-semibold">
                <Sparkles className="w-4 h-4" />
                About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Where Creativity Meets Innovation
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                AKBOY Creative Hub is a dynamic collective of educators, designers, and developers 
                passionate about transforming ideas into impactful solutions. Since our inception, 
                we've been at the forefront of educational technology and creative design in Nigeria.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-600">5+</div>
                  <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-600">200+</div>
                  <div className="text-sm text-gray-600 font-medium">Projects Completed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-600">50+</div>
                  <div className="text-sm text-gray-600 font-medium">Happy Clients</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-600">15+</div>
                  <div className="text-sm text-gray-600 font-medium">Team Members</div>
                </div>
              </div>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-semibold">
                <Link to={`${basePath}/about`}>
                  Learn More About Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img 
                src={hero2}
                alt="AKBOY Team"
                className="w-full rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">4.9★</div>
                    <div className="text-xs text-gray-600">Client Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help bring your ideas to life
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold h-auto"
          >
            <Link to={`${basePath}/contact`}>
              Contact Us Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
