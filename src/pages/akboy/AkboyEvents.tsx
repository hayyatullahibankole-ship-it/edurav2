import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import eventsHero from "@/assets/akboy-events-hero.jpg";

export default function AkboyEvents() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  
  const upcomingEvents = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      type: "Workshop",
      description: "12-week intensive program covering HTML, CSS, JavaScript, React, and backend development with hands-on projects.",
      date: "Starting January 15, 2026",
      duration: "12 Weeks",
      location: "Lagos & Online",
      participants: "30 seats",
      price: "₦150,000",
      featured: true
    },
    {
      id: 2,
      title: "Graphics Design Masterclass",
      type: "Training",
      description: "Learn professional design principles, Adobe Creative Suite, branding, and portfolio building.",
      date: "February 1, 2026",
      duration: "8 Weeks",
      location: "Hybrid",
      participants: "25 seats",
      price: "₦100,000",
      featured: false
    },
    {
      id: 3,
      title: "Digital Marketing Workshop",
      type: "Workshop",
      description: "Master SEO, social media marketing, content creation, and analytics for business growth.",
      date: "February 20, 2026",
      duration: "2 Days",
      location: "Online",
      participants: "50 seats",
      price: "₦25,000",
      featured: false
    }
  ];

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsHero} alt="Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-green-900/95"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl text-white space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Workshops &
              <span className="block bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">
                Training Programs
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-green-50 leading-relaxed">
              Enhance your skills and connect with creative professionals
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our professional training programs and workshops
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {upcomingEvents.map((event, index) => (
              <Card
                key={event.id}
                className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 ${
                  event.featured ? 'border-yellow-400 ring-4 ring-yellow-100' : 'hover:border-green-300'
                } bg-white`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {event.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-3 text-center">
                    <span className="text-yellow-900 font-bold text-sm">🌟 MOST POPULAR</span>
                  </div>
                )}

                <div className="p-8">
                  <Badge className="bg-green-100 text-green-900 border-green-300 mb-4 font-semibold">
                    {event.type}
                  </Badge>

                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-green-800 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-green-800" />
                      <span className="text-sm font-medium">{event.date}</span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 text-green-800" />
                      <span className="text-sm font-medium">{event.duration}</span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-green-800" />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-5 h-5 text-green-800" />
                      <span className="text-sm font-medium">{event.participants}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t-2 border-green-100">
                    <div className="text-3xl font-extrabold text-green-800">
                      {event.price}
                    </div>
                    <Button className="bg-green-800 hover:bg-green-900 text-white shadow-lg hover:shadow-xl transition-all">
                      Register
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Join Our Programs?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🎓", title: "Expert Instructors", desc: "Learn from industry professionals" },
              { icon: "💼", title: "Practical Projects", desc: "Build real-world portfolio pieces" },
              { icon: "📜", title: "Certificates", desc: "Industry-recognized credentials" },
              { icon: "🤝", title: "Networking", desc: "Connect with peers and mentors" }
            ].map((benefit, i) => (
              <Card key={i} className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-green-200">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-800 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Want to Host an Event With Us?
          </h2>
          <p className="text-xl text-green-50 mb-10 leading-relaxed">
            We're open to partnerships and collaboration opportunities
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-emerald-900 hover:bg-green-50 text-lg px-10 py-6 h-auto font-bold shadow-2xl hover:scale-105 transition-all rounded-2xl"
          >
            <Link to={`${basePath}/contact`}>Partner With Us</Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
