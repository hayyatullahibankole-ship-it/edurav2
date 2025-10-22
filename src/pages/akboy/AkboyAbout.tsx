import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Target, Eye, Award, Rocket, Heart, Lightbulb, Users, TrendingUp } from "lucide-react";
import aboutHero from "@/assets/akboy-about-hero.jpg";
import teamImage from "@/assets/akboy-team.jpg";

export default function AkboyAbout() {
  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About AKBOY" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-green-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl text-white space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              About Us
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Empowering African
              <span className="block bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                Creativity & Innovation
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 leading-relaxed">
              Since our inception, we've been transforming lives through education, design, and technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Foundation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Driven by purpose, guided by values
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-10 hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-300 group bg-white">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between creativity and education, providing innovative solutions that empower individuals and organizations to achieve their full potential.
              </p>
            </Card>

            <Card className="p-10 hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-300 group bg-white">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Africa's leading creative and educational technology hub, recognized for transforming lives through innovation, design excellence, and digital education.
              </p>
            </Card>

            <Card className="p-10 hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-300 group bg-white">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Values</h3>
              <p className="text-muted-foreground leading-relaxed">
                Innovation, Excellence, Integrity, Collaboration, and Impact. We believe in creating solutions that make a real difference in people's lives.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Projects Completed", icon: Rocket },
              { value: "1000+", label: "Happy Clients", icon: Heart },
              { value: "50+", label: "Team Members", icon: Users },
              { value: "98%", label: "Success Rate", icon: TrendingUp }
            ].map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                <stat.icon className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-white/90 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 font-semibold">
                <Lightbulb className="w-4 h-4" />
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                From Vision to Reality
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
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
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-30"></div>
              <img src={teamImage} alt="AKBOY Team" className="relative w-full rounded-3xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose AKBOY?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We bring passion, expertise, and proven results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "💡", title: "Innovation First", desc: "We stay ahead with cutting-edge solutions" },
              { icon: "🎯", title: "Result-Focused", desc: "Delivering measurable outcomes every time" },
              { icon: "🤝", title: "Client Partnership", desc: "Your success is our priority" },
              { icon: "⚡", title: "Fast Delivery", desc: "Quality work, delivered on time" },
              { icon: "🏆", title: "Proven Excellence", desc: "Award-winning team and projects" },
              { icon: "📚", title: "Continuous Learning", desc: "Always evolving, always improving" }
            ].map((item, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
