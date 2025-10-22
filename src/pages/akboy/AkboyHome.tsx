import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { 
  BookOpen, Palette, Code, Users, TrendingUp, 
  Briefcase, ArrowRight, Star, Quote, CheckCircle2,
  Sparkles, Zap, Award, Target, Rocket, Heart
} from "lucide-react";
import heroImage from "@/assets/akboy-hero.jpg";
import educationService from "@/assets/education-service.jpg";
import designService from "@/assets/design-service.jpg";
import webDevService from "@/assets/web-dev-service.jpg";
import trainingService from "@/assets/training-service.jpg";
import teamImage from "@/assets/akboy-team.jpg";

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
        supabase.from("akboy_services").select("*").eq("is_active", true).order("display_order").limit(4),
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

  const serviceImages: { [key: string]: string } = {
    "Educational Consultancy": educationService,
    "Tutorial Services": educationService,
    "Graphics Design": designService,
    "Web Design": webDevService,
    "Web Development": webDevService,
    "Creative Training": trainingService,
  };

  return (
    <AkboyLayout>
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#075E54] via-[#0A8A74] to-[#128C7E]">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="absolute top-20 -left-20 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-[#A8E6A1]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-lato">
                <Sparkles className="w-3 h-3 mr-1 text-[#FFD700]" />
                Welcome to AKBOY Creative Hub
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight font-poppins">
                  Transform Your
                  <span className="block mt-2 bg-gradient-to-r from-[#FFD700] via-[#FFC700] to-[#FFD700] bg-clip-text text-transparent animate-gradient">
                    Creative Vision
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-lato max-w-xl">
                  We empower learners and businesses across Africa with innovative educational solutions, stunning design, and cutting-edge technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 text-lg px-10 py-7 rounded-2xl font-bold shadow-2xl hover:shadow-[#FFD700]/50 hover:scale-105 transition-all duration-300 font-poppins"
                >
                  <Link to="/akboy/services">
                    Explore Services
                    <Rocket className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-white/10 hover:bg-white hover:text-[#075E54] text-lg px-10 py-7 rounded-2xl font-bold backdrop-blur-sm transition-all duration-300 font-poppins"
                >
                  <Link to="/akboy/portfolio">View Our Work</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              {stats.length > 0 && (
                <div className="grid grid-cols-3 gap-6 pt-8">
                  {stats.slice(0, 3).map((stat) => (
                    <div key={stat.id} className="group">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                        <div className="text-4xl font-bold text-[#FFD700] font-poppins mb-1">{stat.value}</div>
                        <div className="text-sm text-white/80 font-lato">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700] to-[#A8E6A1] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img 
                    src={heroImage} 
                    alt="AKBOY Creative Team" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/60 via-transparent to-transparent"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl animate-float">
                <Target className="w-8 h-8 text-[#075E54] mb-2" />
                <div className="text-sm font-bold text-[#075E54] font-poppins">Innovation First</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FFD700] rounded-2xl p-6 shadow-2xl animate-float" style={{animationDelay: '1s'}}>
                <Award className="w-8 h-8 text-[#075E54] mb-2" />
                <div className="text-sm font-bold text-[#075E54] font-poppins">Excellence Driven</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-[#A8E6A1]/20 text-[#075E54] border-[#A8E6A1]/50 mb-4 font-lato">
              <Zap className="w-3 h-3 mr-1" />
              What We Offer
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-[#075E54] mb-6 font-poppins">
              Our Premium Services
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto font-lato">
              Comprehensive creative and educational solutions tailored to elevate your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon_name] || BookOpen;
              const serviceImage = serviceImages[service.title] || educationService;
              return (
                <Link 
                  key={service.id}
                  to="/akboy/services"
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-2 border-gray-100 hover:border-[#A8E6A1] hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={serviceImage} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#075E54] via-[#075E54]/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-7 h-7 text-[#075E54]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-[#075E54] mb-3 group-hover:text-[#0A8A74] transition-colors font-poppins">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed font-lato line-clamp-3">
                        {service.short_description}
                      </p>
                      <div className="inline-flex items-center gap-2 text-[#075E54] font-semibold group-hover:gap-4 transition-all font-poppins">
                        Learn More 
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-[#075E54] hover:bg-[#075E54]/90 text-white px-10 py-6 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-poppins">
              <Link to="/akboy/services">
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#075E54] to-[#0A8A74] rounded-3xl blur-xl opacity-10"></div>
              <img 
                src={teamImage} 
                alt="Our Team" 
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
            
            <div className="space-y-8">
              <div>
                <Badge className="bg-[#FFD700]/20 text-[#075E54] border-[#FFD700]/50 mb-4 font-lato">
                  <Star className="w-3 h-3 mr-1" />
                  Why Choose Us
                </Badge>
                <h2 className="text-5xl font-bold text-[#075E54] mb-6 font-poppins">
                  Excellence in Every Project
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed font-lato">
                  We combine creativity, innovation, and expertise to deliver solutions that exceed expectations and drive real results.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Target, title: "Results-Driven Approach", desc: "We focus on delivering measurable outcomes that align with your goals" },
                  { icon: Heart, title: "Client-Centric Service", desc: "Your success is our priority, with personalized attention every step" },
                  { icon: Rocket, title: "Innovation & Creativity", desc: "Cutting-edge solutions that keep you ahead of the competition" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#075E54] to-[#0A8A74] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-7 h-7 text-[#FFD700]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#075E54] mb-2 font-poppins">{item.title}</h3>
                      <p className="text-gray-600 font-lato">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 px-8 py-6 rounded-xl font-bold shadow-xl hover:scale-105 transition-all font-poppins">
                <Link to="/akboy/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#075E54] via-[#0A8A74] to-[#128C7E]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <Badge className="bg-[#FFD700]/20 backdrop-blur-sm border-[#FFD700]/30 text-white hover:bg-[#FFD700]/30 font-lato">
                <Star className="w-3 h-3 mr-1 text-[#FFD700]" />
                Featured Project
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold font-poppins">Edura CBT Platform</h2>
              <p className="text-2xl text-white/90 leading-relaxed font-lato">
                Our flagship educational technology platform revolutionizing exam preparation with AI-powered learning.
              </p>
              <ul className="space-y-4">
                {[
                  "Advanced CBT Practice System",
                  "AI-Powered Study Assistant",
                  "Comprehensive Analytics Dashboard",
                  "Offline Mode Support"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 bg-[#FFD700] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-[#075E54]" />
                    </div>
                    <span className="text-lg font-lato">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-white text-[#075E54] hover:bg-white/90 px-8 py-6 rounded-xl font-bold shadow-2xl hover:scale-105 transition-all font-poppins">
                <Link to="/">Visit Edura CBT</Link>
              </Button>
            </div>
            <Card className="p-10 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-[#FFD700]/20 transition-all">
              <div className="text-center space-y-8">
                <div className="text-8xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFC700] bg-clip-text text-transparent font-poppins">
                  10K+
                </div>
                <p className="text-3xl text-white font-bold font-poppins">Students Empowered</p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
                    <div className="text-5xl font-bold text-[#FFD700] font-poppins mb-2">500+</div>
                    <p className="text-white/80 font-lato">Practice Tests</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
                    <div className="text-5xl font-bold text-[#FFD700] font-poppins mb-2">95%</div>
                    <p className="text-white/80 font-lato">Success Rate</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <Badge className="bg-[#075E54]/10 text-[#075E54] border-[#075E54]/20 mb-4 font-lato">
                <Quote className="w-3 h-3 mr-1" />
                Testimonials
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-[#075E54] mb-6 font-poppins">
                What Our Clients Say
              </h2>
              <p className="text-gray-600 text-xl font-lato">Trusted by students, educators, and businesses</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-8 relative hover:shadow-2xl transition-all bg-white border-2 border-gray-100 hover:border-[#A8E6A1] group">
                  <Quote className="absolute top-6 right-6 w-16 h-16 text-[#A8E6A1] opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="flex items-center gap-4 mb-6">
                    {testimonial.image_url ? (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.client_name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-[#A8E6A1]/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#075E54] to-[#A8E6A1] flex items-center justify-center text-white font-bold text-2xl">
                        {testimonial.client_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#075E54] text-lg font-poppins">{testimonial.client_name}</h4>
                      <p className="text-sm text-gray-600 font-lato">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 font-lato italic">&ldquo;{testimonial.content}&rdquo;</p>
                  {testimonial.rating && (
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A8E6A1] via-[#8FD9A3] to-[#75D4A1] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(7,94,84,0.1),transparent)] animate-pulse"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <Badge className="bg-white/20 text-[#075E54] border-white/30 mb-4 font-lato">
            <Rocket className="w-3 h-3 mr-1" />
            Ready to Start?
          </Badge>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#075E54] font-poppins leading-tight">
            Let's Transform Your Vision Into Reality
          </h2>
          <p className="text-2xl text-[#075E54]/80 max-w-3xl mx-auto font-lato">
            Join thousands of satisfied clients who have elevated their success with AKBOY Creative Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90 px-12 py-8 text-xl rounded-2xl font-bold shadow-2xl hover:shadow-[#075E54]/50 hover:scale-105 transition-all font-poppins">
              <Link to="/akboy/contact">
                Get Started Today
                <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-[#075E54] text-[#075E54] hover:bg-[#075E54] hover:text-white px-12 py-8 text-xl rounded-2xl font-bold bg-white/50 backdrop-blur-sm transition-all font-poppins">
              <Link to="/akboy/portfolio">View Our Portfolio</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
