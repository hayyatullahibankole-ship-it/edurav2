import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Code, Palette, Users, ArrowRight, CheckCircle2, Sparkles, Trophy, Target } from "lucide-react";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";
import eduraMockup from "@/assets/edura-mobile-mockup.png";

export default function AkboyHome() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [hero1, hero2, hero3, hero4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-green-900/95"></div>
          
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
                <Link to="/akboy/services">
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
                <Link to="/akboy/contact">Contact Us</Link>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-200 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
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
              <Link to="/akboy/services">
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project - Edura */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full text-sm font-bold border border-white/20 shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                Featured Project
              </div>
              
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                  Meet Edura:
                  <span className="block bg-gradient-to-r from-yellow-200 via-white to-emerald-100 bg-clip-text text-transparent mt-2">
                    The Future of Education
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-emerald-50 leading-relaxed font-light">
                  A comprehensive educational platform designed to revolutionize learning. From JAMB preparation to university studies, Edura provides students with the tools they need to succeed.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  { icon: "🎯", text: "Interactive CBT practice with 10,000+ questions" },
                  { icon: "🤖", text: "AI-powered personalized study recommendations" },
                  { icon: "📊", text: "Real-time performance analytics & insights" },
                  { icon: "📱", text: "Offline mode for learning anywhere, anytime" }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <span className="text-lg font-medium text-white">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-emerald-900 hover:bg-yellow-50 text-lg px-10 py-7 h-auto font-bold shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 transition-all rounded-2xl"
                >
                  <Link to="/">
                    Visit Edura
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Link>
                </Button>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-white mb-1">10K+</div>
                    <div className="text-sm text-emerald-100">Active Users</div>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-white mb-1">95%</div>
                    <div className="text-sm text-emerald-100">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative animate-fade-in lg:order-last order-first">
              <div className="absolute -inset-8 bg-gradient-to-r from-yellow-300/30 via-white/30 to-emerald-300/30 rounded-[4rem] blur-3xl animate-pulse"></div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-[3rem] blur-2xl opacity-30"></div>
                <img 
                  src={eduraMockup}
                  alt="Edura Mobile App Dashboard"
                  className="relative w-full max-w-lg mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 animate-float"
                />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl animate-float hidden lg:block">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  98%
                </div>
                <div className="text-sm font-semibold text-gray-600">Pass Rate</div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl animate-float hidden lg:block" style={{animationDelay: '1s'}}>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <div className="text-sm font-semibold text-gray-600">Available</div>
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

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="text-center p-10 hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
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

          <div className="grid md:grid-cols-3 gap-8">
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
              <Link to="/akboy/contact">
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
              <Link to="/akboy/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
