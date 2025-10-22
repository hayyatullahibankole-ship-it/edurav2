import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, Palette, Code, Users, Calendar, 
  TrendingUp, Briefcase, ArrowRight, Star, Quote 
} from "lucide-react";

export default function AkboyHome() {
  const [stats, setStats] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const iconMap: { [key: string]: any } = {
    Calendar, Users, Briefcase, TrendingUp,
    BookOpen, Palette, Code,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A8E6A1]/20 via-transparent to-[#075E54]/10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-[#075E54] leading-tight">
              Where <span className="text-[#FFD700]">Creativity</span> Meets Learning
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              We blend education, design, and innovation to empower learners and creators.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#075E54] hover:bg-[#075E54]/90 text-white"
              >
                <Link to="/akboy/services">Explore Our Services</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-[#075E54] text-[#075E54] hover:bg-[#075E54]/10"
              >
                <Link to="/akboy/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 px-4 bg-[#075E54] text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = iconMap[stat.icon_name] || TrendingUp;
                return (
                  <div key={stat.id} className="text-center">
                    <Icon className="w-12 h-12 mx-auto mb-3 text-[#FFD700]" />
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#075E54] mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg">Comprehensive solutions for education and creativity</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = iconMap[service.icon_name] || BookOpen;
              return (
                <Card 
                  key={service.id} 
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#A8E6A1]"
                >
                  <Icon className="w-12 h-12 text-[#075E54] mb-4" />
                  <h3 className="text-xl font-bold text-[#075E54] mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.short_description}</p>
                  <Link 
                    to={`/akboy/services`} 
                    className="text-[#075E54] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-[#075E54] text-[#075E54]">
              <Link to="/akboy/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura CBT */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#075E54] to-[#0A8A74]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center text-white">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Featured Project</h2>
              <h3 className="text-3xl font-semibold text-[#FFD700]">Edura CBT Platform</h3>
              <p className="text-lg text-white/90">
                Our flagship educational technology platform revolutionizing exam preparation 
                with AI-powered learning, interactive practice tests, and comprehensive analytics.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                  <span>Advanced CBT Practice System</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                  <span>AI-Powered Study Assistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                  <span>Comprehensive Performance Analytics</span>
                </li>
              </ul>
              <Button asChild size="lg" className="bg-white text-[#075E54] hover:bg-white/90">
                <Link to="/">Visit Edura CBT</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD700]/20 rounded-lg blur-3xl" />
              <Card className="relative p-8 bg-white/10 backdrop-blur border-white/20">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-[#FFD700]">10,000+</div>
                  <p className="text-xl">Students Empowered</p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-3xl font-bold text-[#FFD700]">500+</div>
                      <p className="text-sm">Practice Tests</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#FFD700]">95%</div>
                      <p className="text-sm">Success Rate</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#075E54] mb-4">What Our Clients Say</h2>
              <p className="text-gray-600 text-lg">Trusted by students, educators, and businesses</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-6 relative">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-[#A8E6A1] opacity-50" />
                  <div className="flex items-center gap-3 mb-4">
                    {testimonial.image_url && (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-[#075E54]">{testimonial.client_name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.content}</p>
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
      <section className="py-20 px-4 bg-[#A8E6A1]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-[#075E54]">Ready to Get Started?</h2>
          <p className="text-xl text-[#075E54]/80">
            Join thousands of satisfied clients who have transformed their learning and creativity with AKBOY
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90">
              <Link to="/akboy/contact">Get in Touch</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#075E54] text-[#075E54]">
              <Link to="/akboy/portfolio">View Portfolio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#075E54] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-[#FFD700]">AKBOY Creative Hub</h3>
              <p className="text-white/80">Empowering education and creativity since 2019</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/akboy/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/akboy/services" className="hover:text-white">Services</Link></li>
                <li><Link to="/akboy/portfolio" className="hover:text-white">Portfolio</Link></li>
                <li><Link to="/akboy/events" className="hover:text-white">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/akboy/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/akboy/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/akboy/testimonials" className="hover:text-white">Testimonials</Link></li>
                <li><Link to="/akboy/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-white/80">
                <li>📧 akboycreativehub@gmail.com</li>
                <li>📞 08101466977</li>
                <li>📍 Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>© {new Date().getFullYear()} AKBOY Creative Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
