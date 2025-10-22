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
import heroImage from "@/assets/akboy-hero.jpg";
import educationService from "@/assets/education-service.jpg";
import designService from "@/assets/design-service.jpg";
import webDevService from "@/assets/web-dev-service.jpg";
import trainingService from "@/assets/training-service.jpg";

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
      {/* Hero Section with Image */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AKBOY Creative Hub Team" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#075E54]/95 via-[#075E54]/85 to-[#0A8A74]/80"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#A8E6A1]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-medium">Welcome to AKBOY Creative Hub</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight font-poppins">
                Where{" "}
                <span className="text-[#FFD700] relative inline-block">
                  Creativity
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12">
                    <path d="M0 8 Q50 2, 100 8 T200 8" stroke="#FFD700" strokeWidth="3" fill="none" opacity="0.3"/>
                  </svg>
                </span>
                {" "}Meets Learning
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-lato">
                We blend education, design, and innovation to empower learners and creators across Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 text-lg px-8 py-6 rounded-xl font-semibold shadow-2xl hover:scale-105 transition-all font-poppins"
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
                  className="border-2 border-white text-white bg-white/10 hover:bg-white hover:text-[#075E54] text-lg px-8 py-6 rounded-xl font-semibold backdrop-blur-sm font-poppins"
                >
                  <Link to="/akboy/portfolio">View Portfolio</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-bold text-[#FFD700] font-poppins">{stat.value}</div>
                    <div className="text-sm text-white/80 font-lato">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Image Showcase */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Creative Team Working" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2 font-poppins">Empowering Growth</h3>
                  <p className="text-white/90 font-lato">Through education, creativity, and innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Images */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-[#A8E6A1]/20 text-[#075E54] px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold font-poppins">What We Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-4 font-poppins">Our Services</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto font-lato">
              Comprehensive solutions tailored to your educational and creative needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon_name] || BookOpen;
              const serviceImage = serviceImages[service.title] || educationService;
              return (
                <Card 
                  key={service.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-[#A8E6A1] bg-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={serviceImage} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#075E54]" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#075E54] mb-3 font-poppins">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed font-lato">{service.short_description}</p>
                    <Link 
                      to="/akboy/services" 
                      className="inline-flex items-center gap-2 text-[#075E54] font-semibold group-hover:gap-4 transition-all font-poppins"
                    >
                      Learn More 
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-[#075E54] hover:bg-[#075E54]/90 text-white px-8 py-6 rounded-xl font-poppins">
              <Link to="/akboy/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura with visual  */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] via-[#0A8A74] to-[#075E54]"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FFD700]/30">
                <Star className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-semibold font-poppins">Featured Project</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-poppins">Edura CBT Platform</h2>
              <p className="text-xl text-white/90 leading-relaxed font-lato">
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
                    <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#075E54]" />
                    </div>
                    <span className="text-lg font-lato">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-white text-[#075E54] hover:bg-white/90 mt-4 font-poppins">
                <Link to="/">Visit Edura CBT</Link>
              </Button>
            </div>
            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="text-7xl font-bold text-[#FFD700] font-poppins">10,000+</div>
                <p className="text-2xl text-white font-poppins">Students Empowered</p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="text-4xl font-bold text-[#FFD700] font-poppins">500+</div>
                    <p className="text-white/80 font-lato">Practice Tests</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="text-4xl font-bold text-[#FFD700] font-poppins">95%</div>
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-4 font-poppins">
                What Our Clients Say
              </h2>
              <p className="text-gray-600 text-lg font-lato">Trusted by students, educators, and businesses</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-6 relative hover:shadow-xl transition-all bg-white">
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-[#A8E6A1] opacity-20" />
                  <div className="flex items-center gap-3 mb-4">
                    {testimonial.image_url ? (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.client_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#075E54] to-[#A8E6A1] flex items-center justify-center text-white font-bold text-xl">
                        {testimonial.client_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-[#075E54] font-poppins">{testimonial.client_name}</h4>
                      <p className="text-sm text-gray-600 font-lato">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 font-lato">{testimonial.content}</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A8E6A1] to-[#75D4A1] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #075E54 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] font-poppins">
            Ready to Transform Your Ideas?
          </h2>
          <p className="text-xl text-[#075E54]/80 font-lato">
            Join thousands of satisfied clients who have elevated their learning and creativity with AKBOY
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90 px-8 py-6 text-lg rounded-xl font-poppins shadow-xl">
              <Link to="/akboy/contact">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-[#075E54] text-[#075E54] hover:bg-[#075E54] hover:text-white px-8 py-6 text-lg rounded-xl font-poppins">
              <Link to="/akboy/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
