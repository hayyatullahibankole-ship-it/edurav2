import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Target, Eye, BookOpen, Palette, Code, Users, TrendingUp, Lightbulb, Award, Sparkles, Rocket } from "lucide-react";
import aboutHero from "@/assets/akboy-about-hero.jpg";
import teamImage from "@/assets/akboy-team.jpg";

export default function AkboyAbout() {
  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About AKBOY" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-900/65 to-green-900/70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl text-white space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              The Story of
              <span className="block bg-gradient-to-r from-emerald-200 to-yellow-200 bg-clip-text text-transparent">
                AKBOY Creative Hub
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 leading-relaxed italic">
              "Building Minds. Empowering Creativity."
            </p>
          </div>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 font-semibold">
              <Sparkles className="w-4 h-4" />
              Our Beginning
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Where It All Started
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg text-left">
              <p>
                AKBOY Creative Hub was born from a simple dream — to bridge creativity, learning, and impact. 
                It all began with a young, passionate designer and educator, Sulaimon Abdulhakeem Sonayon (S.), 
                whose journey started not in a tech lab or a fancy studio, but in a classroom — teaching, learning, 
                and inspiring others.
              </p>
              <p>
                While teaching students and helping peers with academic support, he realized something powerful: 
                education and creativity could work hand-in-hand to help young people discover purpose, earn skills, 
                and build confidence. Out of this realization, AKBOY Creative Hub emerged — a space where education 
                meets innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 stagger-animation">
            <Card className="p-10 hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-300 group bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To empower students and young creatives with the skills, mindset, and opportunities they need 
                to thrive in academics, career, and creative industries.
              </p>
            </Card>

            <Card className="p-10 hover:shadow-2xl transition-all duration-500 border-2 hover:border-emerald-300 group bg-white hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Our Mission</h3>
              <div className="text-muted-foreground leading-relaxed text-lg space-y-3">
                <p>We exist to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Simplify learning through creative education tools and engaging tutorials.</li>
                  <li>Equip individuals with practical digital skills like graphic design, web design, and marketing.</li>
                  <li>Inspire growth through mentorship, trainings, and community impact projects.</li>
                  <li>Foster a generation of creative, confident, and value-driven youth.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Early Days */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative animate-fade-in order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-yellow-200 rounded-3xl blur-2xl opacity-30"></div>
              <img src={teamImage} alt="AKBOY Team" className="relative w-full rounded-3xl shadow-2xl" />
            </div>
            <div className="space-y-6 animate-fade-in order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 font-semibold">
                <Lightbulb className="w-4 h-4" />
                The Early Days
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Humble Beginnings
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>
                  In the early days, AKBOY Creative Hub started small — designing graphics for schools, tutoring students, 
                  and sharing creative tips online. With limited tools and resources, the team focused on quality, integrity, 
                  and innovation.
                </p>
                <p>
                  From creating flyers for local events to helping students prepare for UTME exams, the Hub became known for 
                  its reliability, creativity, and educational impact.
                </p>
                <p>
                  Gradually, AKBOY Creative Hub began to expand — offering Quranic classes, academic tutorials, and design training. 
                  The Hub became a center of excellence for both intellectual and creative growth, gaining recognition for its blend 
                  of faith, discipline, and digital creativity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Today */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We Do Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A multifaceted creative and educational brand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            <Card className="p-8 hover:shadow-xl transition-all duration-500 border-2 hover:border-emerald-200 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Creative Services</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Graphics Design</li>
                <li>• Branding & Marketing Design</li>
                <li>• Web Design & Management</li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-500 border-2 hover:border-emerald-200 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Education & Training</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Academic Tutorials & JAMB Prep</li>
                <li>• Quran Memorization & Tajweed</li>
                <li>• Online Graphic Design Course</li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-500 border-2 hover:border-emerald-200 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Consultancy & Support</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Educational Consultancy for Schools</li>
                <li>• Business Branding Support</li>
                <li>• Career and Skills Development</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Identity */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Our Identity
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AKBOY Creative Hub represents growth, innovation, and excellence.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full mx-auto shadow-xl" style={{backgroundColor: 'hsl(142, 70%, 65%)'}}></div>
                <h4 className="font-bold text-foreground">Light Green</h4>
                <p className="text-sm text-muted-foreground">Fresh ideas and creativity</p>
              </div>
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full mx-auto shadow-xl" style={{backgroundColor: 'hsl(142, 70%, 50%)'}}></div>
                <h4 className="font-bold text-foreground">Dark Green</h4>
                <p className="text-sm text-muted-foreground">Growth and stability</p>
              </div>
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full mx-auto shadow-xl" style={{backgroundColor: 'hsl(45, 100%, 51%)'}}></div>
                <h4 className="font-bold text-foreground">Yellow</h4>
                <p className="text-sm text-muted-foreground">Energy, optimism, and enlightenment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Making a difference in lives and communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { text: "Helped hundreds of students prepare for JAMB and WAEC with guided tutorials and resources." },
              { text: "Trained young designers and entrepreneurs in creative skills for digital independence." },
              { text: "Organized impactful events like Ramadan programs, career fairs, and student orientation programs." },
              { text: "Provided free Quranic education and digital training as part of our community development efforts." }
            ].map((item, i) => (
              <Card key={i} className="p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-900 font-bold">✓</span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">{item.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Future */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 font-semibold">
              <Rocket className="w-4 h-4" />
              Our Future
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Building Tomorrow Today
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
              <p>
                AKBOY Creative Hub is not just a brand — it's a movement. 
                We're building an ecosystem where creativity, education, and opportunity meet.
              </p>
              <div className="bg-emerald-50 p-8 rounded-2xl mt-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Next Phase Includes:</h3>
                <ul className="text-left space-y-3 max-w-2xl mx-auto">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>A modern online learning platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>More career-focused training programs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Collaborations with schools, startups, and organizations to promote creative growth</span>
                  </li>
                </ul>
              </div>
              <p className="text-xl font-semibold text-foreground pt-6">
                Our ultimate goal is to become one of Africa's leading youth-focused creative and educational brands, 
                shaping minds and inspiring generations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
