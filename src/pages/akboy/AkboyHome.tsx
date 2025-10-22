import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code, Palette, GraduationCap, Sparkles, Users, Award, TrendingUp, CheckCircle2, Phone, Mail, Star } from "lucide-react";
import { Link } from "react-router-dom";
import akboyHero from "@/assets/akboy-hero-gradient.jpg";
import eduraMockup from "@/assets/edura-mobile-mockup.png";

const AkboyHome = () => {
  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Web Development",
      description: "Custom websites and web applications built with cutting-edge technologies for optimal performance.",
      features: ["Responsive Design", "SEO Optimized", "Fast Performance"]
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX Design",
      description: "Beautiful, intuitive interfaces that create exceptional user experiences and drive engagement.",
      features: ["User Research", "Wireframing", "Prototyping"]
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "EdTech Solutions",
      description: "Innovative educational platforms that transform learning experiences for students and educators.",
      features: ["Learning Management", "Analytics", "Mobile Apps"]
    }
  ];

  const stats = [
    { value: "6,561+", label: "Satisfied Clients", icon: <Users className="w-6 h-6" /> },
    { value: "600+", label: "Finished Projects", icon: <Award className="w-6 h-6" /> },
    { value: "250+", label: "Skilled Experts", icon: <TrendingUp className="w-6 h-6" /> },
    { value: "1,001+", label: "Media Posts", icon: <Sparkles className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content: "AKBOY transformed our vision into reality. Their attention to detail and technical expertise is unmatched.",
      rating: 5,
      image: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Founder, EduLearn",
      content: "The Edura platform they built has revolutionized how we deliver education. Absolutely phenomenal work!",
      rating: 5,
      image: "MC"
    }
  ];

  const whyChooseUs = [
    { title: "Expert Team", description: "Skilled professionals with years of industry experience" },
    { title: "Quality Delivery", description: "We deliver exceptional results on time, every time" },
    { title: "24/7 Support", description: "Round-the-clock support for all your needs" },
    { title: "Innovative Solutions", description: "Cutting-edge technology and creative approaches" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>

        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-32 md:h-48 fill-background/50">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in text-white">
              <div className="inline-block">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/20">
                  🚀 Built For Success
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Get Our Business
                <span className="block bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                  This IT Solution
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                Delivering cutting-edge IT solutions, stunning designs, and innovative educational platforms that transform businesses and empower learners worldwide.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="group bg-white text-emerald-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all">
                  Subscribe Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-emerald-700">
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-200" />
                  <span className="text-sm font-semibold">+234 810 xxx xxxx</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-200" />
                  <span className="text-sm font-semibold">info@akboy.com</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <img 
                  src={akboyHero} 
                  alt="AKBOY Creative Hub" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border-2 border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">6,561+</p>
                      <p className="text-sm text-muted-foreground">Satisfied Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">We Are Increasing Business Success</h2>
            <p className="text-white/80 max-w-2xl mx-auto">Trusted by thousands of clients worldwide</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-2">
                  {stat.icon}
                </div>
                <p className="text-4xl md:text-5xl font-bold">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold">WHY CHOOSE US</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
              We Can Create With The<br />About Solution
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combining technical excellence with creative innovation to deliver solutions that exceed expectations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all border border-emerald-100 hover:border-emerald-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold">OUR SERVICES</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
              We Solve IT Problems<br />With Technology
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 border border-emerald-100 hover:border-emerald-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="ghost" className="group-hover:text-emerald-600">
                  Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project - Edura */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="text-emerald-600 font-semibold">FEATURED PROJECT</span>
              <h2 className="text-3xl md:text-5xl font-bold">
                Our Latest Incredible<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Client's Project
                </span>
              </h2>
              
              <Card className="p-6 bg-white border border-emerald-200 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Edura E-Learning</h3>
                    <p className="text-muted-foreground">
                      A comprehensive educational platform revolutionizing online learning with AI-powered features, 
                      real-time analytics, and an intuitive mobile experience.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    "AI-Powered Study Assistant",
                    "Interactive Practice Tests",
                    "Real-time Performance Analytics",
                    "Mobile-First Design"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/akboy/portfolio">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                    View Portfolio
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20 blur-3xl rounded-full" />
                <img 
                  src={eduraMockup} 
                  alt="Edura Mobile App" 
                  className="relative z-10 mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              People Who Already Love Us
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 hover:shadow-xl transition-all animate-fade-in border border-emerald-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                
                <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Stay Connected With<br />Cutting Edge IT
            </h2>
            <p className="text-lg text-white/90">
              Ready to transform your business? Let's create something amazing together.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-white/90">
              Get Started Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AkboyHome;
