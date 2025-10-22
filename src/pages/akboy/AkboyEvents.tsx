import { useEffect, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import eventsHero from "@/assets/akboy-events-hero.jpg";

export default function AkboyEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await supabase
        .from("akboy_events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (data) setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsHero} alt="Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#075E54]/95 to-[#0A8A74]/85"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold font-poppins">Events & Workshops</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-lato">
              Join our training sessions, workshops, and creative events to enhance your skills and connect with like-minded individuals
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg font-lato">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <Card 
                  key={event.id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#A8E6A1]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {event.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#075E54]/80 to-transparent"></div>
                      {isUpcoming(event.event_date) && (
                        <Badge className="absolute top-4 right-4 bg-[#FFD700] text-[#075E54] font-poppins">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    {event.event_type && (
                      <Badge variant="outline" className="border-[#075E54] text-[#075E54] mb-3 font-poppins">
                        {event.event_type}
                      </Badge>
                    )}

                    <h3 className="text-xl font-bold text-[#075E54] mb-3 font-poppins">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 font-lato">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-[#075E54]" />
                        <span className="text-sm font-lato">
                          {formatDate(event.event_date)}
                          {event.end_date && ` - ${formatDate(event.end_date)}`}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-[#075E54]" />
                          <span className="text-sm font-lato">{event.location}</span>
                        </div>
                      )}

                      {event.max_participants && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-[#075E54]" />
                          <span className="text-sm font-lato">
                            {event.current_participants || 0}/{event.max_participants} participants
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {event.price > 0 && (
                        <div className="text-2xl font-bold text-[#075E54] font-poppins">
                          ₦{Number(event.price).toLocaleString()}
                        </div>
                      )}
                      {event.registration_url && (
                        <Button asChild className="bg-[#075E54] hover:bg-[#075E54]/90 text-white font-poppins">
                          <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                            Register
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A8E6A1] to-[#75D4A1]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] font-poppins">
            Want to Host an Event With Us?
          </h2>
          <p className="text-xl text-[#075E54]/80 font-lato">
            We're always open to collaboration and partnership opportunities
          </p>
          <Button asChild size="lg" className="bg-[#075E54] text-white hover:bg-[#075E54]/90 px-8 py-6 text-lg font-poppins">
            <a href="/akboy/contact">Get in Touch</a>
          </Button>
        </div>
      </section>
    </AkboyLayout>
  );
}
