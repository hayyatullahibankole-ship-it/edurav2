import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Palette, Code, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import educationService from "@/assets/education-service.jpg";
import designService from "@/assets/design-service.jpg";
import webDevService from "@/assets/web-dev-service.jpg";
import trainingService from "@/assets/training-service.jpg";

export default function AkboyServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from("akboy_services")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (data) setServices(data);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: { [key: string]: any } = {
    Users, BookOpen, Palette, Code,
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
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#075E54] via-[#0A8A74] to-[#075E54]">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-poppins">Our Services</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-lato">
            Comprehensive creative and educational solutions tailored to your unique needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = iconMap[service.icon_name] || BookOpen;
                const serviceImage = serviceImages[service.title] || educationService;
                const features = service.features || [];

                return (
                  <Card 
                    key={service.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-[#A8E6A1]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={serviceImage}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/90 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="w-14 h-14 bg-[#FFD700] rounded-xl flex items-center justify-center mb-4">
                          <Icon className="w-7 h-7 text-[#075E54]" />
                        </div>
                        <h3 className="text-3xl font-bold text-white font-poppins">{service.title}</h3>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="text-gray-600 mb-6 leading-relaxed font-lato">{service.full_description || service.short_description}</p>
                      
                      {features.length > 0 && (
                        <div className="space-y-3 mb-6">
                          {features.slice(0, 4).map((feature: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#A8E6A1] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 font-lato">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {service.pricing_info && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                          <p className="text-sm text-gray-600 font-lato">
                            <span className="font-semibold text-[#075E54]">Pricing: </span>
                            {service.pricing_info}
                          </p>
                        </div>
                      )}

                      <Button asChild className="w-full bg-[#075E54] hover:bg-[#075E54]/90 text-white font-poppins">
                        <Link to="/akboy/contact">
                          Get Started
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A8E6A1] to-[#75D4A1]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] font-poppins">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[#075E54]/80 font-lato">
            Let's discuss how we can help transform your ideas into reality
          </p>
          <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90 px-8 py-6 text-lg font-poppins">
            <Link to="/akboy/contact">Contact Us Today</Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
