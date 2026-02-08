import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Palette, Code, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import educationService from "@/assets/education-service.jpg";
import designService from "@/assets/design-service.jpg";
import webDevService from "@/assets/web-dev-service.jpg";
import trainingService from "@/assets/training-service.jpg";

export default function AkboyServices() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  const services = [
    { id: 1, title: "Educational Consultancy", icon: BookOpen, description: "Comprehensive support for schools — curriculum development, teacher training, quality assurance, and strategic planning.", features: ["Curriculum design", "Teacher training", "Quality assurance", "Assessment systems"], pricing: "Custom packages available", image: educationService, linkType: "contact" },
    { id: 2, title: "Tutorial Services", icon: Users, description: "High-quality tutorials for students at all levels with personalized, one-on-one and group sessions.", features: ["JAMB & WAEC Prep", "Graphics Design (Canva)", "Web Design Basics", "Quran Memorization"], pricing: "From ₦10,000", image: educationService, linkType: "register" },
    { id: 3, title: "Graphics Design", icon: Palette, description: "Stunning visual identities and marketing materials that capture attention and communicate your message.", features: ["Logo & brand identity", "Marketing materials", "Social media graphics", "Print & digital design"], pricing: "Logo from ₦30,000", image: designService, linkType: "contact" },
    { id: 4, title: "Web Design", icon: Code, description: "Modern, responsive websites crafted to align with your brand and achieve your business objectives.", features: ["Custom website design", "Responsive layouts", "UX optimization", "SEO-friendly structure"], pricing: "From ₦150,000", image: webDevService, linkType: "contact" },
    { id: 5, title: "Web Development", icon: Code, description: "Robust, scalable web applications using the latest technologies — secure, fast, and maintainable.", features: ["Custom web apps", "E-commerce solutions", "API development", "Maintenance & support"], pricing: "From ₦250,000", image: webDevService, linkType: "contact" },
    { id: 6, title: "Creative Training", icon: BookOpen, description: "Comprehensive training programs in graphics design, web development, and digital marketing.", features: ["Design masterclass", "Web dev bootcamp", "Digital marketing", "Industry certificates"], pricing: "From ₦50,000", image: trainingService, linkType: "register" },
  ];

  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-slate-950 to-emerald-500/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Services</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mt-4 mb-6">Our Services</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Comprehensive creative and educational solutions tailored to your unique needs</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all group rounded-xl">
                <div className="relative h-56 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
                      <service.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{service.description}</p>
                  <div className="space-y-2 mb-4">
                    {service.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-400"><span className="text-cyan-400 font-mono">Pricing:</span> {service.pricing}</p>
                  </div>
                  <Button asChild className="w-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg">
                    <Link to={service.linkType === 'register' ? `${basePath}/register` : `${basePath}/contact`}>
                      {service.linkType === 'register' ? 'Register Now' : 'Get Started'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-slate-400 mb-10">Let's discuss how we can help transform your ideas into reality</p>
          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-10 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/20">
            <Link to={`${basePath}/contact`}>Contact Us Today <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
