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
      full_description: "Guidance for institutions, curriculum support, and strategic planning to improve academic outcomes.",
      features: [
        "Curriculum design",
        "Teacher training",
        "Quality assurance",
        "Learning systems",
      ],
      pricing_info: "Custom packages available",
      image: educationService,
      linkType: "contact"
    },
    {
      id: 2,
      title: "Tutorial Services",
      icon_name: "Users",
      full_description: "Personalized tutoring for JAMB, WAEC, design, and digital skills that build confidence.",
      features: [
        "JAMB & WAEC prep",
        "Design fundamentals",
        "Web basics",
        "Quran tuition",
      ],
      pricing_info: "From ₦10,000",
      image: educationService,
      linkType: "register",
      registerSlug: ""
    },
    {
      id: 3,
      title: "Graphics Design",
      icon_name: "Palette",
      full_description: "Brand identities, marketing assets, and digital graphics crafted for clarity and impact.",
      features: [
        "Logo design",
        "Social media visuals",
        "Print & digital design",
        "Presentation graphics",
      ],
      pricing_info: "Logo design from ₦30,000",
      image: designService,
      linkType: "contact"
    },
    {
      id: 4,
      title: "Web Design",
      icon_name: "Code",
      full_description: "Clean, responsive websites designed to feel modern and easy to use.",
      features: [
        "Responsive design",
        "User-centered UX",
        "Brand-aligned visuals",
        "SEO-friendly structure",
      ],
      pricing_info: "From ₦150,000",
      image: webDevService,
      linkType: "contact"
    },
    {
      id: 5,
      title: "Web Development",
      icon_name: "Code",
      full_description: "Robust web applications built for speed, security, and long-term growth.",
      features: [
        "Custom web apps",
        "E-commerce",
        "API integration",
        "Maintenance support",
      ],
      pricing_info: "Custom quotes available",
      image: webDevService,
      linkType: "contact"
    },
    {
      id: 6,
      title: "Creative Training",
      icon_name: "BookOpen",
      full_description: "Hands-on training in digital skills, design, and web development.",
      features: [
        "Design workshops",
        "Dev bootcamps",
        "Digital media skills",
        "Project-based learning",
      ],
      pricing_info: "Starting from ₦50,000",
      image: trainingService,
      linkType: "register",
      registerSlug: ""
    }
  ];

  const iconMap: { [key: string]: any } = {
    Users, BookOpen, Palette, Code,
  };

  return (
    <AkboyLayout>
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 font-semibold mb-4">Our Services</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Professional services for education, design, and tech</h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-lg leading-relaxed">
            Build better learning experiences, stronger brands, and modern digital products with AKBOY Creative Hub.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2">
          {services.map((service) => {
            const Icon = iconMap[service.icon_name] || BookOpen;
            return (
              <Card key={service.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative h-72 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/30" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">{service.title}</h2>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">{service.full_description}</p>
                  <div className="grid gap-3 mb-6 text-gray-600">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 mb-6">
                    <p className="text-sm text-gray-700"><span className="font-semibold text-emerald-700">Pricing:</span> {service.pricing_info}</p>
                  </div>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <Link to={service.linkType === "register"
                      ? `${basePath}/register${service.registerSlug ? `?tutorial=${service.registerSlug}` : ""}`
                      : `${basePath}/contact`}>
                      {service.linkType === "register" ? "Register Now" : "Get Started"}
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Need help choosing the right service?</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Our team is ready to guide you through the best package for your goals — whether it is study support, digital creation, or a complete web solution.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-base font-semibold">
            <Link to={`${basePath}/contact`}>Schedule a Consultation</Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
