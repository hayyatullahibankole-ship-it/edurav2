import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Code, Palette, Users, ArrowRight, CheckCircle2, Sparkles, Trophy, Target } from "lucide-react";
import heroImage from "@/assets/akboy-hero-gradient.jpg";
import eduraMockup from "@/assets/edura-mobile-mockup.png";

export default function AkboyHome() {
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
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            alt="AKBOY Creative Hub"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-green-900/95"></div>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                Featured Project
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Meet Edura: The Future of Education
              </h2>
              <p className="text-xl text-emerald-50/90 leading-relaxed">
                A comprehensive educational platform designed to revolutionize learning. From JAMB preparation to university studies, Edura provides students with the tools they need to succeed.
              </p>
              <div className="space-y-3">
                {[
                  "Interactive CBT practice with 10,000+ questions",
                  "AI-powered study recommendations",
                  "Real-time performance analytics",
                  "Offline mode for learning anywhere"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-200 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-emerald-50">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-emerald-900 hover:bg-emerald-50 mt-6 px-8"
              >
                <Link to="/demo">Try Edura Demo</Link>
              </Button>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative">
                <img 
                  src={eduraMockup}
                  alt="Edura Mobile App"
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                />
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
