import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Target, Eye, BookOpen, Palette, Code, Lightbulb, Rocket, Sparkles, CheckCircle2 } from "lucide-react";
import aboutHero from "@/assets/akboy-about-hero.jpg";
import teamImage from "@/assets/akboy-team.jpg";

export default function AkboyAbout() {
  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About AKBOY" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Our Story</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The Story of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                AKBOY Creative Hub
              </span>
            </h1>
            <p className="text-xl text-slate-400 italic">"Building Minds. Empowering Creativity."</p>
          </div>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Our Beginning</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Where It All Started</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed text-left">
            <p>AKBOY Creative Hub was born from a simple dream — to bridge creativity, learning, and impact. It all began with a young, passionate designer and educator, Sulaimon Abdulhakeem Sonayon (S.), whose journey started not in a tech lab or a fancy studio, but in a classroom — teaching, learning, and inspiring others.</p>
            <p>While teaching students and helping peers with academic support, he realized something powerful: education and creativity could work hand-in-hand to help young people discover purpose, earn skills, and build confidence. Out of this realization, AKBOY Creative Hub emerged.</p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl group">
              <div className="w-14 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <Eye className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">To empower students and young creatives with the skills, mindset, and opportunities they need to thrive in academics, career, and creative industries.</p>
            </Card>
            <Card className="p-8 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl group">
              <div className="w-14 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <Target className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <div className="text-slate-400 leading-relaxed space-y-2">
                {["Simplify learning through creative education tools", "Equip individuals with practical digital skills", "Inspire growth through mentorship and trainings", "Foster creative, confident, and value-driven youth"].map((m, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Early Days */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-3xl blur-2xl" />
              <img src={teamImage} alt="AKBOY Team" className="relative w-full rounded-2xl border border-slate-800" />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// The Early Days</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Humble Beginnings</h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>In the early days, AKBOY Creative Hub started small — designing graphics for schools, tutoring students, and sharing creative tips online.</p>
                <p>From creating flyers for local events to helping students prepare for UTME exams, the Hub became known for its reliability, creativity, and educational impact.</p>
                <p>Gradually, AKBOY expanded — offering Quranic classes, academic tutorials, and design training. The Hub became a center of excellence for both intellectual and creative growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Today */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Today</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">What We Do Today</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Palette, title: "Creative Services", items: ["Graphics Design", "Branding & Marketing", "Web Design & Management"] },
              { icon: BookOpen, title: "Education & Training", items: ["Academic Tutorials & JAMB Prep", "Quran Memorization & Tajweed", "Online Design Courses"] },
              { icon: Code, title: "Consultancy & Support", items: ["Educational Consultancy", "Business Branding Support", "Career & Skills Development"] },
            ].map((section, i) => (
              <Card key={i} className="p-6 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl group">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-sm text-slate-400 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Impact</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">Our Impact</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Helped hundreds of students prepare for JAMB and WAEC with guided tutorials and resources.",
              "Trained young designers and entrepreneurs in creative skills for digital independence.",
              "Organized impactful events like Ramadan programs, career fairs, and student orientation programs.",
              "Provided free Quranic education and digital training as part of our community development efforts.",
            ].map((text, i) => (
              <Card key={i} className="p-6 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Future */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-cyan-500/10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono">
            <Rocket className="w-4 h-4" />
            Our Future
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Building Tomorrow Today</h2>
          <p className="text-slate-400 leading-relaxed">AKBOY Creative Hub is not just a brand — it's a movement. We're building an ecosystem where creativity, education, and opportunity meet.</p>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-left">
            <h3 className="text-lg font-bold text-white mb-4">Our Next Phase:</h3>
            <ul className="space-y-3">
              {["A modern online learning platform", "More career-focused training programs", "Collaborations with schools and organizations"].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <span className="text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-white font-semibold">Our goal: become one of Africa's leading youth-focused creative and educational brands.</p>
        </div>
      </section>
    </AkboyLayout>
  );
}
