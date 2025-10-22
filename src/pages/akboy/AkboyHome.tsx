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
  Sparkles, Zap, Award, Target, Rocket, Heart, Globe, Lightbulb
} from "lucide-react";
import heroGradient from "@/assets/akboy-hero-gradient.jpg";
import educationService from "@/assets/education-service.jpg";
import designService from "@/assets/design-service.jpg";
import webDevService from "@/assets/web-dev-service.jpg";
import trainingService from "@/assets/training-service.jpg";
import teamImage from "@/assets/akboy-team.jpg";
import eduraMockup from "@/assets/edura-mobile-mockup.png";

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
      {/* Ultra Modern Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-fuchsia-800 to-blue-900"></div>
          <div className="absolute inset-0 opacity-30">
            <img src={heroGradient} alt="" className="w-full h-full object-cover mix-blend-overlay" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="text-white space-y-10">
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 px-4 py-2 text-base font-lato">
                <Sparkles className="w-4 h-4 mr-2 text-fuchsia-300" />
                Creative Innovation Hub
              </Badge>
              
              <div className="space-y-8">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] font-poppins">
                  <span className="block mb-4">Unleash Your</span>
                  <span className="block bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Creative Power
                  </span>
                </h1>
                
                <p className="text-2xl md:text-3xl text-white/90 leading-relaxed font-lato max-w-2xl">
                  Transform ideas into reality with cutting-edge design, innovative education, and powerful technology solutions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white text-xl px-12 py-8 rounded-2xl font-bold shadow-2xl shadow-fuchsia-500/50 hover:scale-105 transition-all duration-300 font-poppins border-0"
                >
                  <Link to="/akboy/services">
                    Explore Services
                    <Rocket className="ml-3 w-6 h-6" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-purple-900 text-xl px-12 py-8 rounded-2xl font-bold backdrop-blur-md transition-all duration-300 font-poppins"
                >
                  <Link to="/akboy/portfolio">View Portfolio</Link>
                </Button>
              </div>

              {/* Dynamic Stats */}
              {stats.length > 0 && (
                <div className="grid grid-cols-3 gap-6 pt-10">
                  {stats.slice(0, 3).map((stat, i) => (
                    <div key={stat.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 hover:border-white/40 transition-all duration-300">
                        <div className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent font-poppins mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-white/80 font-lato font-medium">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Visual - 3D Floating Elements */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main floating card */}
                <div className="relative z-10">
                  <div className="absolute -inset-6 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-[3rem] blur-3xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl p-6 text-white">
                        <Lightbulb className="w-10 h-10 mb-4" />
                        <div className="text-2xl font-bold font-poppins">Innovation</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl p-6 text-white">
                        <Globe className="w-10 h-10 mb-4" />
                        <div className="text-2xl font-bold font-poppins">Global Reach</div>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white col-span-2">
                        <Award className="w-12 h-12 mb-4" />
                        <div className="text-3xl font-bold font-poppins">Award-Winning</div>
                        <p className="text-white/80 mt-2 font-lato">Excellence in Design & Education</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-8 -right-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl p-6 shadow-2xl animate-float z-20">
                  <Target className="w-10 h-10 text-white mb-2" />
                  <div className="text-sm font-bold text-white font-poppins">Results Driven</div>
                </div>
                <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-2xl animate-float z-20" style={{animationDelay: '1s'}}>
                  <Rocket className="w-10 h-10 text-white mb-2" />
                  <div className="text-sm font-bold text-white font-poppins">Fast Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-white"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge className="bg-purple-100 text-purple-900 border-purple-200 mb-6 px-5 py-2 text-base font-lato">
              <Zap className="w-4 h-4 mr-2" />
              Premium Services
            </Badge>
            <h2 className="text-6xl md:text-7xl font-extrabold mb-8 font-poppins">
              <span className="bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 bg-clip-text text-transparent">
                What We Create
              </span>
            </h2>
            <p className="text-gray-600 text-2xl max-w-3xl mx-auto font-lato leading-relaxed">
              Cutting-edge solutions that drive real impact and transform businesses
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
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <Card className="relative h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={serviceImage} 
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-fuchsia-800 bg-clip-text text-transparent mb-4 font-poppins">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed font-lato line-clamp-3">
                          {service.short_description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all font-poppins">
                          Discover More
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-20">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-12 py-7 rounded-2xl text-xl font-bold shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all font-poppins border-0">
              <Link to="/akboy/services">
                View All Services
                <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Edura Featured Project with Phone Mockup */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Phone Mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-8 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-[4rem] blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative">
                <img 
                  src={eduraMockup} 
                  alt="Edura Mobile App" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-white space-y-8 order-1 lg:order-2">
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 px-5 py-2 text-base font-lato">
                <Star className="w-4 h-4 mr-2 text-cyan-300" />
                Flagship Product
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-poppins leading-tight">
                Edura CBT Platform
              </h2>
              <p className="text-2xl md:text-3xl text-white/90 leading-relaxed font-lato">
                Africa's most advanced educational platform powered by AI, transforming how students prepare for exams.
              </p>
              
              <ul className="space-y-5">
                {[
                  { icon: Zap, text: "Lightning-Fast CBT Practice Engine" },
                  { icon: Brain, text: "AI-Powered Personalized Learning" },
                  { icon: TrendingUp, text: "Real-Time Performance Analytics" },
                  { icon: Globe, text: "Offline Mode for Anywhere Learning" }
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-lato font-medium">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-white/90 px-10 py-7 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition-all font-poppins">
                  <Link to="/">
                    Launch Edura
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Link>
                </Button>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent font-poppins">10K+</div>
                    <div className="text-white/70 font-lato">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent font-poppins">95%</div>
                    <div className="text-white/70 font-lato">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-[3rem] blur-2xl opacity-20"></div>
              <img 
                src={teamImage} 
                alt="Our Team" 
                className="relative rounded-[3rem] shadow-2xl"
              />
            </div>
            
            <div className="space-y-10">
              <div>
                <Badge className="bg-purple-100 text-purple-900 border-purple-200 mb-6 px-5 py-2 text-base font-lato">
                  <Star className="w-4 h-4 mr-2" />
                  Why AKBOY?
                </Badge>
                <h2 className="text-5xl md:text-6xl font-extrabold mb-8 font-poppins">
                  <span className="bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 bg-clip-text text-transparent">
                    Excellence in Every Detail
                  </span>
                </h2>
                <p className="text-gray-600 text-xl leading-relaxed font-lato">
                  We don't just deliver projects – we craft experiences that drive growth and inspire innovation.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Target, title: "Precision & Results", desc: "Data-driven strategies that deliver measurable outcomes" },
                  { icon: Heart, title: "Client Success First", desc: "Your goals become our mission, with dedicated support" },
                  { icon: Rocket, title: "Innovation Leaders", desc: "Stay ahead with cutting-edge solutions and trends" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group p-6 rounded-2xl hover:bg-purple-50 transition-all">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">{item.title}</h3>
                      <p className="text-gray-600 font-lato text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white px-10 py-7 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition-all font-poppins border-0">
                <Link to="/akboy/about">
                  Discover Our Story
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <Badge className="bg-purple-100 text-purple-900 border-purple-200 mb-6 px-5 py-2 text-base font-lato">
                <Quote className="w-4 h-4 mr-2" />
                Client Love
              </Badge>
              <h2 className="text-6xl md:text-7xl font-extrabold mb-8 font-poppins">
                <span className="bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 bg-clip-text text-transparent">
                  Success Stories
                </span>
              </h2>
              <p className="text-gray-600 text-2xl font-lato">Hear from our amazing clients</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <div key={testimonial.id} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                    <Card className="relative p-8 hover:shadow-2xl transition-all bg-white border-0 shadow-xl group h-full">
                      <Quote className="absolute top-6 right-6 w-16 h-16 text-purple-200 opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all" />
                      <div className="flex items-center gap-5 mb-6">
                        {testimonial.image_url ? (
                          <img 
                            src={testimonial.image_url} 
                            alt={testimonial.client_name}
                            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                            {testimonial.client_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-xl font-poppins">{testimonial.client_name}</h4>
                          <p className="text-gray-600 font-lato">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-6 font-lato text-lg italic">&ldquo;{testimonial.content}&rdquo;</p>
                      {testimonial.rating && (
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-fuchsia-500 text-fuchsia-500" />
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.1),transparent_70%)]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
          <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 px-6 py-3 text-lg font-lato">
            <Rocket className="w-5 h-5 mr-2" />
            Let's Create Together
          </Badge>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white font-poppins leading-tight">
            Ready to Transform<br />Your Vision?
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto font-lato leading-relaxed">
            Join thousands who trust AKBOY to bring their creative and educational dreams to life
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-white/90 px-14 py-9 text-2xl rounded-2xl font-extrabold shadow-2xl hover:scale-105 transition-all font-poppins">
              <Link to="/akboy/contact">
                Start Your Project
                <ArrowRight className="ml-3 w-7 h-7" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white hover:text-purple-900 px-14 py-9 text-2xl rounded-2xl font-extrabold bg-white/10 backdrop-blur-md transition-all font-poppins">
              <Link to="/akboy/portfolio">Explore Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}

// Add Brain icon import fix
const Brain = () => <Lightbulb />;
