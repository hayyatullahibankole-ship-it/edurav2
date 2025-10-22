import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { 
  BookOpen, Palette, Code, Users, TrendingUp, 
  Briefcase, ArrowRight, Star, Quote, CheckCircle2,
  Sparkles, Zap, Award
} from "lucide-react";

export default function AkboyHome() {
  const [stats, setStats] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, servicesRes, testimonialsRes] = await Promise.all([
        supabase.from("akboy_stats").select("*").eq("is_active", true).order("display_order"),
        supabase.from("akboy_services").select("*").eq("is_active", true).order("display_order").limit(3),
        supabase.from("akboy_testimonials").select("*").eq("is_active", true).order("display_order").limit(3),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error("Error fetching AKBOY data:", error);
    }
  };

  const iconMap: { [key: string]: any } = {
    Users, Briefcase, TrendingUp, BookOpen, Palette, Code,
  };

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#075E54] via-[#0A8A74] to-[#075E54]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#A8E6A1]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-medium">Welcome to AKBOY Creative Hub</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Where{" "}
                <span className="text-[#FFD700] relative inline-block">
                  Creativity
                  <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#FFD700]/20 -z-10"></span>
                </span>
                {" "}Meets Learning
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                We blend education, design, and innovation to empower learners and creators across Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 text-lg px-8 py-6 rounded-xl font-semibold shadow-2xl hover:scale-105 transition-all"
                >
                  <Link to="/akboy/services">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#075E54] text-lg px-8 py-6 rounded-xl font-semibold"
                >
                  <Link to="/akboy/portfolio">View Portfolio</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">5+</div>
                  <div className="text-sm text-white/70">Years</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">1000+</div>
                  <div className="text-sm text-white/70">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">30+</div>
                  <div className="text-sm text-white/70">Projects</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-6 animate-scale-in">
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:-translate-y-2 duration-300">
                  <Palette className="w-12 h-12 text-[#FFD700] mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Creative Design</h3>
                  <p className="text-white/70 text-sm">Professional graphics & branding solutions</p>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:-translate-y-2 duration-300 mt-8">
                  <BookOpen className="w-12 h-12 text-[#FFD700] mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Education</h3>
                  <p className="text-white/70 text-sm">Expert consultancy & tutorial services</p>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:-translate-y-2 duration-300 -mt-8">
                  <Code className="w-12 h-12 text-[#FFD700] mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Web Development</h3>
                  <p className="text-white/70 text-sm">Modern, responsive web solutions</p>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:-translate-y-2 duration-300">
                  <Award className="w-12 h-12 text-[#FFD700] mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Training</h3>
                  <p className="text-white/70 text-sm">Comprehensive skill development programs</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-[#A8E6A1]/20 text-[#075E54] px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">What We Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive solutions tailored to your educational and creative needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon_name] || BookOpen;
              return (
                <Card 
                  key={service.id} 
                  className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-[#A8E6A1] bg-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#075E54] to-[#A8E6A1] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#075E54] mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.short_description}</p>
                  <Link 
                    to="/akboy/services" 
                    className="inline-flex items-center gap-2 text-[#075E54] font-semibold group-hover:gap-4 transition-all"
                  >
                    Learn More 
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-[#075E54] hover:bg-[#075E54]/90 text-white px-8 py-6 rounded-xl">
              <Link to="/akboy/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#075E54] to-[#0A8A74]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-semibold">Featured Project</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Edura CBT Platform</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Our flagship educational technology platform revolutionizing exam preparation with AI-powered learning and comprehensive analytics.
              </p>
              <ul className="space-y-3">
                {[
                  "Advanced CBT Practice System",
                  "AI-Powered Study Assistant",
                  "Comprehensive Performance Analytics",
                  "Offline Mode Support"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-white text-[#075E54] hover:bg-white/90 mt-4">
                <Link to="/">Visit Edura CBT</Link>
              </Button>
            </div>
            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="text-center space-y-6">
                <div className="text-7xl font-bold text-[#FFD700]">10,000+</div>
                <p className="text-2xl text-white">Students Empowered</p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-4xl font-bold text-[#FFD700]">500+</div>
                    <p className="text-white/80">Practice Tests</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-4xl font-bold text-[#FFD700]">95%</div>
                    <p className="text-white/80">Success Rate</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-4">
                What Our Clients Say
              </h2>
              <p className="text-gray-600 text-lg">Trusted by students, educators, and businesses</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-6 relative hover:shadow-xl transition-all">
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-[#A8E6A1] opacity-20" />
                  <div className="flex items-center gap-3 mb-4">
                    {testimonial.image_url && (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.client_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-[#075E54]">{testimonial.client_name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{testimonial.content}</p>
                  {testimonial.rating && (
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A8E6A1] to-[#75D4A1]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#075E54]">
            Ready to Transform Your Ideas?
          </h2>
          <p className="text-xl text-[#075E54]/80">
            Join thousands of satisfied clients who have elevated their learning and creativity with AKBOY
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90 px-8 py-6 text-lg rounded-xl">
              <Link to="/akboy/contact">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-[#075E54] text-[#075E54] hover:bg-[#075E54] hover:text-white px-8 py-6 text-lg rounded-xl">
              <Link to="/akboy/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
