import { useEffect, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Target, Eye, Award, Mail, Linkedin, Twitter } from "lucide-react";
import aboutHero from "@/assets/akboy-about-hero.jpg";
import teamImage from "@/assets/akboy-team.jpg";

export default function AkboyAbout() {
  const [team, setTeam] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [teamRes, statsRes] = await Promise.all([
      supabase.from("akboy_team").select("*").eq("is_active", true).order("display_order"),
      supabase.from("akboy_stats").select("*").eq("is_active", true).order("display_order"),
    ]);
    if (teamRes.data) setTeam(teamRes.data);
    if (statsRes.data) setStats(statsRes.data);
  };

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About AKBOY" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#075E54]/95 to-[#0A8A74]/90"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold font-poppins">About AKBOY Creative Hub</h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-lato">
              Empowering African creativity and innovation through education, design, and technology since our inception.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#A8E6A1]">
              <div className="w-16 h-16 bg-[#075E54] rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-bold text-[#075E54] mb-4 font-poppins">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed font-lato">
                To bridge the gap between creativity and education, providing innovative solutions that empower individuals and organizations to achieve their full potential.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#A8E6A1]">
              <div className="w-16 h-16 bg-[#075E54] rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-bold text-[#075E54] mb-4 font-poppins">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed font-lato">
                To become Africa's leading creative and educational technology hub, recognized for transforming lives through innovation, design excellence, and digital education.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#A8E6A1]">
              <div className="w-16 h-16 bg-[#075E54] rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-bold text-[#075E54] mb-4 font-poppins">Our Values</h3>
              <p className="text-gray-600 leading-relaxed font-lato">
                Innovation, Excellence, Integrity, Collaboration, and Impact. We believe in creating solutions that make a real difference in people's lives.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#075E54] to-[#0A8A74]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-[#FFD700] mb-2 font-poppins">{stat.value}</div>
                  <div className="text-white text-lg font-lato">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-6 font-poppins">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed font-lato">
                <p>
                  AKBOY Creative Hub was born from a vision to transform the African creative and educational landscape. We recognized the gap between traditional learning methods and the dynamic needs of modern learners and businesses.
                </p>
                <p>
                  What started as a small tutorial service has grown into a comprehensive creative and educational technology hub, serving thousands of students, educators, and businesses across Africa.
                </p>
                <p>
                  Today, we're proud to offer a full suite of services including educational consultancy, tutorial services, graphics design, web development, and our flagship product - Edura CBT Platform, which has revolutionized exam preparation for students.
                </p>
              </div>
            </div>
            <div className="relative">
              <img src={teamImage} alt="AKBOY Team" className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#075E54] mb-4 font-poppins">Meet Our Team</h2>
              <p className="text-gray-600 text-lg font-lato">The creative minds behind AKBOY</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-2xl transition-all group">
                  <div className="relative h-64 overflow-hidden">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#075E54] to-[#A8E6A1] flex items-center justify-center">
                        <Users className="w-20 h-20 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#075E54] to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#075E54] mb-2 font-poppins">{member.name}</h3>
                    <p className="text-[#0A8A74] font-semibold mb-3 font-lato">{member.role}</p>
                    {member.bio && <p className="text-gray-600 text-sm mb-4 font-lato">{member.bio}</p>}
                    {member.social_links && (
                      <div className="flex gap-3">
                        {member.social_links.linkedin && (
                          <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#075E54] hover:text-[#0A8A74] transition-colors">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.social_links.twitter && (
                          <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-[#075E54] hover:text-[#0A8A74] transition-colors">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="text-[#075E54] hover:text-[#0A8A74] transition-colors">
                            <Mail className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </AkboyLayout>
  );
}
