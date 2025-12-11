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
    {
      id: 1,
      title: "Educational Consultancy",
      icon_name: "BookOpen",
      short_description: "Professional guidance for academic institutions and educational programs",
      full_description: "Our educational consultancy services provide comprehensive support for schools, colleges, and training institutions. We offer curriculum development, teacher training, quality assurance, and strategic planning to enhance educational outcomes.",
      features: [
        "Curriculum design and development",
        "Teacher training and capacity building",
        "Educational quality assurance",
        "Strategic planning for institutions",
        "Student assessment systems",
        "Learning management solutions"
      ],
      pricing_info: "Custom packages available based on institutional needs",
      image: educationService
    },
    {
      id: 2,
      title: "Tutorial Services",
      icon_name: "Users",
      short_description: "Personalized learning with expert tutors across various subjects",
      full_description: "We provide high-quality tutorial services for students at all levels. Our experienced tutors offer one-on-one and group sessions tailored to individual learning needs, ensuring academic excellence and confidence building.",
      features: [
        "One-on-one personalized tutoring",
        "Small group learning sessions",
        "Exam preparation (JAMB, WAEC, NECO)",
        "Subject-specific expertise",
        "Progress tracking and reporting",
        "Flexible scheduling options"
      ],
      pricing_info: "Starting from ₦5,000 per session. Packages available",
      image: educationService
    },
    {
      id: 3,
      title: "Graphics Design",
      icon_name: "Palette",
      short_description: "Creative visual solutions that bring your brand to life",
      full_description: "Our graphics design team creates stunning visual identities and marketing materials. From logos to full brand packages, we deliver designs that capture attention and communicate your message effectively.",
      features: [
        "Logo design and brand identity",
        "Marketing materials (flyers, brochures)",
        "Social media graphics",
        "Packaging design",
        "Infographics and illustrations",
        "Print and digital design"
      ],
      pricing_info: "Logo design from ₦30,000. Full branding packages available",
      image: designService
    },
    {
      id: 4,
      title: "Web Design",
      icon_name: "Code",
      short_description: "Beautiful, user-friendly websites that engage and convert",
      full_description: "We design modern, responsive websites that not only look great but deliver exceptional user experiences. Our designs are crafted to align with your brand and achieve your business objectives.",
      features: [
        "Custom website design",
        "Responsive layouts for all devices",
        "User experience (UX) optimization",
        "Brand-aligned visual design",
        "Modern, clean aesthetics",
        "SEO-friendly structure"
      ],
      pricing_info: "Starting from ₦150,000 for basic websites",
      image: webDevService
    },
    {
      id: 5,
      title: "Web Development",
      icon_name: "Code",
      short_description: "Powerful web applications built with cutting-edge technology",
      full_description: "Our development team builds robust, scalable web applications using the latest technologies. From simple websites to complex web platforms, we deliver solutions that are secure, fast, and maintainable.",
      features: [
        "Custom web application development",
        "E-commerce solutions",
        "Content management systems",
        "Database design and integration",
        "API development and integration",
        "Maintenance and support"
      ],
      pricing_info: "Projects from ₦250,000. Contact for custom quotes",
      image: webDevService
    },
    {
      id: 6,
      title: "Creative Training",
      icon_name: "BookOpen",
      short_description: "Hands-on workshops to master digital creative skills",
      full_description: "We offer comprehensive training programs in graphics design, web development, and digital marketing. Our practical, project-based approach ensures participants gain real-world skills they can apply immediately.",
      features: [
        "Graphics design masterclass",
        "Web development bootcamp",
        "Digital marketing training",
        "UI/UX design workshops",
        "Hands-on project work",
        "Industry-recognized certificates"
      ],
      pricing_info: "Training programs from ₦50,000. Group discounts available",
      image: trainingService
    }
  ];

  const iconMap: { [key: string]: any } = {
    Users, BookOpen, Palette, Code,
  };

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50/90 max-w-3xl mx-auto leading-relaxed">
            Comprehensive creative and educational solutions tailored to your unique needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon_name] || BookOpen;

              return (
                <Card 
                  key={service.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-emerald-300 bg-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{service.title}</h3>
                    </div>
                  </div>

                  <div className="p-8">
                    <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                      {service.full_description}
                    </p>
                    
                    {service.features.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {service.features.slice(0, 4).map((feature: string, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {service.pricing_info && (
                      <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold text-emerald-700">Pricing: </span>
                          {service.pricing_info}
                        </p>
                      </div>
                    )}

                    <Button 
                      asChild 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link to={`${basePath}/contact`}>
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-50/90 leading-relaxed">
            Let's discuss how we can help transform your ideas into reality
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all h-auto"
          >
            <Link to={`${basePath}/contact`}>
              Contact Us Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
