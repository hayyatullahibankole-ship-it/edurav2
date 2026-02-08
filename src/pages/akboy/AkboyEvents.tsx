import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export default function AkboyEvents() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  const upcomingEvents = [
    { id: 1, title: "Web Development Bootcamp", type: "Workshop", description: "12-week intensive covering HTML, CSS, JavaScript, React, and backend development.", date: "Starting January 15, 2026", duration: "12 Weeks", location: "Lagos & Online", participants: "30 seats", price: "₦150,000", featured: true },
    { id: 2, title: "Graphics Design Masterclass", type: "Training", description: "Learn professional design principles, Adobe Creative Suite, branding, and portfolio building.", date: "February 1, 2026", duration: "8 Weeks", location: "Hybrid", participants: "25 seats", price: "₦100,000", featured: false },
    { id: 3, title: "Digital Marketing Workshop", type: "Workshop", description: "Master SEO, social media marketing, content creation, and analytics for business growth.", date: "February 20, 2026", duration: "2 Days", location: "Online", participants: "50 seats", price: "₦25,000", featured: false },
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono mb-6">
            <Calendar className="w-4 h-4" /> Upcoming Events
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Workshops & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Training Programs</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Enhance your skills and connect with creative professionals</p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Programs</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">Upcoming Events</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className={`group overflow-hidden bg-slate-900/50 border transition-all rounded-xl ${event.featured ? 'border-cyan-500/30 ring-1 ring-cyan-500/10' : 'border-slate-800 hover:border-cyan-500/20'}`}>
                {event.featured && (
                  <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-b border-cyan-500/20 px-4 py-2 text-center">
                    <span className="text-cyan-400 font-mono text-xs font-bold"><Sparkles className="w-3 h-3 inline mr-1" />MOST POPULAR</span>
                  </div>
                )}
                <div className="p-6">
                  <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 font-mono text-[10px]">{event.type}</Badge>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    {[
                      { icon: Calendar, text: event.date },
                      { icon: Clock, text: event.duration },
                      { icon: MapPin, text: event.location },
                      { icon: Users, text: event.participants },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                        <Icon className="w-3.5 h-3.5 text-cyan-500/50" />
                        {text}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="text-2xl font-bold text-cyan-400 font-mono">{event.price}</div>
                    <Button className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 rounded-lg text-sm">
                      Register <ArrowRight className="ml-1 w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Benefits</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">Why Join Our Programs?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎓", title: "Expert Instructors", desc: "Learn from industry professionals" },
              { icon: "💼", title: "Practical Projects", desc: "Build real-world portfolio pieces" },
              { icon: "📜", title: "Certificates", desc: "Industry-recognized credentials" },
              { icon: "🤝", title: "Networking", desc: "Connect with peers and mentors" },
            ].map((b, i) => (
              <Card key={i} className="p-6 text-center bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{b.title}</h3>
                <p className="text-sm text-slate-400">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Want to Host an Event With Us?</h2>
          <p className="text-lg text-slate-400 mb-10">We're open to partnerships and collaboration opportunities</p>
          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-10 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/20">
            <Link to={`${basePath}/contact`}>Partner With Us</Link>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
